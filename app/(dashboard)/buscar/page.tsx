'use client'
import { useState, useCallback } from 'react'
import { buscar, type ResultadoBusqueda } from '@/lib/search'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Pill, Calculator } from 'lucide-react'
import Link from 'next/link'

const iconos = {
  guia: BookOpen,
  farmaco: Pill,
  calculadora: Calculator,
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function BuscarPage() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [buscando, setBuscando] = useState(false)

  const ejecutarBusqueda = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResultados([]); return }
      setBuscando(true)
      const res = await buscar(q)
      setResultados(res)
      setBuscando(false)
    }, 300),
    []
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24">
      <h1 className="text-xl font-bold mb-4">Buscar</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          autoFocus
          placeholder="Ej: fibrilación auricular, dopamina, TIMI..."
          value={query}
          onChange={e => { setQuery(e.target.value); ejecutarBusqueda(e.target.value) }}
          className="pl-10 bg-card border-border text-foreground h-12"
        />
      </div>

      {buscando && <p className="text-muted-foreground text-sm mt-4">Buscando...</p>}

      <div className="mt-4 space-y-2">
        {resultados.map(r => {
          const Icon = iconos[r.tipo] ?? BookOpen
          const href = r.tipo === 'guia' ? `/guias/${r.id}` : r.tipo === 'farmaco' ? `/buscar?f=${r.id}` : `/calculadoras/${r.id}`
          return (
            <Link
              key={r.id}
              href={href}
              className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-slate-600 bg-muted/50 hover:bg-accent transition-colors"
            >
              <Icon size={18} className="text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{r.nombre}</p>
                {r.descripcion && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.descripcion}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs shrink-0 capitalize border-border text-muted-foreground">
                {r.tipo}
              </Badge>
            </Link>
          )
        })}
        {!buscando && query.length >= 2 && resultados.length === 0 && (
          <p className="text-foreground0 text-sm text-center py-8">Sin resultados para "{query}"</p>
        )}
      </div>
    </div>
  )
}
