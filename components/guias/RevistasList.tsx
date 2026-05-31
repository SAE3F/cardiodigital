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
  
  const sociedades = ['Todas', 'sac', 'fac']
  
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
            <option key={soc} value={soc}>{soc === 'Todas' ? 'Sociedad' : soc.toUpperCase()}</option>
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
                {articles.map((art, idx) => (
                  <Link
                    key={idx}
                    href={`/revistas/pdf?url=${encodeURIComponent(art.pdfLink)}&title=${encodeURIComponent(art.title)}`}
                    className="block p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-blue-500/30 transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <Badge variant="outline" className={`font-mono text-xs whitespace-nowrap ${art.sourceId === 'sac' ? 'border-blue-500/30 text-blue-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                        {art.sourceId.toUpperCase()} {getYear(art.issueTitle)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize bg-accent/80 text-muted-foreground border-none text-right mr-8">
                        {art.category}
                      </Badge>
                    </div>

                    <div className="absolute top-2 right-2">
                      <FavoriteButton 
                        itemSlug={`_journal_${encodeURIComponent(art.pdfLink)}`}
                        tipo="guia"
                        titulo={art.title}
                        url={`/revistas/pdf?url=${encodeURIComponent(art.pdfLink)}&title=${encodeURIComponent(art.title)}`}
                      />
                    </div>

                    <h2 className="font-semibold text-foreground text-sm sm:text-base leading-tight mb-2 pr-10 group-hover:text-blue-400 transition-colors">
                      {art.title}
                    </h2>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ExternalLink size={12} className="mr-1" /> Ver PDF Original
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
