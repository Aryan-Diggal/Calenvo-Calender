"use client";

import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
    },
    secondary: {
      main: '#ea4335',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
