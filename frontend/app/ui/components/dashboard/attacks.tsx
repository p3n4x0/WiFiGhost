import React from 'react';

// The `id` here MUST match the attack ids handled by the backend /attack/<id>
// route (0-9). Do not reorder without updating routes.py.
interface AttackDef {
  id: number;
  label: string;
  desc: string;
  group: 'wpac' | 'wpanc' | 'wps' | 'wep';
}

const ATTACKS: AttackDef[] = [
  { id: 0, label: 'Deauthentication', desc: 'Kick clients to force a handshake', group: 'wpac' },
  { id: 1, label: 'Fake DoS', desc: 'Flood the AP with auth frames', group: 'wpac' },
  { id: 2, label: 'Beacon Flood', desc: 'Broadcast fake SSIDs', group: 'wpac' },
  { id: 3, label: 'Disassociation Amok', desc: 'Mass disassociation', group: 'wpac' },
  { id: 4, label: 'Michael Shutdown', desc: 'TKIP countermeasure exploit', group: 'wpac' },
  { id: 5, label: 'PMKID', desc: 'Clientless WPA/WPA2 capture', group: 'wpanc' },
  { id: 6, label: 'Reaver WPS PIN', desc: 'Brute-force the WPS PIN', group: 'wps' },
  { id: 7, label: 'WEP Fake Auth', desc: 'Fake auth + ARP replay', group: 'wep' },
  { id: 8, label: 'WEP Chopchop', desc: 'Fake auth + chopchop', group: 'wep' },
  { id: 9, label: 'WEP Fragmentation', desc: 'Fake auth + fragmentation', group: 'wep' },
];

const GROUP_LABEL: Record<string, string> = {
  wpac: 'WPA / WPA2 · with clients',
  wpanc: 'WPA / WPA2 · without clients',
  wps: 'WPS',
  wep: 'WEP',
};

interface AttackSelectorProps {
  apType: string;
  clients: number;
  selectedAttack: number | null;
  onSelectAttack: (index: number | null) => void;
}

const AttackSelector: React.FC<AttackSelectorProps> = ({
  apType,
  clients,
  selectedAttack,
  onSelectAttack,
}) => {
  let group: AttackDef['group'];
  if (apType.includes('wep')) group = 'wep';
  else if (apType.includes('wps')) group = 'wps';
  else group = clients > 0 ? 'wpac' : 'wpanc';

  const available = ATTACKS.filter((a) => a.group === group);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-white">Select attack</h3>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-[color:var(--text-dim)]">
          {GROUP_LABEL[group]}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((a) => {
          const active = selectedAttack === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onSelectAttack(active ? null : a.id)}
              className={`rounded-lg border p-3 text-left transition ${
                active
                  ? 'border-brand bg-brand/15'
                  : 'border-[color:var(--border)] bg-surface-hi hover:border-brand/50'
              }`}
            >
              <div className="text-sm font-semibold text-white">{a.label}</div>
              <div className="mt-0.5 text-xs text-[color:var(--text-dim)]">{a.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AttackSelector;
