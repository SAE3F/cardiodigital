'use client'

import { useEffect, useState } from 'react'
import { db, type GuiaLocal } from '@/lib/offline-db'
import Link from 'next/link'
import { BookOpen, Search, RefreshCw, AlertCircle, CheckCircle2, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { syncAllData } from '@/lib/sync'
import { guiasPremium } from '@/lib/data/guias-premium'
import { GUIDELINES_FROM_JOURNALS } from '@/lib/data/journals'
import { RevistasList } from '@/components/guias/RevistasList'

export default function GuiasPage() {
  const [activeTab, setActiveTab] = useState<'guias' | 'revistas'>('guias')
  const [guias, setGuias] = useState<GuiaLocal[]>([])
  const [filtro, setFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [sociedadFiltro, setSociedadFiltro] = useState<string>('Todas')
  
  // Sincronización
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const loadGuias = async () => {
    const allGuias = await db.guias.toArray()
    const enhancedGuias = allGuias.map(g => {
      const override = guiasPremium.find(p => p.titulo?.toLowerCase() === g.titulo.toLowerCase())
      return override ? { ...g, ...override } as GuiaLocal : g
    })
    setGuias(enhancedGuias)
  }

  useEffect(() => {
    loadGuias()
    const last = localStorage.getItem('cardiodigital_last_sync')
    if (last) {
      setLastSyncDate(new Date(parseInt(last)).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }))
    }
    const err = localStorage.getItem('cardiodigital_sync_error')
    if (err) setSyncError(err)
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncError(null)
    try {
      await syncAllData()
      await loadGuias()
      setLastSyncDate(new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }))
      setSyncError(null)
    } catch (e: unknown) {
      console.error(e)
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      setSyncError(msg)
    } finally {
      setIsSyncing(false)
    }
  }

  const [anioFiltro, setAnioFiltro] = useState<string | number>('Todos')

  // Mapear los consensos de revistas a un formato compatible
  const journalGuidelinesMock: GuiaLocal[] = GUIDELINES_FROM_JOURNALS.map(g => ({
    id: g.link,
    slug: `_journal`, // Usamos esto para detectar en el render
    titulo: g.title,
    categoria: g.category,
    fuente: g.sourceId.toUpperCase(),
    anio_publicacion: parseInt(g.issueTitle.match(/\d{4}/)?.[0] || '2025'),
    url_fuente: g.pdfLink,
    contenido_md: '',
    destacada: false,
    updated_at: new Date().toISOString(),
  }))

  const guiasUnificadas = [...guias, ...journalGuidelinesMock]

  const categorias = ['Todas', ...Array.from(new Set(guiasUnificadas.map(g => g.categoria))).filter(Boolean)]
  const anios = ['Todos', ...Array.from(new Set(guiasUnificadas.map(g => g.anio_publicacion))).filter(Boolean).sort((a, b) => b - a)]
  const sociedades = ['Todas', ...Array.from(new Set(guiasUnificadas.map(g => g.fuente))).filter(Boolean)]

  const guiasFiltradas = guiasUnificadas
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
      {/* TABS SUPERIORES */}
      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab('guias')}
          className={`flex-1 text-center py-3 font-medium text-sm sm:text-base transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'guias' ? 'text-blue-400' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <BookOpen size={18} />
          Guías y Consensos
          {activeTab === 'guias' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('revistas')}
          className={`flex-1 text-center py-3 font-medium text-sm sm:text-base transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'revistas' ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FileText size={18} />
          Revistas y Artículos
          {activeTab === 'revistas' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'guias' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
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
          
          {syncError && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 text-sm p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Error al sincronizar datos</p>
                <p className="opacity-90">{syncError}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Buscar guías..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="pl-10 bg-card border-border text-foreground h-11"
              />
            </div>
            <select
              value={anioFiltro}
              onChange={e => setAnioFiltro(e.target.value === 'Todos' ? 'Todos' : Number(e.target.value))}
              className="bg-card border border-border text-foreground rounded-md px-3 h-11 min-w-[100px] outline-none focus:border-blue-500"
            >
              {anios.map(anio => (
                <option key={anio} value={anio}>{anio === 'Todos' ? 'Año' : anio}</option>
              ))}
            </select>
            <select
              value={sociedadFiltro}
              onChange={e => setSociedadFiltro(e.target.value)}
              className="bg-card border border-border text-foreground rounded-md px-3 h-11 min-w-[120px] outline-none focus:border-blue-500 uppercase"
            >
              {sociedades.map(soc => (
                <option key={soc} value={soc}>{soc === 'Todas' ? 'Sociedad' : soc.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {categorias.length > 1 && (
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 snap-x scrollbar-hide">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    categoriaFiltro === cat 
                    ? 'bg-foreground text-background border-slate-100' 
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {guiasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-foreground0 bg-muted/50 rounded-2xl border border-dashed border-border">
                <BookOpen className="mx-auto mb-3 opacity-20" size={48} />
                <p className="text-muted-foreground">No se encontraron guías con esos filtros.</p>
                {guias.length === 0 && (
                  <p className="text-sm mt-2 text-blue-400">Tocá "Sincronizar Datos" para descargar la base de datos.</p>
                )}
              </div>
            ) : (
              guiasFiltradas.map((guia) => {
                const isJournal = guia.slug === '_journal'
                const href = isJournal 
                  ? `/revistas/pdf?url=${encodeURIComponent(guia.url_fuente || '')}&title=${encodeURIComponent(guia.titulo)}`
                  : `/guias/${guia.slug}`

                return (
                  <Link
                    key={guia.id}
                    href={href}
                    className="block p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-blue-500/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <Badge variant="outline" className={`font-mono text-xs whitespace-nowrap ${isJournal ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                        {guia.fuente} {guia.anio_publicacion}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize bg-accent/80 text-muted-foreground border-none text-right">
                        {guia.categoria}
                      </Badge>
                    </div>
                    <h2 className="font-semibold text-foreground text-base sm:text-lg leading-tight mb-1 pr-2 group-hover:text-blue-400 transition-colors">{guia.titulo}</h2>
                    {guia.resumen_rapido && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{guia.resumen_rapido}</p>
                    )}
                    {isJournal && (
                      <div className="flex items-center text-xs text-muted-foreground mt-3">
                        <FileText size={12} className="mr-1" /> Visor PDF Nivel Nativo
                      </div>
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'revistas' && (
        <RevistasList />
      )}
    </div>
  )
}
