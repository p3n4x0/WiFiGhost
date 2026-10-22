"use client"
import Link from 'next/link'
import Image from 'next/image'
import { init } from './lib/data'

const features = [
  {
    title: 'Scan',
    desc: 'Discover nearby access points, channels, security type and associated clients in real time.',
  },
  {
    title: 'Audit',
    desc: 'Run the right attack for each target: deauth, PMKID, WPS and WEP techniques.',
  },
  {
    title: 'Crack',
    desc: 'Recover handshakes and test them against your wordlists, then store the results in the vault.',
  },
]

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Top-right author link */}
      <div className="absolute right-6 top-6 z-10">
        <Link
          className="flex items-center gap-2 text-sm text-[color:var(--text-dim)] transition hover:text-white"
          href="https://github.com/p3n4x0"
          target="_blank"
        >
          by p3n4x0
          <Image
            src="/avatar.png"
            width={32}
            height={32}
            alt="avatar"
            className="rounded-full ring-1 ring-[color:var(--border)] transition hover:scale-110"
          />
        </Link>
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <Link href="/dashboard" onClick={() => init()} className="group">
          <Image
            src="/logo.png"
            alt="WiFiGhost"
            width={200}
            height={200}
            priority
            className="mx-auto h-44 w-44 rounded-full object-cover ring-1 ring-[color:var(--border)] shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)] transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <h1 className="mt-10 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          WiFiGhost
        </h1>
        <p className="mt-4 max-w-xl text-balance text-[color:var(--text-dim)]">
          An ethical WiFi auditing toolkit with a web interface — scan, audit and crack
          wireless networks you are authorised to test.
        </p>

        <Link
          href="/dashboard"
          onClick={() => init()}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark hover:scale-[1.02]"
        >
          Launch dashboard
          <span aria-hidden className="transition group-hover:translate-x-1">→</span>
        </Link>

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="panel p-5 text-left transition hover:border-brand/50"
            >
              <h2 className="mb-2 text-lg font-semibold text-white">{f.title}</h2>
              <p className="text-sm text-[color:var(--text-dim)]">{f.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="https://github.com/p3n4x0/WiFiGhost"
          target="_blank"
          className="mt-10 text-sm text-[color:var(--text-dim)] underline-offset-4 transition hover:text-white hover:underline"
        >
          View the repository on GitHub →
        </Link>
      </div>
    </main>
  )
}
