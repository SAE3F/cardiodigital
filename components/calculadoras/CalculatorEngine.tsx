"use client"

import { useState, useEffect } from "react"
import { getCalculatorBySlug, Interpretation, CalculatorOption } from "@/lib/data/calculators"
import Link from "next/link"
import { usePatient } from "@/lib/contexts/PatientContext"

function findMatchingNumericOption(options: CalculatorOption[], value: number): string | null {
  for (const opt of options) {
    const label = opt.label.toLowerCase();
    
    const rangeMatch = label.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
      if (value >= parseInt(rangeMatch[1]) && value <= parseInt(rangeMatch[2])) return opt.id;
      continue;
    }

    const ltMatch = label.match(/[<≤]\s*(\d+)/);
    if (ltMatch) {
      if (label.includes('≤') && value <= parseInt(ltMatch[1])) return opt.id;
      if (label.includes('<') && value < parseInt(ltMatch[1])) return opt.id;
      continue;
    }

    const gtMatch = label.match(/[>≥]\s*(\d+)/);
    if (gtMatch) {
      if (label.includes('≥') && value >= parseInt(gtMatch[1])) return opt.id;
      if (label.includes('>') && value > parseInt(gtMatch[1])) return opt.id;
      continue;
    }
    
    const oMasMatch = label.match(/(\d+)\s*(?:o|y)\s*m[aá]s/);
    if (oMasMatch) {
      if (value >= parseInt(oMasMatch[1])) return opt.id;
      continue;
    }
  }
  return null;
}

interface EngineProps {
  slug: string;
}

