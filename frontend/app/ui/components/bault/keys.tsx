// keys.tsx
import React, { useState } from 'react';
import Pagination from '../pagination';


interface KeyInfo {
  id: number;
  apName: string;
  bssid: string;
  password: string;
}

interface KeyListProps {
  keysInfo: KeyInfo[];
}

const KeyList: React.FC<KeyListProps> = ({ keysInfo }) => {
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null);
  // Lógica de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = keysInfo.length;
  const showPagination = totalItems > itemsPerPage;

  const handleKeyClick = (key: KeyInfo) => {
    // Deseleccionar la clave si ya estaba seleccionada
    setSelectedKey((prevKey) => (prevKey === key ? null : key));
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-white text-2xl font-bold mb-4">Wi-Fi Keys</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keysInfo.slice(startIndex, endIndex).map((key) => (
          <div
            key={key.id}
            onClick={() => handleKeyClick(key)}
            className={`cursor-pointer p-4 rounded-lg ${
              selectedKey === key ? 'bg-neutral-600' : 'bg-neutral-800 hover:bg-neutral-700'
            } transition duration-300`}
          >
            <h3 className="text-white text-lg font-semibold mb-2">{key.apName}, {key.bssid}</h3>
            <p className={selectedKey === key ? 'text-white' : 'text-gray-400'}>
              {selectedKey === key ? `Password: ${key.password}` : 'Click to reveal password'}
            </p>
          </div>
        ))}
      </div>
      <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} page={page} onChangePage={handleChangePage} showPagination={showPagination} />
      </div>
  );
};

export default KeyList;
