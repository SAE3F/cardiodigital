import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initSync } from '@/lib/sync'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CardioGuardia',
  description: 'Guías y calculadoras de Cardiología y Emergentología',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CardioGuardia',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Previene zoom accidental en guardia
}

import { SyncProvider } from '@/components/SyncProvider'
import { PatientProvider } from '@/lib/contexts/PatientContext'
import { PatientPanel } from '@/components/layout/PatientPanel'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <PatientProvider>
          <SyncProvider />
          {children}
          <PatientPanel />
        </PatientProvider>
      </body>
    </html>
  )
}
