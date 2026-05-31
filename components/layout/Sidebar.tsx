'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Calculator, Search, Settings, UserPlus, UserCheck, Pill, GitCommit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePatient } from '@/lib/contexts/PatientContext'

const navItems = [
  { href: '/guias',        label: 'Guías Clínicas', icon: BookOpen },
  { href: '/algoritmos',   label: 'Algoritmos',     icon: GitCommit },
  { href: '/calculadoras', label: 'Calculadoras',   icon: Calculator },
  { href: '/interacciones', label: 'Interacciones', icon: Pill },
  { href: '/buscar',       label: 'Búsqueda',       icon: Search },
  { href: '/admin',        label: 'Panel Admin',    icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { setPanelOpen, patient } = usePatient()

  return (
    <div className="flex h-full flex-col bg-background p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="text-red-500" />
          CardioGuardia
        </h1>
        <p className="text-xs text-foreground0 mt-1">Herramientas de Guardia</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium',
                active
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-2 pb-4 space-y-2">
        <button 
          onClick={() => setPanelOpen(true)}
          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between font-medium transition-colors ${patient.isActive ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}
        >
          <div className="flex items-center gap-2 text-sm">
            {patient.isActive ? <UserCheck size={18} className="text-blue-400" /> : <UserPlus size={18} />}
            <span>Paciente Activo</span>
          </div>
          {patient.isActive && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
              On
            </span>
          )}
        </button>
        <button 
          onClick={async () => {
            const { syncAllData } = await import('@/lib/sync');
            await syncAllData();
            window.location.reload();
          }}
          className="w-full text-left p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center justify-between"
        >
          Forzar Sincronización
          <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">Modo Offline Activo</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Sincronizado
          </div>
        </div>
      </div>
    </div>
  )
}
