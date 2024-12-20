import React, { ChangeEvent } from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadFile } from '@/app/lib/data';

interface FileUploadButtonProps {
  onUploadSuccess: (updatedList: string[]) => void;
  lists: string[];
  type: string
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onUploadSuccess, lists, type }) => {

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Simulación de la carga exitosa
        // Aquí deberías realizar la lógica de carga real
        uploadFile(type,file)
        // Asumiendo que las list se reciben del backend después de la carga
        const updatedList: string[] = [...lists, file.name];

        // Devolver las list actualizadas al componente padre
        onUploadSuccess(updatedList);
      } catch (error) {
        console.error('Error al subir la lista:', error);
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
          Subir {type}
        </Button>
      </label>
    </div>
  );
};

export default FileUploadButton;
