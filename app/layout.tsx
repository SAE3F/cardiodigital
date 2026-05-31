import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initSync } from '@/lib/sync'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cardiodigital',
  description: 'Guías y calculadoras de Cardiología y Emergentología',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cardiodigital',
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
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { PatientPanel } from '@/components/layout/PatientPanel'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" themes={['light', 'dark', 'oled', 'dim']} enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SettingsProvider>
              <PatientProvider>
                <SyncProvider />
                {children}
                <PatientPanel />
              </PatientProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
