"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from '@mui/material';
import WifiFindRoundedIcon from '@mui/icons-material/WifiFindRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AttackSelector from './attacks';
import Pagination from '../pagination';
import { useToast } from '../toast';
import {
  API_URL,
  fetchList,
  setTarget,
  startAttack,
  startAttack0,
  startAttack2,
  startScan,
  stopScan,
} from '@/app/lib/data';
import io, { Socket } from 'socket.io-client';

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

const securityColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('wpa2')) return 'bg-emerald-500/15 text-emerald-400';
  if (t.includes('wpa')) return 'bg-amber-500/15 text-amber-400';
  if (t.includes('wep')) return 'bg-orange-500/15 text-orange-400';
  if (t.includes('opn') || t === '') return 'bg-red-500/15 text-red-400';
  return 'bg-white/10 text-[color:var(--text-dim)]';
};

const Scanner: React.FC<APListProps> = ({ isActivated, setActivated }) => {
  const toast = useToast();
  // Track the selection by BSSID (stable) rather than by object reference:
  // the scan socket emits a fresh array every few seconds, so holding the
  // object itself would drop the selection — and the attack panel — on every
  // refresh. lastSelectedAP keeps the panel up if the AP blips out for a cycle.
  const [selectedBssid, setSelectedBssid] = useState<string | null>(null);
  const lastSelectedAP = useRef<ScanInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [attack, setAttack] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalClients, setModalClients] = useState<string[]>([]);
  const [selectedNumPackets, setSelectedNumPackets] = useState<number>(0);
  const [selectedFakeNetworks, setSelectedFakeNetworks] = useState('');
  const [scans, setScans] = useState<ScanInfo[] | null>(null);
  const [fakeNetworks, setFakeNetworks] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  const selectedAP = useMemo<ScanInfo | null>(() => {
    if (!selectedBssid) return null;
    const match = scans?.find((s) => s.bssidStation === selectedBssid);
    if (match) lastSelectedAP.current = match;
    return match ?? lastSelectedAP.current;
  }, [scans, selectedBssid]);

  const handleScanButton = async () => {
    const res = await startScan();
    if (res.ok) {
      setScanning(true);
      toast.info('Scanning for networks…');
    } else {
      toast.error(res.error || 'Could not start the scan');
    }
  };

  const handleStopScan = async () => {
    const res = await stopScan();
    setScanning(false);
    setScans(null);
    setSelectedBssid(null);
    setAttack(null);
    setActivated(0);
    if (res.ok) toast.info('Scan stopped');
    else toast.error(res.error || 'Could not stop the scan');
  };

  useEffect(() => {
    const socket: Socket = io(API_URL);
    socket.on('data', (scansIO: ScanInfo[]) => setScans(scansIO));
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (attack === 2) fetchList(setFakeNetworks, 'FakeNetworks');
  }, [attack]);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = scans ? scans.length : 0;
  const showPagination = totalItems > itemsPerPage;

  const handleAPClick = async (ap: ScanInfo) => {
    const next = selectedBssid === ap.bssidStation ? null : ap.bssidStation;
    setSelectedBssid(next);
    setAttack(null);
    setActivated(next ? 1 : 0);
    if (next) await setTarget(ap.bssidStation, ap.essidStation, ap.channelStation);
  };

  const handleAttackClick = async () => {
    if (!selectedAP || attack === null) return;
    setIsFetching(true);
    try {
      let res;
      if (attack === 0) res = await startAttack0(attack, selectedNumPackets);
      else if (attack === 2) res = await startAttack2(attack, selectedFakeNetworks);
      else res = await startAttack(attack);

      if (res.ok) {
        toast.success(res.data?.message || 'Attack finished — check the Vault');
        setScanning(false);
        setSelectedBssid(null);
        setAttack(null);
        setActivated((prev) => (isActivated >= 1 ? 2 : prev));
      } else {
        toast.error(res.error || 'Attack failed');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleChangePage = (_: React.ChangeEvent<unknown>, newPage: number) => setPage(newPage);

  const openClientsModal = (clients: string[]) => {
    setModalClients(clients);
    setShowModal(true);
  };

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = scans ? scans.slice(indexOfFirstItem, indexOfLastItem) : [];

  const attackDisabled =
    attack === null ||
    (attack === 0 && !selectedNumPackets) ||
    (attack === 2 && !selectedFakeNetworks);

  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiFindRoundedIcon className="text-brand" />
          <h2 className="text-xl font-bold text-white">Scanner</h2>
        </div>
        {scanning && (
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleScanButton}
              className="border-[color:var(--border)] text-[color:var(--text-dim)]"
            >
              Rescan
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<StopRoundedIcon />}
              onClick={handleStopScan}
            >
              Stop
            </Button>
          </div>
        )}
      </div>

      {!scanning ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] py-14">
          <p className="mb-4 text-sm text-[color:var(--text-dim)]">
            Put an interface in monitor mode, then start scanning.
          </p>
          <Button variant="contained" onClick={handleScanButton} startIcon={<WifiFindRoundedIcon />}>
            Start scan
          </Button>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-[color:var(--text-dim)]">
          <CircularProgress size={28} />
          <p className="mt-4 text-sm">Listening for networks…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {currentItems.map((ap) => {
            const active = selectedBssid === ap.bssidStation;
            return (
              <button
                key={ap.bssidStation}
                onClick={() => handleAPClick(ap)}
                className={`flex flex-col rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-brand bg-brand/10'
                    : 'border-[color:var(--border)] bg-surface-hi hover:border-brand/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-semibold text-white">
                    {ap.essidStation || <span className="italic text-[color:var(--text-dim)]">&lt;hidden&gt;</span>}
                  </h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${securityColor(ap.type)}`}>
                    {ap.type || 'OPN'}
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-xs text-[color:var(--text-dim)]">
                  <div className="flex justify-between gap-2">
                    <dt>BSSID</dt>
                    <dd className="font-mono text-neutral-300">{ap.bssidStation}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Channel</dt>
                    <dd className="font-mono text-neutral-300">{ap.channelStation}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[color:var(--text-dim)]">
                  <PeopleAltRoundedIcon sx={{ fontSize: 16 }} />
                  <span>
                    {ap.clients.length} client{ap.clients.length === 1 ? '' : 's'}
                  </span>
                  {ap.clients.length > 0 && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openClientsModal(ap.clients);
                      }}
                      className="ml-auto cursor-pointer text-brand underline-offset-2 hover:underline"
                    >
                      view
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        page={page}
        onChangePage={handleChangePage}
        showPagination={showPagination}
      />

      {selectedAP && (
        <div className="mt-6 rounded-xl border border-[color:var(--border)] bg-surface-hi/50 p-4">
          <AttackSelector
            apType={selectedAP.type.toLowerCase()}
            clients={selectedAP.clients.length}
            selectedAttack={attack}
            onSelectAttack={setAttack}
          />

          <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
            {attack === 0 && (
              <FormControl size="small" className="min-w-[180px]">
                <InputLabel id="numPacketsLabel">Deauth packets</InputLabel>
                <Select
                  labelId="numPacketsLabel"
                  value={selectedNumPackets || ''}
                  label="Deauth packets"
                  onChange={(e) => setSelectedNumPackets(Number(e.target.value))}
                >
                  {[10, 15, 20, 30, 0].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n === 0 ? 'Continuous' : n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {attack === 2 && (
              <FormControl size="small" className="min-w-[180px]">
                <InputLabel id="fakeNetworkLabel">Fake network list</InputLabel>
                <Select
                  labelId="fakeNetworkLabel"
                  value={selectedFakeNetworks}
                  label="Fake network list"
                  onChange={(e) => setSelectedFakeNetworks(e.target.value as string)}
                >
                  {fakeNetworks.map((network) => (
                    <MenuItem key={network} value={network}>
                      {network}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              disabled={attackDisabled || isFetching}
              onClick={handleAttackClick}
            >
              {isFetching ? <CircularProgress size={20} color="inherit" /> : 'Launch attack'}
            </Button>
          </div>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="panel mx-auto mt-24 max-w-md p-6">
          <h2 className="mb-3 text-lg font-bold text-white">
            Connected clients ({modalClients.length})
          </h2>
          <ul className="max-h-80 space-y-1 overflow-y-auto font-mono text-sm text-neutral-300">
            {modalClients.map((client) => (
              <li key={client} className="rounded bg-surface-hi px-3 py-1.5">
                {client}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </section>
  );
};

export default Scanner;
