import React, { useState } from 'react';
import Pagination from '../pagination';
import { Alert, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface KeyInfo {
  apName: string;
  bssid: string;
  password: string;
}

interface KeyListProps {
  keysInfo: KeyInfo[];
}

const KeyList: React.FC<KeyListProps> = ({ keysInfo }) => {
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  // Lógica de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = keysInfo.length;
  const showPagination = totalItems > itemsPerPage;

  const handleKeyClick = (key: KeyInfo) => {
    // Deseleccionar la clave si ya estaba seleccionada
    setSelectedKey((prevKey) => (prevKey === key || key.password === null ? null : key));
  };

  const handleCopyToClipboard = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 1000);
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
        {keysInfo.slice(startIndex, endIndex).map((key, index) => (
          <div
            key={index}
            onClick={() => handleKeyClick(key)}
            className={`cursor-pointer p-4 rounded-lg ${
              selectedKey === key ? 'bg-neutral-600' : 'bg-neutral-800 hover:bg-neutral-700'
            } transition duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-lg font-semibold">{key.apName}, {key.bssid}</h3>
              {selectedKey === key && (
                <CopyToClipboard text={key.password} onCopy={handleCopyToClipboard}>
                  <Tooltip title="Copy Password to Clipboard" placement='top'>
                    <IconButton size="small" className='bg-white'>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </CopyToClipboard>
              )}
              {showAlert && (
                <Alert severity="success" sx={{ position: 'fixed', bottom: 16, left: 16 }}>
                  Copied to Clipboard
                </Alert>
              )}
            </div>
            <p className={selectedKey === key ? 'text-white' : 'text-gray-400'}>
              {selectedKey === key ? 
                `Password: ${key.password}` : key.password !== null ? 
                  'Click to reveal password': ''}
            </p>
          </div>
        ))}
      </div>
      <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} page={page} onChangePage={handleChangePage} showPagination={showPagination} />
    </div>
  );
};

export default KeyList;
