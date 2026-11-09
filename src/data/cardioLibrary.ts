export interface DiagnosisItem {
  id: string;
  name: string;
  category: string;
  isUrgent?: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  category: string;
  commonDose?: string;
  dosePresets?: string[];
  isInfusion?: boolean;
}

export interface AntecedentItem {
  id: string;
  name: string;
  shortName: string;
  category: string;
  color?: string;
}

export interface AntecedentCategory {
  category: string;
  icon: string;
  items: AntecedentItem[];
}

export interface DiagnosisCategory {
  category: string;
  icon: string;
  items: DiagnosisItem[];
}

export interface MedicationCategory {
  category: string;
  icon: string;
  items: MedicationItem[];
}

export const CARDIOLOGY_DIAGNOSES: DiagnosisCategory[] = [
  {
    category: 'Síndromes Coronarios Agudos & Isquemia',
    icon: '⚡',
    items: [
      { id: 'iam-cest-ant', name: 'IAMCEST Anteroseptal / Anterior extenso', category: 'Síndromes Coronarios Agudos & Isquemia', isUrgent: true },
      { id: 'iam-cest-inf', name: 'IAMCEST Inferior / Inferoposterior', category: 'Síndromes Coronarios Agudos & Isquemia', isUrgent: true },
      { id: 'iam-cest-vd', name: 'IAMCEST con compromiso de Ventrículo Derecho', category: 'Síndromes Coronarios Agudos & Isquemia', isUrgent: true },
      { id: 'iam-sest-ar', name: 'IAMSEST de Alto Riesgo (Troponinas + / Cambios dinámicos)', category: 'Síndromes Coronarios Agudos & Isquemia', isUrgent: true },
      { id: 'iam-sest-mr', name: 'IAMSEST de Riesgo Intermedio', category: 'Síndromes Coronarios Agudos & Isquemia' },
      { id: 'angina-inestable', name: 'Angina Inestable de Alto Riesgo / Progresiva', category: 'Síndromes Coronarios Agudos & Isquemia' },
      { id: 'pcr-recuperado', name: 'Paro Cardiorrespiratorio (PCR) recuperado de causa coronaria', category: 'Síndromes Coronarios Agudos & Isquemia', isUrgent: true },
      { id: 'minoca', name: 'MINOCA (Infarto sin lesiones coronarias obstructivas)', category: 'Síndromes Coronarios Agudos & Isquemia' },
      { id: 'scad', name: 'Disección Coronaria Espontánea (SCAD)', category: 'Síndromes Coronarios Agudos & Isquemia' },
      { id: 'angina-vasoespastica', name: 'Angina Vasoespástica (Prinzmetal)', category: 'Síndromes Coronarios Agudos & Isquemia' },
      { id: 'complicacion-mecanica', name: 'Complicación Mecánica del IAM (CIV, Rotura de músculo papilar, Pared libre)', category: 'Síndromes Coronarios Agudos & Isquemia', isUrgent: true }
    ]
  },
  {
    category: 'Insuficiencia Cardíaca & Shock',
    icon: '🫀',
    items: [
      { id: 'ic-descompensada-fevi-r', name: 'IC Aguda Descompensada con FEVI Reducida (ICFEr)', category: 'Insuficiencia Cardíaca & Shock' },
      { id: 'ic-descompensada-fevi-p', name: 'IC Aguda Descompensada con FEVI Preservada (ICFEp)', category: 'Insuficiencia Cardíaca & Shock' },
      { id: 'eap-hipertensivo', name: 'Edema Agudo de Pulmón (EAP) Hipertensivo', category: 'Insuficiencia Cardíaca & Shock', isUrgent: true },
      { id: 'eap-cardiogenico', name: 'Edema Agudo de Pulmón (EAP) Cardiogénico / Falla de bomba', category: 'Insuficiencia Cardíaca & Shock', isUrgent: true },
      { id: 'shock-cardiogenico', name: 'Shock Cardiogénico (Killip IV / SCA o Miocardiopatía)', category: 'Insuficiencia Cardíaca & Shock', isUrgent: true },
      { id: 'miocardiopatia-dilatada', name: 'Miocardiopatía Dilatada en fase congestiva avanzada', category: 'Insuficiencia Cardíaca & Shock' },
      { id: 'miocarditis-aguda', name: 'Miocarditis Aguda complicada / fulminante', category: 'Insuficiencia Cardíaca & Shock', isUrgent: true },
      { id: 'takotsubo', name: 'Síndrome de Takotsubo (Miocardiopatía por estrés)', category: 'Insuficiencia Cardíaca & Shock' },
      { id: 'ic-derecha-aguda', name: 'Falla Ventricular Derecha Aguda / Cor Pulmonale Agudo', category: 'Insuficiencia Cardíaca & Shock' }
    ]
  },
  {
    category: 'Arritmias & Trastornos de Conducción',
    icon: '📈',
    items: [
      { id: 'fa-rvr', name: 'Fibrilación Auricular (FA) con Alta Respuesta Ventricular', category: 'Arritmias & Trastornos de Conducción', isUrgent: true },
      { id: 'fa-reciente', name: 'Fibrilación Auricular de Reciente Comienzo para Cardioversión', category: 'Arritmias & Trastornos de Conducción' },
      { id: 'flutter-auricular', name: 'Flutter Auricular sintomático / Rápido', category: 'Arritmias & Trastornos de Conducción' },
      { id: 'bav-completo', name: 'Bloqueo AV Completo (3er grado) sintomático / síncope', category: 'Arritmias & Trastornos de Conducción', isUrgent: true },
      { id: 'bav-alto-grado', name: 'Bloqueo AV de 2do Grado Mobitz II / Alto Grado', category: 'Arritmias & Trastornos de Conducción', isUrgent: true },
      { id: 'enfermedad-nodulo-sinusal', name: 'Enfermedad del Nódulo Sinusal (Síndrome Bradi-Taqui)', category: 'Arritmias & Trastornos de Conducción' },
      { id: 'tv-sostenida', name: 'Taquicardia Ventricular Sostenida (con o sin pulso)', category: 'Arritmias & Trastornos de Conducción', isUrgent: true },
      { id: 'tormenta-arritmica', name: 'Tormenta Arrítmica / Múltiples choques de CDI', category: 'Arritmias & Trastornos de Conducción', isUrgent: true },
      { id: 'tpsv', name: 'Taquicardia Paroxística Supraventricular (TRN / Vía accesoria)', category: 'Arritmias & Trastornos de Conducción' },
      { id: 'wpw-sintomatico', name: 'Síndrome de Wolff-Parkinson-White sintomático', category: 'Arritmias & Trastornos de Conducción' },
      { id: 'qt-largo-torsades', name: 'Síndrome de QT Largo / Torsades de Pointes', category: 'Arritmias & Trastornos de Conducción', isUrgent: true },
      { id: 'sincope-cardiogenico', name: 'Síncope de Presunto Origen Cardiogénico en estudio', category: 'Arritmias & Trastornos de Conducción' }
    ]
  },
  {
    category: 'Valvulopatías & Endocarditis',
    icon: '🚪',
    items: [
      { id: 'ea-severa-sintomatica', name: 'Estenosis Aórtica Severa Sintomática (Síncope / Angor / Disnea)', category: 'Valvulopatías & Endocarditis' },
      { id: 'ia-aguda', name: 'Insuficiencia Aórtica Aguda Severa (Endocarditis / Disección)', category: 'Valvulopatías & Endocarditis', isUrgent: true },
      { id: 'im-aguda', name: 'Insuficiencia Mitral Aguda Severa (Isquémica / Rotura de cuerda)', category: 'Valvulopatías & Endocarditis', isUrgent: true },
      { id: 'em-severa', name: 'Estenosis Mitral Severa con congestión pulmonar', category: 'Valvulopatías & Endocarditis' },
      { id: 'endocarditis-nativa', name: 'Endocarditis Infecciosa de Válvula Nativa', category: 'Valvulopatías & Endocarditis' },
      { id: 'endocarditis-protesica', name: 'Endocarditis Infecciosa de Válvula Protésica', category: 'Valvulopatías & Endocarditis', isUrgent: true },
      { id: 'trombosis-protesis', name: 'Trombosis o Disfunción de Prótesis Valvular', category: 'Valvulopatías & Endocarditis', isUrgent: true }
    ]
  },
  {
    category: 'Aorta & Pericardio',
    icon: '🛡️',
    items: [
      { id: 'diseccion-aortica-a', name: 'Disección Aórtica Aguda Tipo A de Stanford', category: 'Aorta & Pericardio', isUrgent: true },
      { id: 'diseccion-aortica-b', name: 'Disección Aórtica Tipo B Complicada (Dolor refractario / Isquemia)', category: 'Aorta & Pericardio', isUrgent: true },
      { id: 'hematoma-intramural', name: 'Hematoma Intramural Aórtico / Úlcera Penetrante', category: 'Aorta & Pericardio' },
      { id: 'taponamiento-cardiaco', name: 'Taponamiento Cardíaco / Derrame pericárdico severo', category: 'Aorta & Pericardio', isUrgent: true },
      { id: 'pericarditis-aguda', name: 'Pericarditis Aguda con derrame pericárdico moderado', category: 'Aorta & Pericardio' },
      { id: 'pericarditis-constrictiva', name: 'Pericarditis Constrictiva en descompensación', category: 'Aorta & Pericardio' }
    ]
  },
  {
    category: 'Emergencias Hipertensivas & Vascular',
    icon: '🩺',
    items: [
      { id: 'emergencia-hta-organo', name: 'Emergencia Hipertensiva con daño de órgano blanco', category: 'Emergencias Hipertensivas & Vascular', isUrgent: true },
      { id: 'encefalopatia-hta', name: 'Encefalopatía Hipertensiva', category: 'Emergencias Hipertensivas & Vascular', isUrgent: true },
      { id: 'tep-alto-riesgo', name: 'Tromboembolismo Pulmonar (TEP) de Alto Riesgo / Inestable', category: 'Emergencias Hipertensivas & Vascular', isUrgent: true },
      { id: 'tep-riesgo-intermedio', name: 'Tromboembolismo Pulmonar (TEP) de Riesgo Intermedio-Alto', category: 'Emergencias Hipertensivas & Vascular' },
      { id: 'htp-descompensada', name: 'Hipertensión Pulmonar Severa descompensada', category: 'Emergencias Hipertensivas & Vascular' }
    ]
  },
  {
    category: 'Post-Procedimientos Cardiovasculares',
    icon: '🔬',
    items: [
      { id: 'post-atc-compleja', name: 'Post-Angioplastia Coronaria (ATC) Compleja / Tronco / Bifurcación', category: 'Post-Procedimientos Cardiovasculares' },
      { id: 'post-tavi', name: 'Post-Implante de Válvula Aórtica Transcatéter (TAVI)', category: 'Post-Procedimientos Cardiovasculares' },
      { id: 'post-crm', name: 'Post-Cirugía de Revascularización Miocárdica (CRM)', category: 'Post-Procedimientos Cardiovasculares' },
      { id: 'post-reemplazo-valvular', name: 'Post-Cirugía de Reemplazo Valvular (Aórtico / Mitral)', category: 'Post-Procedimientos Cardiovasculares' },
      { id: 'post-marcapasos-cdi', name: 'Post-Implante de Marcapasos Definitivo / CDI / Resincronizador', category: 'Post-Procedimientos Cardiovasculares' },
      { id: 'post-ablacion-fa', name: 'Post-Ablación por Radiofrecuencia / Crioablación de FA o TV', category: 'Post-Procedimientos Cardiovasculares' }
    ]
  }
];

