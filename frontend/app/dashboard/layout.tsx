"use client"
import { Inter } from 'next/font/google'
import '../ui/globals.css'
import { NavbarComponent } from '../ui/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased `}>
        <NavbarComponent />
        {children}
      </body>
    </html>
  )
}
