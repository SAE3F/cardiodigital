/**
 * Base de Datos Offline de Interacciones Farmacológicas en Cardiología.
 * 
 * Fuentes de referencia utilizadas para compilar esta matriz:
 * - Guías Clínicas ACC/AHA (American College of Cardiology / American Heart Association)
 * - Guías Clínicas ESC (European Society of Cardiology)
 * - Bases de datos farmacológicas estándar: Lexicomp y Medscape Drug Interaction Checker.
 * - FDA Prescribing Information / EMA.
 * 
 * NOTA CLÍNICA: Esta base de datos se enfoca estrictamente en las interacciones 
 * cardiovasculares más críticas (Contraindicadas y Mayores) encontradas habitualmente 
 * en guardias y unidades coronarias, no pretende ser exhaustiva para interacciones menores.
 */

export type SeveridadInteraccion = 'contraindicado' | 'mayor' | 'moderado' | 'menor';

export interface InteraccionFarmacos {
  farmacos: [string, string]; // IDs de los dos fármacos
  severidad: SeveridadInteraccion;
  mecanismo: string;
  efecto_clinico: string;
  manejo: string;
}

export interface Farmaco {
  id: string;
  nombre: string;
  grupo: string;
}

export const FARMACOS: Farmaco[] = [
  // Antiarrítmicos
  { id: 'amiodarona', nombre: 'Amiodarona', grupo: 'Antiarrítmicos' },
  { id: 'digoxina', nombre: 'Digoxina', grupo: 'Antiarrítmicos' },
  { id: 'sotalol', nombre: 'Sotalol', grupo: 'Antiarrítmicos' },
  { id: 'flecainida', nombre: 'Flecainida', grupo: 'Antiarrítmicos' },
  
  // Anticoagulantes
  { id: 'warfarina', nombre: 'Warfarina', grupo: 'Anticoagulantes' },
  { id: 'acenocumarol', nombre: 'Acenocumarol', grupo: 'Anticoagulantes' },
  { id: 'dabigatran', nombre: 'Dabigatrán', grupo: 'Anticoagulantes DOAC' },
  { id: 'rivaroxaban', nombre: 'Rivaroxabán', grupo: 'Anticoagulantes DOAC' },
  { id: 'apixaban', nombre: 'Apixabán', grupo: 'Anticoagulantes DOAC' },
  
  // Antiagregantes
  { id: 'aspirina', nombre: 'Aspirina (AAS)', grupo: 'Antiagregantes' },
  { id: 'clopidogrel', nombre: 'Clopidogrel', grupo: 'Antiagregantes' },
  { id: 'ticagrelor', nombre: 'Ticagrelor', grupo: 'Antiagregantes' },
  
  // Antihipertensivos / ICC
  { id: 'enalapril', nombre: 'Enalapril', grupo: 'IECA' },
  { id: 'losartan', nombre: 'Losartán', grupo: 'ARA-II' },
  { id: 'sacubitril_valsartan', nombre: 'Sacubitril/Valsartán', grupo: 'ARNI' },
  { id: 'carvedilol', nombre: 'Carvedilol', grupo: 'Betabloqueantes' },
  { id: 'bisoprolol', nombre: 'Bisoprolol', grupo: 'Betabloqueantes' },
  { id: 'amlodipina', nombre: 'Amlodipina', grupo: 'Antagonistas del Calcio' },
  { id: 'diltiazem', nombre: 'Diltiazem', grupo: 'Antagonistas del Calcio' },
  { id: 'verapamilo', nombre: 'Verapamilo', grupo: 'Antagonistas del Calcio' },
  { id: 'espironolactona', nombre: 'Espironolactona', grupo: 'Diuréticos ARM' },
  
  // Estatinas
  { id: 'atorvastatina', nombre: 'Atorvastatina', grupo: 'Estatinas' },
  { id: 'rosuvastatina', nombre: 'Rosuvastatina', grupo: 'Estatinas' },
  { id: 'simvastatina', nombre: 'Simvastatina', grupo: 'Estatinas' },
  
  // Vasodilatadores / Otros CV
  { id: 'nitroglicerina', nombre: 'Nitroglicerina', grupo: 'Nitratos' },
  { id: 'isosorbide', nombre: 'Isosorbide', grupo: 'Nitratos' },
  { id: 'colchicina', nombre: 'Colchicina', grupo: 'Antiinflamatorios' },
  
  // Fármacos no CV de alta relevancia en interacciones
  { id: 'sildenafil', nombre: 'Sildenafil / Tadalafilo', grupo: 'Inh. PDE-5' },
  { id: 'claritromicina', nombre: 'Claritromicina', grupo: 'Antibióticos' },
  { id: 'azitromicina', nombre: 'Azitromicina', grupo: 'Antibióticos' },
  { id: 'ketoconazol', nombre: 'Ketoconazol / Itraconazol', grupo: 'Antimicóticos' },
  { id: 'omeprazol', nombre: 'Omeprazol', grupo: 'IBP' },
  { id: 'ibuprofeno', nombre: 'AINEs (Ibuprofeno, Naproxeno)', grupo: 'AINEs' },
];

