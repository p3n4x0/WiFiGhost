import type { Metadata } from 'next'
import './ui/globals.css'
import { Providers } from './ui/providers'

export const metadata: Metadata = {
  title: 'WiFiGhost',
  description: 'Ethical WiFi auditing toolkit with a web interface.',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
