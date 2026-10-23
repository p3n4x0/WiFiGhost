"use client"
import React, { useState } from 'react';
import { IconButton, CircularProgress, Tooltip, Modal } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Pagination from '../pagination';
import { useToast } from '../toast';
import { deleteFile, readFile } from '@/app/lib/data';

interface ListProps {
  lists: string[];
  onChanged: () => void;
  type: string;
}

interface Viewer {
  file: string;
  content: string;
  truncated: boolean;
}

const List: React.FC<ListProps> = ({ lists, onChanged, type }) => {
  const toast = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = lists.length;
  const showPagination = totalItems > itemsPerPage;

  const handleView = async (file: string) => {
    setOpening(file);
    const res = await readFile(type, file);
    setOpening(null);
    if (res.ok && res.data) {
      setViewer({ file, content: res.data.content, truncated: res.data.truncated });
    } else {
      toast.error(res.error || 'Could not read the file');
    }
  };

  const handleDelete = async (file: string) => {
    setDeleting(file);
    const res = await deleteFile(type, file);
    setDeleting(null);
    if (res.ok) {
      toast.info(`Deleted ${file}`);
      onChanged();
    } else {
      toast.error(res.error || 'Could not delete the file');
    }
  };

  const startIndex = (page - 1) * itemsPerPage;
  const visible = lists.slice(startIndex, startIndex + itemsPerPage);

  if (totalItems === 0) {
    return (
      <p className="py-8 text-center text-sm text-[color:var(--text-dim)]">
        No files yet — upload one above.
      </p>
    );
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {visible.map((file) => (
          <li
            key={file}
            className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] bg-surface-hi px-3 py-2"
          >
            <button
              onClick={() => handleView(file)}
              title="Click to view contents"
              className="flex min-w-0 flex-1 items-center gap-2 text-left transition hover:text-white"
            >
              {opening === file ? (
                <CircularProgress size={16} className="shrink-0" />
              ) : (
                <InsertDriveFileRoundedIcon
                  sx={{ fontSize: 18 }}
                  className="shrink-0 text-[color:var(--text-dim)]"
                />
              )}
              <span className="truncate text-sm text-neutral-200">{file}</span>
            </button>
            <Tooltip title="Delete">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleting === file}
                  onClick={() => handleDelete(file)}
                >
                  {deleting === file ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </li>
        ))}
      </ul>
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        page={page}
        onChangePage={(_, p) => setPage(p)}
        showPagination={showPagination}
      />

      <Modal open={Boolean(viewer)} onClose={() => setViewer(null)}>
        <div className="panel mx-auto mt-16 flex max-h-[80vh] max-w-2xl flex-col p-0">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-3">
            <h3 className="truncate font-mono text-sm text-white">{viewer?.file}</h3>
            <IconButton size="small" onClick={() => setViewer(null)}>
              <CloseRoundedIcon fontSize="small" className="text-[color:var(--text-dim)]" />
            </IconButton>
          </div>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words px-5 py-4 text-xs text-neutral-200">
            {viewer?.content || <span className="text-[color:var(--text-dim)]">(empty file)</span>}
          </pre>
          {viewer?.truncated && (
            <div className="border-t border-[color:var(--border)] px-5 py-2 text-xs text-amber-400">
              File truncated — showing the first 256&nbsp;KB.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default List;
