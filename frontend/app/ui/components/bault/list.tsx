import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import Pagination from '../pagination';


interface List {
  id: number;
  name: string;
}

interface ListProps {
  lists: List[];
  onUploadSuccess: (updatedLists: List[]) => void;
  type: string
}

const List: React.FC<ListProps> = ({ lists, onUploadSuccess, type }) => {
  const [SelectedList, setSelectedList] = useState<List | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Lógica de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = lists.length;
  const showPagination = totalItems > itemsPerPage;

  const handlelistClick = (list: List) => {
    setSelectedList((prevlist) => (prevlist === list ? null : list));
  };

  const handleDeleteClick = async () => {
    if (SelectedList) {
      setIsDeleting(true);

      try {
        // Simulación de la eliminación exitosa
        // Aquí deberías realizar la lógica de eliminación real

        // Asumiendo que las lists se reciben del backend después de la eliminación
        const updatedLists: List[] = lists.filter(list => list.id !== SelectedList.id);

        setSelectedList(null);
        onUploadSuccess(updatedLists);
      } catch (error) {
        console.error('Error al eliminar la list:', error);
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
      <h2 className="text-white text-2xl font-bold mb-4">{type} Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.slice(startIndex, endIndex).map((list) => (
          <div
            key={list.id}
            onClick={() => handlelistClick(list)}
            className={`cursor-pointer p-4 rounded-lg ${
              SelectedList === list ? 'bg-neutral-600' : 'bg-neutral-800 hover:bg-neutral-700'
            } transition duration-300`}
          >
            <h3 className="text-white text-lg font-semibold mb-2">{list.name}</h3>
          </div>
        ))}
      </div>
      {SelectedList && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className='bg-neutral-800'
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar list'}
          </Button>
        </div>
      )}
      <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} page={page} onChangePage={handleChangePage} showPagination={showPagination} />
    </div>
  );
};

export default List;
