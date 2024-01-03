"use client"
import React, { useState } from 'react';
import WordlistList from "@/app/ui/components/bault/listWordlist";
import FileUploadButton from "@/app/ui/components/bault/uploadButton";
import { Box, Container, Typography } from "@mui/material";

const Wordlists = () => {
  const [wordlists, setWordlists] = useState([
    { id: 1, name: "Wordlist 1" },
    { id: 2, name: "Wordlist 2" },
    { id: 3, name: "Wordlist 3" },
    { id: 4, name: "Wordlist 1" },
    { id: 5, name: "Wordlist 2" },
    { id: 6, name: "Wordlist 3" },
  ]);

  const handleWordlistUploadSuccess = (updatedWordlists: React.SetStateAction<{ id: number; name: string; }[]>) => {
    setWordlists(updatedWordlists);
  };

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "16px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <WordlistList wordlists={wordlists} onUploadSuccess={handleWordlistUploadSuccess}/>
          <FileUploadButton wordlists={wordlists} onUploadSuccess={handleWordlistUploadSuccess}/>
        </Box>
      </Box>
    </Container>
  );
}

export default Wordlists