"use client"
import { Navbar } from "keep-react"
import Image from "next/image"
import { useState } from 'react';
import { PopoverComponent } from './netcard';
import { Alert } from '@mui/material';
import Link from "next/link";
import PolicyRoundedIcon from '@mui/icons-material/PolicyRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export const NavbarComponent = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleCheckout = (netcardSelected: string) => {
    // Lógica adicional si es necesario antes de mostrar la alerta
    setAlertMessage(netcardSelected ? `Enable ${netcardSelected} Monitoring` : 'Disable Monitoring');
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 2500);
  };

  return (
    <Navbar fluid={true} className="bg-black ">
      <Navbar.Container className="flex items-center justify-between bg-neutral-900 mt-2 rounded-full">
        <Navbar.Container
          tag="ul"
          className="lg:flex hidden items-center justify-between gap-1 mt-1 mb-1"
        >
          <Link href="/dashboard/bault" className='rounded-full px-5 py-2 ml-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 hover:scale-110'>
            <PolicyRoundedIcon className="text-white"/>
          </Link>
        </Navbar.Container>

        <Navbar.Container
          tag="ul"
          className="lg:flex hidden items-center justify-between gap-1 mt-1 mb-1"
        >
          <Link href="/dashboard" className='rounded-full px-5 py-2 ml-3 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 hover:scale-110'>
            <HomeRoundedIcon className="text-white"/>
          </Link>
        </Navbar.Container>
        
        <Navbar.Container
          tag="ul"
          className="lg:flex hidden items-center justify-between gap-1 mt-1 mb-1"
        >
          <PopoverComponent onCheckout={handleCheckout} />
          {showAlert && (
            <Alert severity="success" sx={{ position: 'fixed', bottom: 16, left: 16 }}>
              {alertMessage}
            </Alert>
          )}
        </Navbar.Container>
      </Navbar.Container>
    </Navbar>
  );
}
