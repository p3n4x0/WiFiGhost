import React, { useState } from 'react';
import { Button, CircularProgress, Modal} from '@mui/material';
import AttackSelector from './attacks';
import Pagination from '../pagination';

interface ScanInfo {
  bssidStation: string;
  essidStation: string;
  channelStation: number;
  type: string;
  clients: string[];
}

interface APListProps {
  scans: ScanInfo[];
  isActivated: number;
  setActivated: React.Dispatch<React.SetStateAction<number>>;
}

const Scanner: React.FC<APListProps> = ({ scans, isActivated, setActivated }) => {
  const [selectedAP, setSelectedAP] = useState<ScanInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [attack, setAttack] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Lógica de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = scans.length;
  const showPagination = totalItems > itemsPerPage;

  const handleAPClick = (ap: ScanInfo) => {
    setSelectedAP((prevAP) => (prevAP === ap ? null : ap));
    setActivated((prevActivated) => (selectedAP === ap ? 0 : 1));
  };

  const handleAttackClick = async () => {
    if (selectedAP && attack) {
      setIsFetching(true);
      try {
        // Aquí deberías realizar la lógica de conexión real al backend
        console.log(`Status: ${selectedAP.essidStation} | ${attack}`);
      } catch (error) {
        console.error('Error al conectarse al AP:', error);
      } finally {
        setIsFetching(false);
        setActivated((prevActivated) => (isActivated === 1 ? prevActivated + 1 : prevActivated));
      }
    }
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSelectAttack = (attack: string) => {
    setAttack(attack);
  };

  const handleShowClientsModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = scans.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-half-screen mt-8 ml-8 mr-8">
      <h2 className="text-white text-2xl font-bold mb-2">Scanner</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {currentItems.map((ap) => (
          <div
            key={ap.bssidStation}
            onClick={() => handleAPClick(ap)}
            className={`cursor-pointer flex p-4 rounded-lg ${
              selectedAP === ap ? 'bg-neutral-600' : 'bg-neutral-800 hover:bg-neutral-700'
            } transition duration-300`}
          >
            <div className="flex flex-col">
              <h3 className="text-white text-lg font-semibold">{ap.essidStation}</h3>
              <p className="text-gray-400">BSSID: {ap.bssidStation}</p>
              <p className="text-gray-400">Channel: {ap.channelStation}</p>
              <p className="text-gray-400">Type: {ap.type}</p>
            </div>
            <div className="ml-auto flex flex-col">
              <p className="text-gray-400">Clients:</p>
              <ul className="list-disc list-inside text-gray-400">
                {ap.clients.slice(0, 3).map((client) => (
                  <li key={client}>{client}</li>
                ))}
                {ap.clients.length > 3 && (
                  <>
                    <li onClick={handleShowClientsModal} className="cursor-pointer underline text-gray-400">
                      {`+${ap.clients.length - 3} more`}
                    </li>
                    <Modal open={showModal} onClose={handleCloseModal}>
                      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg mx-auto my-16 max-w-md border border-black">
                        <h2 className="text-white text-2xl font-bold">Clients</h2>
                        <ul className="list-disc list-inside text-white">
                          {ap.clients.map((client) => (
                            <li key={client}>{client}</li>
                          ))}
                        </ul>
                      </div>
                    </Modal>
                  </>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} page={page} onChangePage={handleChangePage} showPagination={showPagination} />
      {selectedAP && (
        <>
          <div>
            <AttackSelector apType={selectedAP.type} clients={selectedAP.clients.length} onSelectAttack={handleSelectAttack} />
          </div>
          <div className="flex justify-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleAttackClick}
              disabled={isFetching}
              className="bg-neutral-800"
            >
              {isFetching ? <CircularProgress size={20} color="inherit" /> : 'Attack'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Scanner;