export function CalculatorEngine({ slug }: EngineProps) {
  const config = getCalculatorBySlug(slug)
  const { patient } = usePatient()
  
  const [values, setValues] = useState<Record<string, any>>({})
  const [score, setScore] = useState<number | null>(null)
  const [result, setResult] = useState<Interpretation | null>(null)
  const [autoFilled, setAutoFilled] = useState<string[]>([])

  // Pre-cargar datos del paciente si es aplicable
  useEffect(() => {
    if (!config || !patient.isActive) return;

    const newValues = { ...values }
    const filled: string[] = []

    config.inputs.forEach(input => {
      // Inyección exacta para inputs numéricos de edad y peso
      if (input.type === 'number') {
        if (input.id === 'edad' && patient.age) {
          newValues[input.id] = patient.age
          filled.push(input.label)
        }
        if (input.id === 'peso' && patient.weight) {
          newValues[input.id] = patient.weight
          filled.push(input.label)
        }
      }
      
      // Auto-detección para rangos numéricos (ej. edad o peso en radios/checkboxes)
      if (input.id === 'edad' && patient.age && input.options) {
        const matchId = findMatchingNumericOption(input.options, patient.age);
        if (matchId) {
          newValues[input.id] = matchId;
          filled.push(input.label);
        }
      }
      if (input.id === 'peso' && patient.weight && input.options) {
        const matchId = findMatchingNumericOption(input.options, patient.weight);
        if (matchId) {
          newValues[input.id] = matchId;
          filled.push(input.label);
        }
      }

      // Auto-detección para sexo
      if (input.id === 'sexo' && patient.gender && input.options) {
        const isFemale = patient.gender === 'F';
        for (const opt of input.options) {
          const lbl = opt.label.toLowerCase();
          if (isFemale && (lbl.includes('mujer') || lbl.includes('femenin'))) {
            newValues[input.id] = opt.id;
            filled.push(input.label);
            break;
          } else if (!isFemale && (lbl.includes('hombre') || lbl.includes('masculin'))) {
            newValues[input.id] = opt.id;
            filled.push(input.label);
            break;
          }
        }
      }
    })

    if (filled.length > 0 && Object.keys(values).length === 0) {
      setValues(newValues)
      setAutoFilled(filled)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, patient.isActive, patient.age, patient.weight])

  // Calcular automáticamente cada vez que cambian los valores
  useEffect(() => {
    if (!config) return;
    try {
      const calculatedScore = config.calculate(values)
      setScore(calculatedScore)
      setResult(config.interpret(calculatedScore, values))
    } catch (e) {
      console.error("Error calculando el score", e)
    }
  }, [values, config])

  if (!config) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-slate-200 mb-4">Calculadora no encontrada</h2>
        <Link href="/calculadoras" className="text-blue-400 hover:underline">Volver a la lista</Link>
      </div>
    )
  }

  const handleCheckboxChange = (id: string, optionId: string, checked: boolean) => {
    setValues(prev => ({
      ...prev,
      [id]: checked ? optionId : null
    }))
  }

  const handleRadioChange = (id: string, optionId: string) => {
    setValues(prev => ({
      ...prev,
      [id]: optionId
    }))
  }

  const handleNumberChange = (id: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [id]: parseFloat(value)
    }))
  }

  const colorVariants = {
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    yellow: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">{config.name}</h1>
        <p className="text-slate-400 mt-2">{config.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className="inline-block px-3 py-1 bg-slate-800 text-xs font-medium text-slate-300 rounded-full border border-slate-700">
            {config.category}
          </span>
          {config.reference && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-xs font-medium text-slate-400 rounded-full border border-slate-800" title="Referencia Bibliográfica">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {config.reference}
            </span>
          )}
        </div>
        {autoFilled.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-completado: {autoFilled.join(', ')}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel de Inputs */}
        <div className="space-y-4">
          {config.inputs.map((input) => {
            const isSingleCheckbox = input.type === 'checkbox' && input.options?.length === 1;
            const singleOpt = isSingleCheckbox ? input.options![0] : null;
            const isChecked = isSingleCheckbox ? values[input.id] === singleOpt!.id : false;

            if (isSingleCheckbox) {
              return (
                <label 
                  key={input.id} 
                  className={`block relative p-5 rounded-2xl shadow-xl shadow-black/20 cursor-pointer transition-all border ${isChecked ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'}`}
                >
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(input.id, singleOpt!.id, e.target.checked)}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className={`block text-base font-medium transition-colors ${isChecked ? 'text-blue-400' : 'text-slate-200'}`}>
                        {input.label}
                      </span>
                      {input.description && <p className="text-xs text-slate-400 mt-1">{input.description}</p>}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-mono px-2 py-1 rounded transition-colors ${isChecked ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-950 text-slate-500'}`}>
                        +{singleOpt!.points}
                      </span>
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-600'}`}>
                        <svg className={`w-4 h-4 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </label>
              )
            }

            return (
              <div key={input.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/20">
                <label className="block text-sm font-medium text-slate-200 mb-3">{input.label}</label>
                {input.description && <p className="text-xs text-slate-400 mb-3">{input.description}</p>}

                {input.type === 'radio' && (
                  <div className="space-y-2">
                    {input.options?.map(opt => {
                      const isRadioChecked = values[input.id] === opt.id;
                      return (
                        <label key={opt.id} className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl border transition-all ${isRadioChecked ? 'bg-blue-500/10 border-blue-500/50' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'}`}>
                          <div className="relative flex items-center">
                            <input 
                              type="radio" 
                              name={input.id}
                              className="peer sr-only"
                              checked={isRadioChecked}
                              onChange={() => handleRadioChange(input.id, opt.id)}
                            />
                            <div className={`w-5 h-5 rounded-full border transition-all ${isRadioChecked ? 'border-[6px] border-blue-500 bg-white' : 'border-slate-600 bg-slate-800'}`} />
                          </div>
                          <span className={`text-sm transition-colors flex-1 ${isRadioChecked ? 'text-blue-400 font-medium' : 'text-slate-300 group-hover:text-slate-200'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-xs font-mono px-2 py-1 rounded transition-colors ${isRadioChecked ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-950 text-slate-500'}`}>
                            +{opt.points}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {input.type === 'number' && (
                  <div className="relative mt-2">
                    <input
                      type="number"
                      min={input.min}
                      max={input.max}
                      step={input.step || 1}
                      value={values[input.id] || ''}
                      onChange={(e) => handleNumberChange(input.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                      placeholder={`Ej: ${input.min || 0}`}
                    />
                    {input.unit && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{input.unit}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <button 
            onClick={() => setValues({})}
            className="w-full py-3 px-4 rounded-xl text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-slate-300 transition-all font-medium text-sm"
          >
            Limpiar Formulario
          </button>
        </div>

        {/* Panel de Resultados (Pegajoso) */}
        <div className="relative">
          <div className="sticky top-24">
            <div className={`p-6 rounded-3xl border ${result ? colorVariants[result.color] : 'bg-slate-900 border-slate-800'} transition-colors duration-500 shadow-2xl`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-6">Resultado</h2>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-7xl font-bold tracking-tighter">
                  {score !== null && !isNaN(score) ? score : '0'}
                </span>
                <span className="text-xl opacity-60">puntos</span>
              </div>

              {result ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h3 className="text-sm font-medium opacity-70 mb-1">Estratificación de Riesgo</h3>
                    <p className="text-lg font-bold">{result.risk}</p>
                  </div>
                  <div className="h-px w-full bg-current opacity-10 rounded-full" />
                  <div>
                    <h3 className="text-sm font-medium opacity-70 mb-1">Recomendación Clínica</h3>
                    <p className="text-sm opacity-90 leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 opacity-50">
                  <div className="h-12 bg-slate-800/50 rounded-lg animate-pulse" />
                  <div className="h-20 bg-slate-800/50 rounded-lg animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
