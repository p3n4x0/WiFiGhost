"use client"
import '../ui/globals.css'
import { NavbarComponent } from '../ui/components/navbar'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <NavbarComponent />
        {children}
      </body>
    </html>
  )
}
