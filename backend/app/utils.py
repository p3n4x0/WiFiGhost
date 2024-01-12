import re
import csv
import subprocess
from time import sleep
from app import config, socketio
from app.routes import scanning, scanAttack
from flask import jsonify, make_response

def ret(resp, status=200):
    return make_response(jsonify(resp), status)

def req(req):
    return req.get_json()

def readPasswordFromFile(file_path):
    # Lógica para leer la contraseña desde el archivo, ajusta según tus necesidades
    with open(file_path, 'r') as file:
        password = file.read()
    return password

def is_mac_addres(mac):
    return bool(re.match('^\s*' + '[\:\-]'.join(['([0-9a-f]{2})'] * 6) + '\s*$', mac.lower()))

def waitHandshake():
    path = config['server']['filePath']
    while 1:
        sleep(2)
        with open(f'{path}/tempScan') as scanFile:
            if "handshake" in scanFile.read():
                break

def clean(path, attack=False):
    if attack: clean = f'rm {path}/captureHS.hccap {path}/dumpDataAttack-01* {path}/tempScan'
    else: clean = f'rm {path}/dumpData-01.csv'

    subprocess.run(clean, check=True, text=True, shell=True)


def readScan():
    path = config['server']['filePath']
    while scanning:
        scans = []
        sleep(3)
        with open(f"{path}/dumpData-01.csv", "r") as csvfile:
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
