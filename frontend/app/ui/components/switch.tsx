// components/NetcardSwitches.tsx
import { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useForm, Controller } from 'react-hook-form';

interface Netcard {
  id: number;
  name: string;
}

interface NetcardSwitchesProps {
  netcards: Netcard[];
  onNetcardChange: (netcardName: string) => void;
}

const NetcardSwitches: React.FC<NetcardSwitchesProps> = ({ netcards, onNetcardChange }) => {
  const { control, setValue } = useForm();
  const [selectedNetcard, setSelectedNetcard] = useState<number | null>(null);

  const handleSwitchChange = (netcardId: number, netcardName: string) => {
    // Si el switch actual ya está seleccionado, deselecciónalo
    if (selectedNetcard === netcardId) {
      setValue('netcard', ''); // Desseleccionar
      setSelectedNetcard(null);
      onNetcardChange(''); // Notificar la deselección
    } else {
      setValue('netcard', netcardId);
      setSelectedNetcard(netcardId);
      onNetcardChange(netcardName);
    }
  };

  useEffect(() => {
    // Recuperar el estado del switch desde el almacenamiento local (localStorage)
    const savedNetcardId = localStorage.getItem('selectedNetcard');
    if (savedNetcardId) {
      setSelectedNetcard(parseInt(savedNetcardId, 10));
    }
  }, []);

  // Almacenar el estado del switch en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('selectedNetcard', selectedNetcard?.toString() || '');
  }, [selectedNetcard]);

  return (
    <div className="flex space-x-4 ml-2 mt-2">
      <FormGroup>
        {netcards.map((netcard) => (
          <div key={netcard.id} className="flex items-center">
            <Controller
              control={control}
              name="netcard"
              defaultValue=""
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={selectedNetcard === netcard.id}
                      onChange={() => handleSwitchChange(netcard.id, netcard.name)}
                    />
                  }
                  label={netcard.name}
                />
              )}
            />
          </div>
        ))}
      </FormGroup>
    </div>
  );
};

export default NetcardSwitches;
