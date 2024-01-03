import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

interface APAttacks {
  [key: string]: string[];
}

const AP_ATTACKS: APAttacks = {
  'wpac': ['Deauthentication', 'Fake DoS Attack', 'Beacon Flood Mode Attack', 'Disassociation Amok Mode Attack', 'Michael Shutdown Exploitation'],
  'wpanc': ['PMKID'],
  'wps': ['Reaver Pin Attack'],
  'wep': ['Fake Authentication Attack', 'Fake Authentication Attack + Chopchop', 'Fake Authentication Attack + Fragmentation'],
};

interface AttackCheckboxProps {
  attack: string;
  disabled: boolean;
  onChange: () => void;
}

const AttackCheckbox: React.FC<AttackCheckboxProps> = ({ attack, disabled, onChange }) => (
  <FormControlLabel
    control={<Checkbox onChange={onChange} disabled={disabled} className='text-white'/>}
    label={attack}
  />
);

interface AttackSelectorProps {
  apType: string;
  clients: number;
  onSelectAttack: (attack: string) => void;
}

const AttackSelector: React.FC<AttackSelectorProps> = ({ apType, clients, onSelectAttack }) => {
  const allAttacks = ['Deauthentication', 'Fake DoS Attack', 'Beacon Flood Mode Attack', 'Disassociation Amok Mode Attack', 'Michael Shutdown Exploitation', 'PMKID', 'Reaver Pin Attack', 'Fake Authentication Attack', 'Fake Authentication Attack + Chopchop', 'Fake Authentication Attack + Fragmentation'];
  if (apType !== 'wps' && apType !== 'wep') {
    apType = clients > 0 ? 'wpac' : 'wpanc';
  }
  const availableAttacks = AP_ATTACKS[apType] || [];


  return (
    <div>
      <h3 className="text-white text-lg font-semibold ">Seleccione Ataques:</h3>
      {allAttacks.map((attack) => (
        <AttackCheckbox
          key={attack}
          attack={attack}
          disabled={!availableAttacks.includes(attack)}
          onChange={() => onSelectAttack(attack)}
        />
      ))}
    </div>
  );
};

export default AttackSelector;
