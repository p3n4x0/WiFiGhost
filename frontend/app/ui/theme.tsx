"use client";
import { createTheme } from '@mui/material/styles';

// Shared design tokens — kept in sync with the CSS variables in globals.css
// and the Tailwind theme so MUI, Tailwind and raw CSS all look like one system.
export const tokens = {
    bg: '#0a0a0b',
    surface: '#141416',
    surfaceHi: '#1c1c20',
    border: '#2a2a30',
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    success: '#10b981',
    danger: '#ef4444',
    textPrimary: '#f4f4f5',
    textSecondary: '#a1a1aa',
};

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: tokens.primary },
        secondary: { main: tokens.success },
        error: { main: tokens.danger },
        background: { default: tokens.bg, paper: tokens.surface },
        text: { primary: tokens.textPrimary, secondary: tokens.textSecondary },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 10 },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
    },
});
