'use client'
import { useState, useEffect } from 'react'
import { calcularGoteo, type InputGoteo } from '@/lib/calculadoras/goteo'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePatient } from '@/lib/contexts/PatientContext'

const FARMACOS = ['dopamina', 'dobutamina', 'noradrenalina', 'adrenalina', 'milrinona'] as const

export default function GoteoPage() {
  const { patient } = usePatient()
  
  const [form, setForm] = useState<InputGoteo>({
    farmaco: 'dopamina',
    dosis_gamma: 5,
    peso_kg: patient.isActive && patient.weight ? patient.weight : 70,
    concentracion_mg: 200,
    volumen_bolsa_ml: 250,
  })
  const [resultado, setResultado] = useState<ReturnType<typeof calcularGoteo> | null>(null)
  const [autoFilled, setAutoFilled] = useState(false)

  useEffect(() => {
    if (patient.isActive && patient.weight && patient.weight !== form.peso_kg) {
      setForm(p => ({ ...p, peso_kg: patient.weight! }))
      setAutoFilled(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.isActive, patient.weight])

  const calcular = () => setResultado(calcularGoteo(form))

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <h1 className="text-xl font-bold mb-1">Goteo de Inotrópicos</h1>
      <p className="text-muted-foreground text-sm mb-6">Cálculo en γ/kg/min → mL/hora</p>

      {autoFilled && (
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm rounded-lg">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto-completado: Peso
        </div>
      )}

      <div className="space-y-4">
        {/* Fármaco */}
        <div>
          <Label className="text-muted-foreground mb-2 block">Fármaco</Label>
          <div className="flex flex-wrap gap-2">
            {FARMACOS.map(f => (
              <button
                key={f}
                onClick={() => setForm(p => ({ ...p, farmaco: f }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                  form.farmaco === f
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-border text-muted-foreground hover:border-slate-500 hover:bg-accent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-muted-foreground">Dosis (γ/kg/min)</Label>
            <Input
              type="number" step="0.5"
              value={form.dosis_gamma}
              onChange={e => setForm(p => ({ ...p, dosis_gamma: parseFloat(e.target.value) || 0 }))}
              className="bg-card border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Peso (kg)</Label>
            <Input
              type="number"
              value={form.peso_kg}
              onChange={e => setForm(p => ({ ...p, peso_kg: parseFloat(e.target.value) || 0 }))}
              className="bg-card border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Concentración (mg)</Label>
            <Input
              type="number"
              value={form.concentracion_mg}
              onChange={e => setForm(p => ({ ...p, concentracion_mg: parseFloat(e.target.value) || 0 }))}
              className="bg-card border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Volumen bolsa (mL)</Label>
            <Input
              type="number"
              value={form.volumen_bolsa_ml}
              onChange={e => setForm(p => ({ ...p, volumen_bolsa_ml: parseFloat(e.target.value) || 0 }))}
              className="bg-card border-border text-foreground mt-1"
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
        <div className="mt-6 p-4 bg-card rounded-xl border border-border space-y-3">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Velocidad de infusión</p>
            <p className="text-4xl font-bold text-red-400">{resultado.ml_por_hora}</p>
            <p className="text-muted-foreground">mL/hora</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-accent rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Concentración</p>
              <p className="font-semibold">{resultado.concentracion_mcg_ml} mcg/mL</p>
            </div>
            <div className="bg-accent rounded-lg p-3">
              <p className="text-muted-foreground text-xs">mL/minuto</p>
              <p className="font-semibold">{resultado.ml_por_minuto}</p>
            </div>
          </div>
          {resultado.advertencias.map((adv, i) => (
            <Badge key={i} variant="destructive" className="w-full justify-start text-xs py-1 h-auto text-left whitespace-normal">
              {adv}
            </Badge>
          ))}
          <p className="text-xs text-foreground0 font-mono mt-2">{resultado.formula_usada}</p>
        </div>
      )}
    </div>
  )
}
