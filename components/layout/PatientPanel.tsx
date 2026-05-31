'use client'

import { usePatient } from '@/lib/contexts/PatientContext'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, Activity, Trash2, CheckCircle2 } from 'lucide-react'

export function PatientPanel() {
  const { patient, setPatientData, clearPatient, isPanelOpen, setPanelOpen } = usePatient()

  const handleClear = () => {
    clearPatient()
    setPanelOpen(false)
  }

  return (
    <Sheet open={isPanelOpen} onOpenChange={setPanelOpen}>
      <SheetContent side="right" className="bg-background border-border text-foreground sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground flex items-center gap-2">
            <User className="text-blue-500" />
            Paciente Activo
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Ingresá los datos del paciente actual. Estos se autocompletarán automáticamente en las calculadoras aplicables para acelerar tu flujo de trabajo en la guardia.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-foreground">Edad (años)</Label>
            <Input
              id="age"
              type="number"
              placeholder="Ej: 65"
              value={patient.age || ''}
              onChange={(e) => setPatientData({ age: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-card border-border focus-visible:ring-blue-500 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-foreground">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ej: 70.5"
              value={patient.weight || ''}
              onChange={(e) => setPatientData({ weight: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="bg-card border-border focus-visible:ring-blue-500 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Sexo Biológico</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setPatientData({ gender: 'F' })}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${patient.gender === 'F' ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}
              >
                Femenino
              </button>
              <button
                onClick={() => setPatientData({ gender: 'M' })}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${patient.gender === 'M' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}
              >
                Masculino
              </button>
            </div>
          </div>
        </div>

        {patient.isActive && (
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-200 font-medium mb-1">Paciente en Memoria</p>
              <p className="text-blue-300/80">Los datos persistirán en este dispositivo y se autocompletarán en las calculadoras numéricas.</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            onClick={() => setPanelOpen(false)}
          >
            Listo, continuar
          </Button>

          {patient.isActive && (
             <Button 
              variant="outline" 
              className="w-full border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
              onClick={handleClear}
             >
               <Trash2 className="w-4 h-4 mr-2" />
               Borrar Paciente Activo
             </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
