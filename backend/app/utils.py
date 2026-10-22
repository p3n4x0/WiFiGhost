import re
import csv
import glob
import os
import shlex
import subprocess
import threading
from time import sleep, time
from app import config, socketio
from flask import jsonify, make_response

# Folders the upload/list/delete endpoints are allowed to touch.
ALLOWED_LISTS = {"FakeNetworks", "Wordlist", "hashDB", "passDB"}

# Set while a scan is running; clearing it stops the readScan thread.
scan_active = threading.Event()

# Time budgets (seconds) so an attack request can't hang a worker forever.
HANDSHAKE_TIMEOUT = 300   # WPA/WPA2 handshake capture
PMKID_TIMEOUT = 120       # hcxdumptool clientless capture
WPS_TIMEOUT = 1800        # reaver PIN brute-force (can be long)
WEP_TIMEOUT = 600         # WEP IV collection + crack


def ret(resp, status=200):
    return make_response(jsonify(resp), status)


def run(cmd, timeout=None):
    """Run a shell command, capturing output, never raising on non-zero exit."""
    try:
        return subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
    except subprocess.TimeoutExpired as e:
        # Normalise to a result-like object with whatever was captured.
        class _R:
            returncode = 124
            stdout = (e.stdout or b'').decode() if isinstance(e.stdout, bytes) else (e.stdout or '')
            stderr = (e.stderr or b'').decode() if isinstance(e.stderr, bytes) else (e.stderr or '')
        return _R()


def kill_tools():
    """Stop any capture/attack processes we may have started."""
    run('killall -q airodump-ng aireplay-ng mdk3 hcxdumptool reaver 2>/dev/null')


def wait_for(predicate, timeout, interval=5):
    """Poll `predicate` until it returns truthy or `timeout` seconds elapse."""
    deadline = time() + timeout
    while time() < deadline:
        result = predicate()
        if result:
            return result
        sleep(interval)
    return None


def newest_file(directory, pattern):
    """Most recently modified file matching glob `pattern`, or None."""
    matches = glob.glob(os.path.join(directory, pattern))
    return max(matches, key=os.path.getmtime) if matches else None


def handshake_captured(cap):
    """True if the capture file holds a usable WPA/WPA2 handshake.

    The capture is filtered to a single BSSID by airodump, so aircrack-ng
    lists exactly one network and prints "(N handshake)" in its table.
    """
    if not os.path.exists(cap):
        return False
    r = run(f'aircrack-ng {shlex.quote(cap)} < /dev/null', timeout=30)
    out = r.stdout + r.stderr
    m = re.search(r'\((\d+)\s+handshake', out)
    return bool(m and int(m.group(1)) > 0)


def wep_key(bssid, cap):
    """Attempt a WEP crack on `cap`; return the recovered key or None."""
    if not os.path.exists(cap):
        return None
    r = run(f'aircrack-ng -a 1 -b {shlex.quote(bssid)} -q {shlex.quote(cap)}', timeout=60)
    out = r.stdout
    if 'KEY FOUND' in out:
        try:
            key = out.split('KEY FOUND!')[1].split('[', 1)[1].split(']', 1)[0]
            return key.strip().replace(' ', '')
        except IndexError:
            return None
    return None


def field_after(text, label):
    """Return the trimmed value printed after `label` on the same line, or ''."""
    for line in text.splitlines():
        if label in line:
            return line.split(label, 1)[1].strip()
    return ''

def req(req):
    # Tolerate an empty or missing JSON body instead of raising.
    return req.get_json(silent=True) or {}

def allowed_list(name):
    name = str(name)
    if name not in ALLOWED_LISTS:
        raise ValueError(f"Invalid list: {name}")
    return name

def readPasswordFromFile(file_path):
    with open(file_path, 'r') as file:
        password = file.read()
    return password

def is_mac_address(mac):
    return bool(re.match(r'^\s*' + r'[\:\-]'.join(['([0-9a-f]{2})'] * 6) + r'\s*$', mac.lower()))

def clean(path, attack=False):
    if attack: clean = f'rm -f {path}/dumpDataAttack-01* {path}/tempScan'
    else: clean = f'rm -f {path}/dumpData-01.csv'

    subprocess.run(clean, text=True, shell=True)


def readScan():
    path = config['server']['filePath']
    while scan_active.is_set():
        scans = []
        sleep(8)
        try:
            with open(f"{path}/dumpData-01.csv", "r") as csvfile:
                scanData = csv.reader(csvfile)

                for row in scanData:
                    length = len(row)

                    if length > 0 and is_mac_address(row[0]):
                        bssidStation = row[0].strip()

                        if is_mac_address(row[5]) and (length == 7):   #Clients lines
                            bssidClient = row[5].strip()
                            for station in scans:
                                if station["bssidStation"] == bssidClient:
                                    if bssidStation not in station["clients"]:
                                        station["clients"].append(bssidStation)
                                    break

                        elif length == 15:                       #Stations lines
                            # Skip if we already recorded this AP.
                            if any(s["bssidStation"] == bssidStation for s in scans):
                                continue
                            channelStation = row[3].strip()
                            essidStation = row[13].strip()
                            scan = {
                                "bssidStation": bssidStation,
                                "essidStation": essidStation,
                                "channelStation": channelStation,
                                "type": row[5].strip(),
                                "clients": []
                                }
                            scans.append(scan)
            socketio.emit('data', scans)
        except FileNotFoundError:
            # Scan file not created yet; try again on the next loop.
            continue
        except Exception:
            break
