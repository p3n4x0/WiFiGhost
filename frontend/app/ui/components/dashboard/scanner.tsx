import React, { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, FormControl, InputLabel, MenuItem, Modal, Select} from '@mui/material';
import AttackSelector from './attacks';
import Pagination from '../pagination';
import { fetchList, setTarget, startAttack, startAttack0, startAttack2 } from '@/app/lib/data';
import io from 'socket.io-client'


const socket = io('http://localhost:8080/')


interface ScanInfo {
  bssidStation: string;
  essidStation: string;
  channelStation: number;
  type: string;
  clients: string[];
}

interface APListProps {
  isActivated: number;
  setActivated: React.Dispatch<React.SetStateAction<number>>;
}

const Scanner: React.FC<APListProps> = ({ isActivated, setActivated }) => {
  const [selectedAP, setSelectedAP] = useState<ScanInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [attack, setAttack] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedNumPackets, setSelectedNumPackets] = useState(0);
  const [selectedFakeNetworks, setselectedFakeNetworks] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [scans, setScans] = useState<ScanInfo[] | null>(null);
  const [fakeNetwords, setFakeNetworks] = useState<string[]>([])

  useEffect(() => {
    socket.on('data', (scansIO) => {
      setScans(scansIO)
    });
    /*setScans([
      {
        bssidStation: "aaaaaa",
        essidStation: "string",
        channelStation: 1,
        type: "wpa",
        clients: ["aaaa", "bbbb"]
      }
    ]);       Just to test*/
  }, []);

  useEffect(() => {
    if(attack  === 2) fetchList(setFakeNetworks, "FakeNetworks")
  }, [attack]); 
  
  // Lógica de paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = scans ? scans.length : 0;
  const showPagination = totalItems > itemsPerPage;

  const handleAPClick = async (ap: ScanInfo) => {
    setSelectedAP((prevAP) => (prevAP === ap ? null : ap));
    setActivated(() => (selectedAP === ap ? 0 : 1));
    if (selectedAP !== ap) await setTarget(ap.bssidStation, ap.essidStation, ap.channelStation)
  };

  const handleAttackClick = async () => {
    if (selectedAP && attack || selectedAP && attack === 0) {
      setIsFetching(true);
      try {
        if (attack === 0) await startAttack0(attack, selectedNumPackets)
        else if (attack === 2) startAttack2(attack, selectedFakeNetworks)
        else startAttack(attack)
        console.log(`Status: ${selectedAP.essidStation} | ${attack}`);
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2500);
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

  const handleShowClientsModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = scans ? scans.slice(indexOfFirstItem, indexOfLastItem) : [];

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
            <AttackSelector apType={selectedAP.type.toLowerCase()} clients={selectedAP.clients.length} selectedAttack={attack} onSelectAttack={setAttack} />
          </div>
          <div className="flex justify-end gap-6">
            {attack === 0 && (
              <FormControl className="min-w-[200px]">
                <InputLabel
                  id="numPacketsLabel"
                  className={`text-white ${selectedNumPackets ? 'transform translate-y-[-130%] scale-75' : ''}`}
                >
                  Num Packets:
                </InputLabel>
                <Select
                  labelId="numPacketsLabel"
                  id="numPacketsSelect"
                  value={selectedNumPackets ? selectedNumPackets : ''}
                  label="Num Packets"
                  onChange={(e) => setSelectedNumPackets(e.target.value as number)}
                  className="text-white"
                >
                  {/* Aquí deberías mapear las opciones disponibles de Fake Networks */}
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="15">15</MenuItem>
                  <MenuItem value="20">20</MenuItem>
                  <MenuItem value="30">30</MenuItem>
                </Select>
              </FormControl>
            )}
            {attack === 2 && (
              <FormControl className="min-w-[200px]">
                <InputLabel
                  id="fakeNetworkLabel"
                  className={`text-white ${selectedFakeNetworks ? 'transform translate-y-[-130%] scale-75' : ''}`}
                >
                  Fake Network:
                </InputLabel>
                <Select
                  labelId="fakeNetworkLabel"
                  id="fakeNetworkSelect"
                  value={selectedFakeNetworks ? selectedFakeNetworks : ''}
                  label="Fake Network"
                  onChange={(e) => setselectedFakeNetworks(e.target.value as string)}
                  className="text-white"
                >
                  {fakeNetwords.map((network) => (
                    <MenuItem value={network}>
                      {network}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              color="primary"
              disabled={attack === null || (attack === 0 && !selectedNumPackets) || (attack === 2 && !selectedFakeNetworks)}
              onClick={handleAttackClick}
              className="bg-neutral-800"
            >
              {isFetching ? <CircularProgress size={20} color="inherit" /> : 'Attack'}
            </Button>
            {showAlert && (
              <Alert severity="success" sx={{ position: 'fixed', bottom: 16, left: 16 }}>
                Successful attack
              </Alert>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Scanner;
