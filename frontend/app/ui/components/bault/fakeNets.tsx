"use client"
import React, { useState } from 'react';
import List from "@/app/ui/components/bault/list";
import FileUploadButton from "@/app/ui/components/bault/uploadButton";
import { Box, Container, Typography } from "@mui/material";

const FakeNets = () => {
  const [FakeNets, setFakeNets] = useState([
    { id: 1, name: "FakeNet 1" },
    { id: 2, name: "FakeNet 2" },
    { id: 3, name: "FakeNet 3" },
    { id: 4, name: "FakeNet 1" },
    { id: 5, name: "FakeNet 2" },
    { id: 6, name: "FakeNet 3" },
  ]);

  const handleFakeNetUploadSuccess = (updatedFakeNets: React.SetStateAction<{ id: number; name: string; }[]>) => {
    setFakeNets(updatedFakeNets);
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
          <List type="Fake Nets" lists={FakeNets} onUploadSuccess={handleFakeNetUploadSuccess}/>
          <FileUploadButton type="Fake Nets" list={FakeNets} onUploadSuccess={handleFakeNetUploadSuccess}/>
        </Box>
      </Box>
    </Container>
  );
}

export default FakeNets