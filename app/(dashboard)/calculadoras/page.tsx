"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Search, Heart, Activity, Droplets, Calculator } from 'lucide-react'
import { getAllCalculators } from '@/lib/data/calculators'
import { usePatient } from '@/lib/contexts/PatientContext'

export default function CalculadorasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { setPanelOpen, patient } = usePatient()

  // Obtener calculadoras del motor y la custom de goteo
  const engineCalculators = getAllCalculators().map(c => ({
    href: `/calculadoras/${c.slug}`,
    titulo: c.name,
    descripcion: c.description,
    categoria: c.category,
    icon: Activity, // Generic icon, could be mapped by category
  }))

  const customCalculators = [
    {
      href: '/calculadoras/goteo',
      titulo: 'Goteo de Inotrópicos',
      descripcion: 'Dopamina, dobutamina, noradrenalina en γ/kg/min',
      categoria: 'Cuidados Críticos',
      icon: Droplets,
    },
    {
      href: '/calculadoras/prevent',
      titulo: 'AHA PREVENT™',
      descripcion: 'Riesgo CV Global y Renal a 10 y 30 años (Requiere Internet)',
      categoria: 'Prevención Cardiovascular',
      icon: Activity,
    },
    {
      href: '/calculadoras/score2',
      titulo: 'SCORE2 / SCORE2-OP',
      descripcion: 'Riesgo CV a 10 años Europeo (Requiere Internet)',
      categoria: 'Prevención Cardiovascular',
      icon: Activity,
    }
  ]

  const todas = [...engineCalculators, ...customCalculators]

  // Filtrar por búsqueda
  const filtradas = todas.filter(c => 
    c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Agrupar por categoría
  const agrupadas = filtradas.reduce((acc, curr) => {
    if (!acc[curr.categoria]) acc[curr.categoria] = []
    acc[curr.categoria].push(curr)
    return acc
  }, {} as Record<string, typeof todas>)

  // Ordenar categorías alfabéticamente
  const categoriasOrdenadas = Object.keys(agrupadas).sort()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Calculadoras</h1>
          <p className="text-muted-foreground text-sm">Herramientas clínicas 100% offline</p>
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

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-foreground0" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card text-muted-foreground placeholder-slate-500 focus:outline-none focus:bg-background focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
          placeholder="Buscar por nombre, tema o enfermedad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {categoriasOrdenadas.length === 0 ? (
        <div className="text-center py-12">
          <Calculator className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No se encontraron resultados</h3>
          <p className="text-foreground0 mt-1">Intentá buscar con otros términos.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categoriasOrdenadas.map(categoria => (
            <div key={categoria}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-foreground">{categoria}</h2>
                <div className="h-px flex-1 bg-accent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {agrupadas[categoria].map(c => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="flex flex-col p-4 rounded-2xl bg-card border border-border transition-all hover:bg-accent/80 hover:border-border active:scale-95 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-accent rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors text-muted-foreground">
                        <c.icon size={18} />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-foreground">{c.titulo}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.descripcion}</p>
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
