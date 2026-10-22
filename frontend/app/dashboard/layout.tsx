"use client"
import { NavbarComponent } from '../ui/components/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <NavbarComponent />
      <div className="mx-auto max-w-7xl px-4 pb-16">{children}</div>
    </div>
  )
}
