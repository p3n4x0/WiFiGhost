"use client"
import { useState } from "react";
import Scanner from "../ui/components/dashboard/scanner";
import Stepper from "../ui/components/dashboard/stepper";
import Cracker from "../ui/components/dashboard/cracker";

const sampleScans = [
  {
    bssidStation: '12:34:56:78:90:AB',
    essidStation: 'WiFi Network 1',
    channelStation: 6,
    type: 'wpa',
    clients: ['AA:BB:CC:DD:EE:FF', '11:22:33:44:55:66'],
  },
  {
    bssidStation: 'AB:CD:EF:12:34:56',
    essidStation: 'WiFi Network 2',
    channelStation: 11,
    type: 'wpa2',
    clients: [],
  },
  {
    bssidStation: 'EF:12:34:56:78:90',
    essidStation: 'WiFi Network 3',
    channelStation: 1,
    type: 'wep',
    clients: [],
  },
  {
    bssidStation: 'E1:12:34:52:78:90',
    essidStation: 'WiFi Network 4',
    channelStation: 1,
    type: 'wpa2',
    clients: ['AA:BB:CC:DD:EE:FF', '22:33:44:55:66:77', '33:44:55:66:77:88', '33:44:55:66:77:88', '33:44:55:66:77:88'],
  },
  {
    bssidStation: 'EF:12:34:52:78:91',
    essidStation: 'WiFi Network 4',
    channelStation: 1,
    type: 'wps',
    clients: [],
  },
  {
    bssidStation: 'EF:12:34:52:78:92',
    essidStation: 'WiFi Network 4',
    channelStation: 1,
    type: 'wps',
    clients: [],
  },
  {
    bssidStation: 'EF:12:34:52:78:93',
    essidStation: 'WiFi Network 4',
    channelStation: 1,
    type: 'wps',
    clients: [],
  },
  {
    bssidStation: 'EF:12:34:52:78:94',
    essidStation: 'WiFi Network 4',
    channelStation: 1,
    type: 'wps',
    clients: [],
  },
];


export default function Home() {
  const [isActivated, setActivated] = useState(0);
  const handleCrackExecution = (selectedHash: string, selectedWordlist: string) => {
    setActivated(3)
    // Aquí deberías realizar la lógica de crackeo con los parámetros seleccionados
    console.log('Cracking with Hash:', selectedHash);
    console.log('Using Wordlist:', selectedWordlist);
    // Realiza la lógica de conexión al backend o cualquier acción necesaria
  };
  return (
    <main>
      <Scanner scans={sampleScans} isActivated={isActivated} setActivated={setActivated} />
      <Cracker setActivated={setActivated} handleCrackExecution={handleCrackExecution}/>
      <Stepper isActivated={isActivated}/>
    </main>
  );
}

