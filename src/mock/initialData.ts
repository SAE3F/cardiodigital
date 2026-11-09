import { HospitalConfig, Patient } from '../types';
import { generateEcgSvgDataUrl } from './ecgSvgs';

export const initialHospitalConfig: HospitalConfig = {
  hospitalName: 'Hospital Universitario de Cardiología',
  serviceName: 'Servicio de Cardiología Clínica & Unidad Coronaria',
  sectors: [
    {
      id: 'guardia',
      name: 'Shock Room / Guardia de Emergencias',
      shortName: 'Shock Room',
      type: 'critical',
      color: 'amber',
      defaultGenderRestricted: false,
    },
    {
      id: 'hemodinamia',
      name: 'Recuperación Hemodinamia',
      shortName: 'Hemodinamia',
      type: 'transit',
      color: 'purple',
      defaultGenderRestricted: false,
    },
    {
      id: 'uco',
      name: 'Unidad Coronaria (UCO)',
      shortName: 'UCO',
      type: 'critical',
      color: 'rose',
      defaultGenderRestricted: false,
    },
    {
      id: 'piso',
      name: 'Internación Cardiología (Piso 3°)',
      shortName: 'Piso',
      type: 'ward',
      color: 'blue',
      defaultGenderRestricted: true,
    }
  ],
  rooms: [
    // Shock Room / Guardia de Emergencias (Capacidad de hasta 3 camas/personas)
    { id: 'guardia-r1', sectorId: 'guardia', name: 'Shock Room / Guardia', capacity: 3, isGenderRestricted: false },

    // Recuperación Hemodinamia (2 camas de tránsito)
    { id: 'hemo-r1', sectorId: 'hemodinamia', name: 'Sala Recuperación Hemodinamia', capacity: 2, isGenderRestricted: false },

    // UCO Rooms (5 Boxes individuales)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `uco-r${i + 1}`,
      sectorId: 'uco',
      name: `Box UCO ${i + 1}`,
      capacity: 1,
      isGenderRestricted: false,
    })),

    // Piso Rooms (4 Habitaciones de 4 camas = 16 camas de internación)
    { id: 'piso-r301', sectorId: 'piso', name: 'Habitación 301', capacity: 4, isGenderRestricted: true },
    { id: 'piso-r302', sectorId: 'piso', name: 'Habitación 302', capacity: 4, isGenderRestricted: true },
    { id: 'piso-r303', sectorId: 'piso', name: 'Habitación 303', capacity: 4, isGenderRestricted: true },
    { id: 'piso-r304', sectorId: 'piso', name: 'Habitación 304', capacity: 4, isGenderRestricted: true },
  ],
  beds: [
    // 3 Boxes / Camas de Shock Room (Guardia de emergencias: hasta 3 personas)
    { id: 'bed-guardia-1', roomId: 'guardia-r1', sectorId: 'guardia', name: 'Shock Room 1', status: 'ocupada', patientId: 'p-13' },
    { id: 'bed-guardia-2', roomId: 'guardia-r1', sectorId: 'guardia', name: 'Shock Room 2', status: 'ocupada', patientId: 'p-16' },
    { id: 'bed-guardia-3', roomId: 'guardia-r1', sectorId: 'guardia', name: 'Shock Room 3', status: 'libre', patientId: null },

    // 2 Camas de Recuperación Hemodinamia
    { id: 'bed-hemo-1', roomId: 'hemo-r1', sectorId: 'hemodinamia', name: 'Recup Hemo 1', status: 'ocupada', patientId: 'p-14' },
    { id: 'bed-hemo-2', roomId: 'hemo-r1', sectorId: 'hemodinamia', name: 'Recup Hemo 2', status: 'libre', patientId: null },

    // 5 Camas en UCO
    ...Array.from({ length: 5 }, (_, i) => {
      const bedNumber = i + 1;
      let status: 'ocupada' | 'libre' = 'libre';
      let patientId: string | null = null;

      if (bedNumber === 1) { status = 'ocupada'; patientId = 'p-1'; }
      else if (bedNumber === 2) { status = 'ocupada'; patientId = 'p-2'; }
      else if (bedNumber === 3) { status = 'ocupada'; patientId = 'p-3'; }
      else if (bedNumber === 4) { status = 'ocupada'; patientId = 'p-7'; }
      // UCO 5 disponible para ingresos o traslados

      return {
        id: `bed-uco-${bedNumber}`,
        roomId: `uco-r${bedNumber}`,
        sectorId: 'uco',
        name: `UCO ${bedNumber}`,
        status,
        patientId,
      };
    }),

    // 16 Camas en Internación (4 salas x 4 camas)
    // Habitación 301 (Femenina)
    { id: 'bed-piso-301a', roomId: 'piso-r301', sectorId: 'piso', name: 'Cama 301-A', status: 'ocupada', patientId: 'p-4' },
    { id: 'bed-piso-301b', roomId: 'piso-r301', sectorId: 'piso', name: 'Cama 301-B', status: 'ocupada', patientId: 'p-5' },
    { id: 'bed-piso-301c', roomId: 'piso-r301', sectorId: 'piso', name: 'Cama 301-C', status: 'ocupada', patientId: 'p-10' },
    { id: 'bed-piso-301d', roomId: 'piso-r301', sectorId: 'piso', name: 'Cama 301-D', status: 'ocupada', patientId: 'p-8' },

    // Habitación 302 (Masculina)
    { id: 'bed-piso-302a', roomId: 'piso-r302', sectorId: 'piso', name: 'Cama 302-A', status: 'ocupada', patientId: 'p-6' },
    { id: 'bed-piso-302b', roomId: 'piso-r302', sectorId: 'piso', name: 'Cama 302-B', status: 'ocupada', patientId: 'p-11' },
    { id: 'bed-piso-302c', roomId: 'piso-r302', sectorId: 'piso', name: 'Cama 302-C', status: 'libre', patientId: null },
    { id: 'bed-piso-302d', roomId: 'piso-r302', sectorId: 'piso', name: 'Cama 302-D', status: 'libre', patientId: null },

    // Habitación 303 (Masculina)
    { id: 'bed-piso-303a', roomId: 'piso-r303', sectorId: 'piso', name: 'Cama 303-A', status: 'ocupada', patientId: 'p-12' },
    { id: 'bed-piso-303b', roomId: 'piso-r303', sectorId: 'piso', name: 'Cama 303-B', status: 'ocupada', patientId: 'p-9' },
    { id: 'bed-piso-303c', roomId: 'piso-r303', sectorId: 'piso', name: 'Cama 303-C', status: 'libre', patientId: null },
    { id: 'bed-piso-303d', roomId: 'piso-r303', sectorId: 'piso', name: 'Cama 303-D', status: 'libre', patientId: null },

    // Habitación 304 (Sala con Aislamiento de Contacto: 304-A ocupada por paciente aislado, 304-B/C/D anuladas)
    { id: 'bed-piso-304a', roomId: 'piso-r304', sectorId: 'piso', name: 'Cama 304-A', status: 'ocupada', patientId: 'p-15' },
    { id: 'bed-piso-304b', roomId: 'piso-r304', sectorId: 'piso', name: 'Cama 304-B', status: 'libre', patientId: null },
    { id: 'bed-piso-304c', roomId: 'piso-r304', sectorId: 'piso', name: 'Cama 304-C', status: 'libre', patientId: null },
    { id: 'bed-piso-304d', roomId: 'piso-r304', sectorId: 'piso', name: 'Cama 304-D', status: 'libre', patientId: null },
  ]
};

