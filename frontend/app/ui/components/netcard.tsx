import { Button, Popover } from 'keep-react';
import IconButton from '@mui/material/IconButton';
import NetcardSwitches from './switch';
import { useState, useEffect } from 'react';
import WifiOffRounded from '@mui/icons-material/WifiOffRounded';
import WifiRounded from '@mui/icons-material/WifiRounded';
import { getNetcards } from '@/app/lib/data';

interface PopoverComponentProps {
  onCheckout: (netcardSelected: string) => void;
}

export const PopoverComponent: React.FC<PopoverComponentProps> = ({ onCheckout }) => {
  const netcards = [
    { id: 1, name: 'Netcard 1' },
    { id: 2, name: 'Netcard 2' },
    { id: 3, name: 'Netcard 3' },
    // Agrega más netcards según sea necesario
  ];
  const [netcard, setNetcard] = useState('');
  const [netcardSelected, setNetcardSelected] = useState<string | null>(null);

  const handleNetcardChange = (netcardName: string) => {
    setNetcard(netcardName);
  };

  const handleCheckoutClick = () => {
    setNetcardSelected(netcard);
    onCheckout(netcard); // Pasa el valor al componente padre
    // Aquí puedes realizar la petición al servidor con el valor de netcard
  };

  useEffect(() => {
    // Verificar si hay un valor en localStorage al cargar el componente
    const savedNetcard = localStorage.getItem('selectedNetcard');
    if (savedNetcard) {
      setNetcardSelected(savedNetcard);
    }
  }, []);

  return (
    <Popover className="dark:bg-neutral-900 dark:border-neutral-700 rounded-lg shadow-lg">
      <Popover.Title className="text-white">Netcard Status</Popover.Title>
      <NetcardSwitches netcards={netcards} onNetcardChange={handleNetcardChange} />
      <Popover.Container className='justify-center'>
        <Button size="xs" onClick={handleCheckoutClick} className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg cursor-pointer focus:outline-none">
          Checkout
        </Button>
      </Popover.Container>
      <Popover.Action>
        <IconButton className='rounded-full px-5 py-2 mr-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 hover:scale-110'>
          {netcardSelected ? <WifiRounded className='text-green-500'/> : <WifiOffRounded className='text-red-500'/>}
        </IconButton>
      </Popover.Action>
    </Popover>
  );
};
