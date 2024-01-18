import re
import csv
import subprocess
from time import sleep
from app import config, socketio
from app.routes import scanning
from flask import jsonify, make_response

def ret(resp, status=200):
    return make_response(jsonify(resp), status)

def req(req):
    return req.get_json()

def readPasswordFromFile(file_path):
    with open(file_path, 'r') as file:
        password = file.read()
    return password

def extractPassword(file_input, file_output):
    with open(file_input, "r") as file:
        contenido = file.read()

    lineas = contenido.split('\n')
    for linea in lineas:
        if "The password is" in linea:
            password = linea.split("'")[1]
            break

    with open(file_output, "w") as file:
        file.write(password)



def is_mac_addres(mac):
    return bool(re.match('^\s*' + '[\:\-]'.join(['([0-9a-f]{2})'] * 6) + '\s*$', mac.lower()))

def waitHandshake(path):
    while 1:
        sleep(2)
        with open(f'{path}/tempScan') as scanFile:
            if "handshake" in scanFile.read():
                print("HANDSAHKE FIND")
                break

def clean(path, attack=False):
    if attack: clean = f'rm {path}/dumpDataAttack-01* {path}/tempScan'
    else: clean = f'rm {path}/dumpData-01.csv'

    subprocess.run(clean, text=True, shell=True)


def readScan():
    path = config['server']['filePath']
    while 1:
        print(scanning)
        scans = []
        sleep(10)
        with open(f"{path}/dumpData-01.csv", "r") as csvfile:
            scanData = csv.reader(csvfile)

            for row in scanData:
                length = len(row)
                
                if length > 0:
                    if is_mac_addres(row[0]) and (length > 0):
                        bssidStation = row[0]
                        type = row[5]
                        for station in scans:
                            if station["bssidStation"] == bssidStation:
                                continue
                        if is_mac_addres(row[5]) and (length == 7):   #Clients lines
                            bssidClient = row[5].replace(" ", "")
                            for station in scans:
                                if station["bssidStation"] == bssidClient:
                                    print("cliente: " + station["bssidStation"])
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
                                "type": type,
                                "clients": []
                                }
                            scans.append(scan)
        #print(scans) 
        socketio.emit('data', scans)
