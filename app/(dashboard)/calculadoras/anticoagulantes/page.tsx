'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Repeat, Activity, AlertTriangle, Info } from 'lucide-react'
import { ANTICOAGULANTES, getConversionInstruction, getRenalDosing } from '@/lib/data/anticoagulantes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AnticoagulantesPage() {
  const [fromDrug, setFromDrug] = useState<string>('vka')
  const [toDrug, setToDrug] = useState<string>('rivaroxaban')
  const [crcl, setCrcl] = useState<string>('')

  const conversion = getConversionInstruction(fromDrug, toDrug)
  
  // Mostrar dosis renal solo si la droga objetivo es un DOAC
  const isTargetDoac = ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'].includes(toDrug)
  const renalDosing = isTargetDoac && crcl ? getRenalDosing(toDrug, Number(crcl)) : null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24">
      <Link href="/calculadoras" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Calculadoras
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Repeat className="text-blue-500" /> Switch Anticoagulantes
        </h1>
        <p className="text-muted-foreground">
          Algoritmo de rotación entre anticoagulantes orales y parenterales (Guías ESC/AHA).
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Paciente viene tomando:</label>
            <select
              value={fromDrug}
              onChange={(e) => setFromDrug(e.target.value)}
              className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            >
              {ANTICOAGULANTES.map(d => (
                <option key={`from-${d.id}`} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-background border-border"
              onClick={() => {
                const temp = fromDrug;
                setFromDrug(toDrug);
                setToDrug(temp);
              }}
            >
              <Repeat size={16} className="text-muted-foreground" />
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Rotar a:</label>
            <select
              value={toDrug}
              onChange={(e) => setToDrug(e.target.value)}
              className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            >
              {ANTICOAGULANTES.map(d => (
                <option key={`to-${d.id}`} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {conversion ? (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Activity size={18} /> Instrucción de Rotación
            </h3>
            <p className="text-foreground leading-relaxed">
              {conversion.instruction}
            </p>
            
            {conversion.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {conversion.warnings.map((w, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            {fromDrug === toDrug ? 'Seleccione dos fármacos distintos.' : 'Seleccione los fármacos.'}
          </div>
        )}

        {isTargetDoac && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mt-6">
            <h3 className="font-semibold text-foreground mb-4">Ajuste por Función Renal (DOAC)</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Clearance de Creatinina (mL/min)
              </label>
              <Input
                type="number"
                placeholder="Ej: 45"
                value={crcl}
                onChange={(e) => setCrcl(e.target.value)}
                className="max-w-[150px] bg-background"
              />
            </div>

            {crcl && renalDosing && (
              <div className="bg-accent/50 rounded-xl p-4 border border-border">
                <div className="font-semibold text-lg text-foreground mb-1">
                  {renalDosing.dose}
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>{renalDosing.note}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
