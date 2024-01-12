import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  options: string[];
  title: string
}

const SimpleDialog: React.FC<SimpleDialogProps> = (props) => {
  const { onClose, selectedValue, open, options, title } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle className="bg-neutral-900 text-white">{title}</DialogTitle>
      <List className='bg-neutral-900'>
        {options.map((option) => (
          <ListItem key={option} className="bg-neutral-800 text-white">
            <ListItemButton onClick={() => handleListItemClick(option)} className='transition transform hover:scale-110 cursor-pointer hover:bg-neutral-700 rounded-full'>
              <ListItemText primary={option} className='flex justify-center items-center '/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default SimpleDialog;
