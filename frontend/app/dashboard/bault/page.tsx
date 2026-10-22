"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyList from "@/app/ui/components/bault/keys";
import ListContainer from "@/app/ui/components/bault/listContainer";
import { fetchKeys, KeyInfo } from '@/app/lib/data';

export default function VaultPage() {
  const [keys, setKeys] = useState<KeyInfo[]>([]);

  const reloadKeys = useCallback(() => {
    fetchKeys(setKeys, "all");
  }, []);

  useEffect(() => {
    reloadKeys();
  }, [reloadKeys]);

  return (
    <main className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vault</h1>
          <p className="text-sm text-[color:var(--text-dim)]">
            Captured handshakes, cracked keys and your wordlists.
          </p>
        </div>
        <Tooltip title="Refresh keys">
          <IconButton onClick={reloadKeys}>
            <RefreshRoundedIcon className="text-[color:var(--text-dim)]" />
          </IconButton>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <KeyList keysInfo={keys} />
        <div className="flex flex-col gap-6">
          <ListContainer type="Wordlist" />
          <ListContainer type="FakeNetworks" />
        </div>
      </div>
    </main>
  );
}
