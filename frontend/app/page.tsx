"use client"
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <Link
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://github.com/p3n4x0"
          >
            By{' '}
            <Image 
            src='/avatar.png' 
            width={40}
            height={40}
            alt='avatar'
            className='hidden md:block rounded-full transition transform hover:scale-110'
            />
          </Link>
        </div>
      </div>

      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-20 transition">
          ¡Bienvenido a WiFiGhost!
        </h1>
        <Link href="/dashboard">
          <img
            src="/logo.png" // Reemplaza con la ruta de tu imagen
            alt="WiFiGhost"
            className="mx-auto rounded-full mb-8 h-80 w-80 object-cover transition transform hover:scale-110"
          />
        </Link>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left before:w-[480px]">
        <Link
          href="https://github.com/p3n4x0/WiFiGhost"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Github{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 `} >
            View the repo!
          </p>
        </Link>

        <Link
          href="https://github.com/p3n4x0/WiFiGhost"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Help{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            How to use.
          </p>
        </Link>
      </div>
    </main>
  )
}
