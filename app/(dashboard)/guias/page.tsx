'use client'

import { useEffect, useState } from 'react'
import { db, type GuiaLocal } from '@/lib/offline-db'
import Link from 'next/link'
import { BookOpen, Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { syncAllData } from '@/lib/sync'

export default function GuiasPage() {
  const [guias, setGuias] = useState<GuiaLocal[]>([])
  const [filtro, setFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [sociedadFiltro, setSociedadFiltro] = useState<string>('Todas')
  
  // Sincronización
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null)

  const loadGuias = async () => {
    const allGuias = await db.guias.toArray()
    setGuias(allGuias)
  }

  useEffect(() => {
    loadGuias()
    const last = localStorage.getItem('cardioguardia_last_sync')
    if (last) {
      setLastSyncDate(new Date(parseInt(last)).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }))
    }
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncAllData()
      await loadGuias() // Recargar datos locales
      setLastSyncDate(new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsSyncing(false)
    }
  }

  const [anioFiltro, setAnioFiltro] = useState<string | number>('Todos')

  // Extraer categorías únicas para los tabs
  const categorias = ['Todas', ...Array.from(new Set(guias.map(g => g.categoria))).filter(Boolean)]
  const anios = ['Todos', ...Array.from(new Set(guias.map(g => g.anio_publicacion))).filter(Boolean).sort((a, b) => b - a)]
  const sociedades = ['Todas', ...Array.from(new Set(guias.map(g => g.fuente))).filter(Boolean)]

  const guiasFiltradas = guias
    .filter(g => {
      const textMatch = g.titulo.toLowerCase().includes(filtro.toLowerCase()) || 
                        (g.resumen_rapido && g.resumen_rapido.toLowerCase().includes(filtro.toLowerCase())) ||
                        g.fuente.toLowerCase().includes(filtro.toLowerCase())
      
      const catMatch = categoriaFiltro === 'Todas' || g.categoria === categoriaFiltro
      const anioMatch = anioFiltro === 'Todos' || g.anio_publicacion === Number(anioFiltro)
      const socMatch = sociedadFiltro === 'Todas' || g.fuente === sociedadFiltro
      
      return textMatch && catMatch && anioMatch && socMatch
    })
    .sort((a, b) => (b.anio_publicacion || 0) - (a.anio_publicacion || 0))

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Guías y Consensos</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            {lastSyncDate ? (
              <><CheckCircle2 size={14} className="text-green-500" /> Sincronizado: {lastSyncDate}</>
            ) : (
              <><AlertCircle size={14} className="text-yellow-500" /> Requiere sincronización</>
            )}
          </p>
        </div>

        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-400 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Sincronizando..." : "Sincronizar Datos"}
        </button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Buscar guías..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-slate-100 h-11"
          />
        </div>
        <select
          value={anioFiltro}
          onChange={e => setAnioFiltro(e.target.value === 'Todos' ? 'Todos' : Number(e.target.value))}
          className="bg-slate-900 border border-slate-700 text-slate-100 rounded-md px-3 h-11 min-w-[100px] outline-none focus:border-blue-500"
        >
          {anios.map(anio => (
            <option key={anio} value={anio}>{anio === 'Todos' ? 'Año' : anio}</option>
          ))}
        </select>
        <select
          value={sociedadFiltro}
          onChange={e => setSociedadFiltro(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-100 rounded-md px-3 h-11 min-w-[120px] outline-none focus:border-blue-500"
        >
          {sociedades.map(soc => (
            <option key={soc} value={soc}>{soc === 'Todas' ? 'Sociedad' : soc}</option>
          ))}
        </select>
      </div>

      {/* Tabs horizontales para categorías */}
      {categorias.length > 1 && (
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 snap-x scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                categoriaFiltro === cat 
                ? 'bg-slate-100 text-slate-900 border-slate-100' 
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {guiasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <BookOpen className="mx-auto mb-3 opacity-20" size={48} />
            <p className="text-slate-400">No se encontraron guías con esos filtros.</p>
            {guias.length === 0 && (
              <p className="text-sm mt-2 text-blue-400">Tocá "Sincronizar Datos" para descargar la base de datos de guías.</p>
            )}
          </div>
        ) : (
          guiasFiltradas.map((guia) => (
            <Link
              key={guia.id}
              href={`/guias/${guia.slug}`}
              className="block p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <Badge variant="outline" className="border-red-500/30 text-red-400 font-mono text-xs whitespace-nowrap">
                  {guia.fuente} {guia.anio_publicacion}
                </Badge>
                <Badge variant="secondary" className="text-[10px] capitalize bg-slate-800/80 text-slate-400 border-none text-right">
                  {guia.categoria}
                </Badge>
              </div>
              <h2 className="font-semibold text-slate-100 text-base sm:text-lg leading-tight mb-1 pr-2">{guia.titulo}</h2>
              {guia.resumen_rapido && (
                <p className="text-sm text-slate-400 line-clamp-2 mt-2">{guia.resumen_rapido}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
