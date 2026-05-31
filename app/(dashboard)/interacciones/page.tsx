'use client'

import { useState, useMemo } from 'react'
import { FARMACOS, getInteractionsForSelection, getFarmacoById } from '@/lib/data/interacciones'
import { Search, Pill, AlertTriangle, X, ShieldAlert, CheckCircle2, Database } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function InteraccionesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocalIds, setSelectedLocalIds] = useState<string[]>([])
  
  const filteredLocalFarmacos = useMemo(() => {
    if (!searchQuery) return []
    const q = searchQuery.toLowerCase()
    return FARMACOS.filter(f => 
      !selectedLocalIds.includes(f.id) && 
      (f.nombre.toLowerCase().includes(q) || f.grupo.toLowerCase().includes(q))
    ).slice(0, 15) // Aumentamos el límite de resultados
  }, [searchQuery, selectedLocalIds])

  const selectedLocalFarmacos = selectedLocalIds.map(id => getFarmacoById(id)!)
  const localInteracciones = getInteractionsForSelection(selectedLocalIds)

  const toggleLocalFarmaco = (id: string) => {
    if (selectedLocalIds.includes(id)) {
      setSelectedLocalIds(prev => prev.filter(x => x !== id))
    } else {
      setSelectedLocalIds(prev => [...prev, id])
      setSearchQuery('')
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Interacciones</h1>
        <p className="text-muted-foreground text-sm">
          Evaluación cruzada de interacciones farmacológicas.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-foreground0" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card text-muted-foreground placeholder-slate-500 focus:outline-none focus:bg-background focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
          placeholder="Buscar fármaco clínico..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Dropdown Local */}
        {searchQuery && (
          <div className="absolute z-10 w-full mt-2 bg-accent border border-border rounded-xl shadow-2xl overflow-hidden">
            {filteredLocalFarmacos.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm text-center">No se encontraron fármacos.</div>
            ) : (
              <ul className="max-h-60 overflow-auto">
                {filteredLocalFarmacos.map(f => (
                  <li 
                    key={f.id}
                    onClick={() => toggleLocalFarmaco(f.id)}
                    className="px-4 py-3 hover:bg-secondary cursor-pointer flex justify-between items-center border-b border-border/50 last:border-0"
                  >
                    <span className="font-medium text-foreground">{f.nombre}</span>
                    <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded-md">{f.grupo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Chips de Fármacos Seleccionados */}
      {selectedLocalFarmacos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Receta actual ({selectedLocalFarmacos.length}):</h3>
          <div className="flex flex-wrap gap-2">
            {selectedLocalFarmacos.map(f => (
              <Badge key={f.id} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm bg-accent hover:bg-secondary border-border text-foreground gap-2 flex items-center">
                <Pill className="w-3.5 h-3.5 text-blue-400" />
                {f.nombre}
                <button onClick={() => toggleLocalFarmaco(f.id)} className="ml-1 p-0.5 rounded-full hover:bg-slate-600 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-white" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de Interacciones */}
      <div className="space-y-6">
        {selectedLocalFarmacos.length < 2 ? (
          <div className="text-center py-16 px-4 bg-muted/50 rounded-2xl border border-border border-dashed">
            <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Añadí más fármacos</h3>
            <p className="text-foreground0 mt-2 text-sm max-w-sm mx-auto">
              Seleccioná 2 o más fármacos en el buscador para analizar posibles interacciones en la base de datos cardiológica.
            </p>
          </div>
        ) : (
          localInteracciones.length === 0 ? (
            <div className="text-center py-12 px-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-emerald-400">Sin interacciones críticas en base local</h3>
              <p className="text-emerald-500/70 mt-2 text-sm max-w-sm mx-auto">
                No se encontraron interacciones mayores entre los fármacos seleccionados en nuestra base.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Se detectaron {localInteracciones.length} interaccione(s) locales
              </h3>
              
              {localInteracciones.map((int, idx) => {
                const fA = FARMACOS.find(f => f.id === int.farmacos[0])?.nombre;
                const fB = FARMACOS.find(f => f.id === int.farmacos[1])?.nombre;
                
                const isContraindicado = int.severidad === 'contraindicado';
                const isMayor = int.severidad === 'mayor';
                
                const bgColor = isContraindicado ? 'bg-red-500/10' : isMayor ? 'bg-orange-500/10' : 'bg-yellow-500/10';
                const borderColor = isContraindicado ? 'border-red-500/30' : isMayor ? 'border-orange-500/30' : 'border-yellow-500/30';
                const badgeColor = isContraindicado ? 'bg-red-500 text-white' : isMayor ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white';
                const iconColor = isContraindicado ? 'text-red-400' : isMayor ? 'text-orange-400' : 'text-yellow-400';

                return (
                  <div key={idx} className={`p-5 rounded-2xl border ${bgColor} ${borderColor} shadow-sm transition-all`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <h4 className="text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                        <ShieldAlert className={`w-5 h-5 ${iconColor}`} />
                        {fA} + {fB}
                      </h4>
                      <Badge className={`${badgeColor} uppercase tracking-wider text-[10px] font-bold border-0 px-2.5 py-1`}>
                        {int.severidad}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Mecanismo:</span>
                        <p className="text-muted-foreground">{int.mecanismo}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Efecto Clínico:</span>
                        <p className="text-muted-foreground">{int.efecto_clinico}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg border border-border/50 mt-3">
                        <span className="font-semibold text-foreground block mb-1">Manejo Sugerido:</span>
                        <p className="text-muted-foreground">{int.manejo}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