export const CARDIOLOGY_MEDICATIONS: MedicationCategory[] = [
  {
    category: 'Inotrópicos & Vasopresores (UCO / Shock)',
    icon: '⚡',
    items: [
      { id: 'noradrenalina', name: 'Noradrenalina (Norepinefrina)', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '0.05 - 0.5 mcg/kg/min EV', dosePresets: ['0.05 mcg/kg/min', '0.10 mcg/kg/min', '0.20 mcg/kg/min', '0.40 mcg/kg/min'], isInfusion: true },
      { id: 'dobutamina', name: 'Dobutamina', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '2.5 - 15 mcg/kg/min EV', dosePresets: ['2.5 mcg/kg/min', '5 mcg/kg/min', '7.5 mcg/kg/min', '10 mcg/kg/min'], isInfusion: true },
      { id: 'adrenalina', name: 'Adrenalina (Epinefrina)', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '0.02 - 0.2 mcg/kg/min EV', dosePresets: ['0.02 mcg/kg/min', '0.05 mcg/kg/min', '0.10 mcg/kg/min'], isInfusion: true },
      { id: 'vasopresina', name: 'Vasopresina', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '0.03 - 0.04 UI/min EV', dosePresets: ['0.03 UI/min', '0.04 UI/min'], isInfusion: true },
      { id: 'levosimendan', name: 'Levosimendán', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '0.05 - 0.2 mcg/kg/min EV (x 24hs)', dosePresets: ['0.05 mcg/kg/min', '0.1 mcg/kg/min', '0.2 mcg/kg/min'], isInfusion: true },
      { id: 'milrinona', name: 'Milrinona', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '0.375 - 0.75 mcg/kg/min EV', dosePresets: ['0.375 mcg/kg/min', '0.50 mcg/kg/min', '0.75 mcg/kg/min'], isInfusion: true },
      { id: 'dopamina', name: 'Dopamina', category: 'Inotrópicos & Vasopresores (UCO / Shock)', commonDose: '3 - 10 mcg/kg/min EV', dosePresets: ['3 mcg/kg/min', '5 mcg/kg/min', '10 mcg/kg/min'], isInfusion: true }
    ]
  },
  {
    category: 'Antiarrítmicos',
    icon: '📈',
    items: [
      { id: 'amiodarona-ev', name: 'Amiodarona EV (Goteo continuo / Bomba)', category: 'Antiarrítmicos', commonDose: '300mg carga -> 900mg/24hs', dosePresets: ['300 mg carga en 30min', '900 mg / 24 hs (BIC)', '1200 mg / 24 hs (BIC)'], isInfusion: true },
      { id: 'amiodarona-vo', name: 'Amiodarona VO', category: 'Antiarrítmicos', commonDose: '200 mg/día', dosePresets: ['200 mg/día', '400 mg/día (carga)', '600 mg/día (carga)'] },
      { id: 'adenosina', name: 'Adenosina EV (Bolo rápido)', category: 'Antiarrítmicos', commonDose: '6 mg -> 12 mg EV', dosePresets: ['6 mg bolo rápido', '12 mg bolo rápido'] },
      { id: 'flecainida', name: 'Flecainida VO', category: 'Antiarrítmicos', commonDose: '50 - 100 mg c/12h', dosePresets: ['50 mg c/12h', '100 mg c/12h'] },
      { id: 'propafenona', name: 'Propafenona VO', category: 'Antiarrítmicos', commonDose: '150 - 300 mg c/8h', dosePresets: ['150 mg c/8h', '300 mg c/8h'] },
      { id: 'sotalol', name: 'Sotalol VO', category: 'Antiarrítmicos', commonDose: '80 - 160 mg c/12h', dosePresets: ['80 mg c/12h', '120 mg c/12h', '160 mg c/12h'] },
      { id: 'digoxina', name: 'Digoxina VO / EV', category: 'Antiarrítmicos', commonDose: '0.125 - 0.25 mg/día', dosePresets: ['0.125 mg/día', '0.25 mg/día', '0.50 mg carga EV'] },
      { id: 'diltiazem-ev', name: 'Diltiazem EV', category: 'Antiarrítmicos', commonDose: '0.25 mg/kg bolo -> infusión', dosePresets: ['0.25 mg/kg bolo EV', '5 - 15 mg/h BIC'], isInfusion: true },
      { id: 'sulfato-magnesio', name: 'Sulfato de Magnesio EV', category: 'Antiarrítmicos', commonDose: '2 g EV en 20 min', dosePresets: ['2 g EV en 20 min', '1 g/h BIC'] }
    ]
  },
  {
    category: 'Vasodilatadores & Antianginosos',
    icon: '🫀',
    items: [
      { id: 'nitroglicerina-ev', name: 'Nitroglicerina EV (NTG en bomba)', category: 'Vasodilatadores & Antianginosos', commonDose: '5 - 100 mcg/min EV', dosePresets: ['5 mcg/min', '10 mcg/min', '20 mcg/min', '50 mcg/min'], isInfusion: true },
      { id: 'nitroprusiato-ev', name: 'Nitroprusiato de Sodio EV', category: 'Vasodilatadores & Antianginosos', commonDose: '0.3 - 2 mcg/kg/min EV', dosePresets: ['0.3 mcg/kg/min', '0.5 mcg/kg/min', '1.0 mcg/kg/min'], isInfusion: true },
      { id: 'nitroglicerina-sl', name: 'Nitroglicerina Sublingual', category: 'Vasodilatadores & Antianginosos', commonDose: '0.4 mg SL SOS', dosePresets: ['0.4 mg SL SOS'] },
      { id: 'mononitrato-isosorbide', name: 'Mononitrato de Isosorbide VO', category: 'Vasodilatadores & Antianginosos', commonDose: '20 - 40 mg c/12h', dosePresets: ['20 mg c/12h', '40 mg c/12h'] },
      { id: 'ranolazina', name: 'Ranolazina VO', category: 'Vasodilatadores & Antianginosos', commonDose: '375 - 500 mg c/12h', dosePresets: ['375 mg c/12h', '500 mg c/12h'] },
      { id: 'ivabradina', name: 'Ivabradina VO', category: 'Vasodilatadores & Antianginosos', commonDose: '5 - 7.5 mg c/12h', dosePresets: ['2.5 mg c/12h', '5 mg c/12h', '7.5 mg c/12h'] },
      { id: 'trimetazidina', name: 'Trimetazidina VO', category: 'Vasodilatadores & Antianginosos', commonDose: '35 mg c/12h', dosePresets: ['35 mg c/12h'] }
    ]
  },
  {
    category: 'Betabloqueantes (BB)',
    icon: '🛡️',
    items: [
      { id: 'carvedilol', name: 'Carvedilol VO', category: 'Betabloqueantes (BB)', commonDose: '3.125 - 25 mg c/12h', dosePresets: ['3.125 mg c/12h', '6.25 mg c/12h', '12.5 mg c/12h', '25 mg c/12h'] },
      { id: 'bisoprolol', name: 'Bisoprolol VO', category: 'Betabloqueantes (BB)', commonDose: '2.5 - 10 mg/día', dosePresets: ['1.25 mg/día', '2.5 mg/día', '5 mg/día', '10 mg/día'] },
      { id: 'metoprolol-succinato', name: 'Metoprolol Succinato (Liberación prolongada)', category: 'Betabloqueantes (BB)', commonDose: '25 - 100 mg/día', dosePresets: ['25 mg/día', '50 mg/día', '100 mg/día'] },
      { id: 'nebivolol', name: 'Nebivolol VO', category: 'Betabloqueantes (BB)', commonDose: '2.5 - 5 mg/día', dosePresets: ['2.5 mg/día', '5 mg/día'] },
      { id: 'atenolol', name: 'Atenolol VO', category: 'Betabloqueantes (BB)', commonDose: '25 - 50 mg/día', dosePresets: ['25 mg/día', '50 mg/día'] },
      { id: 'labetalol-ev', name: 'Labetalol EV (Crisis hipertensiva)', category: 'Betabloqueantes (BB)', commonDose: '20 mg bolo -> goteo', dosePresets: ['20 mg bolo EV', '50 mg bolo EV', '1 - 2 mg/min BIC'], isInfusion: true },
      { id: 'esmolol-ev', name: 'Esmolol EV (Ultra rápida)', category: 'Betabloqueantes (BB)', commonDose: '50 - 200 mcg/kg/min EV', dosePresets: ['50 mcg/kg/min', '100 mcg/kg/min', '200 mcg/kg/min'], isInfusion: true }
    ]
  },
  {
    category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)',
    icon: '🔬',
    items: [
      { id: 'sacubitrilo-valsartan', name: 'Sacubitrilo / Valsartán (ARNI)', category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)', commonDose: '24/26 -> 49/51 -> 97/103 mg c/12h', dosePresets: ['24/26 mg c/12h (inicio)', '49/51 mg c/12h (medio)', '97/103 mg c/12h (objetivo)'] },
      { id: 'enalapril', name: 'Enalapril VO', category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)', commonDose: '2.5 - 20 mg c/12h', dosePresets: ['2.5 mg c/12h', '5 mg c/12h', '10 mg c/12h', '20 mg c/12h'] },
      { id: 'ramipril', name: 'Ramipril VO', category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)', commonDose: '2.5 - 10 mg/día', dosePresets: ['2.5 mg/día', '5 mg/día', '10 mg/día'] },
      { id: 'losartan', name: 'Losartán VO', category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)', commonDose: '50 - 100 mg/día', dosePresets: ['25 mg/día', '50 mg/día', '100 mg/día'] },
      { id: 'valsartan', name: 'Valsartán VO', category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)', commonDose: '80 - 160 mg c/12h', dosePresets: ['40 mg c/12h', '80 mg c/12h', '160 mg c/12h'] },
      { id: 'candesartan', name: 'Candesartán VO', category: 'Inhibidores SRAA & ARNI (Falla Cardíaca e HTA)', commonDose: '8 - 32 mg/día', dosePresets: ['8 mg/día', '16 mg/día', '32 mg/día'] }
    ]
  },
  {
    category: 'Antagonistas del Receptor Mineralocorticoide (ARM)',
    icon: '💧',
    items: [
      { id: 'espironolactona', name: 'Espironolactona VO', category: 'Antagonistas del Receptor Mineralocorticoide (ARM)', commonDose: '12.5 - 50 mg/día', dosePresets: ['12.5 mg/día', '25 mg/día', '50 mg/día'] },
      { id: 'eplerenona', name: 'Eplerenona VO', category: 'Antagonistas del Receptor Mineralocorticoide (ARM)', commonDose: '25 - 50 mg/día', dosePresets: ['25 mg/día', '50 mg/día'] },
      { id: 'finerenona', name: 'Finerenona VO', category: 'Antagonistas del Receptor Mineralocorticoide (ARM)', commonDose: '10 - 20 mg/día', dosePresets: ['10 mg/día', '20 mg/día'] }
    ]
  },
  {
    category: 'Inhibidores SGLT2 (iSGLT2)',
    icon: '💊',
    items: [
      { id: 'empagliflozina', name: 'Empagliflozina VO', category: 'Inhibidores SGLT2 (iSGLT2)', commonDose: '10 mg/día', dosePresets: ['10 mg/día', '25 mg/día'] },
      { id: 'dapagliflozina', name: 'Dapagliflozina VO', category: 'Inhibidores SGLT2 (iSGLT2)', commonDose: '10 mg/día', dosePresets: ['10 mg/día'] }
    ]
  },
  {
    category: 'Diuréticos',
    icon: '🌊',
    items: [
      { id: 'furosemida-ev-bolo', name: 'Furosemida EV (Bolos)', category: 'Diuréticos', commonDose: '20 - 80 mg EV c/8-12h', dosePresets: ['20 mg EV c/12h', '40 mg EV c/12h', '60 mg EV c/8h', '80 mg EV c/8h'] },
      { id: 'furosemida-ev-goteo', name: 'Furosemida EV (Goteo continuo)', category: 'Diuréticos', commonDose: '5 - 20 mg/h en bomba', dosePresets: ['5 mg/h BIC', '10 mg/h BIC', '20 mg/h BIC'], isInfusion: true },
      { id: 'furosemida-vo', name: 'Furosemida VO', category: 'Diuréticos', commonDose: '40 - 120 mg/día', dosePresets: ['20 mg/día', '40 mg/día', '40 mg c/12h', '80 mg/día'] },
      { id: 'torasemida', name: 'Torasemida VO', category: 'Diuréticos', commonDose: '10 - 20 mg/día', dosePresets: ['10 mg/día', '20 mg/día'] },
      { id: 'hidroclorotiazida', name: 'Hidroclorotiazida VO', category: 'Diuréticos', commonDose: '25 - 50 mg/día', dosePresets: ['12.5 mg/día', '25 mg/día', '50 mg/día'] },
      { id: 'clortalidona', name: 'Clortalidona VO', category: 'Diuréticos', commonDose: '12.5 - 25 mg/día', dosePresets: ['12.5 mg/día', '25 mg/día'] },
      { id: 'indapamida', name: 'Indapamida VO', category: 'Diuréticos', commonDose: '1.5 mg/día', dosePresets: ['1.5 mg/día'] }
    ]
  },
  {
    category: 'Antiagregantes Plaquetarios',
    icon: '🩸',
    items: [
      { id: 'aspirina', name: 'Aspirina (AAS) VO', category: 'Antiagregantes Plaquetarios', commonDose: '100 mg/día (Carga: 200-300 mg)', dosePresets: ['100 mg/día', '200 mg (carga)', '300 mg (carga)'] },
      { id: 'clopidogrel', name: 'Clopidogrel VO', category: 'Antiagregantes Plaquetarios', commonDose: '75 mg/día (Carga: 300-600 mg)', dosePresets: ['75 mg/día', '300 mg (carga)', '600 mg (carga)'] },
      { id: 'ticagrelor', name: 'Ticagrelor VO', category: 'Antiagregantes Plaquetarios', commonDose: '90 mg c/12h (Carga: 180 mg)', dosePresets: ['90 mg c/12h', '180 mg (carga)'] },
      { id: 'prasugrel', name: 'Prasugrel VO', category: 'Antiagregantes Plaquetarios', commonDose: '10 mg/día (Carga: 60 mg)', dosePresets: ['5 mg/día', '10 mg/día', '60 mg (carga)'] },
      { id: 'tirofiban-ev', name: 'Tirofibán EV (Inhibidor GP IIb/IIIa)', category: 'Antiagregantes Plaquetarios', commonDose: '0.4 mcg/kg/min -> 0.1 mcg/kg/min', dosePresets: ['0.4 mcg/kg/min (bolo 30min)', '0.1 mcg/kg/min (mantenimiento)'], isInfusion: true }
    ]
  },
  {
    category: 'Anticoagulantes',
    icon: '💉',
    items: [
      { id: 'heparina-sodica-ev', name: 'Heparina No Fraccionada (HNF) EV', category: 'Anticoagulantes', commonDose: 'Bolo 60 UI/kg -> 12 UI/kg/h por KPTT', dosePresets: ['5000 UI bolo EV', '800 UI/h BIC', '1000 UI/h BIC', '1200 UI/h BIC'], isInfusion: true },
      { id: 'enoxaparina-sc', name: 'Enoxaparina SC (HBPM)', category: 'Anticoagulantes', commonDose: '1 mg/kg c/12h SC', dosePresets: ['40 mg/día SC (profilaxis)', '60 mg c/12h SC', '80 mg c/12h SC', '100 mg c/12h SC'] },
      { id: 'fondaparinux', name: 'Fondaparinux SC', category: 'Anticoagulantes', commonDose: '2.5 mg/día SC', dosePresets: ['2.5 mg/día SC', '5 mg/día SC'] },
      { id: 'apixaban', name: 'Apixabán VO (DOAC)', category: 'Anticoagulantes', commonDose: '5 mg c/12h (o 2.5 mg c/12h)', dosePresets: ['2.5 mg c/12h', '5 mg c/12h', '10 mg c/12h (TVP)'] },
      { id: 'rivaroxaban', name: 'Rivaroxabán VO (DOAC)', category: 'Anticoagulantes', commonDose: '20 mg/día (con comida)', dosePresets: ['15 mg/día', '20 mg/día', '15 mg c/12h (inicio TVP)'] },
      { id: 'dabigatran', name: 'Dabigatrán VO (DOAC)', category: 'Anticoagulantes', commonDose: '150 mg c/12h', dosePresets: ['110 mg c/12h', '150 mg c/12h'] },
      { id: 'acenocumarol', name: 'Acenocumarol / Warfarina (AVK)', category: 'Anticoagulantes', commonDose: 'Según RIN objetivo (2.0 - 3.0)', dosePresets: ['2 mg/día (ajuste RIN)', '4 mg/día (ajuste RIN)'] }
    ]
  },
  {
    category: 'Hipolipemiantes',
    icon: '✨',
    items: [
      { id: 'atorvastatina', name: 'Atorvastatina VO', category: 'Hipolipemiantes', commonDose: '40 - 80 mg/día', dosePresets: ['20 mg/día', '40 mg/día', '80 mg/día'] },
      { id: 'rosuvastatina', name: 'Rosuvastatina VO', category: 'Hipolipemiantes', commonDose: '20 - 40 mg/día', dosePresets: ['10 mg/día', '20 mg/día', '40 mg/día'] },
      { id: 'ezetimibe', name: 'Ezetimibe VO', category: 'Hipolipemiantes', commonDose: '10 mg/día', dosePresets: ['10 mg/día'] },
      { id: 'acido-bempedoico', name: 'Ácido Bempedoico VO', category: 'Hipolipemiantes', commonDose: '180 mg/día', dosePresets: ['180 mg/día'] },
      { id: 'evolocumab', name: 'Evolocumab SC (iPCSK9)', category: 'Hipolipemiantes', commonDose: '140 mg SC c/14 días', dosePresets: ['140 mg SC c/14 días', '420 mg SC mensual'] }
    ]
  },
  {
    category: 'Bloqueantes Cálcicos (CCB)',
    icon: '🚪',
    items: [
      { id: 'amlodipina', name: 'Amlodipina VO', category: 'Bloqueantes Cálcicos (CCB)', commonDose: '5 - 10 mg/día', dosePresets: ['2.5 mg/día', '5 mg/día', '10 mg/día'] },
      { id: 'lercanidipina', name: 'Lercanidipina VO', category: 'Bloqueantes Cálcicos (CCB)', commonDose: '10 - 20 mg/día', dosePresets: ['10 mg/día', '20 mg/día'] },
      { id: 'diltiazem-vo', name: 'Diltiazem VO', category: 'Bloqueantes Cálcicos (CCB)', commonDose: '60 - 180 mg/día', dosePresets: ['60 mg c/8h', '120 mg/día', '180 mg/día'] },
      { id: 'verapamilo-vo', name: 'Verapamilo VO', category: 'Bloqueantes Cálcicos (CCB)', commonDose: '80 - 240 mg/día', dosePresets: ['80 mg c/8h', '120 mg/día', '240 mg/día'] }
    ]
  }
];

