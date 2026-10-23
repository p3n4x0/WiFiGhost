"use client"
import React, { ChangeEvent, useRef, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUploadRounded';
import { useToast } from '../toast';
import { uploadFile } from '@/app/lib/data';

interface FileUploadButtonProps {
  type: string;
  onUploaded: () => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ type, onUploaded }) => {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadFile(type, file);
    setUploading(false);
    if (res.ok) {
      toast.success(`Uploaded ${file.name}`);
      onUploaded();
    } else {
      toast.error(res.error || 'Upload failed');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Button
      component="label"
      size="small"
      variant="outlined"
      startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
      disabled={uploading}
    >
      Upload
      <input ref={inputRef} type="file" accept=".txt" hidden onChange={handleFileChange} />
    </Button>
  );
};

export default FileUploadButton;
