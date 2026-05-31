'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, BookOpen, Activity, GitCommit, Calculator, User, UserPlus, UserCheck, Pill } from 'lucide-react'
import { cn } from '@/lib/utils'

import { usePatient } from '@/lib/contexts/PatientContext'

const navItems = [
  { icon: Home, label: 'Inicio', href: '/' },
  { icon: Search, label: 'Buscar', href: '/buscar' },
  { icon: BookOpen, label: 'Guías', href: '/guias' },
  { icon: Calculator, label: 'Calcular', href: '/calculadoras' },
  { icon: GitCommit, label: 'Algoritmos', href: '/algoritmos' },
  { icon: User, label: 'Perfil', href: '/perfil' }
]

export function BottomNav() {
  const pathname = usePathname()
  const { setPanelOpen, patient } = usePatient()

  return (
    <div className="flex items-center justify-around h-16 px-2 relative">
      <button
        onClick={() => setPanelOpen(true)}
        className={cn(
          'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors relative',
          patient.isActive ? 'text-blue-400 bg-blue-500/10' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {patient.isActive ? <UserCheck size={22} /> : <UserPlus size={22} />}
        Paciente
        {patient.isActive && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </button>

      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors',
              active
                ? 'text-red-400 bg-red-400/10'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={22} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
