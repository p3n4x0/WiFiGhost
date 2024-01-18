import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import SimpleDialog from './dialog';
import { fetchKeys, fetchList, startCrack } from '@/app/lib/data';
import { Alert } from '@mui/material';

interface KeyInfo {
  apName: string;
  bssid: string;
  password: string;
}

interface CrackerProps {
  setActivated: React.Dispatch<React.SetStateAction<number>>;
}

const Cracker: React.FC<CrackerProps> = ({ setActivated }) => {
  const [wordlists, setWordlists] = useState<string[]>([])
  const [hashesInfo, setHashesInfo] = useState<KeyInfo[]>([])
  const [hashes, setHashes] = useState<string[]>([])
  const [wordlistSelected, setWordlistSelected] = useState<string | null>(null)
  const [hashSelected, setHashSelected] = useState<string | null>(null)
  const [openWordlistDialog, setOpenWordlistDialog] = useState(false)
  const [openHashDialog, setOpenHashDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false);

  const handleCrackExecution = async (selectedHash: string, selectedWordlist: string) => {
    setActivated(3)
    await startCrack(selectedWordlist, selectedHash)
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 2500);
  };

  const handleWordlistClose = (value: string) => {
    setWordlistSelected(value)
    setOpenWordlistDialog(false)
  };

  const handleHashClose = (value: string) => {
    const [apName, bssid] = value.split('/');

    // Realiza la transformación
    const transformedValue = `${apName}&${bssid}.cap`;

    setHashSelected(transformedValue);
    setOpenHashDialog(false)
    setActivated((prevActivated) => (value ? 2 : prevActivated))
  }

  useEffect(() => {
    fetchList(setWordlists, "Wordlist");
    fetchKeys(setHashesInfo, "hashDB");
  }, []);

  useEffect(() => {
    if (hashesInfo){
      const updatedHashes = hashesInfo.map((info) => `${info.apName}/${info.bssid}`);
      setHashes(updatedHashes);
    }
  }, [hashesInfo]); 

  return (
    <div className='bg-neutral-900 p-6 rounded-lg shadow-lg h-half-screen mt-6 ml-8 mr-8'>
      <h2 className='text-white text-2xl font-bold mb-2'>Cracker</h2>
      <div className='flex justify-center items-center gap-96'>
        <div className='flex flex-col justify-center items-center'>
          <Image
            src={`${ wordlistSelected ? '/wordlistSelected.png' : '/noSelected.png'}`}
            className='mx-auto rounded-full object-cover transition transform hover:scale-110 cursor-pointer'
            alt='logo'
            width={180}
            height={120}
            priority
            onClick={() => setOpenWordlistDialog(true)}
          />
          <div className='text-white text-lg font-semibold mt-2'>
            {wordlistSelected ? `Wordlist: ${wordlistSelected}` : 'Select Wordlist'}
          </div>
          <SimpleDialog
            title="Select Wordlist"
            open={openWordlistDialog}
            selectedValue={wordlistSelected || ''}
            onClose={handleWordlistClose}
            options={wordlists}
          />
        </div>

        <div className='flex flex-col justify-center items-center'>
          <Image
            src={`${ hashSelected ? '/hashSelected.png' : '/noSelected.png'}`}
            className={`mx-auto rounded-full object-cover transition transform hover:scale-110 ${
              wordlistSelected ? '' : 'pointer-events-none opacity-50'
            } cursor-pointer`}
            alt='logo'
            width={180}
            height={120}
            priority
            onClick={() => setOpenHashDialog(true)}
          />
          <div className='text-white text-lg font-semibold mt-2'>
            {hashSelected ? `Hash: ${hashSelected}` : 'Select Hash'}
          </div>
          <SimpleDialog
            title="Select Hash"
            open={openHashDialog}
            selectedValue={hashSelected || ''}
            onClose={handleHashClose}
            options={hashes}
          />
        </div>

        <div className='flex flex-col justify-center items-center'>
          <Image
            src='/noSelected.png'
            className={`mx-auto rounded-full object-cover transition transform hover:scale-110  ${
              hashSelected ? '' : 'pointer-events-none opacity-50'
            }`}
            alt='logo'
            width={180}
            height={120}
            priority
            onClick={() =>{if (hashSelected !== null && wordlistSelected !== null) handleCrackExecution(hashSelected, wordlistSelected)}}
          />
          <div className='text-white text-lg font-semibold mt-2'>Crack</div>
        </div>
        {showAlert && (
          <Alert severity="success" sx={{ position: 'fixed', bottom: 16, left: 16 }}>
            Password Cracked
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Cracker;
