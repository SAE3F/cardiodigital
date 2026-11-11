export interface NationalGuideline {
  id: string;
  title: string;
  society: 'SAC' | 'FAC' | 'SAC/FAC Conjunto';
  year: number;
  category: 
    | 'Cardiopatía Isquémica & SCA'
    | 'Insuficiencia Cardíaca'
    | 'Arritmias & Dispositivos'
    | 'Hipertensión & Prevención'
    | 'Valvulopatías & Imágenes'
    | 'Cuidados Críticos & Shock'
    | 'Misceláneas & Chagas';
  quickSummary: string;
  pdfUrl: string;
  articleUrl?: string;
  keyPoints?: string[];
  markdownContent?: string;
}

export const NATIONAL_GUIDELINES: NationalGuideline[] = [
  // 1. CARDIOPATÍA ISQUÉMICA & SCA
  {
    id: 'sac-scasest-2026',
    title: 'Consenso de Síndromes Coronarios Agudos (SCASEST y IAMCEST)',
    society: 'SAC',
    year: 2026,
    category: 'Cardiopatía Isquémica & SCA',
    quickSummary: 'Protocolo de manejo integral de los Síndromes Coronarios Agudos en guardia y UCO. Triage en <10 min, troponinas ultrasensibles y timing de cateterismo.',
    pdfUrl: 'https://www.sac.org.ar/wp-content/uploads/2026/04/sindromes-coronarios-agudos-1.pdf',
    articleUrl: 'https://www.sac.org.ar/consensos/',
    keyPoints: [
      'ECG en < 10 min desde el primer contacto médico (FMC) obligatorio.',
      'Algoritmos de hs-cTn 0/1h o 0/2h para rule-in o rule-out precoz.',
      'Invasiva Inmediata (< 2h) en inestabilidad hemodinámica, shock o arritmias ventriculares.',
      'Invasiva Temprana (< 24h) en troponinas elevadas, cambios dinámicos del ST o GRACE > 140.',
      'Doble antiagregación con AAS + Ticagrelor 90mg c/12h o Prasugrel 10mg/día.'
    ],
    markdownContent: `
### Resumen Clínico Esencial:
* **Triage Inicial:** La realización e interpretación del ECG en menos de 10 minutos es la meta angular. Si el ECG inicial es equívoco y el dolor persiste, tomar derivaciones derechas (V3R-V4R) y posteriores (V7-V9).
* **Troponina Ultrasensible:** Utilizar el valor absoluto basal y el delta a 1 o 2 horas para definir el alta segura (Rule-out) o la confirmación de injuria (Rule-in).
* **Timing de Cinecoronariografía:**
  1. *Muy Alto Riesgo (< 2 hs):* Inestabilidad hemodinámica, shock cardiogénico, dolor torácico refractario o angina recurrente bajo tratamiento médico máximo, arritmias ventriculares amenazantes.
  2. *Alto Riesgo (< 24 hs):* Confirmación por hs-cTn, cambios dinámicos significativos del ST/T, score GRACE > 140.
  3. *Bajo Riesgo / Selectiva:* Pacientes estabilizados, score GRACE < 109, troponinas repetidamente negativas; estudio funcional previo al alta.
    `
  },
  {
    id: 'fac-iam-2024',
    title: 'Consenso sobre el manejo del Infarto Agudo de Miocardio no complicado en la República Argentina',
    society: 'FAC',
    year: 2024,
    category: 'Cardiopatía Isquémica & SCA',
    quickSummary: 'Pautas de atención en guardia y sala de internación para el paciente cursando un infarto sin shock ni complicaciones mecánicas.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/655/423',
    articleUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/655',
    keyPoints: [
      'Estratificación precoz con Killip y Kimball (Killip I: sin estertores ni R3).',
      'Objetivo de Tiempo Puerta-Balón < 90 min en centros con hemodinamia.',
      'Estrategia farmacoinvasiva si la demora para ATC primaria supera los 120 min.',
      'Estatinas de alta intensidad (Atorvastatina 80 mg o Rosuvastatina 40 mg) desde las primeras 24 hs.'
    ]
  },
  {
    id: 'sac-scc-2025',
    title: 'Consenso de Síndromes Coronarios Crónicos (Actualización 2025)',
    society: 'SAC',
    year: 2025,
    category: 'Cardiopatía Isquémica & SCA',
    quickSummary: 'Enfoque moderno del paciente con enfermedad coronaria estable: tratamiento médico óptimo, evaluación anatómica vs funcional e indicaciones de ATC/CRM.',
    pdfUrl: 'https://www.sac.org.ar/wp-content/uploads/2026/01/Consenso-de-sindromes-coronarios-cronicos-5.pdf',
    articleUrl: 'https://www.sac.org.ar/consensos/',
    keyPoints: [
      'Tratamiento Médico Óptimo (TMO) como pilar fundamental para mejorar pronóstico y calidad de vida.',
      'Antianginosos de 1ra línea: Betabloqueantes y/o Antagonistas Cálcicos.',
      'AngioTAC coronaria preferida en probabilidad pretest baja/intermedia.',
      'Revascularización reservada para síntomas refractarios o anatomía de alto riesgo (Tronco > 50%, DA proximal).'
    ]
  },
  {
    id: 'fac-antitrombotico-coronario',
    title: 'Documento de consenso sobre terapia antitrombótica en enfermedad coronaria',
    society: 'FAC',
    year: 2023,
    category: 'Cardiopatía Isquémica & SCA',
    quickSummary: 'Recomendaciones prácticas para la duración de la doble antiagregación (DAPT) y triple terapia en pacientes anticoagulados.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/373/310',
    keyPoints: [
      'DAPT estándar de 12 meses tras SCA, reducible a 3-6 meses si alto riesgo de sangrado (PRECISE-DAPT ≥ 25).',
      'En pacientes con indicación de anticoagulación oral (FA) sometidos a ATC: Triple terapia (DOAC + AAS + Clopidogrel) limitada a la internación o máximo 1 semana, seguida de doble terapia (DOAC + Clopidogrel) hasta el año.'
    ]
  },

  // 2. INSUFICIENCIA CARDÍACA
  {
    id: 'sac-fac-arm-ic-2025',
    title: 'Recomendaciones Conjuntas SAC / FAC para el uso de Antagonistas de los Receptores de Mineralocorticoides en la IC (Integrando Finerenona)',
    society: 'SAC/FAC Conjunto',
    year: 2025,
    category: 'Insuficiencia Cardíaca',
    quickSummary: 'Abordaje integral del bloqueo mineralocorticoideo en todo el espectro de la fracción de eyección (ICFEr, ICFEp) y enfermedad cardiorrenal.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/712/454',
    articleUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/712',
    keyPoints: [
      'Espironolactona/Eplerenona como pilar irrenunciable en ICFEr (FEVI ≤ 40%).',
      'Finerenona en pacientes con Diabetes Tipo 2 y Enfermedad Renal Crónica para reducir eventos CV e internaciones por IC.',
      'Vigilancia estricta de potasio sérico y función renal a los 7 y 30 días del inicio.'
    ]
  },
  {
    id: 'fac-descongestion-ic-2024',
    title: 'Guía práctica para el manejo de la congestión en pacientes con Insuficiencia Cardíaca',
    society: 'FAC',
    year: 2024,
    category: 'Insuficiencia Cardíaca',
    quickSummary: 'Manejo protocolizado de diuréticos de asa endovenosos, bloqueo tubular secuencial y evaluación clínica y de laboratorio de la descongestión.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/675/436',
    keyPoints: [
      'Dosis inicial de furosemida EV igual o superior a 1-2 veces la dosis oral diaria previa.',
      'Evaluación del sodio urinario a las 2 horas (> 50-70 mEq/L) o ritmo diurético a las 6 hs (> 100-150 mL/h).',
      'Si respuesta insuficiente: duplicar dosis de diurético de asa o agregar tiazidas/espironolactona (bloqueo secuencial de la nefrona).'
    ]
  },
  {
    id: 'fac-icfep-2024',
    title: 'Recomendaciones de la FAC para el manejo de pacientes con Insuficiencia Cardíaca con Fracción de Eyección Preservada (ICFEp)',
    society: 'FAC',
    year: 2024,
    category: 'Insuficiencia Cardíaca',
    quickSummary: 'Algoritmo diagnóstico con H2FPEF y evidencia de inhibidores SGLT2 (Empagliflozina / Dapagliflozina) y control de comorbilidades.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/622/402',
    keyPoints: [
      'Los inhibidores SGLT2 (iSGLT2) son el único grupo farmacológico con indicación Clase I para reducir hospitalizaciones en ICFEp.',
      'Control estricto de la presión arterial y la frecuencia en pacientes con FA.',
      'Diuréticos de asa a la menor dosis necesaria para mantener euvolemia sin provocar hipoperfusión.'
    ]
  },
  {
    id: 'sac-fac-hierro-ic-2023',
    title: 'Recomendaciones conjuntas SAC / FAC sobre diagnóstico y tratamiento del déficit de hierro en la Insuficiencia Cardíaca',
    society: 'SAC/FAC Conjunto',
    year: 2023,
    category: 'Insuficiencia Cardíaca',
    quickSummary: 'Pautas para el screening de ferropenia (Ferritina < 100 ng/mL o 100-299 con Sat Transferrina < 20%) y reposición con carboximaltosa férrica EV.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/534/361',
    keyPoints: [
      'Screening obligatorio de ferropenia en todo paciente internado o ambulatorio con IC.',
      'El hierro oral es inefectivo por mala absorción e inflamación sistémica.',
      'La administración de Hierro Carboximaltosa o Derisomaltosa EV mejora la clase funcional, tolerancia al ejercicio y reduce reinternaciones por IC.'
    ]
  },

  // 3. ARRITMIAS & FIBRILACIÓN AURICULAR
  {
    id: 'sac-fa-2025',
    title: 'Consenso Fibrilación Auricular SAC 2025',
    society: 'SAC',
    year: 2025,
    category: 'Arritmias & Dispositivos',
    quickSummary: 'Nuevos paradigmas en FA: esquema ABC, control temprano del ritmo frente al control de frecuencia, y ablación con catéter como 1ra línea.',
    pdfUrl: 'https://www.sac.org.ar/wp-content/uploads/2026/10/Consenso-FA.pdf',
    articleUrl: 'https://www.sac.org.ar/consensos/?unidadtematica=arritmias-y-fibrilacion-auricular',
    keyPoints: [
      'Esquema ABC: A (Anticoagulación / DOACs), B (Better symptom management), C (Comorbidity optimization).',
      'DOACs como primera línea indiscutida sobre acenocumarol en FA no valvular.',
      'Control temprano del ritmo en FA de reciente diagnóstico para frenar el remodelado auricular.',
      'Ablación con catéter de venas pulmonares con indicación Clase I en pacientes sintomáticos.'
    ]
  },
  {
    id: 'fac-fa-2023',
    title: 'Guía de Diagnóstico y Tratamiento sobre la Fibrilación Auricular de la Federación Argentina de Cardiología',
    society: 'FAC',
    year: 2023,
    category: 'Arritmias & Dispositivos',
    quickSummary: 'Abordaje integral en guardia y consultorio: estratificación con CHA2DS2-VASc y HAS-BLED, cardioversión farmacológica y eléctrica.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/491/335',
    keyPoints: [
      'Cardioversión eléctrica sincronizada urgente ante cualquier signo de inestabilidad hemodinámica.',
      'En FA < 48 hs iniciar anticoagulación periprocedimiento.',
      'En FA > 48 hs o tiempo incierto: ETE para descartar trombo auricular o anticoagulación plena por 3 semanas previas a cardiovertir.'
    ]
  },
  {
    id: 'fac-cdi-subcutaneo',
    title: 'Cardiodesfibrilador implantable subcutáneo (S-ICD): Evidencia clínica y recomendaciones',
    society: 'FAC',
    year: 2025,
    category: 'Arritmias & Dispositivos',
    quickSummary: 'Indicaciones y selección de pacientes para CDI totalmente subcutáneo (sin cables intravasculares), ideal en accesos venosos difíciles o riesgo de infección.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/544/459',
    keyPoints: [
      'Alternativa eficaz en prevención primaria y secundaria sin necesidad de estimulación antibradicardia o resincronización.',
      'Previene infecciones endovasculares y endocarditis por electrocatéter.',
      'Requiere cribado electrocardiográfico previo (screening de vectores).'
    ]
  },

  // 4. HIPERTENSIÓN ARTERIAL & PREVENCIÓN
  {
    id: 'fac-hta-2025',
    title: 'Consenso Argentino de Hipertensión Arterial 2025',
    society: 'FAC',
    year: 2025,
    category: 'Hipertensión & Prevención',
    quickSummary: 'Actualización en puntos de corte diagnósticos, monitoreo ambulatorio (MAPA/MDPA), objetivos de control (<130/80 mmHg) y terapia combinada en un solo comprimido.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/726/476',
    keyPoints: [
      'Diagnóstico confirmado preferentemente por MAPA de 24 hs o presiones ambulatorias domiciliarias.',
      'Inicio temprano con combinación fija de 2 drogas en 1 sola pastilla (IECA/ARAII + Calcioantagonista o Tiazida).',
      'Meta de control estricto: TAS 120-129 mmHg si es bien tolerada, sin fragilidad extrema.',
      'Diferenciación entre Emergencia Hipertensiva (daño agudo de órgano blanco: requiere labetalol/nitratos EV en UCO) y Urgencia Hipertensiva (ajuste oral).'
    ]
  },
  {
    id: 'fac-vacunacion-cv',
    title: 'Documento de Consenso sobre el rol de la vacunación en adultos para la prevención de eventos cardiovasculares',
    society: 'FAC',
    year: 2024,
    category: 'Hipertensión & Prevención',
    quickSummary: 'La vacunación antigripal y antineumocócica como herramienta terapéutica cardiovascular para prevenir descompensaciones y eventos isquémicos.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/742/477',
    keyPoints: [
      'Vacuna contra la influenza reduce un 30% la mortalidad cardiovascular y el riesgo de infarto recurrente.',
      'Indicación rutinaria en todo paciente con enfermedad coronaria, insuficiencia cardíaca o diabetes antes del alta hospitalaria.'
    ]
  },

  // 5. CUIDADOS CRÍTICOS & SHOCK
  {
    id: 'fac-shock-2025',
    title: 'Consenso de Shock Cardiogénico complicando al Infarto Agudo de Miocardio 2025',
    society: 'FAC',
    year: 2025,
    category: 'Cuidados Críticos & Shock',
    quickSummary: 'Estratificación SCAI (A a E), algoritmo de soporte hemodinámico temprano, revascularización emergente y selección de vasopresores e inotrópicos.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/665/437',
    keyPoints: [
      'Noradrenalina es el vasopresor de primera línea (menor mortalidad y arritmias que dopamina).',
      'Dobutamina o Milrinona como inotrópicos de soporte para optimizar el gasto cardíaco.',
      'Revascularización urgente de la arteria culpable del infarto de forma prioritaria.',
      'Lactato seriado y saturación venosa central para monitoreo dinámico de la perfusión tisular.'
    ]
  },
  {
    id: 'sac-inotropicos-asistencia',
    title: 'Consenso de Inotrópicos y Asistencia Circulatoria Mecánica',
    society: 'SAC',
    year: 2024,
    category: 'Cuidados Críticos & Shock',
    quickSummary: 'Manejo en Unidad Coronaria del shock refractario, balón de contrapulsación intraaórtico (BIAC), ECMO venoarterial y dispositivos de asistencia ventricular.',
    pdfUrl: 'https://www.sac.org.ar/wp-content/uploads/2021/01/consenso-88-2-1_1.pdf',
    articleUrl: 'https://www.sac.org.ar/consensos/?unidadtematica=cirugia-cardiovascular-y-cardiologia-critica',
    keyPoints: [
      'Titulación de inotrópicos a la dosis mínima efectiva para evitar taquiarritmias y consumo miocárdico de O2.',
      'Levosimendán en pacientes bajo betabloqueantes o hipertensión pulmonar con falla del ventrículo derecho.',
      'Indicación precoz de asistencia circulatoria mecánica previa al fallo multiorgánico irreversible.'
    ]
  },

  // 6. VALVULOPATÍAS & IMÁGENES
  {
    id: 'fac-ecodoppler-2025',
    title: 'Guías de práctica de Eco Doppler vascular de la Federación Argentina de Cardiología (Upgrade 2025)',
    society: 'FAC',
    year: 2025,
    category: 'Valvulopatías & Imágenes',
    quickSummary: 'Caracterización morfológica de la placa aterosclerótica carotídea, dolicoarteriopatías y cuantificación de estenosis vascular.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/772/515',
    keyPoints: [
      'Identificación de placas carotídeas vulnerables (hipoecoicas, superficie irregular o ulcerada).',
      'Criterios de velocidad sistólica máxima para graduación de estenosis carotídea (criterios NASCET y ECST).'
    ]
  },

  // 7. MISCELÁNEAS & CHAGAS
  {
    id: 'fac-chagas-2024',
    title: 'Guías clínicas prácticas de prevención y diagnóstico de la Enfermedad de Chagas Mazza',
    society: 'FAC',
    year: 2024,
    category: 'Misceláneas & Chagas',
    quickSummary: 'Evaluación cardiológica en Argentina de la miocardiopatía chagásica, arritmias ventriculares, bloqueo de rama derecha y aneurisma apical.',
    pdfUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/423/321',
    keyPoints: [
      'Serología diagnóstica con dos pruebas concordantes (ELISA + IFI o HAI).',
      'ECG anual para detectar bloqueo completo de rama derecha (BCRD) con hemibloqueo anterior izquierdo (HBAI).',
      'Holter de 24 hs y ecocardiograma para screening de disfunción ventricular y aneurisma apical del VI con trombo mural.',
      'Indicación de tratamiento antiparasitario (Benznidazol o Nifurtimox) en fase aguda, reactivaciones y fase crónica reciente.'
    ]
  }
];

export function getAllNationalGuidelines(): NationalGuideline[] {
  return NATIONAL_GUIDELINES;
}

export function filterNationalGuidelines(params: {
  search?: string;
  society?: string;
  category?: string;
  year?: number | string;
}): NationalGuideline[] {
  return NATIONAL_GUIDELINES.filter(g => {
    if (params.society && params.society !== 'all' && g.society !== params.society) {
      return false;
    }
    if (params.category && params.category !== 'all' && g.category !== params.category) {
      return false;
    }
    if (params.year && params.year !== 'all' && g.year.toString() !== params.year.toString()) {
      return false;
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      const match = g.title.toLowerCase().includes(q) ||
                    g.quickSummary.toLowerCase().includes(q) ||
                    (g.keyPoints && g.keyPoints.some(k => k.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });
}
