import React, { ChangeEvent } from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadButtonProps {
  onUploadSuccess: (updatedWordlists: React.SetStateAction<{ id: number; name: string; }[]>) => void;
  wordlists: { id: number; name: string; }[];
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onUploadSuccess, wordlists }) => {

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Simulación de la carga exitosa
        // Aquí deberías realizar la lógica de carga real

        // Asumiendo que las wordlists se reciben del backend después de la carga
        const updatedWordlists: { id: number; name: string; }[] = [
          ...wordlists,
          { id: wordlists.length + 1, name: file.name }, // Nueva wordlist agregada después de la carga
        ];

        // Devolver las wordlists actualizadas al componente padre
        onUploadSuccess(updatedWordlists);
      } catch (error) {
        console.error('Error al subir la wordlist:', error);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label>
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          className='bg-neutral-800'
        >
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          Subir Wordlist
        </Button>
      </label>
    </div>
  );
};

export default FileUploadButton;
