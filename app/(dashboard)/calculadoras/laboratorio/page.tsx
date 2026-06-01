'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, TestTube2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LAB_VALUES } from '@/lib/data/laboratorio'

export default function LaboratorioPage() {
  const [filtro, setFiltro] = useState('')

  const filtrados = useMemo(() => {
    if (!filtro) return LAB_VALUES
    const term = filtro.toLowerCase()
    return LAB_VALUES.filter(lab => 
      lab.name.toLowerCase().includes(term) || 
      lab.category.toLowerCase().includes(term) ||
      (lab.notes && lab.notes.toLowerCase().includes(term))
    )
  }, [filtro])

  // Agrupar por categoría
  const agrupados = useMemo(() => {
    return filtrados.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = []
      acc[curr.category].push(curr)
      return acc
    }, {} as Record<string, typeof LAB_VALUES>)
  }, [filtrados])

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <Link href="/calculadoras" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <TestTube2 className="text-blue-500" /> Valores Normales
        </h1>
        <p className="text-muted-foreground">
          Laboratorios de referencia para Cardiología y Cuidados Críticos.
        </p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          <strong>Atención:</strong> Los valores normales pueden variar según el laboratorio y el ensayo utilizado (especialmente en Troponinas y Dímero D). Usar siempre el rango de referencia del laboratorio local.
        </p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-foreground0" />
        </div>
        <Input
          type="text"
          className="pl-10 bg-card border-border text-foreground h-12"
          placeholder="Buscar laboratorio (ej. Potasio, Troponina, pH)..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {Object.keys(agrupados).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron resultados para "{filtro}"
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(agrupados).map(([categoria, labs]) => (
            <div key={categoria} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-foreground">{categoria}</h2>
              </div>
              <div className="divide-y divide-border">
                {labs.map((lab, idx) => (
                  <div key={idx} className="p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-medium text-foreground">
                        {lab.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-sm px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {lab.normalValue} <span className="text-muted-foreground ml-1">{lab.unit}</span>
                        </Badge>
                      </div>
                    </div>
                    {lab.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {lab.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
