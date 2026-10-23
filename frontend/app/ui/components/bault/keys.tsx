"use client"
import React, { useState } from 'react';
import Pagination from '../pagination';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useToast } from '../toast';
import { KeyInfo } from '@/app/lib/data';

interface KeyListProps {
  keysInfo: KeyInfo[];
}

const KeyList: React.FC<KeyListProps> = ({ keysInfo }) => {
  const toast = useToast();
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalItems = keysInfo.length;
  const showPagination = totalItems > itemsPerPage;

  const handleKeyClick = (key: KeyInfo) => {
    if (!key.password) return;
    setSelectedKey((prev) => (prev === key ? null : key));
  };

  const startIndex = (page - 1) * itemsPerPage;
  const visible = keysInfo.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <KeyRoundedIcon className="text-brand" />
        <h2 className="text-xl font-bold text-white">Wi-Fi Keys</h2>
      </div>

      {totalItems === 0 ? (
        <p className="py-10 text-center text-sm text-[color:var(--text-dim)]">
          No keys or handshakes stored yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((key, index) => {
            const cracked = Boolean(key.password);
            const selected = selectedKey === key;
            return (
              <div
                key={`${key.apName}-${key.bssid}-${index}`}
                onClick={() => handleKeyClick(key)}
                className={`rounded-xl border p-4 transition ${
                  cracked ? 'cursor-pointer' : ''
                } ${
                  selected
                    ? 'border-brand bg-brand/10'
                    : 'border-[color:var(--border)] bg-surface-hi hover:border-brand/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">
                      {key.apName || <span className="italic text-[color:var(--text-dim)]">&lt;hidden&gt;</span>}
                    </h3>
                    <p className="truncate font-mono text-xs text-[color:var(--text-dim)]">
                      {key.bssid}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      cracked
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/10 text-[color:var(--text-dim)]'
                    }`}
                  >
                    {cracked ? 'cracked' : 'captured'}
                  </span>
                </div>

                {cracked && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-black/30 px-3 py-2">
                    <code className="truncate text-sm text-white">
                      {selected ? key.password : '•••••••• (click to reveal)'}
                    </code>
                    {selected && (
                      <CopyToClipboard
                        text={key.password || ''}
                        onCopy={() => toast.success('Password copied to clipboard')}
                      >
                        <Tooltip title="Copy password">
                          <IconButton
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ContentCopyIcon fontSize="small" className="text-brand" />
                          </IconButton>
                        </Tooltip>
                      </CopyToClipboard>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        page={page}
        onChangePage={(_, p) => setPage(p)}
        showPagination={showPagination}
      />
    </section>
  );
};

export default KeyList;
