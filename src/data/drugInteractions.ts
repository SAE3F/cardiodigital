/**
 * Base de Datos Offline de Interacciones Farmacológicas en Cardiología.
 * 
 * Fuentes de referencia:
 * - Guías ACC/AHA y ESC
 * - Lexicomp / UpToDate / Epocrates / Medscape
 * - FDA / EMA Prescribing Information
 * 
 * Enfocado en las interacciones Contraindicadas, Mayores y Moderadas críticas.
 * Incluye fármacos comunes en geriatría y comorbilidades prevalentes (Diabetes, EPOC, Psiquiatría, Urología).
 */

export type SeveridadInteraccion = 'contraindicado' | 'mayor' | 'moderado' | 'menor';

export interface InteraccionFarmacos {
  farmacos: [string, string];
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
  /* FÁRMACOS CARDIOVASCULARES Y METABÓLICOS */
  
  // Antiarrítmicos
  { id: 'amiodarona', nombre: 'Amiodarona', grupo: 'Antiarrítmico Clase III' },
  { id: 'sotalol', nombre: 'Sotalol', grupo: 'Antiarrítmico Clase III / Betabloqueante' },
  { id: 'dofetilida', nombre: 'Dofetilida', grupo: 'Antiarrítmico Clase III' },
  { id: 'ibutilida', nombre: 'Ibutilida', grupo: 'Antiarrítmico Clase III' },
  { id: 'flecainida', nombre: 'Flecainida', grupo: 'Antiarrítmico Clase IC' },
  { id: 'propafenona', nombre: 'Propafenona', grupo: 'Antiarrítmico Clase IC' },
  { id: 'digoxina', nombre: 'Digoxina', grupo: 'Glucósido Cardíaco' },

  // Vasodilatadores / Antianginosos
  { id: 'nitroglicerina', nombre: 'Nitroglicerina', grupo: 'Nitrato' },
  { id: 'isosorbide', nombre: 'Isosorbide', grupo: 'Nitrato' },
  { id: 'sildenafil', nombre: 'Sildenafil', grupo: 'Inhibidor PDE-5' },
  { id: 'tadalafil', nombre: 'Tadalafil', grupo: 'Inhibidor PDE-5' },
  { id: 'acenocumarol', nombre: 'Acenocumarol', grupo: 'Anticoagulantes' },
  { id: 'dabigatran', nombre: 'Dabigatrán', grupo: 'DOACs' },
  { id: 'rivaroxaban', nombre: 'Rivaroxabán', grupo: 'DOACs' },
  { id: 'apixaban', nombre: 'Apixabán', grupo: 'DOACs' },
  { id: 'edoxaban', nombre: 'Edoxabán', grupo: 'DOACs' },
  { id: 'heparina', nombre: 'Heparina / Enoxaparina', grupo: 'Anticoagulantes' },
  
  // Antiagregantes
  { id: 'aspirina', nombre: 'Aspirina (AAS)', grupo: 'Antiagregantes' },
  { id: 'clopidogrel', nombre: 'Clopidogrel', grupo: 'Antiagregantes' },
  { id: 'ticagrelor', nombre: 'Ticagrelor', grupo: 'Antiagregantes' },
  { id: 'prasugrel', nombre: 'Prasugrel', grupo: 'Antiagregantes' },
  { id: 'cilostazol', nombre: 'Cilostazol', grupo: 'Antiagregantes' },
  
  // IECA / ARA-II / ARNI
  { id: 'enalapril', nombre: 'Enalapril / Lisinopril', grupo: 'IECA' },
  { id: 'losartan', nombre: 'Losartán / Valsartán', grupo: 'ARA-II' },
  { id: 'sacubitril_valsartan', nombre: 'Sacubitril/Valsartán', grupo: 'ARNI' },
  
  // Betabloqueantes
  { id: 'carvedilol', nombre: 'Carvedilol', grupo: 'Betabloqueantes' },
  { id: 'bisoprolol', nombre: 'Bisoprolol / Metoprolol', grupo: 'Betabloqueantes' },
  { id: 'atenolol', nombre: 'Atenolol', grupo: 'Betabloqueantes' },
  { id: 'propranolol', nombre: 'Propranolol', grupo: 'Betabloqueantes' },
  
