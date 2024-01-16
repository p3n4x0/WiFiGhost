"use client"
import React, { useEffect, useState } from 'react';
import KeyList from "@/app/ui/components/bault/keys";
import ListContainer from "@/app/ui/components/bault/listContainer";
import { fetchKeys } from '@/app/lib/data';

interface KeyInfo {
  apName: string;
  bssid: string;
  password: string;
}

export default function Home() {

  const [keys, setKeys] = useState<KeyInfo[]>([]);

  useEffect(() => {
    fetchKeys(setKeys, "all")
  }, []); 
  
  return (
    <div className="flex-1 flex min-h-screen text-white">
      {/* Sección de contraseñas */}
      <div className="flex-1 flex items-center justify-center ml-8 mb-48">
        <KeyList keysInfo={keys} />
      </div>

      {/* Sección de wordlists y opción de subir */}
      <div className="flex-1 flex flex-col items-center justify-center ml-4 mb-40">
        <ListContainer type="Wordlist" />
        <ListContainer type="FakeNetworks" />
      </div>
    </div>
  );
}



