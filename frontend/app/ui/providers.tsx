"use client";
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { ToastProvider } from './components/toast';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
);
