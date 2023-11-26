from markupsafe import escape
from werkzeug.utils import secure_filename
from flask import request, jsonify, make_response, session
from app import app
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
    print(f'session: {session["netcardMon"]} | netcardMon: {netcardMon}')
    startMon = f'airmon-ng check kill && airmon-ng start {netcard}'

    #subprocess.run(startMon, check=True, shell=True)
    response_data = {"netcard": f"{netcardMon}"}
    response_code = 200

    response = jsonify(response_data)
    response = make_response(response, response_code)

    return response

@app.get('/stop')
def stopNetcardMon():
    netcardMon = session.get("netcardMon") 
    startServices = f'airmon-ng stop {netcardMon} && systemctl start NetworkManager.service'
    print(f"netcardMon: {netcardMon}")
    #subprocess.run(startServices, check=True, shell=True)
    return make_response(200)

@app.get('/scan')
def scan():
    netcardMon = session.get('netcardMon') 
    #Ejecutar en segundo plano y leer constantemenete su actividad para mantener ese monitoreo
    startScan = 'airodump-ng {netcardMon}'

@app.post('/target')
def target():
    session['essid'] = escape(request.form['essid'])

@app.post('/attack/<int:id>')
def attack(id):
    nPackets = escape(request.form['n'])
    netcardMon = session.get('netcardMon') 
    essid = session.get('essid')

    #Ejecutar en segundo plano y leer constantemenete su actividad para encontrar Handshake
    startScan = 'airodump-ng {netcardMon} -e {essid}'

    match id:
        case 0: #Deauthentication
            pass
        case 1: #Fakeauthentication
            pass
        case 2: #Interactive packet replay
            pass
        case 3: #ARP request replay attack
            pass
        case 4: #KoreK chopchop attack
            pass
        case 5: #Fragmentation attack
            pass
        case 6: #Cafe-latte attack
            pass
        case 7: #Client-oriented fragmentation attack
            pass
        case 8: #WPA Migration Mode
            pass
        case 9: #Injection test
            pass

    #Leer csv y buscar handshake



@app.post('/wordlist')
def setWordlist():
    f = request.files['file']
    print(f.filename)
    f.save(f'wordlist/{secure_filename(f.filename)}')
    
    return make_response(200)

@app.get('/wordlist')
def getWordlists():
    ls = 'ls wordlist'
    output = subprocess.run(ls, check=True, capture_output=True, text=True, shell=True)
    
    ls = output.stdout

    response_data = {"ls": f"{ls}"}
    response_code = 200

    response = jsonify(response_data)
    response = make_response(response, response_code)

    return ls

