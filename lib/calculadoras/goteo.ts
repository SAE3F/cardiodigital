/**
 * Calculadora de goteo de inotrópicos
 * Resultado en mL/hora para infusión continua
 */

export interface InputGoteo {
  farmaco: 'dopamina' | 'dobutamina' | 'noradrenalina' | 'adrenalina' | 'milrinona'
  dosis_gamma: number        // γ = mcg/kg/min
  peso_kg: number
  concentracion_mg: number   // mg del fármaco en la bolsa
  volumen_bolsa_ml: number   // mL de la bolsa/jeringa
}

export interface ResultadoGoteo {
  ml_por_hora: number
  ml_por_minuto: number
  concentracion_mcg_ml: number
  formula_usada: string
  advertencias: string[]
}

export function calcularGoteo(input: InputGoteo): ResultadoGoteo {
  const { dosis_gamma, peso_kg, concentracion_mg, volumen_bolsa_ml } = input

  // Concentración final en mcg/mL
  const concentracion_mcg_ml = (concentracion_mg * 1000) / volumen_bolsa_ml

  // Dosis total en mcg/min para el paciente
  const dosis_mcg_min = dosis_gamma * peso_kg

  // mL/min necesarios
  const ml_por_minuto = dosis_mcg_min / concentracion_mcg_ml

  // mL/hora (lo que se carga en la bomba)
  const ml_por_hora = ml_por_minuto * 60

  const advertencias: string[] = []

  // Advertencias por rango de dosis
  if (input.farmaco === 'dopamina') {
    if (dosis_gamma < 3) advertencias.push('Dosis dopaminérgica (< 3 γ): efecto renal/esplácnico')
    else if (dosis_gamma <= 10) advertencias.push('Dosis beta (3–10 γ): efecto inotrópico y cronotrópico')
    else advertencias.push('⚠ Dosis alfa (> 10 γ): vasoconstricción predominante')
  }
  if (input.farmaco === 'noradrenalina' && dosis_gamma > 0.5) {
    advertencias.push('⚠ Dosis alta de noradrenalina: monitoreo estrecho de perfusión periférica')
  }
  if (ml_por_hora > 50) {
    advertencias.push('⚠ Volumen/hora elevado: considerar mayor concentración')
  }

  return {
    ml_por_hora: Math.round(ml_por_hora * 10) / 10,
    ml_por_minuto: Math.round(ml_por_minuto * 100) / 100,
    concentracion_mcg_ml: Math.round(concentracion_mcg_ml * 10) / 10,
    formula_usada: `(${dosis_gamma} γ × ${peso_kg} kg) / ${concentracion_mcg_ml.toFixed(1)} mcg/mL × 60`,
    advertencias,
  }
}