export const initialPatients: Patient[] = [
  // Paciente en Shock Room (Guardia)
  {
    id: 'p-13',
    fullName: 'Sánchez, Marcos Andrés',
    dni: '15.901.884',
    age: 57,
    sex: 'M',
    admissionDate: '2026-11-07',
    bedId: 'bed-guardia-1',
    sectorId: 'guardia',
    roomId: 'guardia-r1',
    diagnosis: 'IAMCEST Inferior / Inferoposterior • En ventana de reperfusión',
    diagnoses: [
      'IAMCEST Inferior / Inferoposterior',
      'Emergencias Hipertensivas & Vascular'
    ],
    antecedents: 'Tabaquismo severo, Sedentarismo. Sin controles médicos previos.',
    antecedentsList: ['Tabaquismo Activo (TBQ)', 'Sedentarismo'],
    clinicalStatus: 'critico',
    admissionTime: '07:30',
    readmissionCount: 0,
    isReadmissionWithin30Days: false,
    doorToBalloon: {
      isApplicable: true,
      painOnsetTime: '05:30',
      doorTime: '07:30',
      ecgTime: '07:38',
      cathLabActivationTime: '07:45',
      balloonTime: '08:35',
      totalMinutes: 65,
      isWithinTarget: true,
      operator: 'Equipo de Hemodinamia Guardia / Dr. Rossi',
      reperfusionStrategy: 'angioplastia_primaria',
      notes: 'Tiempo Puerta-Balón excelente de 65 min (< 90 min meta).'
    },
    hospitalInfection: { hasInfection: false },
    supportDevices: ['Vía periférica gruesa 18G', 'Oxígeno por cánula nasal', 'Monitor de 12 derivaciones continuo'],
    medications: [
      'Aspirina (AAS) VO • 300 mg (carga)',
      'Ticagrelor VO • 180 mg (carga)',
      'Atorvastatina VO • 80 mg/día',
      'Morfina EV • 3 mg SOS'
    ],
    keyLabs: {
      troponinas: 'Ingreso: 8.500 ng/L',
      creatinina: '1.05 mg/dL'
    },
    evolutionNotes: 'Ingresó por guardia hace 45 minutos con dolor opresivo precordial típico de 2 hs de evolución. Carga antiagregante completa realizada en guardia. Esperando traslado inmediato a Hemodinamia o UCO.',
    pendingConduct: 'Traslado urgente a Sala de Cateterismo para Cinecoronariografía y Angioplastia primaria a Coronaria Derecha.',
    plannedTransfer: 'pasa_uco',
    tasks: [
      { id: 't-23', text: 'Activar equipo de guardia de Hemodinamia (Código Infarto)', done: true, createdAt: '08:00' },
      { id: 't-24', text: 'Trasladar a UCO post-procedimiento', done: false, urgent: true, createdAt: '08:15', dueTime: '10:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p13-ingreso',
        date: '2026-11-07',
        time: '07:45',
        title: 'ECG Shock Room (Dolor agudo)',
        type: 'ingreso',
        imageUrl: generateEcgSvgDataUrl('stemi'),
        notes: 'Supradesnivel del segmento ST de 3.5mm en DII, DIII y aVF con infradesnivel especular en aVL y V1-V2.'
      }
    ]
  },
  // Paciente en Recuperación Hemodinamia
  {
    id: 'p-14',
    fullName: 'Bermúdez, Jorge Horacio',
    dni: '11.832.100',
    age: 71,
    sex: 'M',
    admissionDate: '2026-11-07',
    bedId: 'bed-hemo-1',
    sectorId: 'hemodinamia',
    roomId: 'hemo-r1',
    diagnosis: 'Post-Angioplastia Coronaria (ATC) Compleja / Tronco / Bifurcación',
    diagnoses: [
      'Post-Angioplastia Coronaria (ATC) Compleja / Tronco / Bifurcación',
      'Síndromes Coronarios Agudos & Isquemia'
    ],
    antecedents: 'Dislipemia severa, Angioplastia previa en 2019.',
    antecedentsList: ['Dislipemia / Hipercolesterolemia (DLP)', 'Angioplastia Coronaria (ATC) con Stent previa'],
    clinicalStatus: 'vigilar',
    admissionTime: '06:40',
    readmissionCount: 1,
    isReadmissionWithin30Days: false,
    doorToBalloon: {
      isApplicable: true,
      painOnsetTime: '04:15',
      doorTime: '06:40',
      ecgTime: '06:48',
      cathLabActivationTime: '07:00',
      balloonTime: '07:58',
      totalMinutes: 78,
      isWithinTarget: true,
      operator: 'Dra. Martínez / Dr. Rossi',
      reperfusionStrategy: 'angioplastia_primaria',
      notes: 'ATC primaria a Circunfleja. D2B: 78 min (< 90 min).'
    },
    hospitalInfection: { hasInfection: false },
    supportDevices: ['Vendaje compresivo femoral derecho', 'Hidratación parenteral'],
    medications: [
      'Aspirina (AAS) VO • 100 mg/día',
      'Ticagrelor VO • 90 mg c/12h',
      'Atorvastatina VO • 80 mg/día',
      'Enoxaparina SC (HBPM) • 60 mg c/12h SC'
    ],
    keyLabs: {
      creatinina: '1.20 mg/dL'
    },
    evolutionNotes: 'Finalizó angioplastia primaria exitosa a arteria Circunfleja con 2 stents liberadores de fármacos hace 30 minutos. Punción femoral sin hematoma ni sangrado.',
    pendingConduct: 'Traslado a Unidad Coronaria (UCO) para control de enzimas y monitoreo de 24 hs.',
    plannedTransfer: 'pasa_uco',
    tasks: [
      { id: 't-25', text: 'Controlar pulso pedio y apósito femoral cada 30 min', done: false, urgent: true, createdAt: '08:10', dueTime: '10:30' },
      { id: 't-26', text: 'Bajar cama a UCO asignada', done: false, urgent: true, createdAt: '08:20', dueTime: '11:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p14-post',
        date: '2026-11-07',
        time: '08:00',
        title: 'ECG Inmediato Post-ATC',
        type: 'post_procedimiento',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Descenso completo del segmento ST en cara lateral. Ritmo sinusal regular 70 lpm.'
      }
    ]
  },
  // Pacientes en UCO (5 camas)
  {
    id: 'p-1',
    fullName: 'González, Roberto Raúl',
    dni: '14.288.930',
    age: 63,
    sex: 'M',
    admissionDate: '2026-11-05',
    bedId: 'bed-uco-1',
    sectorId: 'uco',
    roomId: 'uco-r1',
    diagnosis: 'IAMCEST Anteroseptal / Anterior extenso • Shock Cardiogénico resuelto',
    diagnoses: [
      'IAMCEST Anteroseptal / Anterior extenso',
      'Shock Cardiogénico (Killip IV / SCA o Miocardiopatía)',
      'Post-Angioplastia Coronaria (ATC) Compleja / Tronco / Bifurcación'
    ],
    antecedents: 'HTA, Dislipemia, Tabaquista severo (40 paq/año), Sedentarismo.',
    antecedentsList: [
      'Hipertensión Arterial (HTA)',
      'Dislipemia / Hipercolesterolemia (DLP)',
      'Tabaquismo Activo (TBQ)',
      'Sedentarismo'
    ],
    clinicalStatus: 'critico',
    supportDevices: ['Noradrenalina (Norepinefrina) EV'],
    medications: [
      'Noradrenalina (Norepinefrina) • 0.10 mcg/kg/min',
      'Aspirina (AAS) VO • 100 mg/día',
      'Ticagrelor VO • 90 mg c/12h',
      'Atorvastatina VO • 80 mg/día',
      'Furosemida EV (Bolos) • 40 mg EV c/12h'
    ],
    keyLabs: {
      troponinas: 'Pico 18.400 ng/L -> actual 9.200 ng/L',
      bnp: '1.450 pg/mL',
      k: '4.3 mEq/L',
      na: '138 mEq/L',
      creatinina: '1.35 mg/dL (basal 1.0)',
      hb: '13.2 g/dL',
      otros: 'Lactato: 1.6 mmol/L'
    },
    evolutionNotes: 'Día 2 post-ATC. Buena respuesta al destete progresivo de noradrenalina. Ruidos cardíacos rítmicos, R3 presente al ingreso ya ausente. Sin nuevos episodios de ángor.',
    pendingConduct: 'Titular noradrenalina a la baja para suspender al mediodía. Control ecocardiográfico de FEVI por la tarde. Iniciar dosis bajas de carvedilol si estabilidad.',
    plannedTransfer: null,
    tasks: [
      { id: 't-1', text: 'Suspender Noradrenalina si PAM > 70 mmHg', done: false, urgent: true, createdAt: '08:00', dueTime: '12:00' },
      { id: 't-2', text: 'Pedir Eco Transtorácico para valorar FEVI y motilidad parietal', done: false, urgent: false, createdAt: '08:15', dueTime: '15:00' },
      { id: 't-3', text: 'Ionograma y Creatinina de control post-contraste', done: true, createdAt: '06:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p1-ingreso',
        date: '2026-11-05',
        time: '14:20',
        title: 'ECG de Ingreso (Dolor precordial típico)',
        type: 'ingreso',
        imageUrl: generateEcgSvgDataUrl('stemi'),
        notes: 'Supradesnivel del segmento ST de 4mm en V1-V4 con imagen especular en cara inferior.'
      },
      {
        id: 'ecg-p1-hoy',
        date: '2026-11-07',
        time: '07:00',
        title: 'ECG del Día (Post-ATC día 2)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('stemi'),
        notes: 'Descenso del ST > 70%, onda T negativa simétrica en precordiales anteriores.'
      }
    ]
  },
  {
    id: 'p-2',
    fullName: 'Rossi, Elena María',
    dni: '9.412.003',
    age: 79,
    sex: 'F',
    admissionDate: '2026-11-06',
    bedId: 'bed-uco-2',
    sectorId: 'uco',
    roomId: 'uco-r2',
    diagnosis: 'Bloqueo AV Completo (3er grado) sintomático / síncope',
    diagnoses: [
      'Bloqueo AV Completo (3er grado) sintomático / síncope',
      'Síncope de Presunto Origen Cardiogénico en estudio'
    ],
    antecedents: 'Cardiopatía hipertensiva, Deterioro cognitivo leve.',
    antecedentsList: ['Hipertensión Arterial (HTA)', 'Cardiopatía Hipertensiva'],
    clinicalStatus: 'vigilar',
    supportDevices: ['Marcapasos Transitorio Femoral Derecho (Frec: 60 lpm, salida 3V)'],
    medications: [
      'Aspirina (AAS) VO • 100 mg/día',
      'Atorvastatina VO • 20 mg/día'
    ],
    keyLabs: {
      troponinas: 'Negativas (< 14 ng/L)',
      k: '4.8 mEq/L',
      creatinina: '0.98 mg/dL',
      hb: '11.8 g/dL',
    },
    evolutionNotes: 'Normotensa, lúcida, sin repetición sincopal. Sensado y captura del marcapasos transitorio al 100%. Buen estado de la zona de punción femoral.',
    pendingConduct: 'Implante de Marcapasos Definitivo Bicameral (DDDR) coordinado con electrofisiología a las 14:00 hs.',
    plannedTransfer: null,
    tasks: [
      { id: 't-4', text: 'Ayuno estricto desde las 10:00 hs para quirófano', done: true, createdAt: '07:30' },
      { id: 't-5', text: 'Profilaxis antibiótica con Cefazolina 2g 30 min antes del implante', done: false, urgent: true, createdAt: '08:00', dueTime: '13:30' },
      { id: 't-6', text: 'Rx de tórax post-implante inmediata', done: false, urgent: false, createdAt: '08:30', dueTime: '16:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p2-hoy',
        date: '2026-11-07',
        time: '06:45',
        title: 'ECG del Día (Ritmo de Marcapasos)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('avblock'),
        notes: 'Espiga de estimulación ventricular con QRS ancho tipo BRI, captura completa.'
      }
    ]
  },
  {
    id: 'p-3',
    fullName: 'Méndez, Juan Carlos',
    dni: '16.782.119',
    age: 58,
    sex: 'M',
    admissionDate: '2026-10-31',
    admissionTime: '10:15',
    readmissionCount: 2,
    isReadmissionWithin30Days: true,
    bedId: 'bed-uco-3',
    sectorId: 'uco',
    roomId: 'uco-r3',
    diagnosis: 'IC Aguda Descompensada con FEVI Reducida (ICFEr) • Miocardiopatía Dilatada',
    diagnoses: [
      'IC Aguda Descompensada con FEVI Reducida (ICFEr)',
      'Miocardiopatía Dilatada en fase congestiva avanzada',
      'Fibrilación Auricular (FA) con Alta Respuesta Ventricular'
    ],
    antecedents: 'IC con FEVI 22%, AICD bicameral en 2023, Fibrilación auricular permanente.',
    antecedentsList: [
      'Insuficiencia Cardíaca con FEVI Reducida (ICFEr)',
      'Fibrilación Auricular (FA) Permanente / Crónica',
      'Portador de Cardiodesfibrilador Implantable (CDI)'
    ],
    clinicalStatus: 'estable',
    supportDevices: ['Vía periférica'],
    medications: [
      'Sacubitrilo / Valsartán (ARNI) • 49/51 mg c/12h',
      'Carvedilol VO • 12.5 mg c/12h',
      'Espironolactona VO • 25 mg/día',
      'Empagliflozina VO • 10 mg/día',
      'Furosemida VO • 40 mg/día',
      'Apixabán VO (DOAC) • 5 mg c/12h'
    ],
    keyLabs: {
      bnp: 'Descendió de 3.200 a 680 pg/mL',
      k: '4.1 mEq/L',
      creatinina: '1.20 mg/dL',
      hb: '12.5 g/dL'
    },
    evolutionNotes: 'Completó 5 días de levosimendán y balance negativo acumulado de -4.500 mL. Sin ortopnea, tolera decúbito dorsal. Buena tolerancia a los 4 pilares.',
    pendingConduct: 'Paciente estabilizado: PASE A PISO DE INTERNACIÓN programado para hoy.',
    plannedTransfer: 'baja_piso',
    tasks: [
      { id: 't-7', text: 'Coordinar cama en piso de internación (Hab 302 o 303)', done: false, urgent: true, createdAt: '08:10', dueTime: '11:00' },
      { id: 't-8', text: 'Reclamar pedido de diuréticos VO para la tarde', done: false, urgent: false, createdAt: '08:20' }
    ],
    ecgs: [
      {
        id: 'ecg-p3-hoy',
        date: '2026-11-07',
        time: '07:15',
        title: 'ECG del Día',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'FA con respuesta ventricular controlada ~72 lpm. QRS ancho con morfología de bloqueo de rama izquierda.'
      }
    ]
  },
  {
    id: 'p-7',
    fullName: 'Valenzuela, Carlos Alberto',
    dni: '13.119.802',
    age: 61,
    sex: 'M',
    admissionDate: '2026-11-06',
    bedId: 'bed-uco-4',
    sectorId: 'uco',
    roomId: 'uco-r4',
    diagnosis: 'Tormenta Arrítmica / Múltiples choques de CDI • Taquicardia Ventricular Sostenida',
    diagnoses: [
      'Tormenta Arrítmica / Múltiples choques de CDI',
      'Taquicardia Ventricular Sostenida (con o sin pulso)'
    ],
    antecedents: 'Cardiopatía isquémica necrótica antigua, CDI colocado en 2021.',
    antecedentsList: [
      'Infarto Agudo de Miocardio (IAM) previo',
      'Portador de Cardiodesfibrilador Implantable (CDI)'
    ],
    clinicalStatus: 'critico',
    supportDevices: ['Amiodarona EV en bomba', 'Lidocaína EV'],
    medications: [
      'Amiodarona EV (Goteo continuo / Bomba) • 900 mg / 24 hs (BIC)',
      'Bisoprolol VO • 5 mg/día',
      'Aspirina (AAS) VO • 100 mg/día'
    ],
    keyLabs: {
      k: '4.7 mEq/L',
      creatinina: '1.15 mg/dL',
      hb: '13.0 g/dL'
    },
    evolutionNotes: 'Sedado con remifentanilo a dosis bajas. Sin nuevas salvas de TV en las últimas 12 hs tras carga de amiodarona y corrección de K a > 4.5 mEq/L.',
    pendingConduct: 'Evaluar ablación por catéter de sustrato arritmogénico con electrofisiología si repite episodios.',
    plannedTransfer: null,
    tasks: [
      { id: 't-16', text: 'Control estricto de K+ c/6hs (objetivo > 4.5 mEq/L)', done: false, urgent: true, createdAt: '08:00', dueTime: '14:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p7-hoy',
        date: '2026-11-07',
        time: '07:05',
        title: 'ECG de Control en UCO',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal con ondas Q patológicas en cara inferior. QT corregido 460 ms.'
      }
    ]
  },
  {
    id: 'p-8',
    fullName: 'Morales, Liliana Beatriz',
    dni: '18.992.341',
    age: 49,
    sex: 'F',
    admissionDate: '2026-11-05',
    bedId: 'bed-piso-301d',
    sectorId: 'piso',
    roomId: 'piso-r301',
    diagnosis: 'Miocarditis Aguda complicada / fulminante • Shock Cardiogénico',
    diagnoses: [
      'Miocarditis Aguda complicada / fulminante',
      'Shock Cardiogénico (Killip IV / SCA o Miocardiopatía)'
    ],
    antecedents: 'Cuadro febril viral hace 10 días. Sin factores de riesgo coronario.',
    antecedentsList: ['Insuficiencia Cardíaca con FEVI Reducida (ICFEr)'],
    clinicalStatus: 'critico',
    supportDevices: ['Milrinona EV', 'Noradrenalina baja dosis', 'Cánula de alto flujo'],
    medications: [
      'Milrinona • 0.375 mcg/kg/min EV',
      'Noradrenalina (Norepinefrina) • 0.05 mcg/kg/min',
      'Furosemida EV (Goteo continuo) • 10 mg/h BIC'
    ],
    keyLabs: {
      troponinas: 'Pico 24.000 ng/L',
      bnp: '2.800 pg/mL',
      creatinina: '1.25 mg/dL'
    },
    evolutionNotes: 'Ecocardiograma con hipocinesia difusa severa, FEVI 28%. Mejor perfusión periférica con milrinona. En discusión para soporte mecánico circulatorio si empeora.',
    pendingConduct: 'Monitoreo hemodinámico estricto, ecocardiograma de control a las 18 hs.',
    plannedTransfer: null,
    tasks: [
      { id: 't-17', text: 'Repetir lactato y gases venosos centrales 12:00 hs', done: false, urgent: true, createdAt: '08:15', dueTime: '12:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p8-hoy',
        date: '2026-11-07',
        time: '06:50',
        title: 'ECG de Control',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Taquicardia sinusal 105 lpm. Microvoltaje difuso en derivaciones del plano frontal.'
      }
    ]
  },
  {
    id: 'p-9',
    fullName: 'Quiroga, Walter Omar',
    dni: '12.449.120',
    age: 64,
    sex: 'M',
    admissionDate: '2026-11-06',
    bedId: 'bed-piso-303b',
    sectorId: 'piso',
    roomId: 'piso-r303',
    diagnosis: 'Disección Aórtica Tipo B Complicada (Dolor refractario / Isquemia)',
    diagnoses: [
      'Disección Aórtica Tipo B Complicada (Dolor refractario / Isquemia)',
      'Emergencia Hipertensiva con daño de órgano blanco'
    ],
    antecedents: 'HTA severa no tratada, Fumador.',
    antecedentsList: [
      'Hipertensión Arterial (HTA)',
      'Tabaquismo Activo (TBQ)',
      'Aneurisma de Aorta Torácica o Abdominal'
    ],
    clinicalStatus: 'critico',
    supportDevices: ['Labetalol EV en bomba', 'Nitroprusiato de Sodio EV', 'Línea arterial radial'],
    medications: [
      'Labetalol EV (Crisis hipertensiva) • 1 - 2 mg/min BIC',
      'Nitroprusiato de Sodio EV • 0.5 mcg/kg/min',
      'Amlodipina VO • 10 mg/día'
    ],
    keyLabs: {
      creatinina: '1.40 mg/dL',
      hb: '12.2 g/dL'
    },
    evolutionNotes: 'Objetivo de anti-impulso logrado: FC < 60 lpm y TAS entre 100-110 mmHg. AngioTC muestra flap de disección desde subclavia izquierda hasta ilíaca.',
    pendingConduct: 'Ateneo médico-quirúrgico con cirugía vascular a las 11:00 hs para definir TEVAR (endoprótesis de aorta torácica).',
    plannedTransfer: null,
    tasks: [
      { id: 't-18', text: 'Presentar caso en Ateneo de Aorta 11:00 hs', done: false, urgent: true, createdAt: '08:00', dueTime: '11:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p9-hoy',
        date: '2026-11-07',
        time: '07:20',
        title: 'ECG Control Anti-impulso',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Bradicardia sinusal farmacológica 54 lpm. Hipertrofia ventricular izquierda.'
      }
    ]
  },
  // Pacientes en Internación de Piso (16 camas)
  {
    id: 'p-4',
    fullName: 'Benítez, Carmen Rosa',
    dni: '11.554.890',
    age: 73,
    sex: 'F',
    admissionDate: '2026-11-04',
    bedId: 'bed-piso-301a',
    sectorId: 'piso',
    roomId: 'piso-r301',
    diagnosis: 'IC Aguda Descompensada con FEVI Preservada (ICFEp) • Fibrilación Auricular (FA)',
    diagnoses: [
      'IC Aguda Descompensada con FEVI Preservada (ICFEp)',
      'Fibrilación Auricular (FA) con Alta Respuesta Ventricular'
    ],
    antecedents: 'DBT2, HTA, Obesidad grado II.',
    antecedentsList: [
      'Diabetes Mellitus Tipo 2 (DBT2)',
      'Hipertensión Arterial (HTA)',
      'Obesidad (IMC ≥ 30 kg/m²)'
    ],
    clinicalStatus: 'estable',
    supportDevices: ['Vía periférica'],
    medications: [
      'Furosemida VO • 40 mg c/12h',
      'Apixabán VO (DOAC) • 5 mg c/12h',
      'Empagliflozina VO • 10 mg/día',
      'Espironolactona VO • 25 mg/día',
      'Bisoprolol VO • 2.5 mg/día'
    ],
    keyLabs: {
      k: '3.9 mEq/L',
      creatinina: '1.05 mg/dL',
      hb: '12.0 g/dL'
    },
    evolutionNotes: 'Balance negativo de -1.200 mL en 24hs. Buena diuresis. Rales crepitantes basales mínimos. En ritmo sinusal recuperado.',
    pendingConduct: 'Pasar furosemida a vía oral. Iniciar anticoagulación oral directa. Plan de alta en 48hs.',
    plannedTransfer: null,
    tasks: [
      { id: 't-9', text: 'Rotar furosemida a VO (40 mg c/12h)', done: false, urgent: false, createdAt: '08:00', dueTime: '12:00' },
      { id: 't-10', text: 'Iniciar Apixabán 5 mg', done: true, createdAt: '08:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p4-hoy',
        date: '2026-11-07',
        time: '07:30',
        title: 'ECG del Día (Ritmo Sinusal)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal regular 68 lpm. Intervalo PR normal.'
      }
    ]
  },
  {
    id: 'p-5',
    fullName: 'Fernández, Marta Beatriz',
    dni: '10.884.221',
    age: 76,
    sex: 'F',
    admissionDate: '2026-11-05',
    bedId: 'bed-piso-301b',
    sectorId: 'piso',
    roomId: 'piso-r301',
    diagnosis: 'Post-Implante de Válvula Aórtica Transcatéter (TAVI) • Estenosis Aórtica Severa',
    diagnoses: [
      'Post-Implante de Válvula Aórtica Transcatéter (TAVI)',
      'Estenosis Aórtica Severa Sintomática (Síncope / Angor / Disnea)'
    ],
    antecedents: 'Estenosis Aórtica Severa sintomática con síncope de esfuerzo.',
    antecedentsList: [
      'Estenosis Aórtica conocida (Moderada / Severa)',
      'Portador de Prótesis Valvular Biológica'
    ],
    clinicalStatus: 'estable',
    supportDevices: ['Vía periférica heparinizada'],
    medications: [
      'Aspirina (AAS) VO • 100 mg/día',
      'Clopidogrel VO • 75 mg/día',
      'Atorvastatina VO • 40 mg/día'
    ],
    keyLabs: {
      k: '4.2 mEq/L',
      creatinina: '0.85 mg/dL',
      hb: '11.5 g/dL'
    },
    evolutionNotes: 'Ecocardiograma control con gradiente transaórtico medio de 7 mmHg, sin fuga perivalvular. ECG sin trastornos de conducción nuevos. Deambula por la habitación.',
    pendingConduct: 'Alta médica programada para el día de hoy con control por consultorio externo de valvulopatías.',
    plannedTransfer: 'alta',
    tasks: [
      { id: 't-11', text: 'Confeccionar epicrisis y receta de doble antiagregación', done: false, urgent: true, createdAt: '08:15', dueTime: '11:00' },
      { id: 't-12', text: 'Retiro de vía venosa periférica para alta', done: false, urgent: false, createdAt: '08:30' }
    ],
    ecgs: [
      {
        id: 'ecg-p5-hoy',
        date: '2026-11-07',
        time: '07:40',
        title: 'ECG del Día (Pre-Alta)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal 70 lpm. PR 170ms, QRS angosto. Sin bloqueo AV ni de rama.'
      }
    ]
  },
  {
    id: 'p-10',
    fullName: 'Spinetta, Dora Alicia',
    dni: '8.761.229',
    age: 82,
    sex: 'F',
    admissionDate: '2026-11-06',
    bedId: 'bed-piso-301c',
    sectorId: 'piso',
    roomId: 'piso-r301',
    diagnosis: 'Estenosis Aórtica Severa Sintomática (Síncope / Angor / Disnea)',
    diagnoses: [
      'Estenosis Aórtica Severa Sintomática (Síncope / Angor / Disnea)'
    ],
    antecedents: 'HTA, Osteoporosis, Fragilidad moderada.',
    antecedentsList: [
      'Hipertensión Arterial (HTA)',
      'Estenosis Aórtica conocida (Moderada / Severa)'
    ],
    clinicalStatus: 'vigilar',
    supportDevices: ['Vía venosa periférica'],
    medications: [
      'Rosuvastatina VO • 20 mg/día',
      'Furosemida VO • 20 mg/día'
    ],
    keyLabs: {
      creatinina: '0.92 mg/dL',
      hb: '11.0 g/dL'
    },
    evolutionNotes: 'Estable en reposo. Se completó angiotomografía multicorte de aorta y accesos femorales para planificación de TAVI.',
    pendingConduct: 'Presentar en Heart Team del jueves para definir implante percutáneo.',
    plannedTransfer: null,
    tasks: [
      { id: 't-19', text: 'Cargar informe de AngioTC en ficha para Heart Team', done: false, urgent: false, createdAt: '08:30' }
    ],
    ecgs: [
      {
        id: 'ecg-p10-hoy',
        date: '2026-11-07',
        time: '07:25',
        title: 'ECG de Control',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal con signos de sobrecarga ventricular izquierda (Sokolow 38mm).'
      }
    ]
  },
  {
    id: 'p-6',
    fullName: 'Domínguez, Alberto José',
    dni: '12.339.810',
    age: 67,
    sex: 'M',
    admissionDate: '2026-11-06',
    bedId: 'bed-piso-302a',
    sectorId: 'piso',
    roomId: 'piso-r302',
    diagnosis: 'IAMSEST de Alto Riesgo (Troponinas + / Cambios dinámicos)',
    diagnoses: [
      'IAMSEST de Alto Riesgo (Troponinas + / Cambios dinámicos)',
      'Angina Inestable de Alto Riesgo / Progresiva'
    ],
    antecedents: 'Tabaquismo activo, HTA, Dislipemia.',
    antecedentsList: [
      'Tabaquismo Activo (TBQ)',
      'Hipertensión Arterial (HTA)',
      'Dislipemia / Hipercolesterolemia (DLP)'
    ],
    clinicalStatus: 'vigilar',
    supportDevices: ['Heparina sódica en bomba', 'Nitroglicerina EV'],
    medications: [
      'Aspirina (AAS) VO • 100 mg/día',
      'Ticagrelor VO • 90 mg c/12h',
      'Heparina No Fraccionada (HNF) EV • 1000 UI/h BIC',
      'Atorvastatina VO • 80 mg/día',
      'Bisoprolol VO • 5 mg/día'
    ],
    keyLabs: {
      troponinas: '120 ng/L -> 480 ng/L',
      k: '4.4 mEq/L',
      creatinina: '1.10 mg/dL',
      hb: '14.1 g/dL'
    },
    evolutionNotes: 'Calmó dolor con nitratos. Sin ángor refractario ni signos de insuficiencia cardíaca. KPTT en rango 65 seg.',
    pendingConduct: 'Cinecoronariografía (CCG) programada en Hemodinamia para hoy a las 11:30 hs.',
    plannedTransfer: 'hemodinamia',
    tasks: [
      { id: 't-13', text: 'Ayuno para cateterismo 11:30 hs', done: true, createdAt: '07:00' },
      { id: 't-14', text: 'Chequear consentimiento informado firmado para CCG/ATC', done: false, urgent: true, createdAt: '08:00', dueTime: '10:00' },
      { id: 't-15', text: 'Avisar a Hemodinamia cuando esté listo camillero', done: false, urgent: false, createdAt: '08:30', dueTime: '11:15' }
    ],
    ecgs: [
      {
        id: 'ecg-p6-hoy',
        date: '2026-11-07',
        time: '07:10',
        title: 'ECG del Día (En reposo)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Infradesnivel transitorio del ST de 1.5mm en V4-V6 que corrigió tras NTG.'
      }
    ]
  },
  {
    id: 'p-11',
    fullName: 'Ceballos, Héctor Daniel',
    dni: '14.881.094',
    age: 69,
    sex: 'M',
    admissionDate: '2026-11-03',
    bedId: 'bed-piso-302b',
    sectorId: 'piso',
    roomId: 'piso-r302',
    diagnosis: 'Post-Cirugía de Revascularización Miocárdica (CRM) • Día 4',
    diagnoses: [
      'Post-Cirugía de Revascularización Miocárdica (CRM)',
      'Síndromes Coronarios Agudos & Isquemia'
    ],
    antecedents: 'Enfermedad de 3 vasos, DBT2 insulino-requiriente.',
    antecedentsList: [
      'Cirugía de Revascularización Miocárdica (CRM / By-pass)',
      'Diabetes Mellitus Tipo 2 (DBT2)',
      'Enfermedad Coronaria Multivaso no revascularizada'
    ],
    clinicalStatus: 'estable',
    supportDevices: ['Vía periférica'],
    medications: [
      'Aspirina (AAS) VO • 100 mg/día',
      'Rosuvastatina VO • 40 mg/día',
      'Carvedilol VO • 6.25 mg c/12h',
      'Furosemida VO • 40 mg/día',
      'Enoxaparina SC (HBPM) • 40 mg/día SC (profilaxis)'
    ],
    keyLabs: {
      hb: '10.2 g/dL',
      creatinina: '1.02 mg/dL',
      k: '4.2 mEq/L'
    },
    evolutionNotes: 'Día 4 post-CRM (Puente mamario a DA + venas a CD y diagonal). Sin drenajes, herida quirúrgica limpia, buena tolerancia a la deambulación.',
    pendingConduct: 'Retirar puntos de esternotomía al 7mo día. Plan de alta en 48 hs si continúa estable.',
    plannedTransfer: null,
    tasks: [
      { id: 't-20', text: 'Curación plana de herida quirúrgica esternotomía', done: true, createdAt: '08:00' },
      { id: 't-21', text: 'Rx de tórax control pre-alta para descartar derrame pleural', done: false, urgent: false, createdAt: '08:30', dueTime: '15:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p11-hoy',
        date: '2026-11-07',
        time: '07:35',
        title: 'ECG Control Post-Quirúrgico',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal regular 74 lpm. Repolarización ventricular normal.'
      }
    ]
  },
  {
    id: 'p-12',
    fullName: 'Varela, Ramón Antonio',
    dni: '16.002.391',
    age: 55,
    sex: 'M',
    admissionDate: '2026-11-02',
    bedId: 'bed-piso-303a',
    sectorId: 'piso',
    roomId: 'piso-r303',
    diagnosis: 'Endocarditis Infecciosa de Válvula Nativa (Aórtica) • Insuficiencia Aórtica Aguda',
    diagnoses: [
      'Endocarditis Infecciosa de Válvula Nativa',
      'Insuficiencia Aórtica Aguda Severa (Endocarditis / Disección)'
    ],
    antecedents: 'Válvula aórtica bicúspide conocida. Procedimiento dental hace 3 semanas.',
    antecedentsList: [
      'Estenosis Aórtica conocida (Moderada / Severa)'
    ],
    clinicalStatus: 'vigilar',
    supportDevices: ['Vía periférica para antibióticos EV'],
    medications: [
      'Furosemida VO • 40 mg/día',
      'Enalapril VO • 5 mg c/12h'
    ],
    keyLabs: {
      hb: '10.8 g/dL',
      creatinina: '1.18 mg/dL',
      otros: 'Hemocultivos 2/2 (+) para Streptococcus viridans'
    },
    evolutionNotes: 'Afebril desde hace 72 hs con esquema antibiótico dirigido. ETE mostró vegetación de 9 mm en valva coronaria derecha con insuficiencia aórtica moderada-severa.',
    pendingConduct: 'Completar 4 semanas de antibióticos. Seguimiento ecocardiográfico semanal para descartar progresión a absceso perivalvular.',
    plannedTransfer: null,
    tasks: [
      { id: 't-22', text: 'Hemocultivos de control al 5to día de antibióticos', done: false, urgent: true, createdAt: '08:00', dueTime: '18:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p12-hoy',
        date: '2026-11-07',
        time: '07:15',
        title: 'ECG Control (Vigilar PR por absceso)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal 72 lpm. PR 180 ms estable (sin prolongación del PR).'
      }
    ]
  },
  {
    id: 'p-15',
    fullName: 'Castillo, Elsa Beatriz',
    dni: '10.892.341',
    age: 70,
    sex: 'F',
    admissionDate: '2026-10-25',
    admissionTime: '15:20',
    readmissionCount: 1,
    isReadmissionWithin30Days: false,
    bedId: 'bed-piso-304a',
    sectorId: 'piso',
    roomId: 'piso-r304',
    diagnosis: 'Endocarditis Infecciosa de Válvula Aórtica por SAMR • Aislamiento de Contacto',
    diagnoses: [
      'Endocarditis Infecciosa sobre Válvula Nativa',
      'Bacteriemia por SAMR (Staphylococcus aureus meticilino resistente)'
    ],
    antecedents: 'HTA, DBT2, Insuficiencia renal crónica estadio 3b.',
    antecedentsList: [
      'Hipertensión Arterial (HTA)',
      'Diabetes Mellitus Tipo 2 (DBT2)',
      'Enfermedad Renal Crónica (ERC no en diálisis)'
    ],
    clinicalStatus: 'vigilar',
    isIsolated: true,
    isolationType: 'contacto',
    isolationReason: 'SAMR (+) en hemocultivos (Aislamiento de Contacto)',
    hospitalInfection: {
      hasInfection: true,
      type: 'bacteriemia_cateter',
      germ: 'Staphylococcus aureus resistente a meticilina (SAMR)',
      onsetDate: '2026-10-30',
      antibioticTreatment: 'Vancomicina 1g c/12h ajustada por niveles valle',
      isPostProcedure: true,
      procedureType: 'Acceso Venoso Central (CVC)'
    },
    supportDevices: ['Vía periférica'],
    medications: [
      'Amlodipina VO • 5 mg/día'
    ],
    keyLabs: {
      troponinas: 'Negativas (< 14 ng/L)',
      creatinina: '1.65 mg/dL',
      hb: '10.5 g/dL',
      otros: 'Hemocultivos 2/2 (+) para SAMR sensible a Vancomicina'
    },
    evolutionNotes: 'Afebril en las últimas 24 hs bajo vancomicina ajustada por vancocinemia valle. Habitación 304 exclusiva por aislamiento de contacto.',
    pendingConduct: 'Dosaje de vancocinemia valle a las 13:00 hs. Repetir hemocultivos de control para documentar aclaramiento bacteriano.',
    plannedTransfer: null,
    tasks: [
      { id: 't-23', text: 'Dosaje de vancocinemia valle 30 min antes de la infusión', done: false, urgent: true, createdAt: '08:00', dueTime: '13:00' },
      { id: 't-24', text: 'Hemocultivos de control x 2 series', done: false, urgent: true, createdAt: '08:30', dueTime: '11:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p15-hoy',
        date: '2026-11-07',
        time: '07:30',
        title: 'ECG Control PR (Descarte de absceso perivalvular)',
        type: 'control_diario',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Ritmo sinusal regular 76 lpm. Intervalo PR normal (160 ms), sin progresión de bloqueo.'
      }
    ]
  },
  {
    id: 'p-16',
    fullName: 'Navarro, Lucía Elena',
    dni: '16.442.981',
    age: 68,
    sex: 'F',
    admissionDate: '2026-11-07',
    admissionTime: '06:15',
    readmissionCount: 3,
    isReadmissionWithin30Days: true,
    bedId: 'bed-guardia-2',
    sectorId: 'guardia',
    roomId: 'guardia-r1',
    diagnosis: 'Edema Agudo de Pulmón Hipertensivo resuelto con VNI • Emergencia Hipertensiva',
    diagnoses: [
      'Edema Agudo de Pulmón (EAP) de origen hipertensivo',
      'Emergencia Hipertensiva con daño de órgano blanco',
      'Insuficiencia Cardíaca con FEVI Preservada (ICFEp)'
    ],
    antecedents: 'HTA severa de larga data, cardiopatía hipertensiva, abandono de enalapril.',
    antecedentsList: [
      'Hipertensión Arterial (HTA)',
      'Cardiopatía Hipertensiva',
      'Insuficiencia Cardíaca con FEVI Preservada (ICFEp)'
    ],
    clinicalStatus: 'vigilar',
    supportDevices: ['Vía periférica', 'Cánula nasal 2 L/min'],
    medications: [
      'Furosemida EV (Bolos) • 40 mg EV c/12h',
      'Nitroglicerina EV (NTG en bomba) • 10 mcg/min',
      'Amlodipina VO • 10 mg/día'
    ],
    keyLabs: {
      bnp: '1.800 pg/mL',
      k: '4.2 mEq/L',
      creatinina: '1.28 mg/dL',
      hb: '12.0 g/dL'
    },
    evolutionNotes: 'Ingresó con TA 220/120 mmHg y disnea CF IV con rales crepitantes hasta campos medios. Excelente respuesta a VNI por 2 hs y nitroglicerina. Actualmente TA 135/80 mmHg sin tiraje ni disnea.',
    pendingConduct: 'Paciente compensada: PROGRAMADO PASE A PISO DE INTERNACIÓN (Hab 301) una vez retirada la nitroglicerina.',
    plannedTransfer: 'baja_piso',
    tasks: [
      { id: 't-31', text: 'Suspender nitroglicerina EV si TAS < 140 mmHg e iniciar Enalapril VO', done: false, urgent: true, createdAt: '08:00', dueTime: '10:00' },
      { id: 't-32', text: 'Coordinar cama en Piso 3° para pase de guardia matutino', done: false, urgent: false, createdAt: '08:15', dueTime: '11:00' }
    ],
    ecgs: [
      {
        id: 'ecg-p16-hoy',
        date: '2026-11-07',
        time: '07:00',
        title: 'ECG de Ingreso en Shock Room',
        type: 'ingreso',
        imageUrl: generateEcgSvgDataUrl('normal'),
        notes: 'Taquicardia sinusal 98 lpm. Sobrecarga ventricular izquierda severa (Sokolow 38 mm).'
      }
    ]
  }
];

