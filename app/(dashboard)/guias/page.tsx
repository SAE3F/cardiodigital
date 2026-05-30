'use client'

import { useEffect, useState } from 'react'
import { db, type GuiaLocal } from '@/lib/offline-db'
import Link from 'next/link'
import { BookOpen, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function GuiasPage() {
  const [guias, setGuias] = useState<GuiaLocal[]>([])
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    // Cargar guías de la base de datos offline (Dexie)
    const loadGuias = async () => {
      const allGuias = await db.guias.toArray()
      setGuias(allGuias)
    }
    loadGuias()
  }, [])

  const guiasFiltradas = guias.filter(g => 
    g.titulo.toLowerCase().includes(filtro.toLowerCase()) || 
    (g.resumen_rapido && g.resumen_rapido.toLowerCase().includes(filtro.toLowerCase())) ||
    g.fuente.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Guías Clínicas</h1>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Buscar guías, sociedades..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-700 text-slate-100"
        />
      </div>

      <div className="space-y-3">
        {guiasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="mx-auto mb-3 opacity-20" size={48} />
            <p>No se encontraron guías en la base de datos local.</p>
            <p className="text-sm mt-1">Sincronizá con internet para descargar las últimas guías.</p>
          </div>
        ) : (
          guiasFiltradas.map((guia) => (
            <Link
              key={guia.id}
              href={`/guias/${guia.slug}`}
              className="block p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="border-red-500/30 text-red-400 font-mono text-xs">
                  {guia.fuente} {guia.anio_publicacion}
                </Badge>
                <Badge variant="secondary" className="text-[10px] capitalize bg-slate-800 text-slate-400">
                  {guia.categoria}
                </Badge>
              </div>
              <h2 className="font-semibold text-slate-100 text-lg leading-tight mb-1">{guia.titulo}</h2>
              {guia.resumen_rapido && (
                <p className="text-sm text-slate-400 line-clamp-2">{guia.resumen_rapido}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
