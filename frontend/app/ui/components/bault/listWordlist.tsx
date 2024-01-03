import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import Pagination from '../pagination';


interface Wordlist {
  id: number;
  name: string;
}

interface WordlistListProps {
  wordlists: Wordlist[];
  onUploadSuccess: (updatedWordlists: Wordlist[]) => void;
}

const WordlistList: React.FC<WordlistListProps> = ({ wordlists, onUploadSuccess }) => {
  const [selectedWordlist, setSelectedWordlist] = useState<Wordlist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Lógica de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = wordlists.length;
  const showPagination = totalItems > itemsPerPage;

  const handleWordlistClick = (wordlist: Wordlist) => {
    setSelectedWordlist((prevWordlist) => (prevWordlist === wordlist ? null : wordlist));
  };

  const handleDeleteClick = async () => {
    if (selectedWordlist) {
      setIsDeleting(true);

      try {
        // Simulación de la eliminación exitosa
        // Aquí deberías realizar la lógica de eliminación real

        // Asumiendo que las wordlists se reciben del backend después de la eliminación
        const updatedWordlists: Wordlist[] = wordlists.filter(wordlist => wordlist.id !== selectedWordlist.id);

        setSelectedWordlist(null);
        onUploadSuccess(updatedWordlists);
      } catch (error) {
        console.error('Error al eliminar la wordlist:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Lógica de paginación
  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-white text-2xl font-bold mb-4">Wordlists Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wordlists.slice(startIndex, endIndex).map((wordlist) => (
          <div
            key={wordlist.id}
            onClick={() => handleWordlistClick(wordlist)}
            className={`cursor-pointer p-4 rounded-lg ${
              selectedWordlist === wordlist ? 'bg-neutral-600' : 'bg-neutral-800 hover:bg-neutral-700'
            } transition duration-300`}
          >
            <h3 className="text-white text-lg font-semibold mb-2">{wordlist.name}</h3>
          </div>
        ))}
      </div>
      {selectedWordlist && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className='bg-neutral-800'
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar Wordlist'}
          </Button>
        </div>
      )}
      <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} page={page} onChangePage={handleChangePage} showPagination={showPagination} />
    </div>
  );
};

export default WordlistList;
