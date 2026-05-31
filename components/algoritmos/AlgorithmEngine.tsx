'use client'

import { useState } from 'react'
import { AlgorithmConfig, AlgorithmNode, AlgorithmOption } from '@/lib/data/algoritmos'
import { ArrowLeft, ChevronRight, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'

interface AlgorithmEngineProps {
  config: AlgorithmConfig;
}

export function AlgorithmEngine({ config }: AlgorithmEngineProps) {
  // history guarda los IDs de los nodos visitados en orden
  const [history, setHistory] = useState<string[]>([config.initialNodeId])
  
  // El nodo actual es el último del historial
  const currentNodeId = history[history.length - 1]
  const currentNode = config.nodes[currentNodeId]

  const handleOptionClick = (nextId: string) => {
    setHistory([...history, nextId])
  }

  const handleUndo = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1))
    }
  }

  const handleReset = () => {
    setHistory([config.initialNodeId])
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{config.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800/50">
              {config.source}
            </span>
          </div>
          {history.length > 1 && (
            <button 
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Reiniciar
            </button>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{config.description}</p>
      </div>

      {/* Camino Histórico (Nodos Anteriores) */}
      <div className="space-y-6 mb-6">
        {history.slice(0, -1).map((nodeId, index) => {
          const node = config.nodes[nodeId]
          // Buscar qué opción eligió el usuario para pasar al siguiente nodo
          const nextNodeId = history[index + 1]
          const chosenOption = node.options?.find(opt => opt.nextId === nextNodeId)

          return (
            <div key={`${nodeId}-${index}`} className="relative pl-6 border-l-2 border-border ml-4 pb-4 opacity-50 transition-opacity hover:opacity-100">
              <div className="absolute w-3 h-3 bg-secondary rounded-full -left-[7px] top-1.5 border-2 border-slate-900"></div>
              
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <h3 className="text-muted-foreground font-medium text-sm mb-2">{node.title}</h3>
                {chosenOption && (
                  <div className="flex items-center text-blue-400 text-sm font-semibold">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    {chosenOption.label}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Nodo Actual */}
      <div className="relative pl-6 border-l-2 border-blue-500 ml-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1.5 border-4 border-slate-950 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
        
        {currentNode.type === 'question' ? (
          // CARD DE PREGUNTA
          <div className="bg-accent p-5 md:p-6 rounded-2xl border border-border shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-2">{currentNode.title}</h2>
            {currentNode.description && (
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {currentNode.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {currentNode.options?.map((option, i) => {
                // Estilos según variante
                let btnClass = "flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center "
                if (option.variant === 'default') {
                  btnClass += "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20"
                } else if (option.variant === 'destructive') {
                  btnClass += "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20"
                } else {
                  btnClass += "bg-secondary hover:bg-slate-600 text-foreground"
                }

                return (
                  <button 
                    key={i} 
                    onClick={() => handleOptionClick(option.nextId)}
                    className={btnClass}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          // CARD DE ENDPOINT (CONCLUSIÓN)
          <div className={`p-6 rounded-2xl border shadow-xl ${
            currentNode.color === 'red' ? 'bg-red-950/30 border-red-900/50' :
            currentNode.color === 'yellow' ? 'bg-yellow-950/30 border-yellow-900/50' :
            'bg-green-950/30 border-green-900/50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {currentNode.color === 'red' ? (
                <ShieldAlert className="w-8 h-8 text-red-500" />
              ) : currentNode.color === 'yellow' ? (
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              )}
              <h2 className="text-2xl font-bold text-foreground">{currentNode.title}</h2>
            </div>
            
            {currentNode.description && (
              <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                {currentNode.description}
              </p>
            )}
            
            {currentNode.recommendation && (
              <div className="bg-background/50 p-4 rounded-xl mb-4 border border-border/50">
                <h4 className="text-xs uppercase tracking-wider font-bold text-foreground0 mb-2">Recomendación</h4>
                <p className="text-foreground text-sm whitespace-pre-line leading-relaxed">
                  {currentNode.recommendation}
                </p>
              </div>
            )}

            {currentNode.alert && (
              <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30 flex items-start gap-3 mt-4">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm font-medium">
                  {currentNode.alert}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón Volver (solo si hay historia) */}
      {history.length > 1 && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleUndo}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground bg-card hover:bg-accent px-4 py-2 rounded-full transition-colors text-sm font-medium border border-border"
          >
            <ArrowLeft className="w-4 h-4" />
            Deshacer último paso
          </button>
        </div>
      )}
    </div>
  )
}
