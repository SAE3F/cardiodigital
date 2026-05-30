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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          autoFocus
          placeholder="Ej: fibrilación auricular, dopamina, TIMI..."
          value={query}
          onChange={e => { setQuery(e.target.value); ejecutarBusqueda(e.target.value) }}
          className="pl-10 bg-slate-900 border-slate-700 text-slate-100 h-12"
        />
      </div>

      {buscando && <p className="text-slate-400 text-sm mt-4">Buscando...</p>}

      <div className="mt-4 space-y-2">
        {resultados.map(r => {
          const Icon = iconos[r.tipo] ?? BookOpen
          const href = r.tipo === 'guia' ? `/guias/${r.id}` : r.tipo === 'farmaco' ? `/buscar?f=${r.id}` : `/calculadoras`
          return (
            <Link
              key={r.id}
              href={href}
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800 transition-colors"
            >
              <Icon size={18} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-100 truncate">{r.nombre}</p>
                {r.descripcion && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{r.descripcion}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs shrink-0 capitalize border-slate-700 text-slate-400">
                {r.tipo}
              </Badge>
            </Link>
          )
        })}
        {!buscando && query.length >= 2 && resultados.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">Sin resultados para "{query}"</p>
        )}
      </div>
    </div>
  )
}
