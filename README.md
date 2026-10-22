# 👻 WiFiGhost 👻

This is a tool designed for performing WiFi audits ethically and professionally. It is tailored for security researchers, network administrators, and cybersecurity enthusiasts, enabling the identification of vulnerabilities in wireless networks through a web interface, which streamlines and simplifies the process.

---

## 📋 Table of Contents

1. [Features](#-features)  
2. [Requirements](#-requirements)  
3. [Installation](#-installation)  
4. [Usage](#-usage)  

---

## ✨ Features

- **Recognition and Enumeration**:
  - Scan for available WiFi networks
  - Collect information about networks (SSID, BSSID, channel, clients, security)
- **Vulnerability Analysis**
- **Exploitation**:
  - Brute-force and dictionary attacks
  - Deauthentication attacks
  - Man-in-the-middle attacks
- **Supported Network Types**:  
  - WEP (Wired Equivalent Privacy)  
  - WPA (WiFi Protected Access)  
  - WPA2-PSK (Wi-Fi Protected Access 2 - Pre-shared Key)  

---

## ⚙️ Requirements

Before starting, ensure you have the following:

**System tools** (available in Kali, or `apt install` them):

- Aircrack-ng Suite (`airmon-ng`, `airodump-ng`, `aireplay-ng`, `aircrack-ng`, `packetforge-ng`) — handshake detection and WPA/WEP cracking
- MDK3
- HCXDumpTool + HCXTools (`hcxdumptool`, `hcxpcapngtool`) — PMKID capture/extraction
- Hashcat (for cracking PMKID hashes, mode 22000)
- Reaver (for WPS attacks)
- macchanger
- wireless-tools (`iwconfig`)

**Runtimes:**

- Python 3.8+
- Node.js 18+ and npm (for the web interface)

**Hardware:**

- Linux bare-metal or a WiFi adapter compatible with monitor mode (see [network card](https://www.tienda-alfanetwork.com/alfa-awus036ach-c-adaptador-wifi-usb-ac1200.html)).  

---

## 📥 Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/p3n4x0/WiFiGhost.git && cd WiFiGhost
   ```
2. **Install the backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    On Kali and other PEP 668 "externally managed" systems the command above
    is blocked. Either install the package from apt:
    ```bash
    sudo apt install -y python3-flask-cors python3-flask python3-yaml
    ```
    or use a virtual environment (and then launch the server with
    `sudo venv/bin/python backend/server.py`):
    ```bash
    python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
    ```
3. **Install the frontend dependencies:**
    ```bash
    cd frontend && npm install && cd ..
    ```
4. **Set permissions:**
    ```bash
    sudo chmod +x backend/server.py
    ```
5. **Review the configuration (feel free to change the spoofed MAC OUI, the Flask secret, host/port or the capture path):**
    ```bash
    vi backend/config/config.yaml
    ```
    The frontend talks to `http://127.0.0.1:8080` by default. To point it at a
    different backend, create `frontend/.env.local` with:
    ```bash
    NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
    ```
---

## 🚀 Usage
1. **Run the backend server in one terminal (you can monitor server logs and ensure proper functionality):**
   ```bash
   sudo python3 backend/server.py
   ```
2. **Run the frontend client in another terminal:**
   ```bash
   cd frontend && npm run dev
   ```
3. Go to `localhost:3000`, put your wireless interface in monitor mode and start auditing.

### Demo

A short walkthrough of a **Deauthentication** attack — kicking a client to
capture the WPA2 handshake:

<!-- Drop your recording here: on GitHub, edit this README and drag the video
     file onto the line below. It will upload to user-attachments and embed. -->

_Demo video coming soon._

---

## ⚠️ Legal & Authorization Notice

WiFiGhost is intended **only** for auditing networks you own or that you have
explicit, written permission to test. Intercepting traffic, deauthenticating
clients or cracking keys on networks you are not authorized to assess is
illegal in most jurisdictions. You are solely responsible for how you use this
tool. The authors accept no liability for misuse or for any damage caused.