export const CARDIOLOGY_ANTECEDENTS: AntecedentCategory[] = [
  {
    category: 'Factores de Riesgo Cardiovascular (FRCV)',
    icon: '🎯',
    items: [
      { id: 'hta', name: 'Hipertensión Arterial (HTA)', shortName: 'HTA', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'rose' },
      { id: 'dbt2', name: 'Diabetes Mellitus Tipo 2 (DBT2)', shortName: 'DBT2', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'purple' },
      { id: 'dbt1', name: 'Diabetes Mellitus Tipo 1 (DBT1)', shortName: 'DBT1', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'purple' },
      { id: 'dlp', name: 'Dislipemia / Hipercolesterolemia (DLP)', shortName: 'DLP', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'amber' },
      { id: 'tbq-activo', name: 'Tabaquismo Activo (TBQ)', shortName: 'TBQ Activo', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'orange' },
      { id: 'tbq-previo', name: 'Ex-Tabaquista (Cesación > 1 año)', shortName: 'Ex-TBQ', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'slate' },
      { id: 'obesidad', name: 'Obesidad (IMC ≥ 30 kg/m²)', shortName: 'Obesidad', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'sky' },
      { id: 'sedentarismo', name: 'Sedentarismo', shortName: 'Sedentarismo', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'slate' },
      { id: 'afec', name: 'Antecedente Familiar de Enf. Coronaria Precoz (AFEC)', shortName: 'AFEC', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'red' },
      { id: 'estres', name: 'Estrés Psicosocial Crónico / Trastorno de Ansiedad', shortName: 'Estrés', category: 'Factores de Riesgo Cardiovascular (FRCV)', color: 'teal' }
    ]
  },
  {
    category: 'Cardiopatía Isquémica & Revascularización',
    icon: '⚡',
    items: [
      { id: 'iam-previo', name: 'Infarto Agudo de Miocardio (IAM) previo', shortName: 'IAM previo', category: 'Cardiopatía Isquémica & Revascularización', color: 'rose' },
      { id: 'atc-previa', name: 'Angioplastia Coronaria (ATC) con Stent previa', shortName: 'ATC previa', category: 'Cardiopatía Isquémica & Revascularización', color: 'indigo' },
      { id: 'crm-previa', name: 'Cirugía de Revascularización Miocárdica (CRM / By-pass)', shortName: 'CRM previa', category: 'Cardiopatía Isquémica & Revascularización', color: 'blue' },
      { id: 'angina-cronica', name: 'Angina Crónica Estable conocida', shortName: 'Angina Crónica', category: 'Cardiopatía Isquémica & Revascularización', color: 'amber' },
      { id: 'enf-multivaso', name: 'Enfermedad Coronaria Multivaso no revascularizada', shortName: 'Multivaso', category: 'Cardiopatía Isquémica & Revascularización', color: 'red' }
    ]
  },
  {
    category: 'Insuficiencia Cardíaca & Miocardiopatías',
    icon: '🫀',
    items: [
      { id: 'icfer', name: 'Insuficiencia Cardíaca con FEVI Reducida (ICFEr)', shortName: 'ICFEr', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'rose' },
      { id: 'icfep', name: 'Insuficiencia Cardíaca con FEVI Preservada (ICFEp)', shortName: 'ICFEp', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'blue' },
      { id: 'mcp-dilatada', name: 'Miocardiopatía Dilatada (No isquémica)', shortName: 'MCP Dilatada', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'purple' },
      { id: 'mcp-hipertrofica', name: 'Miocardiopatía Hipertrófica (MCPH)', shortName: 'MCPH', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'indigo' },
      { id: 'cardiopatia-hta', name: 'Cardiopatía Hipertensiva', shortName: 'Cardiopatía HTA', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'rose' },
      { id: 'chagas', name: 'Serología de Chagas Positiva / Cardiopatía Chagásica', shortName: 'Chagas (+)', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'amber' },
      { id: 'amiloidosis', name: 'Amiloidosis Cardíaca / Miocardiopatía Infiltrativa', shortName: 'Amiloidosis', category: 'Insuficiencia Cardíaca & Miocardiopatías', color: 'teal' }
    ]
  },
  {
    category: 'Arritmias & Dispositivos Implantables',
    icon: '📈',
    items: [
      { id: 'fa-paroxistica', name: 'Fibrilación Auricular (FA) Paroxística', shortName: 'FA Paroxística', category: 'Arritmias & Dispositivos Implantables', color: 'sky' },
      { id: 'fa-permanente', name: 'Fibrilación Auricular (FA) Permanente / Crónica', shortName: 'FA Permanente', category: 'Arritmias & Dispositivos Implantables', color: 'indigo' },
      { id: 'flutter-previo', name: 'Flutter Auricular (típico / atípico)', shortName: 'Flutter', category: 'Arritmias & Dispositivos Implantables', color: 'sky' },
      { id: 'marcapasos-def', name: 'Portador de Marcapasos Definitivo (MP)', shortName: 'Marcapasos', category: 'Arritmias & Dispositivos Implantables', color: 'emerald' },
      { id: 'cdi-implantable', name: 'Portador de Cardiodesfibrilador Implantable (CDI)', shortName: 'CDI', category: 'Arritmias & Dispositivos Implantables', color: 'red' },
      { id: 'trc-resincronizador', name: 'Portador de Resincronizador Cardíaco (TRC / TRC-D)', shortName: 'TRC', category: 'Arritmias & Dispositivos Implantables', color: 'purple' },
      { id: 'ablacion-previa', name: 'Ablación por Catéter previa de Arritmia', shortName: 'Ablación previa', category: 'Arritmias & Dispositivos Implantables', color: 'teal' }
    ]
  },
  {
    category: 'Valvulopatías & Patología Aórtica',
    icon: '🚪',
    items: [
      { id: 'estenosis-aortica', name: 'Estenosis Aórtica conocida (Moderada / Severa)', shortName: 'Estenosis Aórtica', category: 'Valvulopatías & Patología Aórtica', color: 'amber' },
      { id: 'insuficiencia-mitral', name: 'Insuficiencia Mitral conocida (Moderada / Severa)', shortName: 'Insuf. Mitral', category: 'Valvulopatías & Patología Aórtica', color: 'sky' },
      { id: 'protesis-biologica', name: 'Portador de Prótesis Valvular Biológica', shortName: 'Prótesis Biológica', category: 'Valvulopatías & Patología Aórtica', color: 'blue' },
      { id: 'protesis-mecanica', name: 'Portador de Prótesis Valvular Mecánica (Anticoagulado)', shortName: 'Prótesis Mecánica', category: 'Valvulopatías & Patología Aórtica', color: 'rose' },
      { id: 'aneurisma-aorta', name: 'Aneurisma de Aorta Torácica o Abdominal', shortName: 'Aneurisma Aorta', category: 'Valvulopatías & Patología Aórtica', color: 'orange' }
    ]
  },
  {
    category: 'Comorbilidades & Riesgo Vascular Extracardíaco',
    icon: '🩺',
    items: [
      { id: 'erc-no-dialisis', name: 'Enfermedad Renal Crónica (ERC no en diálisis)', shortName: 'ERC', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'purple' },
      { id: 'erc-dialisis', name: 'ERC Terminal en Hemodiálisis Crónica', shortName: 'HD Crónica', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'red' },
      { id: 'acv-previo', name: 'Accidente Cerebrovascular (ACV) Isquémico / Hemorrágico', shortName: 'ACV previo', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'rose' },
      { id: 'ait-previo', name: 'Ataque Isquémico Transitorio (AIT) previo', shortName: 'AIT previo', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'amber' },
      { id: 'eap', name: 'Enfermedad Arterial Periférica (EAP)', shortName: 'EAP', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'orange' },
      { id: 'epoc-asma', name: 'EPOC / Asma Bronquial crónica', shortName: 'EPOC/Asma', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'slate' },
      { id: 'sahos', name: 'Síndrome de Apnea Obstructiva del Sueño (SAHOS)', shortName: 'SAHOS', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'teal' },
      { id: 'hipotiroidismo', name: 'Hipotiroidismo / Tiroidopatía', shortName: 'Hipotiroidismo', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'slate' },
      { id: 'enfermedad-oncologica', name: 'Antecedente Oncológico (con/sin cardiotoxicidad)', shortName: 'Oncológico', category: 'Comorbilidades & Riesgo Vascular Extracardíaco', color: 'slate' }
    ]
  }
];
