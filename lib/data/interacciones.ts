/**
 * Base de Datos Offline de Interacciones Farmacológicas en Cardiología.
 * 
 * Fuentes de referencia:
 * - Guías ACC/AHA y ESC
 * - Lexicomp / UpToDate / Epocrates / Medscape
 * - FDA / EMA Prescribing Information
 * 
 * Enfocado en las interacciones Contraindicadas, Mayores y Moderadas críticas.
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
  // Antiarrítmicos
  { id: 'amiodarona', nombre: 'Amiodarona', grupo: 'Antiarrítmicos' },
  { id: 'digoxina', nombre: 'Digoxina', grupo: 'Antiarrítmicos' },
  { id: 'sotalol', nombre: 'Sotalol', grupo: 'Antiarrítmicos' },
  { id: 'flecainida', nombre: 'Flecainida', grupo: 'Antiarrítmicos' },
  { id: 'propafenona', nombre: 'Propafenona', grupo: 'Antiarrítmicos' },
  { id: 'dronedarona', nombre: 'Dronedarona', grupo: 'Antiarrítmicos' },
  
  // Anticoagulantes
  { id: 'warfarina', nombre: 'Warfarina', grupo: 'Anticoagulantes' },
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
  
  // Inhibidores / Inductores Enzimáticos y Otros no CV
  { id: 'sildenafil', nombre: 'Sildenafil / Tadalafilo', grupo: 'Inh. PDE-5' },
  { id: 'claritromicina', nombre: 'Claritromicina', grupo: 'Macrólidos' },
  { id: 'azitromicina', nombre: 'Azitromicina', grupo: 'Macrólidos' },
  { id: 'ketoconazol', nombre: 'Ketoconazol / Itraconazol', grupo: 'Antimicóticos Azoles' },
  { id: 'fluconazol', nombre: 'Fluconazol', grupo: 'Antimicóticos Azoles' },
  { id: 'rifampicina', nombre: 'Rifampicina', grupo: 'Inductores Enzimáticos' },
  { id: 'carbamazepina', nombre: 'Carbamazepina / Fenitoína', grupo: 'Inductores Enzimáticos' },
  { id: 'omeprazol', nombre: 'Omeprazol / Esomeprazol', grupo: 'IBP' },
  { id: 'pantoprazol', nombre: 'Pantoprazol', grupo: 'IBP' },
  { id: 'ibuprofeno', nombre: 'Ibuprofeno / Naproxeno / Diclofenac', grupo: 'AINEs' },
  { id: 'fluoxetina', nombre: 'Fluoxetina / Paroxetina', grupo: 'ISRS' },
  { id: 'citalopram', nombre: 'Citalopram / Escitalopram', grupo: 'ISRS' },
  { id: 'ciprofloxacina', nombre: 'Ciprofloxacina / Levofloxacina', grupo: 'Fluoroquinolonas' },
  { id: 'litio', nombre: 'Litio', grupo: 'Estabilizadores del Ánimo' },
];

export const INTERACCIONES: InteraccionFarmacos[] = [
  /* 🔴 CONTRAINDICACIONES ABSOLUTAS */
  { farmacos: ['sildenafil', 'nitratos'], severidad: 'contraindicado',
    mecanismo: 'Sinergismo sobre vía óxido nítrico / GMPc.',
    efecto_clinico: 'Hipotensión profunda refractaria, isquemia, síncope.',
    manejo: 'Evitar nitratos x 24h post-sildenafil y x 48h post-tadalafilo.' },
  { farmacos: ['sacubitril_valsartan', 'enalapril'], severidad: 'contraindicado',
    mecanismo: 'Inhibición dual ECA y neprilisina.',
    efecto_clinico: 'Aumento severo de bradicininas, altísimo riesgo de angioedema fatal.',
    manejo: 'Lavado estricto (washout) de 36h al cambiar de IECA a ARNI.' },
  { farmacos: ['colchicina', 'claritromicina'], severidad: 'contraindicado',
    mecanismo: 'Claritromicina inhibe potentemente P-gp y CYP3A4.',
    efecto_clinico: 'Toxicidad fatal por colchicina (miopatía, neuropatía, pancitopenia).',
    manejo: 'Evitar combinación. Contraindicación absoluta en enfermedad renal/hepática.' },
  { farmacos: ['colchicina', 'ketoconazol'], severidad: 'contraindicado',
    mecanismo: 'Inhibición potente P-gp y CYP3A4.',
    efecto_clinico: 'Toxicidad por colchicina potencialmente fatal.',
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
    mecanismo: 'Inhibición CYP3A4.',
    efecto_clinico: 'Aumento severo de simvastatina. Rabdomiólisis.',
    manejo: 'Suspender estatina durante tto antibiótico.' },
  { farmacos: ['simvastatina', 'ketoconazol'], severidad: 'contraindicado',
    mecanismo: 'Inhibición CYP3A4.',
    efecto_clinico: 'Riesgo alto de rabdomiólisis.',
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
    efecto_clinico: 'Aumento de niveles de rosuvastatina, rabdomiólisis.',
    manejo: 'Evitar combinación. Preferir fenofibrato si es necesario.' },
  { farmacos: ['dronedarona', 'amiodarona'], severidad: 'contraindicado',
    mecanismo: 'Duplicación terapéutica y prolongación QT.',
    efecto_clinico: 'Toxicidad, Torsades de Pointes.',
    manejo: 'No combinar jamás.' },
  { farmacos: ['dronedarona', 'digoxina'], severidad: 'contraindicado', // O mayor extremo
    mecanismo: 'Dronedarona inhibe P-gp.',
    efecto_clinico: 'Aumento masivo de digoxinemia (hasta 2.5x).',
    manejo: 'Contraindicado por algunas guías, o reducir digoxina 50% con monitoreo diario.' },

  /* 🟠 INTERACCIONES MAYORES */
  { farmacos: ['amiodarona', 'warfarina'], severidad: 'mayor',
    mecanismo: 'Amiodarona inhibe CYP2C9, reduciendo depuración de warfarina.',
    efecto_clinico: 'Aumento severo del RIN y sangrado.',
    manejo: 'Reducir warfarina 30-50% al iniciar amiodarona. Monitorear RIN c/3-5 días.' },
  { farmacos: ['amiodarona', 'acenocumarol'], severidad: 'mayor',
    mecanismo: 'Inhibición CYP2C9.',
    efecto_clinico: 'Aumento de RIN.',
    manejo: 'Reducir acenocumarol 30-50% y monitorear.' },
  { farmacos: ['amiodarona', 'digoxina'], severidad: 'mayor',
    mecanismo: 'Inhibición P-glicoproteína.',
    efecto_clinico: 'Digoxinemia aumenta 70-100%, toxicidad digitálica.',
    manejo: 'Reducir digoxina al 50%. Vigilar ECG y digoxinemia.' },
  { farmacos: ['amiodarona', 'simvastatina'], severidad: 'mayor',
    mecanismo: 'Inhibición CYP3A4.',
    efecto_clinico: 'Riesgo de miopatía/rabdomiólisis.',
    manejo: 'Dosis máxima simvastatina 20mg/día. Considerar rosuvastatina.' },
  { farmacos: ['clopidogrel', 'omeprazol'], severidad: 'mayor',
    mecanismo: 'Omeprazol inhibe CYP2C19 (Clopidogrel es prodroga).',
    efecto_clinico: 'Falla antiagregante, trombosis de stent.',
    manejo: 'Cambiar a Pantoprazol o rotar clopidogrel a prasugrel/ticagrelor.' },
  { farmacos: ['rivaroxaban', 'ketoconazol'], severidad: 'mayor',
    mecanismo: 'Ketoconazol inhibe CYP3A4 y P-gp.',
    efecto_clinico: 'Aumento severo exposición a rivaroxabán.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['apixaban', 'ketoconazol'], severidad: 'mayor',
    mecanismo: 'Ketoconazol inhibe CYP3A4 y P-gp.',
    efecto_clinico: 'Aumento de niveles apixabán.',
    manejo: 'Reducir dosis apixabán a 2.5mg c/12h o evitar.' },
  { farmacos: ['dabigatran', 'verapamilo'], severidad: 'mayor',
    mecanismo: 'Verapamilo inhibe P-gp (dabigatrán es sustrato).',
    efecto_clinico: 'Aumento significativo de niveles de dabigatrán, sangrado.',
    manejo: 'Dar dabigatrán 2h antes de verapamilo. Ajustar dosis en falla renal.' },
  { farmacos: ['dabigatran', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Amiodarona inhibe P-gp.',
    efecto_clinico: 'Aumento de dabigatrán.',
    manejo: 'Vigilar sangrado. En falla renal moderada, considerar reducir dabigatrán.' },
  { farmacos: ['rivaroxaban', 'rifampicina'], severidad: 'mayor',
    mecanismo: 'Rifampicina induce fuertemente CYP3A4 y P-gp.',
    efecto_clinico: 'Falla terapéutica del DOAC. Riesgo de ACV/TEP.',
    manejo: 'Evitar combinación. Rotar a HBPM o warfarina.' },
  { farmacos: ['apixaban', 'rifampicina'], severidad: 'mayor',
    mecanismo: 'Inducción CYP3A4/P-gp.',
    efecto_clinico: 'Pérdida eficacia anticoagulante.',
    manejo: 'Evitar.' },
  { farmacos: ['verapamilo', 'bisoprolol'], severidad: 'mayor',
    mecanismo: 'Efecto inotrópico y dromotrópico negativo sinérgico.',
    efecto_clinico: 'Bradicardia severa, BAV completo, shock cardiogénico.',
    manejo: 'Evitar uso concomitante. En casos refractarios, extremar vigilancia.' },
  { farmacos: ['diltiazem', 'bisoprolol'], severidad: 'mayor',
    mecanismo: 'Efecto inotrópico y dromotrópico negativo sinérgico.',
    efecto_clinico: 'Bradicardia severa, bloqueo AV.',
    manejo: 'Evitar. Si es inevitable, titular dosis bajas con ECG frecuente.' },
  { farmacos: ['verapamilo', 'atenolol'], severidad: 'mayor',
    mecanismo: 'Sinergismo negativo AV.',
    efecto_clinico: 'Bradicardia profunda.',
    manejo: 'Evitar.' },
  { farmacos: ['diltiazem', 'atenolol'], severidad: 'mayor',
    mecanismo: 'Sinergismo negativo AV.',
    efecto_clinico: 'Bradicardia profunda.',
    manejo: 'Evitar.' },
  { farmacos: ['aspirina', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Ibuprofeno bloquea sitio unión de AAS en COX-1.',
    efecto_clinico: 'AAS pierde efecto cardioprotector antiplaquetario.',
    manejo: 'Dar AAS 2h antes u 8h después del ibuprofeno. Preferir otro analgésico.' },
  { farmacos: ['espironolactona', 'enalapril'], severidad: 'mayor',
    mecanismo: 'Retención sinérgica de potasio.',
    efecto_clinico: 'Riesgo alto hiperpotasemia (arritmias letales), sobre todo en ERC.',
    manejo: 'Vigilar K+ y Creatinina basal, 1 semana, y mensual. Evitar si K > 5 mEq/L.' },
  { farmacos: ['espironolactona', 'losartan'], severidad: 'mayor',
    mecanismo: 'Retención sinérgica de potasio.',
    efecto_clinico: 'Hiperpotasemia.',
    manejo: 'Vigilancia estrecha de ionograma.' },
  { farmacos: ['sacubitril_valsartan', 'espironolactona'], severidad: 'mayor',
    mecanismo: 'Efecto ahorrador de K+.',
    efecto_clinico: 'Hiperpotasemia.',
    manejo: 'Monitorizar K+.' },
  { farmacos: ['litio', 'furosemida'], severidad: 'mayor',
    mecanismo: 'Depleción de Na+ aumenta reabsorción de litio.',
    efecto_clinico: 'Toxicidad severa por litio (neurotoxicidad, falla renal).',
    manejo: 'Evitar o reducir litio 50%. Litemia estricta.' },
  { farmacos: ['litio', 'tiazidas'], severidad: 'mayor',
    mecanismo: 'Depleción Na+ proximal, reabsorción masiva litio.',
    efecto_clinico: 'Toxicidad severa por litio.',
    manejo: 'Contraindicación relativa alta. Usar diurético de asa si es imperioso, tiazidas prohibidas en general.' },
  { farmacos: ['litio', 'enalapril'], severidad: 'mayor',
    mecanismo: 'Reducción FG y alteración manejo Na+.',
    efecto_clinico: 'Toxicidad por litio.',
    manejo: 'Monitorizar litemia al introducir IECA.' },
  { farmacos: ['litio', 'losartan'], severidad: 'mayor',
    mecanismo: 'Igual a IECA.',
    efecto_clinico: 'Toxicidad por litio.',
    manejo: 'Litemia seriada.' },
  { farmacos: ['ciprofloxacina', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Prolongación aditiva intervalo QT.',
    efecto_clinico: 'Riesgo alto de Torsades de Pointes.',
    manejo: 'Evitar quinolonas en pacientes con amiodarona.' },
  { farmacos: ['claritromicina', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Prolongación QT y claritromicina inhibe metabolismo amiodarona.',
    efecto_clinico: 'Torsades de Pointes, toxicidad por amiodarona.',
    manejo: 'Evitar combinación.' },
  { farmacos: ['sotalol', 'ciprofloxacina'], severidad: 'mayor',
    mecanismo: 'Prolongación QT aditiva.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar.' },
  { farmacos: ['sotalol', 'claritromicina'], severidad: 'mayor',
    mecanismo: 'Prolongación QT aditiva.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar.' },
  { farmacos: ['fluoxetina', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Prolongación QT aditiva. Fluoxetina inhibe CYP2D6/3A4.',
    efecto_clinico: 'Torsades de Pointes, toxicidad.',
    manejo: 'Precaución extrema, ECG seriado.' },
  { farmacos: ['citalopram', 'amiodarona'], severidad: 'mayor',
    mecanismo: 'Citalopram es conocido prolongador QT dosis-dependiente.',
    efecto_clinico: 'Torsades de Pointes.',
    manejo: 'Evitar si es posible, máximo citalopram 20mg.' },
  { farmacos: ['ibuprofeno', 'enalapril'], severidad: 'mayor',
    mecanismo: 'AINEs constriñen arteriola aferente, IECA dilatan eferente.',
    efecto_clinico: 'Caída abrupta del FG, Falla Renal Aguda.',
    manejo: 'Evitar AINEs sistémicos continuos en ptes con IECA/ARAII, vigilar Cr.' },
  { farmacos: ['ibuprofeno', 'losartan'], severidad: 'mayor',
    mecanismo: 'Falla renal por compromiso hemodinámico glomerular.',
    efecto_clinico: 'Falla renal aguda.',
    manejo: 'Vigilar función renal.' },
  { farmacos: ['ibuprofeno', 'furosemida'], severidad: 'mayor',
    mecanismo: 'AINEs reducen síntesis prostaglandinas, mitigando efecto diurético.',
    efecto_clinico: 'Falla diurética, empeoramiento Insuficiencia Cardíaca.',
    manejo: 'Evitar AINEs en ICC descompensada.' },
  { farmacos: ['warfarina', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Inhibición plaquetaria por AINEs + daño mucosa + anticoagulación.',
    efecto_clinico: 'Riesgo masivo de sangrado gastrointestinal.',
    manejo: 'Evitar. Si analgésico es necesario usar paracetamol.' },
  { farmacos: ['rivaroxaban', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Doble riesgo de sangrado (anticoagulación + disfunción plaquetaria AINE).',
    efecto_clinico: 'Hemorragia digestiva.',
    manejo: 'Evitar.' },
  { farmacos: ['apixaban', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Doble riesgo sangrado.',
    efecto_clinico: 'Hemorragia digestiva.',
    manejo: 'Evitar.' },
  { farmacos: ['dabigatran', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Doble riesgo sangrado.',
    efecto_clinico: 'Hemorragia digestiva.',
    manejo: 'Evitar.' },
  { farmacos: ['clopidogrel', 'ibuprofeno'], severidad: 'mayor',
    mecanismo: 'Toxicidad GI y doble disfunción plaquetaria.',
    efecto_clinico: 'Sangrado GI.',
    manejo: 'Evitar AINEs. Dar IBP si se combinan por urgencia.' },

  /* 🟡 INTERACCIONES MODERADAS */
  { farmacos: ['amiodarona', 'bisoprolol'], severidad: 'moderado',
    mecanismo: 'Efecto depresor aditivo nódulo sinusal y AV.',
    efecto_clinico: 'Riesgo bradicardia.',
    manejo: 'Monitorear FC y ECG.' },
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
    mecanismo: 'Inhibición leve CYP3A4.',
    efecto_clinico: 'Aumento estatinemia, riesgo miopatía.',
    manejo: 'No superar 20-40mg atorvastatina.' },
  { farmacos: ['clopidogrel', 'pantoprazol'], severidad: 'moderado',
    mecanismo: 'Inhibición CYP2C19 mucho menor que omeprazol.',
    efecto_clinico: 'Mínimo impacto clínico.',
    manejo: 'Combinación aceptable si IBP es indicado, aunque se prefiere separarlos.' },
  { farmacos: ['furosemida', 'enalapril'], severidad: 'moderado',
    mecanismo: 'Depleción de volumen + vasodilatación eferente.',
    efecto_clinico: 'Hipotensión primera dosis y caída inicial FG.',
    manejo: 'Iniciar IECA en dosis baja si paciente está depletado.' },
  { farmacos: ['aspirina', 'enalapril'], severidad: 'moderado',
    mecanismo: 'Altas dosis AAS (>300mg) bloquean vasodilatación inducida por bradicininas.',
    efecto_clinico: 'Atenuación beneficio hemodinámico IECA.',
    manejo: 'Usar dosis bajas AAS (75-100mg).' },
  { farmacos: ['clopidogrel', 'fluoxetina'], severidad: 'moderado',
    mecanismo: 'Fluoxetina inhibe CYP2C19.',
    efecto_clinico: 'Disminución metabolito activo clopidogrel.',
    manejo: 'Vigilar o rotar ISRS (ej. citalopram).' },
  { farmacos: ['digoxina', 'espironolactona'], severidad: 'moderado',
    mecanismo: 'Reducción excreción digoxina.',
    efecto_clinico: 'Ligero aumento digoxinemia.',
    manejo: 'Monitoreo de niveles.' },
];

export function getInteractionsForSelection(farmacosIds: string[]): InteraccionFarmacos[] {
  const result: InteraccionFarmacos[] = [];
  
  for (const interaccion of INTERACCIONES) {
    const fA = interaccion.farmacos[0];
    const fB = interaccion.farmacos[1];
    
    if (farmacosIds.includes(fA) && farmacosIds.includes(fB)) {
      result.push(interaccion);
    }
  }
  
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
