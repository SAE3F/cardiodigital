export const ANTICOAGULANTES = [
  { id: 'vka', name: 'Antivitamina K (Acenocumarol / Warfarina)', type: 'vka' },
  { id: 'apixaban', name: 'Apixaban', type: 'doac' },
  { id: 'rivaroxaban', name: 'Rivaroxaban', type: 'doac' },
  { id: 'dabigatran', name: 'Dabigatran', type: 'doac' },
  { id: 'edoxaban', name: 'Edoxaban', type: 'doac' },
  { id: 'lmwh', name: 'HBPM (Enoxaparina)', type: 'parenteral' },
  { id: 'ufh', name: 'Heparina Sódica (IV)', type: 'parenteral' },
];

export const getConversionInstruction = (fromId: string, toId: string) => {
  if (fromId === toId) return null;

  const from = ANTICOAGULANTES.find(a => a.id === fromId);
  const to = ANTICOAGULANTES.find(a => a.id === toId);

  if (!from || !to) return null;

  let instruction = '';
  let warnings = [];

  // VKA to DOAC
  if (from.type === 'vka' && to.type === 'doac') {
    instruction = `Suspender ${from.name}. Iniciar ${to.name} cuando el RIN sea:`;
    if (to.id === 'rivaroxaban') warnings.push('RIN ≤ 3.0 (algunas guías sugieren ≤ 2.5).');
    else if (to.id === 'edoxaban') warnings.push('RIN ≤ 2.5.');
    else warnings.push('RIN ≤ 2.0.');
  }
  
  // DOAC to VKA
  else if (from.type === 'doac' && to.type === 'vka') {
    instruction = `Administrar ${to.name} junto con ${from.name} de forma simultánea (solapamiento) hasta que el RIN sea ≥ 2.0.`;
    warnings.push(`Los DOACs pueden alterar el valor del RIN. Se debe medir el RIN justo antes de la siguiente dosis programada de ${from.name} para minimizar esta interferencia.`);
    warnings.push(`Suspender ${from.name} una vez que el RIN esté en rango terapéutico estable.`);
  }

  // Parenteral to DOAC
  else if (from.type === 'parenteral' && to.type === 'doac') {
    if (from.id === 'lmwh') {
      instruction = `Iniciar ${to.name} en el momento en que correspondería administrar la siguiente dosis de ${from.name}.`;
    } else {
      instruction = `Iniciar ${to.name} inmediatamente después de suspender la infusión continua de ${from.name}.`;
    }
  }

  // DOAC to Parenteral
  else if (from.type === 'doac' && to.type === 'parenteral') {
    instruction = `Iniciar ${to.name} en el momento en que correspondería administrar la siguiente dosis de ${from.name}.`;
  }

  // VKA to Parenteral
  else if (from.type === 'vka' && to.type === 'parenteral') {
    instruction = `Suspender ${from.name}. Iniciar ${to.name} cuando el RIN sea < 2.0.`;
  }

  // Parenteral to VKA
  else if (from.type === 'parenteral' && to.type === 'vka') {
    instruction = `Iniciar ${to.name} junto con ${from.name}. Mantener ${from.name} al menos 5 días Y hasta que el RIN sea ≥ 2.0 durante 24-48 horas.`;
  }

  // DOAC to DOAC
  else if (from.type === 'doac' && to.type === 'doac') {
    instruction = `Suspender ${from.name}. Iniciar ${to.name} en el momento en que correspondería administrar la siguiente dosis de ${from.name}.`;
    warnings.push('Atención: Si la función renal está muy alterada, el intervalo podría necesitar ser mayor debido a un clearance prolongado del DOAC previo.');
  }

  return { from, to, instruction, warnings };
};

export const getRenalDosing = (doacId: string, crcl: number | null) => {
  if (!crcl) return null;

  if (doacId === 'apixaban') {
    if (crcl >= 30) return { dose: '5 mg cada 12 hs', note: 'Reducir a 2.5 mg c/12h si cumple ≥2 criterios: Edad ≥80a, Peso ≤60kg, Creatinina ≥1.5 mg/dL.' };
    if (crcl >= 15 && crcl < 30) return { dose: '2.5 mg cada 12 hs', note: 'Ajuste empírico por falla renal severa (o uso cauteloso de 5mg según criterios ABC).' };
    return { dose: 'No recomendado', note: 'Contraindicado o no recomendado en CrCl < 15 / Diálisis en muchas guías (aunque FDA permite en HD).' };
  }
  
  if (doacId === 'rivaroxaban') {
    if (crcl >= 50) return { dose: '20 mg cada 24 hs', note: 'Tomar junto con las comidas.' };
    if (crcl >= 15 && crcl < 50) return { dose: '15 mg cada 24 hs', note: 'Tomar junto con las comidas.' };
    return { dose: 'No recomendado', note: 'Contraindicado si CrCl < 15 mL/min.' };
  }

  if (doacId === 'dabigatran') {
    if (crcl >= 50) return { dose: '150 mg cada 12 hs', note: 'Considerar 110 mg c/12h si edad ≥80a, alto riesgo de sangrado o uso de inhibidores P-gp (verapamilo).' };
    if (crcl >= 30 && crcl < 50) return { dose: '110 mg cada 12 hs', note: 'Ajuste recomendado en Argentina/Europa por edad o riesgo.' };
    return { dose: 'No recomendado', note: 'Contraindicado si CrCl < 30 mL/min.' };
  }

  if (doacId === 'edoxaban') {
    if (crcl > 95) return { dose: 'Uso con precaución', note: 'Mayor riesgo de ACV isquémico por hiperclearance.' };
    if (crcl >= 50 && crcl <= 95) return { dose: '60 mg cada 24 hs', note: 'Reducir a 30 mg si Peso ≤60kg o inhibidores P-gp.' };
    if (crcl >= 15 && crcl < 50) return { dose: '30 mg cada 24 hs', note: 'Ajuste por función renal.' };
    return { dose: 'No recomendado', note: 'Contraindicado si CrCl < 15 mL/min.' };
  }

  return null;
};
