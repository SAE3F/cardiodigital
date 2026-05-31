'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calculator, Search, Settings, UserPlus, UserCheck, Pill, GitCommit } from 'lucide-react'
import { cn } from '@/lib/utils'

import { usePatient } from '@/lib/contexts/PatientContext'

const navItems = [
  { href: '/guias',        label: 'Guías',     icon: BookOpen },
  { href: '/algoritmos',   label: 'Algoritmos',icon: GitCommit },
  { href: '/calculadoras', label: 'Calcular',  icon: Calculator },
  { href: '/interacciones',label: 'Interac.',  icon: Pill },
  { href: '/buscar',       label: 'Buscar',    icon: Search },
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
          patient.isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
        )}
      >
        {patient.isActive ? <UserCheck size={22} /> : <UserPlus size={22} />}
        Paciente
        {patient.isActive && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </button>

      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors',
              active
                ? 'text-red-400 bg-red-400/10'
                : 'text-slate-400 hover:text-slate-200'
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
