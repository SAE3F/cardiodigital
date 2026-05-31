'use client'

import { ALGORITMOS } from '@/lib/data/algoritmos'
import Link from 'next/link'
import { GitCommit, ArrowRight, ShieldAlert, HeartPulse, Activity, Heart } from 'lucide-react'
import { usePatient } from '@/lib/contexts/PatientContext'

export default function AlgoritmosHubPage() {
  const { setPanelOpen, patient } = usePatient()
  // Agrupar por categoría
  const categorias = Array.from(new Set(ALGORITMOS.map(a => a.category)))

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Algoritmos de Decisión</h1>
          <p className="text-muted-foreground text-sm">
            Flujogramas interactivos paso a paso basados en los consensos de la Sociedad Argentina de Cardiología (SAC).
          </p>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs transition-colors border ${
            patient.isActive ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {patient.isActive ? <Heart className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          Paciente
        </button>
      </div>

      <div className="space-y-10">
        {categorias.map(cat => (
          <div key={cat}>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              {cat === 'Cardiopatía Isquémica' ? <HeartPulse className="w-5 h-5 text-red-500" /> :
               cat === 'Insuficiencia Cardíaca' ? <Activity className="w-5 h-5 text-blue-500" /> :
               <ShieldAlert className="w-5 h-5 text-yellow-500" />}
              {cat}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALGORITMOS.filter(a => a.category === cat).map(algo => (
                <Link 
                  href={`/algoritmos/${algo.slug}`} 
                  key={algo.slug}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-blue-500/50 hover:bg-accent transition-all group flex flex-col h-full"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <GitCommit className="w-5 h-5 text-blue-400" />
                      <h3 className="font-bold text-foreground text-lg">{algo.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {algo.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-foreground0 px-2 py-1 bg-background rounded-md">
                      {algo.source}
                    </span>
                    <ArrowRight className="w-5 h-5 text-foreground0 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
