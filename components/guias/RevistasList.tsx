'use client'

import { useState, useMemo, useEffect } from 'react'
import { REGULAR_ARTICLES } from '@/lib/data/journals'
import { Search, BookOpen, ExternalLink, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FavoriteButton } from '@/components/ui/favorite-button'

// Helper para resaltar palabras encontradas
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  
  const tokens = highlight.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  if (tokens.length === 0) return <>{text}</>;

  // Crear una regex que coincida con cualquiera de los tokens
  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        tokens.some(t => part.toLowerCase() === t) ? (
          <span key={i} className="bg-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-bold px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export function RevistasList() {
  const [filtro, setFiltro] = useState('')
  const [debouncedFiltro, setDebouncedFiltro] = useState('')
  const [sociedadFiltro, setSociedadFiltro] = useState<string>('Todas')
  const [anioFiltro, setAnioFiltro] = useState<string>('Todos')
  const [displayLimit, setDisplayLimit] = useState(30)
  
  // Implementar debounce para no trabar la UI al escribir
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFiltro(filtro)
      setDisplayLimit(30) // Resetear paginación al cambiar búsqueda
    }, 300)
    return () => clearTimeout(handler)
  }, [filtro])

  // Resetear paginación al cambiar filtros select
  useEffect(() => {
    setDisplayLimit(30)
  }, [sociedadFiltro, anioFiltro])
  
  const sociedades = [
    { id: 'Todas', name: 'Sociedad' },
    { id: 'sac', name: 'SAC' },
    { id: 'fac', name: 'FAC' },
    { id: 'rec', name: 'REC' },
    { id: 'jacc', name: 'JACC' },
    { id: 'circulation', name: 'Circulation' },
    { id: 'ehj', name: 'EHJ' },
    { id: 'nejm', name: 'NEJM' },
    { id: 'jama', name: 'JAMA' },
    { id: 'lancet', name: 'Lancet' }
  ]
  
  const getYear = (issueTitle: string) => issueTitle.match(/\b(19|20)\d{2}\b/)?.[0] || 'Desconocido'
  
  const anios = useMemo(() => {
    return ['Todos', ...Array.from(new Set(REGULAR_ARTICLES.map(a => getYear(a.issueTitle))))
      .filter(y => y !== 'Desconocido')
      .sort((a, b) => Number(b) - Number(a))]
  }, [])
  
  const filtradas = useMemo(() => {
    const searchTokens = debouncedFiltro.toLowerCase().split(/\s+/).filter(t => t.length > 0)
    
    return REGULAR_ARTICLES.filter(art => {
      // Tokenized search (AND logico)
      const textToSearch = `${art.title} ${art.category} ${art.issueTitle}`.toLowerCase()
      const textMatch = searchTokens.length === 0 || searchTokens.every(token => textToSearch.includes(token))
      
      const socMatch = sociedadFiltro === 'Todas' || art.sourceId === sociedadFiltro
      const anioMatch = anioFiltro === 'Todos' || getYear(art.issueTitle) === anioFiltro
      
      return textMatch && socMatch && anioMatch
    })
  }, [debouncedFiltro, sociedadFiltro, anioFiltro])

  const visibleArticles = filtradas.slice(0, displayLimit)
  const hasMore = filtradas.length > displayLimit
  const isSearching = debouncedFiltro.trim().length > 0

  // Agrupar por Issue Title solo si NO estamos buscando texto específico
  const agrupadas = useMemo(() => {
    if (isSearching) return {} // No agrupamos si hay busqueda
    
    return visibleArticles.reduce((acc, curr) => {
      if (!acc[curr.issueTitle]) acc[curr.issueTitle] = []
      acc[curr.issueTitle].push(curr)
      return acc
    }, {} as Record<string, typeof REGULAR_ARTICLES>)
  }, [visibleArticles, isSearching])

  const renderArticleCard = (art: any, idx: number) => {
    const href = art.isExternal 
      ? art.link 
      : `/revistas/pdf?url=${encodeURIComponent(art.pdfLink)}&title=${encodeURIComponent(art.title)}`
    
    const badgeColors: Record<string, string> = {
      sac: 'border-blue-500/30 text-blue-400',
      fac: 'border-emerald-500/30 text-emerald-400',
      rec: 'border-yellow-500/30 text-yellow-400',
      jacc: 'border-indigo-500/30 text-indigo-400',
      circulation: 'border-red-500/30 text-red-400',
      ehj: 'border-purple-500/30 text-purple-400',
      nejm: 'border-slate-500/30 text-slate-400',
      jama: 'border-orange-500/30 text-orange-400',
      lancet: 'border-pink-500/30 text-pink-400'
    }

    return (
      <Link
        key={`${art.sourceId}-${idx}`}
        href={href}
        target={art.isExternal ? "_blank" : undefined}
        rel={art.isExternal ? "noopener noreferrer" : undefined}
        className="block p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-blue-500/30 transition-all group relative"
      >
        <div className="flex justify-between items-start mb-2 gap-2">
          <Badge variant="outline" className={`font-mono text-xs whitespace-nowrap ${badgeColors[art.sourceId] || 'border-gray-500/30 text-gray-400'}`}>
            {art.sourceId.toUpperCase()} {getYear(art.issueTitle)}
          </Badge>
          <Badge variant="secondary" className="text-[10px] capitalize bg-accent/80 text-muted-foreground border-none text-right mr-8">
            <HighlightText text={art.category} highlight={debouncedFiltro} />
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          <FavoriteButton 
            itemSlug={art.isExternal ? `_ext_${encodeURIComponent(art.link)}` : `_journal_${encodeURIComponent(art.pdfLink)}`}
            tipo="guia"
            titulo={art.title}
            url={href}
          />
        </div>

        <h2 className="font-semibold text-foreground text-sm sm:text-base leading-tight mb-2 pr-10 group-hover:text-blue-400 transition-colors">
          <HighlightText text={art.title} highlight={debouncedFiltro} />
        </h2>
        
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <div className="flex items-center text-xs text-muted-foreground group-hover:text-blue-400">
            <ExternalLink size={12} className="mr-1" /> {art.isExternal ? 'Abrir fuente original' : 'Ver PDF Original'}
          </div>
          
          {art.isExternal && art.link.includes('doi.org') && (
            <div 
              className="flex items-center text-xs text-orange-500 hover:text-orange-400 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://annas-archive.pk/search?q=${encodeURIComponent(art.link.replace('https://doi.org/', ''))}`, '_blank');
              }}
            >
              <ExternalLink size={12} className="mr-1" /> Buscar en Anna's Archive
            </div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por palabras clave (ej: amyloidosis jacc)..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="pl-10 bg-card border-border text-foreground h-11"
          />
        </div>
        <select
          value={anioFiltro}
          onChange={e => setAnioFiltro(e.target.value)}
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
            <option key={soc.id} value={soc.id}>{soc.name}</option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-12 text-foreground0 bg-muted/50 rounded-2xl border border-dashed border-border">
          <BookOpen className="mx-auto mb-3 opacity-20" size={48} />
          <p className="text-muted-foreground">No se encontraron artículos.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {isSearching ? (
            // Lista plana para búsquedas
            <div className="grid grid-cols-1 gap-3">
              <p className="text-xs text-muted-foreground mb-2">Mostrando {visibleArticles.length} de {filtradas.length} resultados</p>
              {visibleArticles.map((art, idx) => renderArticleCard(art, idx))}
            </div>
          ) : (
            // Lista agrupada por fascículo cuando no hay búsqueda de texto
            Object.entries(agrupadas).map(([issue, articles]) => (
              <div key={issue} className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-blue-500">
                  {issue}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {articles.map((art, idx) => renderArticleCard(art, idx))}
                </div>
              </div>
            ))
          )}

          {hasMore && (
            <div className="pt-4 pb-8 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="w-full sm:w-auto rounded-full bg-card hover:bg-accent border-blue-500/30 hover:border-blue-500"
              >
                <ChevronDown className="mr-2" size={16} />
                Cargar más artículos ({filtradas.length - displayLimit} restantes)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
