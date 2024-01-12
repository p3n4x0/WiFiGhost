// components/NetcardSwitches.tsx
import { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useForm, Controller } from 'react-hook-form';

interface NetcardSwitchesProps {
  netcards: string[];
  onNetcardChange: (netcardName: string) => void;
}

const NetcardSwitches: React.FC<NetcardSwitchesProps> = ({ netcards, onNetcardChange }) => {
  const { control, setValue } = useForm();
  const [selectedNetcard, setSelectedNetcard] = useState<string | null>(null);

  const handleSwitchChange = (netcardName: string) => {
    // Si el switch actual ya está seleccionado, deselecciónalo
    if (selectedNetcard === netcardName) {
      setValue('netcard', ''); // Desseleccionar
      setSelectedNetcard(null);
      onNetcardChange(''); // Notificar la deselección
    } else {
      setValue('netcard', netcardName);
      setSelectedNetcard(netcardName);
      onNetcardChange(netcardName);
    }
  };

  useEffect(() => {
    // Recuperar el estado del switch desde el almacenamiento local (localStorage)
    const savedNetcardName = localStorage.getItem('selectedNetcard');
    if (savedNetcardName) {
      setSelectedNetcard(savedNetcardName);
    }
  }, []);

  // Almacenar el estado del switch en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('selectedNetcard', selectedNetcard || '');
  }, [selectedNetcard]);

  return (
    <div className="flex space-x-4 ml-2 mt-2">
      <FormGroup>
        {Array.isArray(netcards) && netcards.length > 0 ? (
          netcards.map((netcard) => (
            <div key={netcard} className="flex items-center">
              <Controller
                control={control}
                name="netcard"
                defaultValue=""
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={selectedNetcard === netcard}
                        onChange={() => handleSwitchChange(netcard)}
                      />
                    }
                    label={netcard}
                  />
                )}
              />
            </div>
          ))
        ) : (
          <p>No hay netcards disponibles.</p>
        )}
      </FormGroup>
    </div>
  );
};

export default NetcardSwitches;