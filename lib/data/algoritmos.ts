export type AlgorithmNodeType = 'question' | 'endpoint';
export type EndpointColor = 'green' | 'yellow' | 'red' | 'blue';

export interface AlgorithmOption {
  label: string;
  nextId: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export interface AlgorithmNode {
  id: string;
  type: AlgorithmNodeType;
  title: string;
  description?: string;
  options?: AlgorithmOption[];
  recommendation?: string;
  alert?: string;
  color?: EndpointColor;
}

export interface AlgorithmConfig {
  slug: string;
  name: string;
  category: string;
  source: string;
  description: string;
  relatedGuidelines?: string[]; // Slugs de guías clínicas asociadas
  initialNodeId: string;
  nodes: Record<string, AlgorithmNode>;
}

export const ALGORITMOS: AlgorithmConfig[] = [
  {
    slug: 'iamcest-repf',
    name: 'Reperfusión en IAMCEST',
    category: 'Cardiopatía Isquémica',
    source: 'Consenso SAC IAMCEST (2024)',
    description: 'Estrategia de reperfusión inicial en el Infarto Agudo de Miocardio con Elevación del ST.',
    relatedGuidelines: ['iamcest-2024', 'consenso-iamcest', 'sindromes coronarios agudos'],
    initialNodeId: 'q_hemodinamia',
    nodes: {
      'q_hemodinamia': {
        id: 'q_hemodinamia',
        type: 'question',
        title: '¿El centro actual cuenta con capacidad para realizar Angioplastia Primaria (ATC) 24/7?',
        description: 'Hemodinamia disponible en el sitio sin necesidad de traslado.',
        options: [
          { label: 'Sí, hay hemodinamia', nextId: 'q_tiempo_90', variant: 'default' },
          { label: 'No hay hemodinamia', nextId: 'q_tiempo_120', variant: 'outline' }
        ]
      },
      'q_tiempo_90': {
        id: 'q_tiempo_90',
        type: 'question',
        title: '¿El tiempo esperado desde el Primer Contacto Médico (FMC) hasta cruzar la cuerda en Hemodinamia es menor a 90 minutos?',
        options: [
          { label: 'Sí (< 90 min)', nextId: 'end_atc_90', variant: 'default' },
          { label: 'No (Demora > 90 min)', nextId: 'q_contraindicaciones_lisis', variant: 'outline' }
        ]
      },
      'q_tiempo_120': {
        id: 'q_tiempo_120',
        type: 'question',
        title: 'Estimando el traslado a un centro con red: ¿El tiempo esperado desde el FMC hasta cruzar la cuerda será menor a 120 minutos?',
        options: [
          { label: 'Sí (< 120 min)', nextId: 'end_traslado_atc', variant: 'default' },
          { label: 'No (> 120 min)', nextId: 'q_contraindicaciones_lisis_2', variant: 'outline' }
        ]
      },
      'q_contraindicaciones_lisis': {
        id: 'q_contraindicaciones_lisis',
        type: 'question',
        title: '¿El paciente tiene contraindicaciones absolutas para Fibrinolíticos?',
        description: 'ACV hemorrágico previo, ACV isquémico < 6 meses, neoplasia SNC, trauma mayor reciente, sangrado activo.',
        options: [
          { label: 'Sí, están contraindicados', nextId: 'end_atc_demorada', variant: 'destructive' },
          { label: 'No tiene contraindicaciones', nextId: 'end_fibrinolisis_in_situ', variant: 'default' }
        ]
      },
      'q_contraindicaciones_lisis_2': {
        id: 'q_contraindicaciones_lisis_2',
        type: 'question',
        title: '¿El paciente tiene contraindicaciones absolutas para Fibrinolíticos?',
        options: [
          { label: 'Sí, están contraindicados', nextId: 'end_traslado_urgente', variant: 'destructive' },
          { label: 'No tiene contraindicaciones', nextId: 'end_farmacoinvasiva', variant: 'default' }
        ]
      },
      'end_atc_90': {
        id: 'end_atc_90',
        type: 'endpoint',
        title: 'Angioplastia Primaria de Urgencia',
        description: 'Estrategia de elección.',
        recommendation: 'Activar equipo de Hemodinamia inmediatamente. Objetivo: Tiempo Puerta-Balón < 60-90 minutos.',
        color: 'red'
      },
      'end_traslado_atc': {
        id: 'end_traslado_atc',
        type: 'endpoint',
        title: 'Traslado Rápido para ATC Primaria',
        description: 'El tiempo estimado permite el beneficio de la ATC sobre la lisis.',
        recommendation: 'Gestionar traslado urgente en ambulancia UTIM a centro con red. Objetivo: Tiempo FMC-Balón < 120 minutos.',
        color: 'yellow'
      },
      'end_fibrinolisis_in_situ': {
        id: 'end_fibrinolisis_in_situ',
        type: 'endpoint',
        title: 'Fibrinólisis Inmediata',
        description: 'Si la ATC primaria va a demorar > 90 min en el propio centro, la lisis temprana es superior.',
        recommendation: 'Administrar fibrinolíticos (Tenecteplase/Estreptoquinasa) en < 10 minutos (Tiempo Puerta-Aguja).',
        alert: 'Tras la lisis, considerar angiografía de rescate (si falla) o sistemática a las 2-24hs.',
        color: 'red'
      },
      'end_farmacoinvasiva': {
        id: 'end_farmacoinvasiva',
        type: 'endpoint',
        title: 'Estrategia Farmacoinvasiva',
        description: 'La demora en el traslado justifica reperfusión farmacológica inicial.',
        recommendation: 'Fibrinólisis inmediata (< 10 min) en el centro actual. Posteriormente, trasladar siempre a centro con hemodinamia.',
        alert: 'Si hay criterios de reperfusión clínica/ECG: ATC electiva en 2-24hs. Si no hay reperfusión: ATC de Rescate inmediata.',
        color: 'yellow'
      },
      'end_atc_demorada': {
        id: 'end_atc_demorada',
        type: 'endpoint',
        title: 'Angioplastia Primaria (A pesar de demora)',
        description: 'Debido a las contraindicaciones de la lisis, la única opción es la ATC.',
        recommendation: 'Proceder con ATC primaria asumiendo la demora > 90 min.',
        color: 'red'
      },
      'end_traslado_urgente': {
        id: 'end_traslado_urgente',
        type: 'endpoint',
        title: 'Traslado Urgente para ATC',
        description: 'Contraindicación de lisis. Riesgo inaceptable de sangrado.',
        recommendation: 'Traslado urgente bajo máximo soporte médico para ATC primaria, priorizando celeridad.',
        color: 'red'
      }
    }
  },
  {
    slug: 'ic-stevenson',
    name: 'Perfiles Hemodinámicos ICA',
    category: 'Insuficiencia Cardíaca',
    source: 'Consenso SAC Insuficiencia Cardíaca (2023)',
    description: 'Clasificación clínica de Stevenson y manejo inicial en la Insuficiencia Cardíaca Aguda.',
    relatedGuidelines: ['ic-2023', 'consenso-ic-aguda', 'consenso-insuficiencia-cardiaca', 'insuficiencia cardíaca'],
    initialNodeId: 'q_congestion',
    nodes: {
      'q_congestion': {
        id: 'q_congestion',
        type: 'question',
        title: '¿Presenta signos clínicos de Congestión?',
        description: 'Ortopnea, disnea paroxística nocturna, RHY+, ingurgitación yugular, rales crepitantes, edemas periféricos, hepatomegalia, ascitis.',
        options: [
          { label: 'Sí (Paciente Húmedo)', nextId: 'q_hipoperfusion_humedo', variant: 'default' },
          { label: 'No (Paciente Seco)', nextId: 'q_hipoperfusion_seco', variant: 'outline' }
        ]
      },
      'q_hipoperfusion_humedo': {
        id: 'q_hipoperfusion_humedo',
        type: 'question',
        title: '¿Presenta signos clínicos de Hipoperfusión Periférica?',
        description: 'Extremidades frías/sudorosas, oliguria, obnubilación, lactato elevado, pulso fino. (La presión arterial puede estar normal o baja).',
        options: [
          { label: 'Sí (Paciente Frío)', nextId: 'end_perfil_c', variant: 'default' },
          { label: 'No (Paciente Caliente)', nextId: 'end_perfil_b', variant: 'outline' }
        ]
      },
      'q_hipoperfusion_seco': {
        id: 'q_hipoperfusion_seco',
        type: 'question',
        title: '¿Presenta signos clínicos de Hipoperfusión Periférica?',
        options: [
          { label: 'Sí (Paciente Frío)', nextId: 'end_perfil_l', variant: 'default' },
          { label: 'No (Paciente Caliente)', nextId: 'end_perfil_a', variant: 'outline' }
        ]
      },
      'end_perfil_b': {
        id: 'end_perfil_b',
        type: 'endpoint',
        title: 'Perfil B: Húmedo y Caliente',
        description: 'Es el escenario más frecuente (70-80%). Predomina la congestión por retención hídrica o redistribución de flujo, manteniendo adecuada perfusión tisular.',
        recommendation: '1. Diuréticos de asa IV (ej. Furosemida 20-40 mg IV inicial).\n2. Vasodilatadores IV (Nitroglicerina/Nitroprusiato) si la PA sistólica > 110 mmHg.\n3. O2 si SatO2 < 90%.',
        color: 'yellow'
      },
      'end_perfil_c': {
        id: 'end_perfil_c',
        type: 'endpoint',
        title: 'Perfil C: Húmedo y Frío',
        description: 'Shock Cardiogénico o Bajo Gasto Severo. Situación crítica de alta mortalidad.',
        recommendation: '1. Inotrópicos IV (Dobutamina, Milrinona o Levosimendán) para mejorar el gasto.\n2. Vasopresores (Noradrenalina) si PAS < 90 mmHg con hipoperfusión extrema.\n3. Diuréticos con mucha precaución (pueden empeorar el shock).\n4. Evaluar Asistencia Ventricular Mecánica (BCIAo).',
        alert: 'Internación urgente en Unidad Coronaria / Terapia Intensiva.',
        color: 'red'
      },
      'end_perfil_l': {
        id: 'end_perfil_l',
        type: 'endpoint',
        title: 'Perfil L: Seco y Frío',
        description: 'Bajo gasto cardíaco oculto, depleción severa de volumen (por exceso de diuréticos previos) o disfunción severa del VD.',
        recommendation: '1. Prueba cuidadosa de fluidos (retos de solución fisiológica).\n2. Si no mejora tras fluidos o hay empeoramiento, requerirá inotrópicos IV.',
        alert: 'Vigilar estrechamente aparición de rales durante la expansión.',
        color: 'yellow'
      },
      'end_perfil_a': {
        id: 'end_perfil_a',
        type: 'endpoint',
        title: 'Perfil A: Seco y Caliente',
        description: 'Paciente compensado hemodinámicamente, sin signos de falla cardíaca descompensada actual.',
        recommendation: '1. Optimizar tratamiento médico óptimo vía oral (BB, IECA/ARNI, iSGLT2, ARM).\n2. Considerar y descartar otras causas de sus síntomas (pulmonares, anemia, etc.).',
        color: 'green'
      }
    }
  },
  {
    slug: 'fa-aguda',
    name: 'Fibrilación Auricular Aguda',
    category: 'Arritmias',
    source: 'Consenso SAC Arritmias (2022)',
    description: 'Manejo inicial en guardia de la Fibrilación Auricular de reciente comienzo.',
    relatedGuidelines: ['fa-2022', 'consenso-arritmias', 'consenso-fibrilacion-auricular', 'fibrilación auricular'],
    initialNodeId: 'q_inestabilidad',
    nodes: {
      'q_inestabilidad': {
        id: 'q_inestabilidad',
        type: 'question',
        title: '¿El paciente presenta Inestabilidad Hemodinámica?',
        description: 'Hipotensión severa o shock, isquemia coronaria activa, insuficiencia cardíaca aguda/edema agudo de pulmón, o alteración del sensorio.',
        options: [
          { label: 'Sí, está inestable', nextId: 'end_cve_urgente', variant: 'destructive' },
          { label: 'No, está hemodinámicamente estable', nextId: 'q_tiempo_evolucion', variant: 'default' }
        ]
      },
      'end_cve_urgente': {
        id: 'end_cve_urgente',
        type: 'endpoint',
        title: 'Cardioversión Eléctrica (CVE) de Urgencia',
        description: 'El compromiso vital exige revertir el ritmo de inmediato, independientemente del estado de anticoagulación o riesgo de trombo.',
        recommendation: 'Realizar Cardioversión Eléctrica sincronizada (150-200 J bifásico) urgente bajo sedación profunda. Iniciar heparina periprocedimiento.',
        color: 'red'
      },
      'q_tiempo_evolucion': {
        id: 'q_tiempo_evolucion',
        type: 'question',
        title: '¿Cuál es el tiempo de evolución clínica (desde el inicio de los síntomas)?',
        options: [
          { label: 'Menor a 48 horas (Certero)', nextId: 'q_anticoagulado_48', variant: 'default' },
          { label: 'Mayor a 48 hs o Incierto', nextId: 'q_ete_disponible', variant: 'outline' }
        ]
      },
      'q_anticoagulado_48': {
        id: 'q_anticoagulado_48',
        type: 'question',
        title: 'Al ser < 48hs el riesgo embólico es bajo, pero: ¿El paciente venía anticoagulado previamente y está en rango (ej. DOACs regulares o RIN 2-3)?',
        options: [
          { label: 'Sí, está anticoagulado', nextId: 'end_cv_inmediata', variant: 'default' },
          { label: 'No estaba anticoagulado', nextId: 'end_iniciar_aco_cv', variant: 'outline' }
        ]
      },
      'end_cv_inmediata': {
        id: 'end_cv_inmediata',
        type: 'endpoint',
        title: 'Cardioversión Electiva (Ritmo)',
        description: 'Condiciones ideales para intentar restaurar el ritmo sinusal de forma segura.',
        recommendation: 'Estrategia de Control de Ritmo: Cardioversión Farmacológica (Amiodarona o Flecainida) o Cardioversión Eléctrica electiva según preferencia.',
        color: 'green'
      },
      'end_iniciar_aco_cv': {
        id: 'end_iniciar_aco_cv',
        type: 'endpoint',
        title: 'Anticoagular y Cardiovertir',
        description: 'Aunque lleve < 48hs, las guías SAC recomiendan cobertura anticoagulante periprocedimiento.',
        recommendation: '1. Iniciar HBPM (Enoxaparina) o HNF IV o un DOAC lo antes posible.\n2. Proceder a Cardioversión Farmacológica o Eléctrica.\n3. Mantener anticoagulación por 4 semanas post-cardioversión (si CHA2DS2-VASc requiere crónico, mantener de por vida).',
        color: 'yellow'
      },
      'q_ete_disponible': {
        id: 'q_ete_disponible',
        type: 'question',
        title: 'Al ser > 48hs (o tiempo incierto), existe alto riesgo de trombo auricular. ¿Se dispone de ETE (Ecocardiograma Transesofágico) para descartarlo ahora?',
        options: [
          { label: 'Sí, hay ETE disponible', nextId: 'end_ete_guiado', variant: 'default' },
          { label: 'No hay ETE disponible o no se realizará', nextId: 'end_control_frecuencia', variant: 'outline' }
        ]
      },
      'end_ete_guiado': {
        id: 'end_ete_guiado',
        type: 'endpoint',
        title: 'Cardioversión Guiada por ETE',
        description: 'El ETE permite acortar las 3 semanas de anticoagulación previa.',
        recommendation: 'Realizar ETE.\n- Si NO hay trombo en AI/OAI: Iniciar Heparina y Cardiovertir. Mantener ACO mínimo 4 semanas.\n- Si HAY trombo: Control de frecuencia, anticoagular 3 semanas y repetir ETE.',
        color: 'yellow'
      },
      'end_control_frecuencia': {
        id: 'end_control_frecuencia',
        type: 'endpoint',
        title: 'Control de Frecuencia y ACO Diferida',
        description: 'No es seguro cardiovertir ahora por riesgo de ACV embólico.',
        recommendation: '1. Control de Frecuencia Cardíaca (< 110 lpm) usando Betabloqueantes (Bisoprolol/Atenolol) o Calcioantagonistas (Diltiazem) IV o VO.\n2. Iniciar Anticoagulación oral completa.\n3. Tras 3 semanas de ACO efectiva ininterrumpida, programar Cardioversión electiva ambulatoria.',
        color: 'yellow'
      }
    }
  }
];

export function getAlgorithmBySlug(slug: string): AlgorithmConfig | undefined {
  return ALGORITMOS.find(a => a.slug === slug);
}
