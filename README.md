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

- Aircrack-ng Suite  
- MDK3  
- HCXDumpTool  
- Pyrit  
- Linux bare-metal or a WiFi adapter compatible with monitor mode (see [network card](https://www.tienda-alfanetwork.com/alfa-awus036ach-c-adaptador-wifi-usb-ac1200.html)).  

---

## 📥 Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/p3n4x0/WiFiGhost.git && cd WiFiGhost
   ```
2. **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```   
3. **Set permissions:**
    ```bash
    sudo chmod +x backend/server.py
    ```
4. **Set Database Config (also feel free to change the mac oui as well as the secret if needed):**
    ```bash
    vi backend/config/config.yaml
    ```
---

## 🚀 Usage
1. **Run the backend server in one terminal (you can monitor server logs and ensure proper functionality):**
   ```bash
   sudo python3 backend/server.py
   ```
2. **Run the frontend client in another terminal:**
   ```bash
   sudo python3 backend/server.py
   ```
3. Put your network card in monitor mode and start hacking! Below is a video demonstrating an example of use: attacking a WPA2-PSK network with authenticated clients.


https://github.com/user-attachments/assets/24024d17-d980-42ef-8287-dc81d96543e3
