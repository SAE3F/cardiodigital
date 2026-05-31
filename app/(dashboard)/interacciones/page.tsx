'use client'

import { useState, useMemo, useEffect } from 'react'
import { FARMACOS, getInteractionsForSelection, getFarmacoById } from '@/lib/data/interacciones'
import { searchDrugsExternally, getExternalInteractions, RxNavDrug, RxNavInteraction } from '@/lib/api/rxnav'
import { Search, Pill, AlertTriangle, X, ShieldAlert, CheckCircle2, Globe, Database, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function InteraccionesPage() {
  const [searchMode, setSearchMode] = useState<'local' | 'external'>('local')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Estado Local
  const [selectedLocalIds, setSelectedLocalIds] = useState<string[]>([])
  
  // Estado Externo (NIH)
  const [externalCandidates, setExternalCandidates] = useState<RxNavDrug[]>([])
  const [isSearchingExternal, setIsSearchingExternal] = useState(false)
  const [selectedExternalDrugs, setSelectedExternalDrugs] = useState<RxNavDrug[]>([])
  const [externalInteractions, setExternalInteractions] = useState<RxNavInteraction[]>([])
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false)

  // -- LOGICA LOCAL --
  const filteredLocalFarmacos = useMemo(() => {
    if (!searchQuery || searchMode !== 'local') return []
    const q = searchQuery.toLowerCase()
    return FARMACOS.filter(f => 
      !selectedLocalIds.includes(f.id) && 
      (f.nombre.toLowerCase().includes(q) || f.grupo.toLowerCase().includes(q))
    ).slice(0, 8)
  }, [searchQuery, searchMode, selectedLocalIds])

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

  // -- LOGICA EXTERNA (NIH) --
  useEffect(() => {
    if (searchMode !== 'external' || searchQuery.length < 3) {
      setExternalCandidates([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingExternal(true)
      const results = await searchDrugsExternally(searchQuery)
      setExternalCandidates(results.filter(r => !selectedExternalDrugs.find(sed => sed.rxcui === r.rxcui)))
      setIsSearchingExternal(false)
    }, 500) // debounce

    return () => clearTimeout(timer)
  }, [searchQuery, searchMode, selectedExternalDrugs])

  // Cargar interacciones cruzadas externas cuando cambian las drogas
  useEffect(() => {
    async function fetchExtInteractions() {
      if (selectedExternalDrugs.length < 2) {
        setExternalInteractions([])
        return
      }
      setIsLoadingInteractions(true)
      const rxcuis = selectedExternalDrugs.map(d => d.rxcui)
      const results = await getExternalInteractions(rxcuis)
      setExternalInteractions(results)
      setIsLoadingInteractions(false)
    }
    
    if (searchMode === 'external') {
      fetchExtInteractions()
    }
  }, [selectedExternalDrugs, searchMode])

  const toggleExternalFarmaco = (drug: RxNavDrug) => {
    const exists = selectedExternalDrugs.find(d => d.rxcui === drug.rxcui)
    if (exists) {
      setSelectedExternalDrugs(prev => prev.filter(d => d.rxcui !== drug.rxcui))
    } else {
      setSelectedExternalDrugs(prev => [...prev, drug])
      setSearchQuery('')
      setExternalCandidates([])
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Interacciones</h1>
        <p className="text-slate-400 text-sm">
          Evaluación cruzada de interacciones farmacológicas.
        </p>
      </div>

      {/* Selector de Modo */}
      <div className="flex bg-slate-900 rounded-lg p-1 mb-6 border border-slate-800">
        <button
          onClick={() => setSearchMode('local')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
            searchMode === 'local' 
              ? 'bg-slate-700 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Base Cardiológica (Offline)
        </button>
        <button
          onClick={() => setSearchMode('external')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
            searchMode === 'external' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Base Global NIH (Online)
        </button>
      </div>

      {/* Advertencia NIH */}
      {searchMode === 'external' && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-300 flex items-center gap-2">
            <Globe className="w-5 h-5 flex-shrink-0" />
            Buscando en la National Library of Medicine (EE.UU.). Se recomienda buscar los fármacos por su <strong>nombre genérico en inglés</strong> (ej. Acetaminophen, Rivaroxaban).
          </p>
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearchingExternal ? (
            <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-slate-500" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
          placeholder={searchMode === 'local' ? "Buscar fármaco clínico..." : "Search NIH Database (min 3 chars)..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Dropdown Local */}
        {searchMode === 'local' && searchQuery && (
          <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {filteredLocalFarmacos.length === 0 ? (
              <div className="p-4 text-slate-400 text-sm text-center">No se encontraron fármacos en la base local. Probá la base global.</div>
            ) : (
              <ul className="max-h-60 overflow-auto">
                {filteredLocalFarmacos.map(f => (
                  <li 
                    key={f.id}
                    onClick={() => toggleLocalFarmaco(f.id)}
                    className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0"
                  >
                    <span className="font-medium text-slate-200">{f.nombre}</span>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-md">{f.grupo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Dropdown Externo */}
        {searchMode === 'external' && externalCandidates.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <ul className="max-h-60 overflow-auto">
              {externalCandidates.map(f => (
                <li 
                  key={f.rxcui}
                  onClick={() => toggleExternalFarmaco(f)}
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0"
                >
                  <span className="font-medium text-slate-200 capitalize">{f.name.toLowerCase()}</span>
                  <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-md">NIH RxCUI: {f.rxcui}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chips de Fármacos Seleccionados */}
      {(searchMode === 'local' ? selectedLocalFarmacos : selectedExternalDrugs).length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Receta actual ({searchMode === 'local' ? selectedLocalFarmacos.length : selectedExternalDrugs.length}):</h3>
          <div className="flex flex-wrap gap-2">
            {searchMode === 'local' ? (
              selectedLocalFarmacos.map(f => (
                <Badge key={f.id} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 gap-2 flex items-center">
                  <Pill className="w-3.5 h-3.5 text-blue-400" />
                  {f.nombre}
                  <button onClick={() => toggleLocalFarmaco(f.id)} className="ml-1 p-0.5 rounded-full hover:bg-slate-600 transition-colors">
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                </Badge>
              ))
            ) : (
              selectedExternalDrugs.map(f => (
                <Badge key={f.rxcui} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm bg-blue-900/40 hover:bg-blue-800/40 border-blue-500/30 text-blue-200 gap-2 flex items-center">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span className="capitalize">{f.name.toLowerCase()}</span>
                  <button onClick={() => toggleExternalFarmaco(f)} className="ml-1 p-0.5 rounded-full hover:bg-blue-800 transition-colors">
                    <X className="w-3.5 h-3.5 text-blue-400 hover:text-white" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      )}

      {/* Resultados de Interacciones */}
      <div className="space-y-6">
        {(searchMode === 'local' ? selectedLocalFarmacos : selectedExternalDrugs).length < 2 ? (
          <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            <Pill className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">Añadí más fármacos</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
              Seleccioná 2 o más fármacos en el buscador para analizar posibles interacciones.
            </p>
          </div>
        ) : searchMode === 'local' ? (
          // RENDER LOCAL INTERACTIONS
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
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
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
                      <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                        <ShieldAlert className={`w-5 h-5 ${iconColor}`} />
                        {fA} + {fB}
                      </h4>
                      <Badge className={`${badgeColor} uppercase tracking-wider text-[10px] font-bold border-0 px-2.5 py-1`}>
                        {int.severidad}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Mecanismo:</span>
                        <p className="text-slate-400">{int.mecanismo}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Efecto Clínico:</span>
                        <p className="text-slate-400">{int.efecto_clinico}</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mt-3">
                        <span className="font-semibold text-slate-200 block mb-1">Manejo Sugerido:</span>
                        <p className="text-slate-300">{int.manejo}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // RENDER EXTERNAL INTERACTIONS
          isLoadingInteractions ? (
            <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-slate-300">Consultando NIH...</h3>
            </div>
          ) : externalInteractions.length === 0 ? (
            <div className="text-center py-12 px-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-emerald-400">Sin interacciones registradas en NIH</h3>
              <p className="text-emerald-500/70 mt-2 text-sm max-w-sm mx-auto">
                No se encontraron reportes en DrugBank u ONC para esta combinación.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                {externalInteractions.length} Interaccione(s) documentada(s) (NIH)
              </h3>
              
              {externalInteractions.map((int, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border bg-blue-900/10 border-blue-500/30 shadow-sm transition-all`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 flex-wrap capitalize">
                      <ShieldAlert className={`w-5 h-5 text-amber-400`} />
                      {int.drugs[0].name.toLowerCase()} + {int.drugs[1].name.toLowerCase()}
                    </h4>
                    <Badge className={`bg-amber-500/20 text-amber-300 border-amber-500/30 uppercase tracking-wider text-[10px] font-bold px-2.5 py-1`}>
                      {int.severity} (Fuente: {int.source})
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Descripción:</span>
                      <p className="text-slate-400 leading-relaxed">{int.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
