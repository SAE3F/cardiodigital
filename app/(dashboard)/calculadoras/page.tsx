"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Search, Heart, Activity, Droplets, Calculator } from 'lucide-react'
import { getAllCalculators } from '@/lib/data/calculators'

export default function CalculadorasPage() {
  const [searchQuery, setSearchQuery] = useState('')

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Calculadoras</h1>
        <p className="text-slate-400 text-sm">Herramientas clínicas 100% offline</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
          placeholder="Buscar por nombre, tema o enfermedad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {categoriasOrdenadas.length === 0 ? (
        <div className="text-center py-12">
          <Calculator className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">No se encontraron resultados</h3>
          <p className="text-slate-500 mt-1">Intentá buscar con otros términos.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categoriasOrdenadas.map(categoria => (
            <div key={categoria}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-slate-200">{categoria}</h2>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {agrupadas[categoria].map(c => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="flex flex-col p-4 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:bg-slate-800/80 hover:border-slate-700 active:scale-95 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors text-slate-400">
                        <c.icon size={18} />
                      </div>
                      <h3 className="font-semibold text-sm text-slate-200 group-hover:text-slate-100">{c.titulo}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{c.descripcion}</p>
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