export const initialDischargedPatients: Patient[] = [
  {
    id: 'p-d1',
    fullName: 'Pérez, Horacio Daniel',
    dni: '12.449.201',
    age: 65,
    sex: 'M',
    admissionDate: '2026-10-22',
    admissionTime: '08:15',
    dischargeDate: '2026-10-27',
    dischargeReason: 'alta_medica',
    bedId: null,
    sectorId: null,
    roomId: null,
    diagnosis: 'IAMCEST Anterior Extenso • ATC Primaria a Descendente Anterior exitosa',
    diagnoses: [
      'IAMCEST Anteroseptal / Anterior extenso',
      'Post-Angioplastia Coronaria (ATC) Compleja / Tronco / Bifurcación'
    ],
    antecedents: 'HTA, Tabaquismo severo',
    antecedentsList: ['Hipertensión Arterial (HTA)', 'Tabaquismo Activo (TBQ)'],
    clinicalStatus: 'estable',
    supportDevices: [],
    medications: [
      'Aspirina (AAS) VO • 100 mg/día',
      'Ticagrelor VO • 90 mg c/12h',
      'Atorvastatina VO • 80 mg/día',
      'Bisoprolol VO • 5 mg/día',
      'Ramipril VO • 5 mg/día'
    ],
    readmissionCount: 0,
    isReadmissionWithin30Days: false,
    doorToBalloon: {
      isApplicable: true,
      painOnsetTime: '06:30',
      doorTime: '08:15',
      ecgTime: '08:22',
      cathLabActivationTime: '08:30',
      balloonTime: '09:08',
      totalMinutes: 53,
      isWithinTarget: true,
      operator: 'Dra. Martínez / Hemodinamia',
      reperfusionStrategy: 'angioplastia_primaria',
      notes: 'Tiempo Puerta-Balón óptimo 53 min. Reperfusión completa TIMI 3.'
    },
    hospitalInfection: { hasInfection: false },
    keyLabs: { troponinas: 'Pico 14.200 ng/L' },
    evolutionNotes: 'Evolución favorable post-ATC. Alta con ecocardiograma FEVI 45%.',
    pendingConduct: 'Control ambulatorio en consultorio de cardiopatía isquémica a los 7 días.',
    plannedTransfer: 'alta',
    tasks: [],
    ecgs: []
  },
  {
    id: 'p-d2',
    fullName: 'Lombardi, Teresa Juana',
    dni: '9.871.402',
    age: 80,
    sex: 'F',
    admissionDate: '2026-10-18',
    admissionTime: '11:30',
    dischargeDate: '2026-10-26',
    dischargeReason: 'alta_medica',
    bedId: null,
    sectorId: null,
    roomId: null,
    diagnosis: 'Insuficiencia Cardíaca Aguda Descompensada (ICFEr) • Infección Urinaria por SV',
    diagnoses: [
      'IC Aguda Descompensada con FEVI Reducida (ICFEr)',
      'Fibrilación Auricular (FA) con Alta Respuesta Ventricular'
    ],
    antecedents: 'ICFEr conocida, HTA, DBT2',
    antecedentsList: [
      'Insuficiencia Cardíaca con FEVI Reducida (ICFEr)',
      'Hipertensión Arterial (HTA)',
      'Diabetes Mellitus Tipo 2 (DBT2)'
    ],
    clinicalStatus: 'estable',
    supportDevices: [],
    medications: [
      'Furosemida VO • 40 mg c/12h',
      'Sacubitrilo / Valsartán (ARNI) • 24/26 mg c/12h',
      'Carvedilol VO • 6.25 mg c/12h',
      'Apixabán VO (DOAC) • 2.5 mg c/12h'
    ],
    readmissionCount: 3,
    isReadmissionWithin30Days: true,
    hospitalInfection: {
      hasInfection: true,
      type: 'infeccion_urinaria',
      germ: 'Escherichia coli sensible a Ciprofloxacina',
      onsetDate: '2026-10-21',
      antibioticTreatment: 'Ciprofloxacina 500mg c/12h x 7 días',
      isPostProcedure: false
    },
    keyLabs: {},
    evolutionNotes: 'Reingreso precoz por trasgresión alimentaria e ITU intercurrente. Tratada y compensada.',
    pendingConduct: 'Seguimiento estricto por consultorio de insuficiencia cardíaca.',
    plannedTransfer: 'alta',
    tasks: [],
    ecgs: []
  }
];
