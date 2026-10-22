"use client"
import React, { useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import SimpleDialog from './dialog';
import { useToast } from '../toast';
import { fetchKeys, fetchList, prepareCrack, startCrack, KeyInfo } from '@/app/lib/data';

interface CrackerProps {
  setActivated: React.Dispatch<React.SetStateAction<number>>;
}

const StepCard: React.FC<{
  step: number;
  title: string;
  icon: React.ReactNode;
  value: string | null;
  placeholder: string;
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}> = ({ step, title, icon, value, placeholder, disabled, busy, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled || busy}
    className={`flex flex-1 flex-col items-center gap-3 rounded-xl border p-6 text-center transition ${
      value
        ? 'border-brand bg-brand/10'
        : 'border-[color:var(--border)] bg-surface-hi hover:border-brand/50'
    } disabled:cursor-not-allowed disabled:opacity-40`}
  >
    <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-dim)]">
      Step {step}
    </span>
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full ${
        value ? 'bg-brand/20 text-brand' : 'bg-white/5 text-[color:var(--text-dim)]'
      }`}
    >
      {busy ? <CircularProgress size={26} color="inherit" /> : icon}
    </div>
    <div className="font-semibold text-white">{title}</div>
    <div className="max-w-[16rem] truncate text-sm text-[color:var(--text-dim)]">
      {value || placeholder}
    </div>
  </button>
);

const Cracker: React.FC<CrackerProps> = ({ setActivated }) => {
  const toast = useToast();
  const [wordlists, setWordlists] = useState<string[]>([]);
  const [hashesInfo, setHashesInfo] = useState<KeyInfo[]>([]);
  const [hashes, setHashes] = useState<string[]>([]);
  const [wordlistSelected, setWordlistSelected] = useState<string | null>(null);
  const [hashSelected, setHashSelected] = useState<string | null>(null);
  const [openWordlistDialog, setOpenWordlistDialog] = useState(false);
  const [openHashDialog, setOpenHashDialog] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [cracking, setCracking] = useState(false);

  const handleCrackExecution = async () => {
    if (!hashSelected || !wordlistSelected) return;
    setCracking(true);
    const res = await startCrack(hashSelected, wordlistSelected);
    setCracking(false);
    if (res.ok) {
      setActivated(3);
      toast.success(res.data?.message || 'Crack finished — open the Vault to see the result');
    } else {
      toast.error(res.error || 'Cracking failed');
    }
  };

  const handleWordlistClose = async (value: string) => {
    setOpenWordlistDialog(false);
    if (!value) return;
    setWordlistSelected(value);
    setPreparing(true);
    const res = await prepareCrack(value);
    setPreparing(false);
    if (res.ok) toast.success(`Wordlist "${value}" prepared`);
    else toast.error(res.error || 'Could not prepare the wordlist');
  };

  const handleHashClose = (value: string) => {
    setOpenHashDialog(false);
    if (!value) return;
    // `value` is the real capture filename ("{essid}+{bssid}.cap" or ".22000").
    setHashSelected(value);
    setActivated((prev) => (prev < 2 ? 2 : prev));
  };

  useEffect(() => {
    fetchList(setWordlists, 'Wordlist');
    fetchKeys(setHashesInfo, 'hashDB');
  }, []);

  useEffect(() => {
    if (hashesInfo) {
      // Use the real capture filenames as both the label and the value.
      setHashes(hashesInfo.map((info) => info.file || `${info.apName}+${info.bssid}.cap`));
    }
  }, [hashesInfo]);

  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <LockOpenRoundedIcon className="text-brand" />
        <h2 className="text-xl font-bold text-white">Cracker</h2>
      </div>

      <div className="flex flex-col items-stretch gap-4 md:flex-row">
        <StepCard
          step={1}
          title="Wordlist"
          icon={<ListAltRoundedIcon />}
          value={wordlistSelected}
          placeholder="Select a wordlist"
          busy={preparing}
          onClick={() => setOpenWordlistDialog(true)}
        />
        <StepCard
          step={2}
          title="Handshake"
          icon={<VpnKeyRoundedIcon />}
          value={hashSelected}
          placeholder="Select a captured handshake"
          disabled={!wordlistSelected}
          onClick={() => setOpenHashDialog(true)}
        />
        <StepCard
          step={3}
          title="Crack"
          icon={<LockOpenRoundedIcon />}
          value={cracking ? 'Cracking…' : null}
          placeholder="Run the crack"
          disabled={!hashSelected || !wordlistSelected}
          busy={cracking}
          onClick={handleCrackExecution}
        />
      </div>

      <SimpleDialog
        title="Select wordlist"
        open={openWordlistDialog}
        selectedValue={wordlistSelected || ''}
        onClose={handleWordlistClose}
        options={wordlists}
        emptyMessage="No wordlists yet — upload one in the Vault."
      />
      <SimpleDialog
        title="Select handshake"
        open={openHashDialog}
        selectedValue={hashSelected || ''}
        onClose={handleHashClose}
        options={hashes}
        emptyMessage="No captured handshakes yet — run an attack first."
      />
    </section>
  );
};

export default Cracker;
