// CHA₂DS₂-VASc
export interface InputCHADS {
  insuficiencia_cardiaca: boolean
  hipertension: boolean
  edad_75_o_mas: boolean
  diabetes: boolean
  stroke_atia_previo: boolean   // 2 puntos
  enfermedad_vascular: boolean
  edad_65_74: boolean
  sexo_femenino: boolean        // Solo suma si tiene otro factor
}

export function calcularCHADS(input: InputCHADS) {
  let puntaje = 0
  if (input.insuficiencia_cardiaca) puntaje += 1
  if (input.hipertension) puntaje += 1
  if (input.edad_75_o_mas) puntaje += 2
  if (input.diabetes) puntaje += 1
  if (input.stroke_atia_previo) puntaje += 2
  if (input.enfermedad_vascular) puntaje += 1
  if (input.edad_65_74) puntaje += 1
  if (input.sexo_femenino) puntaje += 1

  const riesgoAnual = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 6.7, 15.2]
  const tasaAnual = riesgoAnual[Math.min(puntaje, 9)] ?? 15.2

  let recomendacion: string
  if (puntaje === 0) recomendacion = 'No anticoagular. Sin terapia antitrombótica.'
  else if (puntaje === 1) recomendacion = 'Considerar anticoagulación oral (ACO). Individualizar.'
  else recomendacion = 'Anticoagulación oral (ACO) recomendada. Preferir NOAC sobre warfarina.'

  return { puntaje, tasaAnual, recomendacion }
}

// HAS-BLED
export interface InputHASBLED {
  hipertension_no_controlada: boolean   // PAS > 160
  insuficiencia_renal: boolean
  insuficiencia_hepatica: boolean
  stroke_previo: boolean
  sangrado_previo: boolean
  inr_labil: boolean                    // Solo warfarina
  edad_mayor_65: boolean
  drogas_antiplaquetarias: boolean
  alcohol: boolean
}

export function calcularHASBLED(input: InputHASBLED) {
  let puntaje = 0
  Object.values(input).forEach(v => { if (v) puntaje++ })

  let riesgo: string
  let recomendacion: string
  if (puntaje <= 1) {
    riesgo = 'Bajo (< 1% anual)'
    recomendacion = 'ACO indicada. No modifica la decisión de anticoagular.'
  } else if (puntaje === 2) {
    riesgo = 'Moderado (~2% anual)'
    recomendacion = 'ACO indicada con seguimiento estrecho. Corregir factores modificables.'
  } else {
    riesgo = '⚠ Alto (≥ 3% anual)'
    recomendacion = 'ACO no contraindicada, pero corregir factores modificables antes de iniciar.'
  }

  return { puntaje, riesgo, recomendacion }
}

// TIMI para SCA sin elevación del ST
export interface InputTIMI {
  edad_65_o_mas: boolean
  tres_o_mas_factores_rcv: boolean
  estenosis_coronaria_previa: boolean
  desviacion_st: boolean
  dos_o_mas_episodios_anginosos: boolean
  aspirina_ultimos_7_dias: boolean
  marcadores_positivos: boolean
}

export function calcularTIMI(input: InputTIMI) {
  const puntaje = Object.values(input).filter(Boolean).length

  const eventos14dias = [4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9]
  const tasa = eventos14dias[Math.min(puntaje, 6)]

  let estrategia: string
  if (puntaje <= 2) estrategia = 'Bajo riesgo. Manejo conservador inicial.'
  else if (puntaje <= 4) estrategia = 'Riesgo intermedio. Estrategia invasiva temprana.'
  else estrategia = '🚨 Alto riesgo. Estrategia invasiva urgente.'

  return { puntaje, tasa, estrategia }
}
