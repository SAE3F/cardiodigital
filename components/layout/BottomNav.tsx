'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Activity, GitCommit, Calculator, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: BookOpen, label: 'Guías', href: '/guias' },
  { icon: Calculator, label: 'Calcular', href: '/calculadoras' },
  { icon: GitCommit, label: 'Algoritmos', href: '/algoritmos' },
  { icon: User, label: 'Perfil', href: '/perfil' }
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-around h-16 px-2 relative">
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
