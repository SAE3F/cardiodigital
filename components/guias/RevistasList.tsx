import { useState } from 'react'
import { REGULAR_ARTICLES } from '@/lib/data/journals'
import { Search, BookOpen, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FavoriteButton } from '@/components/ui/favorite-button'

export function RevistasList() {
  const [filtro, setFiltro] = useState('')
  const [sociedadFiltro, setSociedadFiltro] = useState<string>('Todas')
  const [anioFiltro, setAnioFiltro] = useState<string>('Todos')
  
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
  
  const anios = ['Todos', ...Array.from(new Set(REGULAR_ARTICLES.map(a => getYear(a.issueTitle))))
    .filter(y => y !== 'Desconocido')
    .sort((a, b) => Number(b) - Number(a))]
  
  const filtradas = REGULAR_ARTICLES.filter(art => {
    const textMatch = art.title.toLowerCase().includes(filtro.toLowerCase()) || 
                      art.category.toLowerCase().includes(filtro.toLowerCase()) ||
                      art.issueTitle.toLowerCase().includes(filtro.toLowerCase())
    
    const socMatch = sociedadFiltro === 'Todas' || art.sourceId === sociedadFiltro
    const anioMatch = anioFiltro === 'Todos' || getYear(art.issueTitle) === anioFiltro
    
    return textMatch && socMatch && anioMatch
  })

  // Agrupar por Issue Title para no mostrar una lista plana desordenada
  const agrupadas = filtradas.reduce((acc, curr) => {
    if (!acc[curr.issueTitle]) acc[curr.issueTitle] = []
    acc[curr.issueTitle].push(curr)
    return acc
  }, {} as Record<string, typeof REGULAR_ARTICLES>)

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar artículos o casos clínicos..."
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

      {Object.keys(agrupadas).length === 0 ? (
        <div className="text-center py-12 text-foreground0 bg-muted/50 rounded-2xl border border-dashed border-border">
          <BookOpen className="mx-auto mb-3 opacity-20" size={48} />
          <p className="text-muted-foreground">No se encontraron artículos.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(agrupadas).map(([issue, articles]) => (
            <div key={issue} className="space-y-3">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-blue-500">
                {issue}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {articles.map((art: any, idx: number) => {
                  const href = art.isExternal 
                    ? art.link 
                    : `/revistas/pdf?url=${encodeURIComponent(art.pdfLink)}&title=${encodeURIComponent(art.title)}`
                  
                  // Badge color mapping
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
                    key={idx}
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
                        {art.category}
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
                      {art.title}
                    </h2>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center text-xs text-muted-foreground group-hover:text-blue-400">
                        <ExternalLink size={12} className="mr-1" /> {art.isExternal ? 'Abrir fuente original' : 'Ver PDF Original'}
                      </div>
                      
                      {art.isExternal && art.link.includes('doi.org') && (
                        <div 
                          className="flex items-center text-xs text-orange-500 hover:text-orange-400 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://annas-archive.org/search?q=${encodeURIComponent(art.link.replace('https://doi.org/', ''))}`, '_blank');
                          }}
                        >
                          <ExternalLink size={12} className="mr-1" /> Buscar en Anna's Archive
                        </div>
                      )}
                    </div>
                  </Link>
                )})}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