  // Antagonistas del Calcio
  { id: 'amlodipina', nombre: 'Amlodipina / Nifedipina', grupo: 'BCC Dihidropiridínicos' },
  { id: 'diltiazem', nombre: 'Diltiazem', grupo: 'BCC No-Dihidropiridínicos' },
  { id: 'verapamilo', nombre: 'Verapamilo', grupo: 'BCC No-Dihidropiridínicos' },
  
  // Diuréticos
  { id: 'furosemida', nombre: 'Furosemida / Torasemida', grupo: 'Diuréticos de Asa' },
  { id: 'tiazidas', nombre: 'Hidroclorotiazida / Clortalidona', grupo: 'Diuréticos Tiazídicos' },
  { id: 'espironolactona', nombre: 'Espironolactona / Eplerenona', grupo: 'Diuréticos ARM' },
  
  // Estatinas y Fibratos
  { id: 'atorvastatina', nombre: 'Atorvastatina', grupo: 'Estatinas' },
  { id: 'rosuvastatina', nombre: 'Rosuvastatina', grupo: 'Estatinas' },
  { id: 'simvastatina', nombre: 'Simvastatina', grupo: 'Estatinas' },
  { id: 'gemfibrozil', nombre: 'Gemfibrozil', grupo: 'Fibratos' },
  { id: 'fenofibrato', nombre: 'Fenofibrato', grupo: 'Fibratos' },
  
  // Vasodilatadores / Otros CV
  { id: 'nitratos', nombre: 'Nitroglicerina / Isosorbide', grupo: 'Nitratos' },
  { id: 'colchicina', nombre: 'Colchicina', grupo: 'Antiinflamatorios' },
  { id: 'ivabradina', nombre: 'Ivabradina', grupo: 'Antianginosos' },

  // Antidiabéticos
  { id: 'metformina', nombre: 'Metformina', grupo: 'Biguanidas' },
  { id: 'dapagliflozina', nombre: 'Dapagliflozina / Empagliflozina', grupo: 'iSGLT2' },
  { id: 'sulfonilureas', nombre: 'Gliclazida / Glimepirida', grupo: 'Sulfonilureas' },
  { id: 'insulina', nombre: 'Insulinas', grupo: 'Hormonas' },
  
  /* FÁRMACOS DE OTRAS ESPECIALIDADES (COMORBILIDADES / GERIATRÍA) */

  // Antimicrobianos
  { id: 'claritromicina', nombre: 'Claritromicina', grupo: 'Macrólidos' },
  { id: 'azitromicina', nombre: 'Azitromicina', grupo: 'Macrólidos' },
  { id: 'ciprofloxacina', nombre: 'Ciprofloxacina / Levofloxacina', grupo: 'Fluoroquinolonas' },
  { id: 'ketoconazol', nombre: 'Ketoconazol / Itraconazol', grupo: 'Antimicóticos Azoles' },
  { id: 'fluconazol', nombre: 'Fluconazol', grupo: 'Antimicóticos Azoles' },
  { id: 'rifampicina', nombre: 'Rifampicina', grupo: 'Inductores Enzimáticos' },

  // Analgésicos / Antiinflamatorios / Gota
  { id: 'ibuprofeno', nombre: 'Ibuprofeno / Naproxeno / Diclofenac', grupo: 'AINEs' },
  { id: 'corticoides', nombre: 'Prednisona / Dexametasona', grupo: 'Corticoides' },
  { id: 'tramadol', nombre: 'Tramadol', grupo: 'Opioides' },
  { id: 'alopurinol', nombre: 'Alopurinol', grupo: 'Antigotosos' },
  
  // Psiquiatría / Neurología
  { id: 'fluoxetina', nombre: 'Fluoxetina / Paroxetina', grupo: 'ISRS' },
  { id: 'citalopram', nombre: 'Citalopram / Escitalopram', grupo: 'ISRS' },
  { id: 'litio', nombre: 'Litio', grupo: 'Estabilizadores del Ánimo' },
  { id: 'quetiapina', nombre: 'Quetiapina / Risperidona', grupo: 'Antipsicóticos' },
  { id: 'haloperidol', nombre: 'Haloperidol', grupo: 'Antipsicóticos' },
  { id: 'carbamazepina', nombre: 'Carbamazepina / Fenitoína', grupo: 'Anticonvulsivantes' },
  { id: 'donepezilo', nombre: 'Donepezilo', grupo: 'Inh. Colinesterasa' },
  
