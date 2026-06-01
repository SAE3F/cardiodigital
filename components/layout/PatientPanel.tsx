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
import { User, Trash2, CheckCircle2, Zap, Scale, Fingerprint } from 'lucide-react'

export function PatientPanel() {
  const { patient, setPatientData, clearPatient, isPanelOpen, setPanelOpen } = usePatient()

  const handleClear = () => {
    clearPatient()
    setPanelOpen(false)
  }

  return (
    <Sheet open={isPanelOpen} onOpenChange={setPanelOpen}>
      <SheetContent 
        side="right" 
        className="border-l border-white/10 dark:border-white/5 bg-background/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl text-foreground sm:max-w-md w-full overflow-y-auto shadow-2xl"
      >
        {/* Glow de fondo */}
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] pointer-events-none rounded-full -translate-y-1/2" />

        <div className="relative z-10 h-full flex flex-col">
          <SheetHeader className="mb-8 pt-4">
            <SheetTitle className="text-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                <User size={24} />
              </div>
              Perfil del Paciente
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mt-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
              Ajustá los parámetros del paciente actual. La app los utilizará automáticamente en todas las calculadoras y algoritmos.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8 flex-1">
            {/* Edad */}
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <Label htmlFor="age" className="text-foreground/80 font-medium flex items-center gap-2">
                <Fingerprint size={16} className="text-muted-foreground" />
                Edad (años)
              </Label>
              <div className="relative group">
                <Input
                  id="age"
                  type="number"
                  placeholder="Ej: 65"
                  value={patient.age || ''}
                  onChange={(e) => setPatientData({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-accent/50 border-border/50 hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 text-xl px-5 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Peso */}
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <Label htmlFor="weight" className="text-foreground/80 font-medium flex items-center gap-2">
                <Scale size={16} className="text-muted-foreground" />
                Peso (kg)
              </Label>
              <div className="relative group">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  value={patient.weight || ''}
                  onChange={(e) => setPatientData({ weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="bg-accent/50 border-border/50 hover:border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl h-14 text-xl px-5 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Sexo */}
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <Label className="text-foreground/80 font-medium flex items-center gap-2">
                <Zap size={16} className="text-muted-foreground" />
                Sexo Biológico
              </Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPatientData({ gender: 'F' })}
                  className={`flex-1 py-4 px-3 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${
                    patient.gender === 'F' 
                      ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/10 border-pink-500/50 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.15)]' 
                      : 'bg-accent/50 border-border/50 text-muted-foreground hover:bg-accent hover:border-border'
                  }`}
                >
                  <div className={`p-2 rounded-full ${patient.gender === 'F' ? 'bg-pink-500/20' : 'bg-transparent'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v7"/><path d="M9 19h6"/><circle cx="12" cy="9" r="6"/></svg>
                  </div>
                  <span className="font-semibold text-sm">Femenino</span>
                </button>
                <button
                  onClick={() => setPatientData({ gender: 'M' })}
                  className={`flex-1 py-4 px-3 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${
                    patient.gender === 'M' 
                      ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/50 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                      : 'bg-accent/50 border-border/50 text-muted-foreground hover:bg-accent hover:border-border'
                  }`}
                >
                  <div className={`p-2 rounded-full ${patient.gender === 'M' ? 'bg-blue-500/20' : 'bg-transparent'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14L21 3"/><path d="M16 3h5v5"/><circle cx="10" cy="14" r="6"/></svg>
                  </div>
                  <span className="font-semibold text-sm">Masculino</span>
                </button>
              </div>
            </div>
            
            {patient.isActive && (
              <div className="mt-8 animate-in zoom-in-95 duration-500 delay-500">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/30 p-5 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 size={64} />
                  </div>
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-full text-blue-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-blue-500 dark:text-blue-400 font-bold mb-1">Paciente en Memoria</p>
                      <p className="text-sm text-foreground/70 leading-relaxed">Los datos se mantendrán sincronizados con todas las herramientas clínicas.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-8 border-t border-border/50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
            <Button 
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              onClick={() => setPanelOpen(false)}
            >
              Confirmar
            </Button>

            {patient.isActive && (
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 font-medium transition-all active:scale-[0.98]"
                onClick={handleClear}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Borrar Datos
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
