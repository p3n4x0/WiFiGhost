import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  options: string[];
  title: string;
  emptyMessage?: string;
}

const SimpleDialog: React.FC<SimpleDialogProps> = ({
  onClose,
  selectedValue,
  open,
  options,
  title,
  emptyMessage,
}) => {
  return (
    <Dialog
      onClose={() => onClose(selectedValue)}
      open={open}
      PaperProps={{
        className: 'border border-[color:var(--border)] bg-[color:var(--surface)]',
      }}
    >
      <DialogTitle className="text-white">{title}</DialogTitle>
      <div className="min-w-[320px] p-4 pt-0">
        {options.length === 0 ? (
          <p className="py-6 text-center text-sm text-[color:var(--text-dim)]">
            {emptyMessage || 'Nothing to show.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {options.map((option) => (
              <li key={option}>
                <button
                  onClick={() => onClose(option)}
                  className={`w-full truncate rounded-lg border px-4 py-2.5 text-center text-sm transition ${
                    selectedValue === option
                      ? 'border-brand bg-brand/15 text-white'
                      : 'border-[color:var(--border)] bg-surface-hi text-neutral-200 hover:border-brand/50'
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

export default SimpleDialog;
