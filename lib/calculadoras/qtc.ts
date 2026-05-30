export type FormulaQTc = 'bazett' | 'fridericia' | 'framingham'

export interface InputQTc {
  qt_ms: number      // QT medido en milisegundos
  rr_ms: number      // Intervalo RR en milisegundos
  formula: FormulaQTc
  frecuencia_cardiaca?: number  // FC alternativa para calcular RR
}

export interface ResultadoQTc {
  qtc_ms: number
  prolongado: boolean
  critico: boolean
  interpretacion: string
  formula_usada: string
}

export function calcularQTc(input: InputQTc): ResultadoQTc {
  let { qt_ms, rr_ms } = input

  // Si se provee FC, calcular RR
  if (input.frecuencia_cardiaca && input.frecuencia_cardiaca > 0) {
    rr_ms = (60 / input.frecuencia_cardiaca) * 1000
  }

  const rr_s = rr_ms / 1000
  let qtc_ms: number
  let formula_usada: string

  switch (input.formula) {
    case 'bazett':
      qtc_ms = qt_ms / Math.sqrt(rr_s)
      formula_usada = `Bazett: QT / √RR = ${qt_ms} / √${rr_s.toFixed(3)}`
      break
    case 'fridericia':
      qtc_ms = qt_ms / Math.cbrt(rr_s)
      formula_usada = `Fridericia: QT / ∛RR = ${qt_ms} / ∛${rr_s.toFixed(3)}`
      break
    case 'framingham':
      qtc_ms = qt_ms + 154 * (1 - rr_s)
      formula_usada = `Framingham: QT + 154 × (1 – RR) = ${qt_ms} + 154 × (1 – ${rr_s.toFixed(3)})`
      break
  }

  qtc_ms = Math.round(qtc_ms)
  const prolongado = qtc_ms > 440
  const critico = qtc_ms > 500

  let interpretacion: string
  if (qtc_ms <= 440) interpretacion = 'Normal (≤ 440 ms)'
  else if (qtc_ms <= 460) interpretacion = 'Borderline prolongado (441–460 ms)'
  else if (qtc_ms <= 500) interpretacion = '⚠ QTc prolongado (461–500 ms) — revisar fármacos'
  else interpretacion = '🚨 QTc crítico (> 500 ms) — riesgo de Torsades de Pointes'

  return { qtc_ms, prolongado, critico, interpretacion, formula_usada }
}
