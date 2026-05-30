export interface InputClearance {
  creatinina_mg_dl: number
  edad: number
  peso_kg: number
  sexo: 'masculino' | 'femenino'
}

export interface ResultadoClearance {
  crcl_ml_min: number
  interpretacion: string
  estadio_ckd: string
  ajuste_dosis: string
}

export function calcularClearanceCockcroftGault(input: InputClearance): ResultadoClearance {
  const { creatinina_mg_dl, edad, peso_kg, sexo } = input
  let crcl = ((140 - edad) * peso_kg) / (72 * creatinina_mg_dl)
  if (sexo === 'femenino') crcl *= 0.85
  crcl = Math.round(crcl * 10) / 10

  let estadio_ckd: string
  if (crcl >= 90) estadio_ckd = 'G1 (≥ 90 mL/min) — Normal o aumentado'
  else if (crcl >= 60) estadio_ckd = 'G2 (60–89 mL/min) — Levemente disminuido'
  else if (crcl >= 45) estadio_ckd = 'G3a (45–59 mL/min) — Leve a moderado'
  else if (crcl >= 30) estadio_ckd = 'G3b (30–44 mL/min) — Moderado a severo'
  else if (crcl >= 15) estadio_ckd = 'G4 (15–29 mL/min) — Severo'
  else estadio_ckd = 'G5 (< 15 mL/min) — Falla renal'

  let ajuste_dosis: string
  if (crcl >= 50) ajuste_dosis = 'Sin ajuste en la mayoría de los fármacos'
  else if (crcl >= 30) ajuste_dosis = 'Ajustar NOAC, HBPM, metformina, digoxina'
  else if (crcl >= 15) ajuste_dosis = '⚠ Ajuste significativo requerido. Evitar metformina, NOAC orales'
  else ajuste_dosis = '🚨 Diálisis. Consultar nefrología para todo fármaco renal'

  return {
    crcl_ml_min: crcl,
    interpretacion: estadio_ckd,
    estadio_ckd,
    ajuste_dosis,
  }
}
