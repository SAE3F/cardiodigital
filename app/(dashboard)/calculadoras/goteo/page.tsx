'use client'
import { useState } from 'react'
import { calcularGoteo, type InputGoteo } from '@/lib/calculadoras/goteo'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const FARMACOS = ['dopamina', 'dobutamina', 'noradrenalina', 'adrenalina', 'milrinona'] as const

export default function GoteoPage() {
  const [form, setForm] = useState<InputGoteo>({
    farmaco: 'dopamina',
    dosis_gamma: 5,
    peso_kg: 70,
    concentracion_mg: 200,
    volumen_bolsa_ml: 250,
  })
  const [resultado, setResultado] = useState<ReturnType<typeof calcularGoteo> | null>(null)

  const calcular = () => setResultado(calcularGoteo(form))

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <h1 className="text-xl font-bold mb-1">Goteo de Inotrópicos</h1>
      <p className="text-slate-400 text-sm mb-6">Cálculo en γ/kg/min → mL/hora</p>

      <div className="space-y-4">
        {/* Fármaco */}
        <div>
          <Label className="text-slate-300 mb-2 block">Fármaco</Label>
          <div className="flex flex-wrap gap-2">
            {FARMACOS.map(f => (
              <button
                key={f}
                onClick={() => setForm(p => ({ ...p, farmaco: f }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                  form.farmaco === f
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-slate-300">Dosis (γ/kg/min)</Label>
            <Input
              type="number" step="0.5"
              value={form.dosis_gamma}
              onChange={e => setForm(p => ({ ...p, dosis_gamma: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-900 border-slate-700 text-slate-100 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-300">Peso (kg)</Label>
            <Input
              type="number"
              value={form.peso_kg}
              onChange={e => setForm(p => ({ ...p, peso_kg: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-900 border-slate-700 text-slate-100 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-300">Concentración (mg)</Label>
            <Input
              type="number"
              value={form.concentracion_mg}
              onChange={e => setForm(p => ({ ...p, concentracion_mg: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-900 border-slate-700 text-slate-100 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-300">Volumen bolsa (mL)</Label>
            <Input
              type="number"
              value={form.volumen_bolsa_ml}
              onChange={e => setForm(p => ({ ...p, volumen_bolsa_ml: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-900 border-slate-700 text-slate-100 mt-1"
            />
          </div>
        </div>

        <Button
          onClick={calcular}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 text-base"
        >
          Calcular
        </Button>
      </div>

      {resultado && (
        <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3">
          <div className="text-center">
            <p className="text-slate-400 text-sm">Velocidad de infusión</p>
            <p className="text-4xl font-bold text-red-400">{resultado.ml_por_hora}</p>
            <p className="text-slate-400">mL/hora</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Concentración</p>
              <p className="font-semibold">{resultado.concentracion_mcg_ml} mcg/mL</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-slate-400 text-xs">mL/minuto</p>
              <p className="font-semibold">{resultado.ml_por_minuto}</p>
            </div>
          </div>
          {resultado.advertencias.map((adv, i) => (
            <Badge key={i} variant="destructive" className="w-full justify-start text-xs py-1 h-auto text-left whitespace-normal">
              {adv}
            </Badge>
          ))}
          <p className="text-xs text-slate-500 font-mono mt-2">{resultado.formula_usada}</p>
        </div>
      )}
    </div>
  )
}
