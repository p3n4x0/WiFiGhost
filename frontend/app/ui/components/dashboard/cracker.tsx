import React, { useState } from 'react';
import Image from 'next/image';
import SimpleDialog, { SimpleDialogProps } from './dialog';

interface CrackerProps {
  setActivated: React.Dispatch<React.SetStateAction<number>>;
  handleCrackExecution: (selectedHash: string, selectedWordlist: string) => void
}

const Cracker: React.FC<CrackerProps> = ({setActivated, handleCrackExecution}) => {
  const [wordlistSelected, setWordlistSelected] = useState<string | null>(null);
  const [hashSelected, setHashSelected] = useState<string | null>(null);
  const [openWordlistDialog, setOpenWordlistDialog] = useState(false);
  const [openHashDialog, setOpenHashDialog] = useState(false);

  const handleWordlistClose = (value: string) => {
    setWordlistSelected(value);
    setOpenWordlistDialog(false);
  };

  const handleHashClose = (value: string) => {
    setHashSelected(value);
    setOpenHashDialog(false);
    setActivated((prevActivated) => (value ? 2 : prevActivated));
  };

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
            open={openWordlistDialog}
            selectedValue={wordlistSelected || ''}
            onClose={handleWordlistClose}
            options={['Wordlist1', 'Wordlist2', 'Wordlist3']}
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
            open={openHashDialog}
            selectedValue={hashSelected || ''}
            onClose={handleHashClose}
            options={['Hash1', 'Hash2', 'Hash3']}
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
      </div>
    </div>
  );
};

export default Cracker;
