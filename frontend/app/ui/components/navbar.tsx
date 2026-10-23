"use client"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import { NetcardControl } from './netcard'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeRoundedIcon },
  { href: '/dashboard/bault', label: 'Vault', icon: ShieldRoundedIcon },
]

export const NavbarComponent = () => {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="WiFiGhost"
            width={36}
            height={36}
            className="rounded-full ring-1 ring-[color:var(--border)]"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            WiFiGhost
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-brand/15 text-brand'
                    : 'text-[color:var(--text-dim)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon fontSize="small" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
          <div className="ml-2 pl-2">
            <NetcardControl />
          </div>
        </nav>
      </div>
    </header>
  )
}