  // Gastroenterología / Urología / Endocrinología
  { id: 'omeprazol', nombre: 'Omeprazol / Esomeprazol', grupo: 'IBP' },
  { id: 'pantoprazol', nombre: 'Pantoprazol', grupo: 'IBP' },
  { id: 'tamsulosina', nombre: 'Tamsulosina', grupo: 'Alfa bloqueantes' },
  { id: 'sildenafil', nombre: 'Sildenafil / Tadalafilo', grupo: 'Inh. PDE-5' },
  { id: 'levotiroxina', nombre: 'Levotiroxina', grupo: 'Hormonas Tiroideas' },
  { id: 'salbutamol', nombre: 'Salbutamol / Salmeterol', grupo: 'Broncodilatadores' }
];

export const INTERACCIONES: InteraccionFarmacos[] = [
  /* 🔴 CONTRAINDICACIONES ABSOLUTAS */
  { farmacos: ['sildenafil', 'nitratos'], severidad: 'contraindicado',
    mecanismo: 'Sinergismo sobre vía óxido nítrico / GMPc.',
    efecto_clinico: 'Hipotensión profunda refractaria, isquemia miocárdica, síncope.',
    manejo: 'Evitar nitratos x 24h post-sildenafil y x 48h post-tadalafilo.' },
  { farmacos: ['sacubitril_valsartan', 'enalapril'], severidad: 'contraindicado',
    mecanismo: 'Inhibición dual ECA y neprilisina impidiendo degradación de bradicininas.',
    efecto_clinico: 'Altísimo riesgo de angioedema fatal.',
    manejo: 'Lavado estricto (washout) de 36h al cambiar de IECA a ARNI.' },
  { farmacos: ['colchicina', 'claritromicina'], severidad: 'contraindicado',
    mecanismo: 'Claritromicina inhibe potentemente P-gp y CYP3A4.',
    efecto_clinico: 'Toxicidad fatal por colchicina (miopatía, neuropatía, pancitopenia).',
    manejo: 'Evitar combinación. Contraindicación absoluta en enfermedad renal/hepática.' },
  { farmacos: ['colchicina', 'ketoconazol'], severidad: 'contraindicado',
    mecanismo: 'Inhibición potente P-gp y CYP3A4.',
    efecto_clinico: 'Toxicidad severa sistémica por colchicina.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['ticagrelor', 'ketoconazol'], severidad: 'contraindicado',
    mecanismo: 'Ketoconazol inhibe fuertemente CYP3A4.',
    efecto_clinico: 'Aumento masivo exposición ticagrelor, riesgo hemorrágico inaceptable.',
    manejo: 'Evitar uso de inhibidores potentes CYP3A4 con ticagrelor.' },
  { farmacos: ['ticagrelor', 'claritromicina'], severidad: 'contraindicado',
    mecanismo: 'Claritromicina inhibe fuertemente CYP3A4.',
    efecto_clinico: 'Aumento masivo exposición ticagrelor.',
    manejo: 'Usar macrólido alternativo (azitromicina) o cambiar a clopidogrel.' },
  { farmacos: ['simvastatina', 'claritromicina'], severidad: 'contraindicado',
    mecanismo: 'Inhibición CYP3A4 bloquea metabolismo de la simvastatina.',
    efecto_clinico: 'Aumento severo de niveles séricos. Rabdomiólisis y falla renal.',
    manejo: 'Suspender estatina durante tto antibiótico.' },
  { farmacos: ['simvastatina', 'ketoconazol'], severidad: 'contraindicado',
    mecanismo: 'Inhibición CYP3A4.',
    efecto_clinico: 'Riesgo inminente de rabdomiólisis.',
    manejo: 'Suspender simvastatina o rotar a estatina no-CYP3A4 (rosuvastatina).' },
  { farmacos: ['gemfibrozil', 'simvastatina'], severidad: 'contraindicado',
    mecanismo: 'Gemfibrozil inhibe glucuronidación de estatinas.',
    efecto_clinico: 'Riesgo inaceptablemente alto de miopatía/rabdomiólisis.',
    manejo: 'Contraindicado. Si se requiere fibrato, usar fenofibrato con extrema cautela.' },
  { farmacos: ['gemfibrozil', 'atorvastatina'], severidad: 'contraindicado',
    mecanismo: 'Gemfibrozil inhibe metabolismo de estatina.',
    efecto_clinico: 'Alto riesgo de rabdomiólisis.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['gemfibrozil', 'rosuvastatina'], severidad: 'contraindicado',
    mecanismo: 'Gemfibrozil interfiere con transporte de OATP1B1.',
    efecto_clinico: 'Aumento de niveles de rosuvastatina, miotoxicidad.',
    manejo: 'Evitar combinación. Preferir fenofibrato si es necesario.' },
  { farmacos: ['dronedarona', 'amiodarona'], severidad: 'contraindicado',
    mecanismo: 'Duplicación terapéutica y prolongación sinérgica del intervalo QT.',
    efecto_clinico: 'Toxicidad, Torsades de Pointes, arritmias ventriculares letales.',
    manejo: 'No combinar jamás.' },
  { farmacos: ['quetiapina', 'amiodarona'], severidad: 'contraindicado',
    mecanismo: 'Prolongación extrema del intervalo QT aditiva.',
    efecto_clinico: 'Riesgo gravísimo de Torsades de Pointes.',
    manejo: 'Evitar. Si se requiere antipsicótico buscar alternativa o monitoreo ECG estricto.' },
  { farmacos: ['haloperidol', 'amiodarona'], severidad: 'contraindicado',
    mecanismo: 'Haloperidol IV/VO + Amiodarona = prolongación QT sinérgica.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar combinación o usar dosis mínimas con telemetría continua.' },
  { farmacos: ['sotalol', 'quetiapina'], severidad: 'contraindicado',
    mecanismo: 'Sotalol y Quetiapina prolongan QT.',
    efecto_clinico: 'Arritmias ventriculares letales (TdP).',
    manejo: 'Evitar.' },

  /* 🟠 INTERACCIONES MAYORES (Requieren intervención o vigilancia estricta) */
  { farmacos: ['amiodarona', 'warfarina'], severidad: 'mayor',
    mecanismo: 'Amiodarona inhibe CYP2C9, reduciendo depuración de warfarina.',
    efecto_clinico: 'Aumento severo del RIN y riesgo altísimo de sangrado.',
    manejo: 'Reducir warfarina 30-50% al iniciar amiodarona. Monitorear RIN c/3-5 días.' },
  { farmacos: ['amiodarona', 'acenocumarol'], severidad: 'mayor',
    mecanismo: 'Inhibición CYP2C9.',
    efecto_clinico: 'Aumento de RIN, hemorragia.',
    manejo: 'Reducir acenocumarol 30-50% y monitorear.' },
  { farmacos: ['amiodarona', 'digoxina'], severidad: 'mayor',
    mecanismo: 'Inhibición P-glicoproteína disminuye clearance de digoxina.',
    efecto_clinico: 'Digoxinemia aumenta 70-100%, intoxicación digitálica (arritmias, síntomas GI).',
    manejo: 'Reducir digoxina al 50%. Vigilar ECG y digoxinemia.' },
  { farmacos: ['amiodarona', 'simvastatina'], severidad: 'mayor',
    mecanismo: 'Inhibición CYP3A4.',
    efecto_clinico: 'Riesgo elevado de miopatía/rabdomiólisis.',
    manejo: 'Dosis máxima simvastatina 20mg/día. Considerar rosuvastatina.' },
  { farmacos: ['clopidogrel', 'omeprazol'], severidad: 'mayor',
    mecanismo: 'Omeprazol inhibe CYP2C19 (vía necesaria para activar Clopidogrel que es prodroga).',
    efecto_clinico: 'Falla antiagregante, infarto recurrente, trombosis de stent.',
    manejo: 'Cambiar a Pantoprazol o rotar clopidogrel a prasugrel/ticagrelor.' },
  { farmacos: ['rivaroxaban', 'ketoconazol'], severidad: 'mayor',
    mecanismo: 'Ketoconazol inhibe potentemente CYP3A4 y P-gp.',
    efecto_clinico: 'Aumento severo exposición a rivaroxabán, sangrado mayor.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['apixaban', 'ketoconazol'], severidad: 'mayor',
    mecanismo: 'Ketoconazol inhibe CYP3A4 y P-gp.',
    efecto_clinico: 'Aumento de niveles apixabán.',
    manejo: 'Reducir dosis apixabán a 2.5mg c/12h o evitar.' },
  { farmacos: ['dabigatran', 'verapamilo'], severidad: 'mayor',
    mecanismo: 'Verapamilo inhibe P-gp (dabigatrán es sustrato).',
    efecto_clinico: 'Aumento significativo de niveles de dabigatrán, hemorragia.',
    manejo: 'Dar dabigatrán 2h antes de verapamilo. Ajustar dosis en falla renal.' },
  { farmacos: ['dabigatran', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Amiodarona inhibe P-gp.',
    efecto_clinico: 'Aumento de niveles plasmáticos de dabigatrán.',
    manejo: 'Vigilar sangrado. En falla renal moderada, considerar reducir dabigatrán.' },
  { farmacos: ['rivaroxaban', 'rifampicina'], severidad: 'mayor',
    mecanismo: 'Rifampicina induce fuertemente CYP3A4 y P-gp.',
    efecto_clinico: 'Falla terapéutica del DOAC. Riesgo severo de ACV/TEP.',
    manejo: 'Evitar combinación. Rotar a heparina o warfarina.' },
  { farmacos: ['apixaban', 'rifampicina'], severidad: 'mayor',
    mecanismo: 'Inducción CYP3A4/P-gp.',
    efecto_clinico: 'Pérdida eficacia anticoagulante.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['verapamilo', 'bisoprolol'], severidad: 'mayor',
    mecanismo: 'Efecto inotrópico y dromotrópico negativo aditivo/sinérgico.',
    efecto_clinico: 'Bradicardia severa, BAV completo, shock cardiogénico.',
    manejo: 'Evitar uso concomitante. En casos refractarios, extremar vigilancia en unidad cerrada.' },
  { farmacos: ['diltiazem', 'bisoprolol'], severidad: 'mayor',
    mecanismo: 'Sinergismo negativo sobre nodo AV.',
    efecto_clinico: 'Bradicardia profunda, bloqueo AV.',
    manejo: 'Evitar. Si es inevitable, titular dosis bajas con ECG diario.' },
  { farmacos: ['verapamilo', 'atenolol'], severidad: 'mayor',
    mecanismo: 'Sinergismo negativo AV.',
    efecto_clinico: 'Falla de bomba, bloqueo completo.',
    manejo: 'Evitar.' },
  { farmacos: ['diltiazem', 'atenolol'], severidad: 'mayor',
    mecanismo: 'Sinergismo negativo AV.',
    efecto_clinico: 'Bradicardia profunda.',
    manejo: 'Evitar.' },
  { farmacos: ['aspirina', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Ibuprofeno bloquea por impedimento estérico el sitio de acetilación de AAS en COX-1.',
    efecto_clinico: 'AAS pierde su efecto cardioprotector antiplaquetario sostenido.',
    manejo: 'Dar AAS 2h antes u 8h después del ibuprofeno. Ideal: rotar AINE a paracetamol o coxib.' },
  { farmacos: ['espironolactona', 'enalapril'], severidad: 'mayor',
    mecanismo: 'Bloqueo dual del eje SRAA, retención sinérgica de potasio.',
    efecto_clinico: 'Riesgo alto de hiperpotasemia (arritmias letales), sobre todo en ERC o ancianos.',
    manejo: 'Vigilar K+ y Creatinina basal, a la 1 semana, y mensual. Suspender si K > 5.5 mEq/L.' },
  { farmacos: ['espironolactona', 'losartan'], severidad: 'mayor',
    mecanismo: 'Bloqueo dual del eje SRAA.',
    efecto_clinico: 'Hiperpotasemia.',
    manejo: 'Vigilancia estrecha de ionograma.' },
  { farmacos: ['sacubitril_valsartan', 'espironolactona'], severidad: 'mayor',
    mecanismo: 'Efecto ahorrador de K+ masivo.',
    efecto_clinico: 'Hiperpotasemia severa.',
    manejo: 'Monitorización frecuente de función renal y potasio sérico.' },
  { farmacos: ['litio', 'furosemida'], severidad: 'mayor',
    mecanismo: 'Depleción de Na+ sensa a nivel renal y aumenta reabsorción compensatoria de litio.',
    efecto_clinico: 'Toxicidad severa por litio (confusión, ataxia, falla renal, arritmias).',
    manejo: 'Evitar o reducir dosis de litio al 50%. Monitoreo estricto de litemia.' },
  { farmacos: ['litio', 'tiazidas'], severidad: 'mayor',
    mecanismo: 'Depleción de Na+ en túbulo contorneado distal provoca reabsorción masiva de litio proximal.',
    efecto_clinico: 'Toxicidad aguda grave por litio.',
    manejo: 'Combinación totalmente contraindicada en la práctica.' },
  { farmacos: ['litio', 'enalapril'], severidad: 'mayor',
    mecanismo: 'Caída de FG y alteración del manejo de Na+ a nivel tubular.',
    efecto_clinico: 'Aumento impredecible de niveles de litio, toxicidad.',
    manejo: 'Monitorizar litemia intensivamente al introducir o titular IECA.' },
  { farmacos: ['litio', 'losartan'], severidad: 'mayor',
    mecanismo: 'Mecanismo análogo a los IECA.',
    efecto_clinico: 'Toxicidad por litio.',
    manejo: 'Litemia seriada.' },
  { farmacos: ['litio', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'AINEs reducen filtrado glomerular por vasoconstricción aferente.',
    efecto_clinico: 'Disminuye excreción de litio un 20-40%. Toxicidad clínica evidente.',
    manejo: 'Evitar AINEs en pacientes con litio.' },
  { farmacos: ['ciprofloxacina', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Prolongación aditiva intervalo QT.',
    efecto_clinico: 'Riesgo inminente de Torsades de Pointes y fibrilación ventricular.',
    manejo: 'Evitar fluoroquinolonas si el paciente recibe amiodarona.' },
  { farmacos: ['claritromicina', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Prolongación QT por ambas drogas + claritromicina inhibe metabolismo de amiodarona.',
    efecto_clinico: 'Torsades de Pointes, toxicidad sistémica por amiodarona.',
    manejo: 'Evitar combinación. Elegir antibiótico seguro (ej. betalactámico).' },
  { farmacos: ['sotalol', 'ciprofloxacina'], severidad: 'mayor',
    mecanismo: 'Prolongación QT aditiva.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['sotalol', 'claritromicina'], severidad: 'mayor',
    mecanismo: 'Prolongación QT aditiva profunda.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar.' },
  { farmacos: ['fluoxetina', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Prolongación QT aditiva. Fluoxetina inhibe CYP2D6/3A4.',
    efecto_clinico: 'Arritmias ventriculares, neurotoxicidad.',
    manejo: 'Precaución extrema, ECG seriado. Considerar antidepresivo más seguro (sertralina).' },
  { farmacos: ['citalopram', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Citalopram es un prolongador de QT dosis-dependiente fuerte dentro de los ISRS.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar si es posible, máximo citalopram 20mg en añosos.' },
  { farmacos: ['ibuprofeno', 'enalapril'], severidad: 'mayor',
    mecanismo: 'AINE constriñe arteriola aferente (corta PG), IECA dilata eferente (corta ATII).',
    efecto_clinico: 'Caída de presión de perfusión glomerular -> Falla Renal Aguda.',
    manejo: 'Triple Whammy si se suma diurético. Evitar AINEs sistémicos, vigilar creatinina.' },
  { farmacos: ['ibuprofeno', 'losartan'], severidad: 'mayor',
    mecanismo: 'Compromiso hemodinámico glomerular (análogo a IECA).',
    efecto_clinico: 'Falla renal aguda, retención de volumen.',
    manejo: 'Vigilar función renal.' },
  { farmacos: ['ibuprofeno', 'furosemida'], severidad: 'mayor',
    mecanismo: 'AINEs inhiben síntesis de prostaglandinas renales, mitigando efecto natriurético.',
    efecto_clinico: 'Falla diurética, retención hídrica severa, descompensación de Insuficiencia Cardíaca.',
    manejo: 'Contraindicado relativo AINE en ICC descompensada.' },
  { farmacos: ['warfarina', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Disfunción plaquetaria por AINE + daño mucosa gástrica + anticoagulación sistémica.',
    efecto_clinico: 'Riesgo masivo de Hemorragia Digestiva Alta.',
    manejo: 'Evitar AINE. Si analgésico es necesario usar paracetamol.' },
  { farmacos: ['rivaroxaban', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Sinergismo de riesgo hemorrágico.',
    efecto_clinico: 'Sangrado mayor (GI, cerebral).',
    manejo: 'Evitar. Uso concurrente desaconsejado fuertemente.' },
  { farmacos: ['apixaban', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Sinergismo hemorrágico.',
    efecto_clinico: 'Sangrado mayor.',
    manejo: 'Evitar.' },
  { farmacos: ['clopidogrel', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Suma de disfunción plaquetaria y toxicidad GI directa.',
    efecto_clinico: 'Sangrado gastrointestinal profuso.',
    manejo: 'Si se combinan, es obligatorio cobertura con IBP (ej. pantoprazol) y cursos muy cortos.' },
  { farmacos: ['tamsulosina', 'carvedilol'], severidad: 'mayor',
    mecanismo: 'Tamsulosina (alfa bloqueante) + Betabloqueante con efecto alfa (Carvedilol).',
    efecto_clinico: 'Vasodilatación extrema, hipotensión ortostática severa, síncope, caídas en ancianos.',
    manejo: 'Titulación extremadamente lenta. Tomar tamsulosina de noche. Advertir al paciente sobre cambios de postura.' },
  { farmacos: ['tamsulosina', 'amlodipina'], severidad: 'mayor',
    mecanismo: 'Bloqueo alfa 1 urotelial/vascular + Bloqueo cálcico vascular.',
    efecto_clinico: 'Hipotensión ortostática y síncope en ancianos.',
    manejo: 'Monitorear PA de pie y decúbito.' },
  { farmacos: ['dapagliflozina', 'furosemida'], severidad: 'mayor',
    mecanismo: 'Diuresis osmótica por glucosuria + inhibición NKCC2 en asa de Henle.',
    efecto_clinico: 'Depleción severa de volumen intravascular, hipotensión, falla renal prerrenal.',
    manejo: 'Al iniciar iSGLT2, evaluar reducir dosis de diuréticos de asa empíricamente.' },
  { farmacos: ['sulfonilureas', 'carvedilol'], severidad: 'mayor',
    mecanismo: 'Betabloqueantes enmascaran taquicardia y temblor (síntomas de hipoglucemia).',
    efecto_clinico: 'Hipoglucemias severas silenciosas, daño neurológico inadvertido.',
    manejo: 'Educar al paciente sobre la sudoración (no bloqueada por BB). Monitorizar glucemias capilares.' },
  { farmacos: ['corticoides', 'furosemida'], severidad: 'mayor',
    mecanismo: 'Pérdida renal de potasio sinérgica.',
    efecto_clinico: 'Hipopotasemia profunda (arritmias, debilidad muscular).',
    manejo: 'Monitoreo frecuente de ionograma, suplementar K+ si necesario.' },
  { farmacos: ['tramadol', 'fluoxetina'], severidad: 'mayor',
    mecanismo: 'Tramadol (inhibe recaptación serotonina) + ISRS. Además ISRS inhibe CYP2D6 evitando paso a metabolito analgésico de tramadol.',
    efecto_clinico: 'Riesgo de Síndrome Serotoninérgico. Disminución de eficacia analgésica.',
    manejo: 'Evitar combinación. Riesgo de convulsiones y crisis hipertensivas.' },
  { farmacos: ['donepezilo', 'bisoprolol'], severidad: 'mayor',
    mecanismo: 'Sinergismo parasimpaticomimético (bradicardizante) y betabloqueo simpático.',
    efecto_clinico: 'Bradicardia extrema, síncope asintomático, caídas repetidas en geriatría.',
    manejo: 'Monitoreo ECG. Cuestionar indicación de I-AChE si requiere altas dosis de betabloqueante.' },
  { farmacos: ['alopurinol', 'enalapril'], severidad: 'mayor',
    mecanismo: 'Mecanismo inmunológico / alteración depuración cruzada no del todo clara.',
    efecto_clinico: 'Aumenta riesgo de Síndrome de Stevens-Johnson o hipersensibilidad severa al alopurinol.',
    manejo: 'En pacientes con insuficiencia renal usar con extrema precaución. Educar sobre rash cutáneo.' },
  { farmacos: ['alopurinol', 'tiazidas'], severidad: 'mayor',
    mecanismo: 'Tiazidas retienen ácido úrico (contrarrestando efecto) y reducen clearance de alopurinol.',
    efecto_clinico: 'Gota refractaria y mayor riesgo de toxicidad cutánea severa por alopurinol.',
    manejo: 'Ajustar dosis de alopurinol si la función renal cae. Vigilar rash.' },

  /* 🟡 INTERACCIONES MODERADAS */
  { farmacos: ['amiodarona', 'bisoprolol'], severidad: 'moderado',
    mecanismo: 'Efecto depresor aditivo nódulo sinusal y AV.',
    efecto_clinico: 'Riesgo de bradicardia excesiva.',
    manejo: 'Monitorear FC y ECG periódicamente.' },
  { farmacos: ['amiodarona', 'carvedilol'], severidad: 'moderado',
    mecanismo: 'Sinergia bradicardizante.',
    efecto_clinico: 'Riesgo bradicardia.',
    manejo: 'Monitorear FC y ECG.' },
  { farmacos: ['digoxina', 'verapamilo'], severidad: 'moderado',
    mecanismo: 'Verapamilo inhibe P-gp aumentando digoxinemia y suma efecto bradicardizante.',
    efecto_clinico: 'Bradicardia y posible toxicidad digitálica.',
    manejo: 'Reducir digoxina y vigilar.' },
  { farmacos: ['digoxina', 'diltiazem'], severidad: 'moderado',
    mecanismo: 'Diltiazem inhibe P-gp aumentando digoxinemia.',
    efecto_clinico: 'Toxicidad digitálica y bradicardia.',
    manejo: 'Vigilar niveles.' },
  { farmacos: ['amiodarona', 'atorvastatina'], severidad: 'moderado',
    mecanismo: 'Inhibición leve/moderada CYP3A4.',
    efecto_clinico: 'Aumento estatinemia, riesgo miopatía.',
    manejo: 'Dosis máx recomendada de atorvastatina es 20mg (algunas guías 40mg) si se usa con amiodarona.' },
  { farmacos: ['clopidogrel', 'pantoprazol'], severidad: 'moderado',
    mecanismo: 'Inhibición CYP2C19 mucho menor que el omeprazol.',
    efecto_clinico: 'Impacto clínico incierto, generalmente menor.',
    manejo: 'Si IBP está indicado para proteger GI, Pantoprazol es el de elección junto con clopidogrel.' },
  { farmacos: ['furosemida', 'enalapril'], severidad: 'moderado',
    mecanismo: 'Depleción de volumen intravascular + vasodilatación arteriolar eferente abrupta.',
    efecto_clinico: 'Hipotensión severa de primera dosis y deterioro inicial del filtrado glomerular.',
    manejo: 'Iniciar IECA en dosis baja al anochecer. Suspender transitoriamente la furosemida 24h antes si es posible.' },
  { farmacos: ['aspirina', 'enalapril'], severidad: 'moderado',
    mecanismo: 'Altas dosis de AAS inhiben vasodilatación renal mediada por bradicininas/prostaglandinas.',
    efecto_clinico: 'Atenuación del beneficio hemodinámico y de sobrevida del IECA en insuficiencia cardíaca.',
    manejo: 'Usar dosis bajas de AAS (75-100 mg/día) donde el efecto sistémico es mínimo.' },
  { farmacos: ['clopidogrel', 'fluoxetina'], severidad: 'moderado',
    mecanismo: 'Fluoxetina inhibe CYP2C19 (y 2D6).',
    efecto_clinico: 'Disminución de formación del metabolito activo del clopidogrel.',
    manejo: 'Vigilar respuesta clínica o considerar rotar de ISRS (ej. a escitalopram).' },
  { farmacos: ['digoxina', 'espironolactona'], severidad: 'moderado',
    mecanismo: 'Reducción excreción tubular de digoxina e interferencia en ensayos de laboratorio antiguos.',
    efecto_clinico: 'Aumento de digoxinemia (+25%).',
    manejo: 'Monitoreo de niveles. Suele ser bien tolerado si el K+ se mantiene normal-alto (el K+ alto protege contra arritmias por digoxina).' },
  { farmacos: ['levotiroxina', 'amiodarona'], severidad: 'moderado',
    mecanismo: 'Amiodarona contiene Iodo (puede causar hipo/hipertiroidismo) e inhibe conversión periférica de T4 a T3.',
    efecto_clinico: 'Alteraciones complejas del perfil tiroideo. Aumento de TSH transitorio.',
    manejo: 'Medir TSH basal y luego c/6 meses. No suspender amiodarona de inmediato; interconsultar Endocrinología.' },
  { farmacos: ['metformina', 'furosemida'], severidad: 'moderado',
    mecanismo: 'Diuréticos pueden causar falla renal prerrenal, metformina se acumula.',
    efecto_clinico: 'Riesgo indirecto de acidosis láctica.',
    manejo: 'Vigilar volemia y función renal en pacientes geriátricos diabéticos.' }
];

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
  
  // Ordenar: Contraindicado -> Mayor -> Moderado -> Menor
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
