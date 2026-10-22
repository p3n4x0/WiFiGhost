"use client";
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

interface ToastContextValue {
    notify: (message: string, severity?: AlertColor) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: '',
        severity: 'info',
    });

    const notify = useCallback((message: string, severity: AlertColor = 'info') => {
        setToast({ open: true, message, severity });
    }, []);

    const value: ToastContextValue = {
        notify,
        success: (m) => notify(m, 'success'),
        error: (m) => notify(m, 'error'),
        info: (m) => notify(m, 'info'),
    };

    const handleClose = (_?: unknown, reason?: string) => {
        if (reason === 'clickaway') return;
        setToast((t) => ({ ...t, open: false }));
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};