export const INTERACCIONES: InteraccionFarmacos[] = [
  // 🔴 CONTRAINDICADOS
  {
    farmacos: ['sildenafil', 'nitroglicerina'],
    severidad: 'contraindicado',
    mecanismo: 'Efecto sinérgico sobre la vía del óxido nítrico / GMPc.',
    efecto_clinico: 'Hipotensión profunda potencialmente fatal. Riesgo de síncope e isquemia miocárdica severa.',
    manejo: 'Contraindicación absoluta. Evitar nitratos al menos por 24h tras sildenafil y 48h tras tadalafilo.'
  },
  {
    farmacos: ['sildenafil', 'isosorbide'],
    severidad: 'contraindicado',
    mecanismo: 'Efecto sinérgico sobre la vía del óxido nítrico / GMPc.',
    efecto_clinico: 'Hipotensión profunda potencialmente fatal.',
    manejo: 'Contraindicación absoluta.'
  },
  {
    farmacos: ['sacubitril_valsartan', 'enalapril'],
    severidad: 'contraindicado',
    mecanismo: 'Aumento severo de los niveles de bradicinina.',
    efecto_clinico: 'Alto riesgo de angioedema severo.',
    manejo: 'Dejar un período de "lavado" (washout) de 36 horas al cambiar de un IECA a Sacubitril/Valsartán.'
  },
  {
    farmacos: ['colchicina', 'claritromicina'],
    severidad: 'contraindicado',
    mecanismo: 'Claritromicina inhibe fuertemente CYP3A4 y P-glicoproteína, reduciendo el clearance de colchicina.',
    efecto_clinico: 'Toxicidad severa y potencialmente fatal por colchicina (neuromiopatía, falla multiorgánica).',
    manejo: 'Evitar combinación. En pacientes renales, contraindicación absoluta.'
  },
  {
    farmacos: ['ticagrelor', 'ketoconazol'],
    severidad: 'contraindicado',
    mecanismo: 'Inhibición potente del CYP3A4 por ketoconazol.',
    efecto_clinico: 'Aumento significativo de la exposición a ticagrelor, elevado riesgo de sangrado.',
    manejo: 'Evitar el uso concurrente con inhibidores potentes del CYP3A4.'
  },

  // 🟠 MAYORES
  {
    farmacos: ['amiodarona', 'warfarina'],
    severidad: 'mayor',
    mecanismo: 'Amiodarona inhibe CYP2C9, CYP1A2 y CYP3A4, disminuyendo el metabolismo de warfarina.',
    efecto_clinico: 'Aumento dramático del RIN y alto riesgo de sangrado.',
    manejo: 'Reducir la dosis de warfarina en un 30-50% empíricamente al iniciar amiodarona. Monitorear RIN estrechamente.'
  },
  {
    farmacos: ['amiodarona', 'digoxina'],
    severidad: 'mayor',
    mecanismo: 'Amiodarona inhibe la P-glicoproteína, reduciendo la excreción renal y no renal de digoxina.',
    efecto_clinico: 'Aumento de niveles de digoxina (hasta 70-100%), riesgo de toxicidad digitálica.',
    manejo: 'Reducir la dosis de digoxina al 50% empíricamente. Monitorear niveles y ECG.'
  },
  {
    farmacos: ['clopidogrel', 'omeprazol'],
    severidad: 'mayor',
    mecanismo: 'Omeprazol inhibe CYP2C19, necesario para transformar clopidogrel en su metabolito activo.',
    efecto_clinico: 'Disminución del efecto antiagregante. Mayor riesgo de trombosis de stent/eventos CV.',
    manejo: 'Considerar IBP alternativos con menor impacto en CYP2C19 (ej. pantoprazol) o cambiar clopidogrel por prasugrel/ticagrelor si IBP es indispensable.'
  },
  {
    farmacos: ['simvastatina', 'diltiazem'],
    severidad: 'mayor',
    mecanismo: 'Diltiazem inhibe CYP3A4, reduciendo el metabolismo de simvastatina.',
    efecto_clinico: 'Aumento significativo de niveles de simvastatina, riesgo de miopatía/rabdomiólisis.',
    manejo: 'Limitar la dosis de simvastatina a un máximo de 10 mg/día, o cambiar a estatina no metabolizada por CYP3A4 (rosuvastatina).'
  },
  {
    farmacos: ['simvastatina', 'amiodarona'],
    severidad: 'mayor',
    mecanismo: 'Inhibición del CYP3A4 por amiodarona.',
    efecto_clinico: 'Riesgo elevado de miopatía/rabdomiólisis.',
    manejo: 'Limitar dosis de simvastatina a 20 mg/día o rotar estatina (rosuvastatina/atorvastatina).'
  },
  {
    farmacos: ['rivaroxaban', 'ketoconazol'],
    severidad: 'mayor',
    mecanismo: 'Inhibición doble de CYP3A4 y P-gp.',
    efecto_clinico: 'Aumento pronunciado de niveles de DOAC, alto riesgo de sangrado.',
    manejo: 'Evitar uso concomitante.'
  },
  {
    farmacos: ['verapamilo', 'bisoprolol'],
    severidad: 'mayor',
    mecanismo: 'Efecto inotrópico y cronotrópico negativo aditivo.',
    efecto_clinico: 'Riesgo de bradicardia severa, bloqueo AV y fallo de bomba.',
    manejo: 'Evitar en general. Si es estrictamente necesario, titular muy cuidadosamente bajo estricto control ECG y clínico.'
  },
  {
    farmacos: ['aspirina', 'ibuprofeno'],
    severidad: 'mayor',
    mecanismo: 'Ibuprofeno bloquea estéricamente el sitio de unión de AAS en la COX-1.',
    efecto_clinico: 'Pérdida del efecto cardioprotector de la aspirina.',
    manejo: 'Si AAS es esencial, dar AAS al menos 2 hs antes o 8 hs después del ibuprofeno. Preferir paracetamol u otro AINE menos interfiriente.'
  },
  {
    farmacos: ['espironolactona', 'enalapril'],
    severidad: 'mayor',
    mecanismo: 'Efecto sinérgico ahorrador de potasio.',
    efecto_clinico: 'Riesgo elevado de hiperpotasemia, especialmente en falla renal.',
    manejo: 'Monitorear estrechamente K+ y creatinina, especialmente al inicio o titulación.'
  },

  // 🟡 MODERADOS
  {
    farmacos: ['amiodarona', 'bisoprolol'],
    severidad: 'moderado',
    mecanismo: 'Efecto depresor aditivo sobre nódulo sinusal y AV.',
    efecto_clinico: 'Riesgo de bradicardia y bloqueos AV.',
    manejo: 'Monitorear ECG. Puede requerir ajuste a la baja del betabloqueante.'
  },
  {
    farmacos: ['digoxina', 'verapamilo'],
    severidad: 'moderado',
    mecanismo: 'Verapamilo inhibe la P-gp, aumentando niveles de digoxina (hasta 70%). Además, efecto bradicardizante aditivo.',
    efecto_clinico: 'Posible toxicidad digitálica y bradicardia/bloqueo.',
    manejo: 'Medir digoxinemia. Monitoreo ECG. Disminuir dosis de digoxina si es necesario.'
  },
  {
    farmacos: ['amiodarona', 'atorvastatina'],
    severidad: 'moderado',
    mecanismo: 'Inhibición leve/moderada de CYP3A4 por amiodarona.',
    efecto_clinico: 'Aumento de exposición a atorvastatina, riesgo de miopatía.',
    manejo: 'Monitorizar síntomas musculares. Considerar no exceder 20-40 mg/día de atorvastatina.'
  }
];

// Helpers para evaluar interacciones
export function getInteractionsForSelection(farmacosIds: string[]): InteraccionFarmacos[] {
  const result: InteraccionFarmacos[] = [];
  
  for (const interaccion of INTERACCIONES) {
    const fA = interaccion.farmacos[0];
    const fB = interaccion.farmacos[1];
    
    // Si ambos fármacos de la interacción están en la selección
    if (farmacosIds.includes(fA) && farmacosIds.includes(fB)) {
      result.push(interaccion);
    }
  }
  
  // Ordenar: Contraindicado -> Mayor -> Moderado
  const orden: Record<SeveridadInteraccion, number> = {
    'contraindicado': 1,
    'mayor': 2,
    'moderado': 3,
    'menor': 4
  };
  
  return result.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
}

export function getFarmacoById(id: string): Farmaco | undefined {
  return FARMACOS.find(f => f.id === id);
}
