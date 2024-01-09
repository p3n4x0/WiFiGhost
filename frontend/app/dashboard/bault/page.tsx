"use client"
import React from 'react';
import KeyList from "@/app/ui/components/bault/keys";
import ListContainer from "@/app/ui/components/bault/listContainer";

export default function Home() {
  const exampleKeys = [
    { id: 1, apName: 'WiFi Network 1', password: 'examplePassword1', bssid: 'pruebaBssid1' },
    { id: 2, apName: 'WiFi Network 2', password: 'examplePassword2', bssid: 'pruebaBssid2' },
    { id: 3, apName: 'WiFi Network 3', password: 'examplePassword3', bssid: 'pruebaBssid3' },
  ];
  return (
    <div className="flex-1 flex min-h-screen text-white">
      {/* Sección de contraseñas */}
      <div className="flex-1 flex items-center justify-center ml-8 mb-48">
        <KeyList keysInfo={exampleKeys} />
      </div>

      {/* Sección de wordlists y opción de subir */}
      <div className="flex-1 flex flex-col items-center justify-center ml-4 mb-40">
        <ListContainer type="Wordlist" />
        <ListContainer type="FakeNetworks" />
      </div>
    </div>
  );
}



