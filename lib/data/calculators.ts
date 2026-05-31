export type InputType = 'radio' | 'checkbox' | 'number' | 'slider';

export interface CalculatorOption {
  id: string;
  label: string;
  points: number;
}

export interface CalculatorInput {
  id: string;
  label: string;
  description?: string;
  type: InputType;
  options?: CalculatorOption[]; // Para radio/checkbox
  min?: number; // Para number/slider
  max?: number;
  step?: number;
  unit?: string;
}

export interface Interpretation {
  scoreRange: [number, number];
  risk: string;
  recommendation: string;
  color: 'green' | 'yellow' | 'red' | 'blue'; // Tailwind color variants
}

export interface CalculatorConfig {
  slug: string;
  name: string;
  category: string;
  description: string;
  reference?: string;
  relatedGuidelines?: string[]; // Slugs de guías clínicas asociadas
  inputs: CalculatorInput[];
  calculate: (values: Record<string, any>) => number;
  interpret: (score: number, values?: Record<string, any>) => Interpretation;
}

export const calculators: CalculatorConfig[] = [
  {
    slug: 'chads2-vasc',
    name: 'CHA₂DS₂-VASc',
    category: 'Arritmias',
    description: 'Estimación del riesgo de ACV en pacientes con Fibrilación Auricular no valvular.',
    reference: 'Lip GY, et al. Chest. 2010;137(2):263-72.',
    relatedGuidelines: ['fa-2022', 'consenso-fibrilacion-auricular', 'consenso-arritmias'],
    inputs: [
      {
        id: 'insuficiencia_cardiaca',
        label: 'Insuficiencia Cardíaca Congestiva / Disfunción VI',
        type: 'checkbox',
        options: [{ id: 'c', label: 'Sí', points: 1 }]
      },
      {
        id: 'hipertension',
        label: 'Hipertensión',
        type: 'checkbox',
        options: [{ id: 'h', label: 'Sí', points: 1 }]
      },
      {
        id: 'edad',
        label: 'Edad',
        type: 'radio',
        options: [
          { id: 'age_lt_65', label: '< 65 años', points: 0 },
          { id: 'age_65_74', label: '65 - 74 años', points: 1 },
          { id: 'age_gte_75', label: '≥ 75 años', points: 2 }
        ]
      },
      {
        id: 'diabetes',
        label: 'Diabetes Mellitus',
        type: 'checkbox',
        options: [{ id: 'd', label: 'Sí', points: 1 }]
      },
      {
        id: 'acv',
        label: 'Historia de ACV, AIT o tromboembolismo',
        type: 'checkbox',
        options: [{ id: 's2', label: 'Sí', points: 2 }]
      },
      {
        id: 'enfermedad_vascular',
        label: 'Enfermedad Vascular (IAM, EVP, placa aórtica)',
        type: 'checkbox',
        options: [{ id: 'v', label: 'Sí', points: 1 }]
      },
      {
        id: 'sexo',
        label: 'Categoría de Sexo (Mujer)',
        type: 'checkbox',
        options: [{ id: 'sc', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.insuficiencia_cardiaca === 'c') score += 1;
      if (values.hipertension === 'h') score += 1;
      if (values.edad === 'age_65_74') score += 1;
      if (values.edad === 'age_gte_75') score += 2;
      if (values.diabetes === 'd') score += 1;
      if (values.acv === 's2') score += 2;
      if (values.enfermedad_vascular === 'v') score += 1;
      if (values.sexo === 'sc') score += 1;
      return score;
    },
    interpret: (score, values) => {
      // Regla especial: Mujer sin otros factores = Riesgo bajo
      const isFemaleOnly = score === 1 && values?.sexo === 'sc';
      
      if (score === 0 || isFemaleOnly) {
        return {
          scoreRange: [0, score],
          risk: 'Bajo',
          recommendation: 'Sin terapia antitrombótica (0% riesgo de ACV/año)',
          color: 'green'
        };
      } else if (score === 1 && values?.sexo !== 'sc' || (score === 2 && values?.sexo === 'sc')) {
        return {
          scoreRange: [1, score],
          risk: 'Moderado',
          recommendation: 'Considerar anticoagulación oral (1.3-2.2% riesgo de ACV/año)',
          color: 'yellow'
        };
      } else {
        return {
          scoreRange: [2, 9],
          risk: 'Alto',
          recommendation: 'Anticoagulación oral recomendada (≥3.2% riesgo de ACV/año)',
          color: 'red'
        };
      }
    }
  },
  {
    slug: 'has-bled',
    name: 'HAS-BLED Score',
    category: 'Fibrilación Auricular',
    description: 'Evalúa el riesgo de sangrado mayor a 1 año en Fibrilación Auricular en anticoagulación',
    reference: 'Pisters R, et al. Chest. 2010;138(5):1093-100.',
    inputs: [
      {
        id: 'hipertension',
        label: 'Hipertensión no controlada (>160 mmHg sistólica)',
        type: 'checkbox',
        options: [{ id: 'h', label: 'Sí', points: 1 }]
      },
      {
        id: 'renal',
        label: 'Función Renal Anormal (Diálisis, Tx, Cr >200 µmol/L)',
        type: 'checkbox',
        options: [{ id: 'a_renal', label: 'Sí', points: 1 }]
      },
      {
        id: 'hepatica',
        label: 'Función Hepática Anormal (Cirrosis, Bilirrubina >2x, AST/ALT >3x)',
        type: 'checkbox',
        options: [{ id: 'a_hepatic', label: 'Sí', points: 1 }]
      },
      {
        id: 'stroke',
        label: 'Historia de ACV previo',
        type: 'checkbox',
        options: [{ id: 's', label: 'Sí', points: 1 }]
      },
      {
        id: 'sangrado',
        label: 'Historia o predisposición al sangrado (anemia, diátesis)',
        type: 'checkbox',
        options: [{ id: 'b', label: 'Sí', points: 1 }]
      },
      {
        id: 'labile_inr',
        label: 'INR Lábil (si toma warfarina, TTR < 60%)',
        type: 'checkbox',
        options: [{ id: 'l', label: 'Sí', points: 1 }]
      },
      {
        id: 'edad',
        label: 'Edad avanzada (> 65 años)',
        type: 'checkbox',
        options: [{ id: 'e', label: 'Sí', points: 1 }]
      },
      {
        id: 'drogas',
        label: 'Uso concomitante de fármacos que aumentan sangrado (AINEs, antiplaquetarios)',
        type: 'checkbox',
        options: [{ id: 'd_drugs', label: 'Sí', points: 1 }]
      },
      {
        id: 'alcohol',
        label: 'Consumo excesivo de alcohol (≥ 8 tragos/semana)',
        type: 'checkbox',
        options: [{ id: 'd_alcohol', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.hipertension === 'h') score += 1;
      if (values.renal === 'a_renal') score += 1;
      if (values.hepatica === 'a_hepatic') score += 1;
      if (values.stroke === 's') score += 1;
      if (values.sangrado === 'b') score += 1;
      if (values.labile_inr === 'l') score += 1;
      if (values.edad === 'e') score += 1;
      if (values.drogas === 'd_drugs') score += 1;
      if (values.alcohol === 'd_alcohol') score += 1;
      return score;
    },
    interpret: (score) => {
      if (score < 3) {
        return {
          scoreRange: [0, 2],
          risk: 'Bajo a Moderado',
          recommendation: 'Riesgo bajo/moderado de sangrado (1.13-1.88 sangrados por 100 pacientes-año). Iniciar anticoagulación con precaución estándar.',
          color: 'green'
        };
      } else {
        return {
          scoreRange: [3, 9],
          risk: 'Alto',
          recommendation: 'Alto riesgo de sangrado (≥3.74 sangrados por 100 pacientes-año). Corregir factores reversibles y programar seguimientos clínicos más frecuentes.',
          color: 'red'
        };
      }
    }
  },
  {
    slug: 'timi-stemi',
    name: 'TIMI Risk Score for STEMI',
    category: 'Síndrome Coronario Agudo',
    description: 'Estima la mortalidad a 30 días en pacientes con IAM con elevación del ST',
    reference: 'Morrow DA, et al. Circulation. 2000;102(17):2031-7.',
    inputs: [
      {
        id: 'edad',
        label: 'Edad',
        type: 'radio',
        options: [
          { id: 'age_lt_65', label: '< 65 años', points: 0 },
          { id: 'age_65_74', label: '65 - 74 años', points: 2 },
          { id: 'age_gte_75', label: '≥ 75 años', points: 3 }
        ]
      },
      {
        id: 'factores_riesgo',
        label: 'Diabetes, Hipertensión o Angina previa',
        type: 'checkbox',
        options: [{ id: 'fr', label: 'Sí', points: 1 }]
      },
      {
        id: 'sistolica',
        label: 'Presión Arterial Sistólica < 100 mmHg',
        type: 'checkbox',
        options: [{ id: 'sbp', label: 'Sí', points: 3 }]
      },
      {
        id: 'frecuencia',
        label: 'Frecuencia Cardíaca > 100 lpm',
        type: 'checkbox',
        options: [{ id: 'hr', label: 'Sí', points: 2 }]
      },
      {
        id: 'killip',
        label: 'Clasificación Killip II-IV',
        type: 'checkbox',
        options: [{ id: 'k', label: 'Sí', points: 2 }]
      },
      {
        id: 'peso',
        label: 'Peso < 67 kg',
        type: 'checkbox',
        options: [{ id: 'w', label: 'Sí', points: 1 }]
      },
      {
        id: 'tiempo',
        label: 'Tiempo a la reperfusión > 4 hs',
        type: 'checkbox',
        options: [{ id: 't', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.edad === 'age_65_74') score += 2;
      if (values.edad === 'age_gte_75') score += 3;
      if (values.factores_riesgo === 'fr') score += 1;
      if (values.sistolica === 'sbp') score += 3;
      if (values.frecuencia === 'hr') score += 2;
      if (values.killip === 'k') score += 2;
      if (values.peso === 'w') score += 1;
      if (values.tiempo === 't') score += 1;
      return score;
    },
    interpret: (score) => {
      const mortalityRates: Record<number, string> = {
        0: '0.8%', 1: '1.6%', 2: '2.2%', 3: '4.4%', 4: '7.3%',
        5: '12%', 6: '16%', 7: '23%', 8: '27%', 9: '36%',
        10: '36%', 11: '36%', 12: '36%', 13: '36%', 14: '36%'
      };
      
      const tasa = mortalityRates[score] || '>36%';
      
      let riskLevel = 'Bajo';
      let color: 'green' | 'yellow' | 'red' = 'green';
      if (score >= 4 && score <= 6) { riskLevel = 'Moderado'; color = 'yellow'; }
      if (score >= 7) { riskLevel = 'Alto'; color = 'red'; }

      return {
        scoreRange: [score, score],
        risk: riskLevel,
        recommendation: `Mortalidad estimada a 30 días: ${tasa}.`,
        color: color
      };
    }
  },
  {
    slug: 'heart-score',
    name: 'HEART Score',
    category: 'Síndrome Coronario Agudo',
    description: 'Estratifica el riesgo a 6 semanas de eventos cardíacos adversos mayores (MACE)',
    reference: 'Six AJ, et al. Neth Heart J. 2008;16(6):191-6.',
    inputs: [
      {
        id: 'historia',
        label: 'Historia Clínica',
        type: 'radio',
        options: [
          { id: 'h_alta', label: 'Altamente sospechosa', points: 2 },
          { id: 'h_mod', label: 'Moderadamente sospechosa', points: 1 },
          { id: 'h_baja', label: 'Ligeramente sospechosa', points: 0 }
        ]
      },
      {
        id: 'ecg',
        label: 'Electrocardiograma (ECG)',
        type: 'radio',
        options: [
          { id: 'e_st', label: 'Depresión significativa del ST', points: 2 },
          { id: 'e_inesp', label: 'Alteraciones inespecíficas de repolarización', points: 1 },
          { id: 'e_norm', label: 'Normal', points: 0 }
        ]
      },
      {
        id: 'edad',
        label: 'Edad',
        type: 'radio',
        options: [
          { id: 'a_mayor', label: '≥ 65 años', points: 2 },
          { id: 'a_media', label: '45 - 64 años', points: 1 },
          { id: 'a_menor', label: '< 45 años', points: 0 }
        ]
      },
      {
        id: 'riesgo',
        label: 'Factores de Riesgo',
        description: 'HTA, Dislipemia, Diabetes, Obesidad, Tabaquismo, AHF',
        type: 'radio',
        options: [
          { id: 'r_alto', label: '≥ 3 factores o enf. ateroesclerótica conocida', points: 2 },
          { id: 'r_mod', label: '1 - 2 factores', points: 1 },
          { id: 'r_bajo', label: 'Sin factores conocidos', points: 0 }
        ]
      },
      {
        id: 'troponina',
        label: 'Troponina Inicial',
        type: 'radio',
        options: [
          { id: 't_alta', label: '≥ 3x límite superior normal', points: 2 },
          { id: 't_mod', label: '1 - 3x límite superior normal', points: 1 },
          { id: 't_norm', label: '≤ límite normal', points: 0 }
        ]
      }
    ],
    calculate: (values) => {
      let score = 0;
      // Sumar los puntos del radio seleccionado
      Object.keys(values).forEach(key => {
        const val = values[key];
        if (val === 'h_alta' || val === 'e_st' || val === 'a_mayor' || val === 'r_alto' || val === 't_alta') score += 2;
        if (val === 'h_mod' || val === 'e_inesp' || val === 'a_media' || val === 'r_mod' || val === 't_mod') score += 1;
      });
      return score;
    },
    interpret: (score) => {
      if (score <= 3) {
        return {
          scoreRange: [0, 3],
          risk: 'Bajo',
          recommendation: '0.9 - 1.7% riesgo de MACE a 6 semanas. Considerar el alta temprana.',
          color: 'green'
        };
      } else if (score >= 4 && score <= 6) {
        return {
          scoreRange: [4, 6],
          risk: 'Moderado',
          recommendation: '12 - 16.6% riesgo de MACE a 6 semanas. Sugiere internación u observación para evaluación clínica.',
          color: 'yellow'
        };
      } else {
        return {
          scoreRange: [7, 10],
          risk: 'Alto',
          recommendation: '50 - 65% riesgo de MACE a 6 semanas. Sugiere intervencionismo temprano.',
          color: 'red'
        };
      }
    }
  },
  {
    slug: 'wells-tep',
    name: 'Criterios de Wells (TEP)',
    category: 'Tromboembolismo Pulmonar',
    description: 'Probabilidad clínica pretest para Tromboembolismo Pulmonar',
    reference: 'Wells PS, et al. Thromb Haemost. 2000;83(3):416-20.',
    inputs: [
      {
        id: 'sintomas_tvp',
        label: 'Signos y síntomas clínicos de TVP',
        type: 'checkbox',
        options: [{ id: 's_tvp', label: 'Sí', points: 3 }]
      },
      {
        id: 'diagnostico_alt',
        label: 'TEP es el diagnóstico #1 o igualmente probable que el alternativo',
        type: 'checkbox',
        options: [{ id: 'd_tep', label: 'Sí', points: 3 }]
      },
      {
        id: 'fc',
        label: 'Frecuencia Cardíaca > 100 lpm',
        type: 'checkbox',
        options: [{ id: 'fc_alta', label: 'Sí', points: 1.5 }]
      },
      {
        id: 'inmovilizacion',
        label: 'Inmovilización ≥ 3 días o cirugía en últimas 4 semanas',
        type: 'checkbox',
        options: [{ id: 'inmov', label: 'Sí', points: 1.5 }]
      },
      {
        id: 'historia_tep',
        label: 'Historia previa de TEP o TVP',
        type: 'checkbox',
        options: [{ id: 'h_tep', label: 'Sí', points: 1.5 }]
      },
      {
        id: 'hemoptisis',
        label: 'Hemoptisis',
        type: 'checkbox',
        options: [{ id: 'hemo', label: 'Sí', points: 1 }]
      },
      {
        id: 'cancer',
        label: 'Malignidad con tratamiento activo en últimos 6 meses (o paliativo)',
        type: 'checkbox',
        options: [{ id: 'ca', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.sintomas_tvp) score += 3;
      if (values.diagnostico_alt) score += 3;
      if (values.fc) score += 1.5;
      if (values.inmovilizacion) score += 1.5;
      if (values.historia_tep) score += 1.5;
      if (values.hemoptisis) score += 1;
      if (values.cancer) score += 1;
      return score;
    },
    interpret: (score) => {
      // Interpretación a 2 niveles (Simplificado)
      if (score <= 4) {
        return {
          scoreRange: [0, 4],
          risk: 'TEP Improbable',
          recommendation: 'Considerar solicitar un Dímero-D. Si es negativo, el TEP está descartado.',
          color: 'green'
        };
      } else {
        return {
          scoreRange: [4.5, 12.5],
          risk: 'TEP Probable',
          recommendation: 'Solicitar AngioTC de tórax (CTA) para confirmar el diagnóstico.',
          color: 'red'
        };
      }
    }
  },
  {
    slug: 'crusade',
    name: 'CRUSADE Score',
    category: 'Síndrome Coronario Agudo',
    description: 'Estima el riesgo basal de sangrado mayor intrahospitalario en NSTEMI',
    reference: 'Subherwal S, et al. Circulation. 2009;119(14):1873-82.',
    inputs: [
      {
        id: 'hematocrito',
        label: 'Hematocrito Base (%)',
        type: 'radio',
        options: [
          { id: 'h_muybajo', label: '< 31%', points: 9 },
          { id: 'h_bajo', label: '31 - 33.9%', points: 7 },
          { id: 'h_medio', label: '34 - 39.9%', points: 3 },
          { id: 'h_normal', label: '≥ 40%', points: 0 }
        ]
      },
      {
        id: 'clearance',
        label: 'Clearance de Creatinina (mL/min)',
        type: 'radio',
        options: [
          { id: 'c_muybajo', label: '≤ 15', points: 39 },
          { id: 'c_bajo', label: '> 15 - 30', points: 35 },
          { id: 'c_medio', label: '> 30 - 60', points: 28 },
          { id: 'c_alto', label: '> 60 - 90', points: 17 },
          { id: 'c_normal', label: '> 90', points: 0 }
        ]
      },
      {
        id: 'fc',
        label: 'Frecuencia Cardíaca (lpm)',
        type: 'radio',
        options: [
          { id: 'fc_muyalta', label: '≥ 121', points: 11 },
          { id: 'fc_alta', label: '111 - 120', points: 10 },
          { id: 'fc_medalt', label: '101 - 110', points: 8 },
          { id: 'fc_media', label: '91 - 100', points: 6 },
          { id: 'fc_baja', label: '81 - 90', points: 3 },
          { id: 'fc_muybaja', label: '71 - 80', points: 1 },
          { id: 'fc_normal', label: '≤ 70', points: 0 }
        ]
      },
      {
        id: 'pas',
        label: 'Presión Arterial Sistólica (mmHg)',
        type: 'radio',
        options: [
          { id: 'p_muybaja', label: '≤ 90', points: 10 },
          { id: 'p_baja', label: '91 - 100', points: 8 },
          { id: 'p_media', label: '101 - 120', points: 5 },
          { id: 'p_alta', label: '121 - 180', points: 1 },
          { id: 'p_muyalta', label: '≥ 181', points: 5 } // Nota: alta y muy alta suman puntos distintos al normal
        ]
      },
      {
        id: 'sexo',
        label: 'Sexo Femenino',
        type: 'checkbox',
        options: [{ id: 'mujer', label: 'Sí', points: 8 }]
      },
      {
        id: 'icc',
        label: 'Signos de Insuficiencia Cardíaca al ingreso',
        type: 'checkbox',
        options: [{ id: 'icc', label: 'Sí', points: 7 }]
      },
      {
        id: 'vascular',
        label: 'Enfermedad Vascular Previa (EVP o ACV)',
        type: 'checkbox',
        options: [{ id: 'vasc', label: 'Sí', points: 6 }]
      },
      {
        id: 'diabetes',
        label: 'Diabetes Mellitus',
        type: 'checkbox',
        options: [{ id: 'dm', label: 'Sí', points: 6 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      Object.keys(values).forEach(key => {
        const val = values[key];
        // Buscar el puntaje correspondiente en la config iterando sobre todos los inputs
        if (typeof val === 'string') {
          if (val === 'h_muybajo') score += 9;
          else if (val === 'h_bajo') score += 7;
          else if (val === 'h_medio') score += 3;
          else if (val === 'c_muybajo') score += 39;
          else if (val === 'c_bajo') score += 35;
          else if (val === 'c_medio') score += 28;
          else if (val === 'c_alto') score += 17;
          else if (val === 'fc_muyalta') score += 11;
          else if (val === 'fc_alta') score += 10;
          else if (val === 'fc_medalt') score += 8;
          else if (val === 'fc_media') score += 6;
          else if (val === 'fc_baja') score += 3;
          else if (val === 'fc_muybaja') score += 1;
          else if (val === 'p_muybaja') score += 10;
          else if (val === 'p_baja') score += 8;
          else if (val === 'p_media') score += 5;
          else if (val === 'p_alta') score += 1;
          else if (val === 'p_muyalta') score += 5;
          else if (val === 'mujer') score += 8;
          else if (val === 'icc') score += 7;
          else if (val === 'vasc') score += 6;
          else if (val === 'dm') score += 6;
        }
      });
      return score;
    },
    interpret: (score) => {
      if (score <= 20) {
        return {
          scoreRange: [0, 20], risk: 'Muy Bajo',
          recommendation: '3.1% de riesgo de sangrado mayor hospitalario.', color: 'green'
        };
      } else if (score >= 21 && score <= 30) {
        return {
          scoreRange: [21, 30], risk: 'Bajo',
          recommendation: '5.5% de riesgo de sangrado mayor hospitalario.', color: 'green'
        };
      } else if (score >= 31 && score <= 40) {
        return {
          scoreRange: [31, 40], risk: 'Moderado',
          recommendation: '8.6% de riesgo de sangrado mayor hospitalario.', color: 'yellow'
        };
      } else if (score >= 41 && score <= 50) {
        return {
          scoreRange: [41, 50], risk: 'Alto',
          recommendation: '11.9% de riesgo de sangrado mayor hospitalario.', color: 'red'
        };
      } else {
        return {
          scoreRange: [51, 100], risk: 'Muy Alto',
          recommendation: '19.5% de riesgo de sangrado mayor hospitalario. Extremar precauciones.', color: 'red'
        };
      }
    }
  },
  {
    slug: 'canadian-syncope',
    name: 'Canadian Syncope Risk Score',
    category: 'Síncope',
    description: 'Riesgo de eventos adversos graves a 30 días en pacientes con síncope',
    reference: 'Thiruganasambandamoorthy V, et al. CMAJ. 2016;188(12):E289-98.',
    inputs: [
      {
        id: 'predisposicion',
        label: 'Predisposición vasovagal',
        description: 'Estar de pie prolongado, estímulo doloroso, etc.',
        type: 'checkbox',
        options: [{ id: 'vaso', label: 'Sí (-1 punto)', points: -1 }]
      },
      {
        id: 'historia_cv',
        label: 'Historia de enfermedad cardíaca',
        description: 'Enfermedad coronaria, IC, valvulopatía, etc.',
        type: 'checkbox',
        options: [{ id: 'cv', label: 'Sí', points: 1 }]
      },
      {
        id: 'ecg_anormal',
        label: 'ECG Anormal o no sinusal',
        description: 'Cualquier ritmo distinto al sinusal, o cambios agudos de isquemia',
        type: 'checkbox',
        options: [{ id: 'ecg_ab', label: 'Sí', points: 2 }]
      },
      {
        id: 'pas_extrema',
        label: 'Presión Arterial Sistólica < 90 o > 180 mmHg en urgencias',
        type: 'checkbox',
        options: [{ id: 'pas', label: 'Sí', points: 2 }]
      },
      {
        id: 'troponina',
        label: 'Troponina elevada (> 99 percentilo)',
        type: 'checkbox',
        options: [{ id: 'tropo', label: 'Sí', points: 2 }]
      },
      {
        id: 'eje',
        label: 'Eje QRS anormal (< -30° o > 100°)',
        type: 'checkbox',
        options: [{ id: 'eje', label: 'Sí', points: 1 }]
      },
      {
        id: 'qrs_ancho',
        label: 'Duración del QRS > 130 ms',
        type: 'checkbox',
        options: [{ id: 'qrs', label: 'Sí', points: 1 }]
      },
      {
        id: 'qtc_largo',
        label: 'Intervalo QTc > 480 ms',
        type: 'checkbox',
        options: [{ id: 'qtc', label: 'Sí', points: 2 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.predisposicion) score -= 1;
      if (values.historia_cv) score += 1;
      if (values.ecg_anormal) score += 2;
      if (values.pas_extrema) score += 2;
      if (values.troponina) score += 2;
      if (values.eje) score += 1;
      if (values.qrs_ancho) score += 1;
      if (values.qtc_largo) score += 2;
      return score;
    },
    interpret: (score) => {
      if (score <= 0) {
        return {
          scoreRange: [-3, 0], risk: 'Muy Bajo',
          recommendation: '< 1% de riesgo de evento adverso grave a 30 días. Alta médica.', color: 'green'
        };
      } else if (score >= 1 && score <= 3) {
        return {
          scoreRange: [1, 3], risk: 'Bajo',
          recommendation: '1 - 3% de riesgo de evento adverso grave. Considerar observación breve.', color: 'yellow'
        };
      } else if (score >= 4 && score <= 5) {
        return {
          scoreRange: [4, 5], risk: 'Moderado',
          recommendation: '8 - 12% de riesgo de evento adverso grave. Requiere monitoreo y estudio.', color: 'red'
        };
      } else {
        return {
          scoreRange: [6, 11], risk: 'Alto a Muy Alto',
          recommendation: '> 20% de riesgo de evento adverso grave. Admisión hospitalaria obligatoria.', color: 'red'
        };
      }
    }
  },
  {
    slug: 'grace',
    name: 'GRACE Score (2.0)',
    category: 'Síndrome Coronario Agudo',
    description: 'Calcula la mortalidad a 6 meses en pacientes con SCA (STEMI y NSTEMI)',
    reference: 'Fox KA, et al. BMJ. 2006;333(7578):1091.',
    inputs: [
      {
        id: 'edad',
        label: 'Edad (años)',
        type: 'number',
        min: 18, max: 120, unit: 'años'
      },
      {
        id: 'fc',
        label: 'Frecuencia Cardíaca (lpm)',
        type: 'number',
        min: 20, max: 300, unit: 'lpm'
      },
      {
        id: 'pas',
        label: 'Presión Arterial Sistólica (mmHg)',
        type: 'number',
        min: 40, max: 300, unit: 'mmHg'
      },
      {
        id: 'creatinina',
        label: 'Creatinina Sérica (mg/dL)',
        type: 'number',
        min: 0.1, max: 15, step: 0.1, unit: 'mg/dL'
      },
      {
        id: 'killip',
        label: 'Clase Killip',
        type: 'radio',
        options: [
          { id: 'k1', label: 'I (Sin signos de IC)', points: 0 },
          { id: 'k2', label: 'II (Rales, S3, ingurgitación yugular)', points: 20 },
          { id: 'k3', label: 'III (Edema agudo de pulmón)', points: 39 },
          { id: 'k4', label: 'IV (Shock cardiogénico)', points: 59 }
        ]
      },
      {
        id: 'paro',
        label: 'Paro cardíaco al ingreso',
        type: 'checkbox',
        options: [{ id: 'paro', label: 'Sí', points: 39 }]
      },
      {
        id: 'st',
        label: 'Desviación del segmento ST',
        type: 'checkbox',
        options: [{ id: 'st', label: 'Sí', points: 28 }]
      },
      {
        id: 'enzimas',
        label: 'Elevación de enzimas cardíacas (Troponinas)',
        type: 'checkbox',
        options: [{ id: 'enz', label: 'Sí', points: 14 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      
      const age = values.edad || 0;
      if (age > 0) {
        if (age <= 39) score += 17;
        else if (age <= 49) score += 34;
        else if (age <= 59) score += 50;
        else if (age <= 69) score += 66;
        else if (age <= 79) score += 83;
        else if (age <= 89) score += 91;
        else if (age >= 90) score += 100;
      }
      
      const hr = values.fc || 0;
      if (hr > 0) {
        if (hr <= 69) score += 3;
        else if (hr <= 89) score += 9;
        else if (hr <= 109) score += 14;
        else if (hr <= 149) score += 23;
        else if (hr <= 199) score += 35;
        else if (hr >= 200) score += 46;
      }
      
      const sbp = values.pas || 0;
      if (sbp > 0) {
        if (sbp < 80) score += 58;
        else if (sbp <= 99) score += 53;
        else if (sbp <= 119) score += 43;
        else if (sbp <= 139) score += 34;
        else if (sbp <= 159) score += 24;
        else if (sbp <= 199) score += 10;
        else if (sbp >= 200) score += 0;
      }
      
      const cr = values.creatinina || 0;
      if (cr > 0) {
        if (cr <= 0.39) score += 1;
        else if (cr <= 0.79) score += 4;
        else if (cr <= 1.19) score += 7;
        else if (cr <= 1.59) score += 10;
        else if (cr <= 1.99) score += 13;
        else if (cr <= 3.99) score += 21;
        else if (cr >= 4.0) score += 28;
      }

      if (values.killip === 'k2') score += 20;
      if (values.killip === 'k3') score += 39;
      if (values.killip === 'k4') score += 59;
      
      if (values.paro) score += 39;
      if (values.st) score += 28;
      if (values.enzimas) score += 14;
      
      return score;
    },
    interpret: (score, values) => {
      // Requiere que se hayan llenado los inputs numéricos críticos
      if (!values?.edad || !values?.fc || !values?.pas || !values?.creatinina) {
        return {
          scoreRange: [0, score], risk: 'Incompleto',
          recommendation: 'Llene todos los valores numéricos (Edad, FC, PAS, Creatinina) para obtener el riesgo.', color: 'blue'
        };
      }

      if (score <= 108) {
        return {
          scoreRange: [0, 108], risk: 'Bajo',
          recommendation: '< 1% mortalidad intrahospitalaria. Manejo conservador o estrategia invasiva diferida.', color: 'green'
        };
      } else if (score >= 109 && score <= 140) {
        return {
          scoreRange: [109, 140], risk: 'Moderado',
          recommendation: '1 - 3% mortalidad intrahospitalaria. Estrategia invasiva temprana (<72 hs).', color: 'yellow'
        };
      } else {
        return {
          scoreRange: [141, 300], risk: 'Alto',
          recommendation: '> 3% mortalidad intrahospitalaria. Estrategia invasiva temprana urgente (<24 hs).', color: 'red'
        };
      }
    }
  },
  {
    slug: 'h2fpef',
    name: 'H₂FPEF Score',
    category: 'Insuficiencia Cardíaca',
    description: 'Diagnóstico de Insuficiencia Cardíaca con Fracción de Eyección Preservada (HFpEF) en pacientes con disnea',
    reference: 'Reddy YN, et al. Circulation. 2018;138(9):861-870.',
    inputs: [
      {
        id: 'heavy',
        label: 'Heavy (Obesidad): IMC > 30 kg/m²',
        type: 'checkbox',
        options: [{ id: 'heavy', label: 'Sí', points: 2 }]
      },
      {
        id: 'htn',
        label: 'Hypertensive (Hipertensión): Uso de ≥ 2 drogas antihipertensivas',
        type: 'checkbox',
        options: [{ id: 'htn', label: 'Sí', points: 1 }]
      },
      {
        id: 'af',
        label: 'Fibrilación Auricular: Paroxística o persistente',
        type: 'checkbox',
        options: [{ id: 'af', label: 'Sí', points: 3 }]
      },
      {
        id: 'pulmonary',
        label: 'Pulmonary Hypertension: PSAP > 35 mmHg por ecocardiografía',
        type: 'checkbox',
        options: [{ id: 'pulm', label: 'Sí', points: 1 }]
      },
      {
        id: 'elder',
        label: 'Elder (Anciano): Edad > 60 años',
        type: 'checkbox',
        options: [{ id: 'elder', label: 'Sí', points: 1 }]
      },
      {
        id: 'filling',
        label: 'Filling Pressures: E/e\' > 9 en ecocardiografía',
        type: 'checkbox',
        options: [{ id: 'fill', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.heavy) score += 2;
      if (values.htn) score += 1;
      if (values.af) score += 3;
      if (values.pulmonary) score += 1;
      if (values.elder) score += 1;
      if (values.filling) score += 1;
      return score;
    },
    interpret: (score) => {
      if (score <= 1) {
        return {
          scoreRange: [0, 1], risk: 'Baja Probabilidad',
          recommendation: 'HFpEF descartado (Probabilidad < 25%). Busque causas no cardíacas de disnea.', color: 'green'
        };
      } else if (score >= 2 && score <= 5) {
        return {
          scoreRange: [2, 5], risk: 'Probabilidad Intermedia',
          recommendation: 'El diagnóstico no es seguro (Probabilidad 25-80%). Se requieren más pruebas (ej. Eco de estrés o cateterismo derecho).', color: 'yellow'
        };
      } else {
        return {
          scoreRange: [6, 9], risk: 'Alta Probabilidad',
          recommendation: 'Diagnóstico de HFpEF confirmado (Probabilidad > 90%). Iniciar manejo de IC.', color: 'red'
        };
      }
    }
  },
  {
    slug: 'qtc',
    name: 'QT Corregido (Fórmula de Bazett)',
    category: 'Parámetros Clínicos Básicos',
    description: 'Calcula el intervalo QT corregido por la frecuencia cardíaca',
    reference: 'Bazett HC. Heart. 1920;7(4):353-370.',
    inputs: [
      {
        id: 'qt',
        label: 'Intervalo QT medido (ms)',
        type: 'number',
        min: 200, max: 800, unit: 'ms'
      },
      {
        id: 'fc',
        label: 'Frecuencia Cardíaca (lpm)',
        type: 'number',
        min: 30, max: 250, unit: 'lpm'
      },
      {
        id: 'sexo',
        label: 'Sexo',
        type: 'radio',
        options: [
          { id: 'm', label: 'Hombre', points: 0 },
          { id: 'f', label: 'Mujer', points: 0 }
        ]
      }
    ],
    calculate: (values) => {
      const qt = values.qt || 0;
      const fc = values.fc || 0;
      if (qt === 0 || fc === 0) return 0;
      
      const rrSegundos = 60 / fc;
      const qtc = qt / Math.sqrt(rrSegundos);
      return Math.round(qtc);
    },
    interpret: (score, values) => {
      if (score === 0) {
        return { scoreRange: [0, 0], risk: 'Incompleto', recommendation: 'Llene QT y FC.', color: 'blue' };
      }
      
      const isFemale = values?.sexo === 'f';
      const upperLimit = isFemale ? 460 : 440;
      
      if (score <= upperLimit) {
        return {
          scoreRange: [0, upperLimit], risk: 'Normal',
          recommendation: `QTc dentro de parámetros normales (límite: ${upperLimit} ms).`, color: 'green'
        };
      } else if (score > upperLimit && score < 500) {
        return {
          scoreRange: [upperLimit + 1, 499], risk: 'Prolongado',
          recommendation: 'QTc prolongado. Revisar medicación concomitante y alteraciones hidroelectrolíticas.', color: 'yellow'
        };
      } else {
        return {
          scoreRange: [500, 1000], risk: 'Peligro Inminente',
          recommendation: 'QTc ≥ 500 ms. Alto riesgo de Torsades de Pointes. Suspender drogas QT prolongadoras.', color: 'red'
        };
      }
    }
  },
  {
    slug: 'clearance-creatinina',
    name: 'Clearance de Creatinina (Cockcroft-Gault)',
    category: 'Parámetros Clínicos Básicos',
    description: 'Estima la tasa de filtrado glomerular para ajuste de dosis de fármacos',
    reference: 'Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41.',
    inputs: [
      {
        id: 'edad',
        label: 'Edad (años)',
        type: 'number',
        min: 18, max: 120, unit: 'años'
      },
      {
        id: 'peso',
        label: 'Peso (kg)',
        type: 'number',
        min: 30, max: 300, unit: 'kg'
      },
      {
        id: 'creatinina',
        label: 'Creatinina Sérica (mg/dL)',
        type: 'number',
        min: 0.1, max: 15, step: 0.1, unit: 'mg/dL'
      },
      {
        id: 'sexo',
        label: 'Sexo',
        type: 'radio',
        options: [
          { id: 'm', label: 'Hombre', points: 0 },
          { id: 'f', label: 'Mujer (aplica factor 0.85)', points: 0 }
        ]
      }
    ],
    calculate: (values) => {
      const edad = values.edad || 0;
      const peso = values.peso || 0;
      const cr = values.creatinina || 0;
      
      if (edad === 0 || peso === 0 || cr === 0) return 0;
      
      let crcl = ((140 - edad) * peso) / (72 * cr);
      if (values.sexo === 'f') {
        crcl = crcl * 0.85;
      }
      
      return Math.round(crcl * 10) / 10; // Redondear a 1 decimal
    },
    interpret: (score) => {
      if (score === 0) {
        return { scoreRange: [0, 0], risk: 'Incompleto', recommendation: 'Complete edad, peso y creatinina.', color: 'blue' };
      }
      
      if (score >= 90) {
        return { scoreRange: [90, 300], risk: 'Estadio 1', recommendation: 'Filtrado glomerular normal o elevado. No requiere ajuste de dosis.', color: 'green' };
      } else if (score >= 60 && score < 90) {
        return { scoreRange: [60, 89], risk: 'Estadio 2', recommendation: 'Descenso leve del filtrado. Vigilar fármacos nefrotóxicos.', color: 'green' };
      } else if (score >= 30 && score < 60) {
        return { scoreRange: [30, 59], risk: 'Estadio 3', recommendation: 'Descenso moderado. Ajuste de dosis obligatorio (ej: DOACs, antibióticos).', color: 'yellow' };
      } else if (score >= 15 && score < 30) {
        return { scoreRange: [15, 29], risk: 'Estadio 4', recommendation: 'Descenso severo. Preparar para terapia de reemplazo renal. Ajuste estricto.', color: 'red' };
      } else {
        return { scoreRange: [0, 14], risk: 'Estadio 5', recommendation: 'Fallo renal terminal (ESKD).', color: 'red' };
      }
    }
  },
  {
    slug: 'dapt',
    name: 'DAPT Score',
    category: 'Síndrome Coronario Agudo',
    description: 'Decisión sobre duración de la Doble Antiagregación Plaquetaria post-stent (12 vs 30 meses)',
    reference: 'Yeh RW, et al. JAMA. 2016;315(16):1735-49.',
    inputs: [
      {
        id: 'edad',
        label: 'Edad',
        type: 'radio',
        options: [
          { id: 'e_joven', label: '< 65 años', points: 0 },
          { id: 'e_media', label: '65 - 74 años', points: -1 },
          { id: 'e_mayor', label: '≥ 75 años', points: -2 }
        ]
      },
      {
        id: 'tabaco',
        label: 'Tabaquismo activo (en el último año)',
        type: 'checkbox',
        options: [{ id: 'tab', label: 'Sí', points: 1 }]
      },
      {
        id: 'diabetes',
        label: 'Diabetes Mellitus',
        type: 'checkbox',
        options: [{ id: 'dm', label: 'Sí', points: 1 }]
      },
      {
        id: 'iam',
        label: 'Infarto Agudo de Miocardio al ingreso',
        type: 'checkbox',
        options: [{ id: 'iam', label: 'Sí', points: 1 }]
      },
      {
        id: 'pci_previa',
        label: 'Intervencionismo previo o IAM previo',
        type: 'checkbox',
        options: [{ id: 'pci', label: 'Sí', points: 1 }]
      },
      {
        id: 'stent_chico',
        label: 'Diámetro del stent < 3 mm',
        type: 'checkbox',
        options: [{ id: 'stent', label: 'Sí', points: 1 }]
      },
      {
        id: 'paclitaxel',
        label: 'Stent liberador de Paclitaxel',
        type: 'checkbox',
        options: [{ id: 'pacli', label: 'Sí', points: 1 }]
      },
      {
        id: 'icc',
        label: 'Insuficiencia Cardíaca o FEVI < 30%',
        type: 'checkbox',
        options: [{ id: 'icc', label: 'Sí', points: 2 }]
      },
      {
        id: 'injerto',
        label: 'Intervencionismo en puente venoso (Vein graft PCI)',
        type: 'checkbox',
        options: [{ id: 'vein', label: 'Sí', points: 2 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.edad === 'e_media') score -= 1;
      if (values.edad === 'e_mayor') score -= 2;
      if (values.tabaco) score += 1;
      if (values.diabetes) score += 1;
      if (values.iam) score += 1;
      if (values.pci_previa) score += 1;
      if (values.stent_chico) score += 1;
      if (values.paclitaxel) score += 1;
      if (values.icc) score += 2;
      if (values.injerto) score += 2;
      return score;
    },
    interpret: (score) => {
      if (score >= 2) {
        return {
          scoreRange: [2, 10], risk: 'Beneficio Alto',
          recommendation: 'Puntaje ≥ 2. Mayor beneficio con DAPT prolongada (30 meses) vs riesgo de sangrado.', color: 'green'
        };
      } else {
        return {
          scoreRange: [-2, 1], risk: 'Beneficio Bajo / Riesgo de Sangrado Alto',
          recommendation: 'Puntaje < 2. Menor beneficio isquémico y mayor riesgo de sangrado. Considerar régimen estándar de 12 meses.', color: 'yellow'
        };
      }
    }
  },
  {
    slug: 'pesi',
    name: 'PESI Score',
    category: 'Tromboembolismo Pulmonar',
    description: 'Predice la mortalidad a 30 días en pacientes con TEP confirmado',
    reference: 'Aujesky D, et al. Am J Respir Crit Care Med. 2005;172(8):1041-6.',
    inputs: [
      {
        id: 'edad',
        label: 'Edad (años)',
        description: 'La edad en años se suma directamente al puntaje',
        type: 'number',
        min: 18, max: 120, unit: 'años'
      },
      {
        id: 'sexo',
        label: 'Sexo Masculino',
        type: 'checkbox',
        options: [{ id: 'm', label: 'Sí', points: 10 }]
      },
      {
        id: 'cancer',
        label: 'Historia de Cáncer',
        type: 'checkbox',
        options: [{ id: 'ca', label: 'Sí', points: 30 }]
      },
      {
        id: 'icc',
        label: 'Insuficiencia Cardíaca',
        type: 'checkbox',
        options: [{ id: 'icc', label: 'Sí', points: 10 }]
      },
      {
        id: 'epoc',
        label: 'Enfermedad Pulmonar Crónica',
        type: 'checkbox',
        options: [{ id: 'epoc', label: 'Sí', points: 10 }]
      },
      {
        id: 'fc',
        label: 'Frecuencia Cardíaca ≥ 110 lpm',
        type: 'checkbox',
        options: [{ id: 'fc', label: 'Sí', points: 20 }]
      },
      {
        id: 'pas',
        label: 'Presión Arterial Sistólica < 100 mmHg',
        type: 'checkbox',
        options: [{ id: 'pas', label: 'Sí', points: 30 }]
      },
      {
        id: 'fr',
        label: 'Frecuencia Respiratoria ≥ 30 rpm',
        type: 'checkbox',
        options: [{ id: 'fr', label: 'Sí', points: 20 }]
      },
      {
        id: 'temp',
        label: 'Temperatura < 36°C',
        type: 'checkbox',
        options: [{ id: 'temp', label: 'Sí', points: 20 }]
      },
      {
        id: 'conciencia',
        label: 'Estado mental alterado',
        type: 'checkbox',
        options: [{ id: 'mental', label: 'Sí', points: 60 }]
      },
      {
        id: 'sat',
        label: 'Saturación de O₂ Arterial < 90%',
        type: 'checkbox',
        options: [{ id: 'sat', label: 'Sí', points: 20 }]
      }
    ],
    calculate: (values) => {
      let score = values.edad || 0;
      if (values.sexo) score += 10;
      if (values.cancer) score += 30;
      if (values.icc) score += 10;
      if (values.epoc) score += 10;
      if (values.fc) score += 20;
      if (values.pas) score += 30;
      if (values.fr) score += 20;
      if (values.temp) score += 20;
      if (values.conciencia) score += 60;
      if (values.sat) score += 20;
      return score;
    },
    interpret: (score) => {
      if (score === 0) {
        return { scoreRange: [0, 0], risk: 'Incompleto', recommendation: 'Debe ingresar la edad como mínimo.', color: 'blue' };
      }
      
      if (score <= 65) {
        return { scoreRange: [0, 65], risk: 'Clase I (Muy Bajo)', recommendation: 'Mortalidad 0-1.6%. Considerar tratamiento ambulatorio.', color: 'green' };
      } else if (score >= 66 && score <= 85) {
        return { scoreRange: [66, 85], risk: 'Clase II (Bajo)', recommendation: 'Mortalidad 1.7-3.5%. Tratamiento ambulatorio posible.', color: 'green' };
      } else if (score >= 86 && score <= 105) {
        return { scoreRange: [86, 105], risk: 'Clase III (Moderado)', recommendation: 'Mortalidad 3.2-7.1%. Requiere internación.', color: 'yellow' };
      } else if (score >= 106 && score <= 125) {
        return { scoreRange: [106, 125], risk: 'Clase IV (Alto)', recommendation: 'Mortalidad 4.0-11.4%. Requiere internación.', color: 'red' };
      } else {
        return { scoreRange: [126, 400], risk: 'Clase V (Muy Alto)', recommendation: 'Mortalidad 10-24.5%. Alta probabilidad de deterioro crítico.', color: 'red' };
      }
    }
  },
  {
    slug: 'geneva-revisado',
    name: 'Geneva Score (Revisado)',
    category: 'Tromboembolismo Pulmonar',
    description: 'Probabilidad clínica de Tromboembolismo Pulmonar',
    reference: 'Le Gal G, et al. Ann Intern Med. 2006;144(3):165-71.',
    inputs: [
      {
        id: 'edad',
        label: 'Edad > 65 años',
        type: 'checkbox',
        options: [{ id: 'g_edad', label: 'Sí', points: 1 }]
      },
      {
        id: 'tep_previo',
        label: 'TVP o TEP previo',
        type: 'checkbox',
        options: [{ id: 'g_prev', label: 'Sí', points: 3 }]
      },
      {
        id: 'cirugia',
        label: 'Cirugía bajo anestesia general o fractura en último mes',
        type: 'checkbox',
        options: [{ id: 'g_cir', label: 'Sí', points: 2 }]
      },
      {
        id: 'cancer',
        label: 'Cáncer activo (o curado en < 1 año)',
        type: 'checkbox',
        options: [{ id: 'g_ca', label: 'Sí', points: 2 }]
      },
      {
        id: 'dolor_pierna',
        label: 'Dolor unilateral en miembro inferior',
        type: 'checkbox',
        options: [{ id: 'g_dolor', label: 'Sí', points: 3 }]
      },
      {
        id: 'hemoptisis',
        label: 'Hemoptisis',
        type: 'checkbox',
        options: [{ id: 'g_hemo', label: 'Sí', points: 2 }]
      },
      {
        id: 'fc',
        label: 'Frecuencia Cardíaca (lpm)',
        type: 'radio',
        options: [
          { id: 'fc_normal', label: '< 75', points: 0 },
          { id: 'fc_media', label: '75 - 94', points: 3 },
          { id: 'fc_alta', label: '≥ 95', points: 5 }
        ]
      },
      {
        id: 'edema',
        label: 'Dolor a la palpación venosa profunda Y edema unilateral',
        type: 'checkbox',
        options: [{ id: 'g_edema', label: 'Sí', points: 4 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.edad) score += 1;
      if (values.tep_previo) score += 3;
      if (values.cirugia) score += 2;
      if (values.cancer) score += 2;
      if (values.dolor_pierna) score += 3;
      if (values.hemoptisis) score += 2;
      if (values.fc === 'fc_media') score += 3;
      if (values.fc === 'fc_alta') score += 5;
      if (values.edema) score += 4;
      return score;
    },
    interpret: (score) => {
      if (score <= 3) {
        return {
          scoreRange: [0, 3], risk: 'Baja Probabilidad (8%)',
          recommendation: 'TEP improbable. Evaluar Dímero-D.', color: 'green'
        };
      } else if (score >= 4 && score <= 10) {
        return {
          scoreRange: [4, 10], risk: 'Probabilidad Intermedia (28%)',
          recommendation: 'Se requieren más estudios (AngioTC o Dímero-D según algoritmos).', color: 'yellow'
        };
      } else {
        return {
          scoreRange: [11, 22], risk: 'Alta Probabilidad (74%)',
          recommendation: 'Alto riesgo de TEP. Proceder directo a imágenes (AngioTC) e iniciar anticoagulación empírica si no hay contraindicaciones.', color: 'red'
        };
      }
    }
  },
  {
    slug: 'rcri',
    name: 'Índice de Lee (RCRI)',
    category: 'Riesgo Quirúrgico',
    description: 'Revised Cardiac Risk Index para evaluación cardiovascular preoperatoria',
    reference: 'Lee TH, et al. Circulation. 1999;100(10):1043-9.',
    inputs: [
      {
        id: 'cirugia',
        label: 'Cirugía de Alto Riesgo',
        description: 'Intraperitoneal, intratorácica o vascular suprainguinal',
        type: 'checkbox',
        options: [{ id: 'rcri_cx', label: 'Sí', points: 1 }]
      },
      {
        id: 'isquemia',
        label: 'Cardiopatía Isquémica',
        description: 'Historia de IAM, Q patológicas, prueba de esfuerzo +, angina actual',
        type: 'checkbox',
        options: [{ id: 'rcri_isq', label: 'Sí', points: 1 }]
      },
      {
        id: 'icc',
        label: 'Insuficiencia Cardíaca Congestiva',
        description: 'Historia de IC, edema pulmonar, disnea paroxística nocturna, o rales crepitantes',
        type: 'checkbox',
        options: [{ id: 'rcri_icc', label: 'Sí', points: 1 }]
      },
      {
        id: 'acv',
        label: 'Historia de ACV o AIT',
        type: 'checkbox',
        options: [{ id: 'rcri_acv', label: 'Sí', points: 1 }]
      },
      {
        id: 'insulina',
        label: 'Tratamiento preoperatorio con Insulina',
        type: 'checkbox',
        options: [{ id: 'rcri_insu', label: 'Sí', points: 1 }]
      },
      {
        id: 'creatinina',
        label: 'Creatinina Sérica > 2.0 mg/dL',
        type: 'checkbox',
        options: [{ id: 'rcri_cr', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      Object.keys(values).forEach(k => { if (values[k]) score += 1; });
      return score;
    },
    interpret: (score) => {
      const risks = {
        0: 'Riesgo Clase I (0.4 - 0.5% MACE)',
        1: 'Riesgo Clase II (0.9 - 1.3% MACE)',
        2: 'Riesgo Clase III (2.4 - 3.6% MACE)',
        3: 'Riesgo Clase IV (≥ 5.4 - 9.1% MACE)'
      };
      const riskText = score >= 3 ? risks[3] : risks[score as keyof typeof risks];
      
      let color: 'green' | 'yellow' | 'red' = 'green';
      if (score === 1) color = 'yellow';
      if (score >= 2) color = 'red';
      
      return {
        scoreRange: [score, score], risk: riskText,
        recommendation: score >= 2 
          ? 'MACE (Muerte, IAM, Paro) elevado. Requiere evaluación prequirúrgica cardiológica estricta (Considerar biomarcadores/Holter/EcoEstrés según guía).'
          : 'Bajo riesgo de MACE. Puede proceder a cirugía sin estudios cardiológicos extensos si tiene buena capacidad funcional.',
        color: color
      };
    }
  },
  {
    slug: 'scai-shock',
    name: 'SCAI Shock Stage',
    category: 'Shock y UCO',
    description: 'Clasificación del shock cardiogénico de la Society for Cardiovascular Angiography and Interventions',
    reference: 'Baran DA, et al. Catheter Cardiovasc Interv. 2019;94(1):29-37.',
    inputs: [
      {
        id: 'estado',
        label: 'Seleccione el peor escenario clínico actual del paciente:',
        type: 'radio',
        options: [
          { id: 'scai_e', label: 'Extremis: Paro en curso, RCP con soporte mecánico, o colapso circulatorio absoluto con hipotensión profunda refractaria.', points: 5 },
          { id: 'scai_d', label: 'Deteriorating (Deterioro): Empeorando a pesar del tratamiento (requiriendo escalar drogas/soporte mecánico).', points: 4 },
          { id: 'scai_c', label: 'Classic Shock: Hipoperfusión evidente requiriendo inotrópicos, vasopresores o soporte mecánico para mantener presión.', points: 3 },
          { id: 'scai_b', label: 'Beginning Shock: Hipotensión relativa (ej: PAS < 90) o taquicardia, pero SIN signos de hipoperfusión tisular.', points: 2 },
          { id: 'scai_a', label: 'At Risk: Estable (PA normal, perfusión normal), pero con patología predisponente (ej: IAM extenso, miocarditis aguda).', points: 1 }
        ]
      }
    ],
    calculate: (values) => {
      if (values.estado === 'scai_e') return 5;
      if (values.estado === 'scai_d') return 4;
      if (values.estado === 'scai_c') return 3;
      if (values.estado === 'scai_b') return 2;
      if (values.estado === 'scai_a') return 1;
      return 0;
    },
    interpret: (score) => {
      switch (score) {
        case 5:
          return { scoreRange: [5, 5], risk: 'Estadio E (Extremis)', recommendation: 'Mortalidad muy alta. Colapso circulatorio. Requiere RCP o soporte circulatorio mecánico (VA-ECMO) inmediato si aplica.', color: 'red' };
        case 4:
          return { scoreRange: [4, 4], risk: 'Estadio D (Deteriorating)', recommendation: 'Mortalidad alta. Falla de las terapias iniciales. Evaluar escalamiento rápido a dispositivos de asistencia ventricular.', color: 'red' };
        case 3:
          return { scoreRange: [3, 3], risk: 'Estadio C (Classic Cardiogenic Shock)', recommendation: 'Hipoperfusión tisular (Lactato > 2, alteración mental). Optimizar hemodinamia en UCO (vasopresores, cateterismo, inotrópicos).', color: 'yellow' };
        case 2:
          return { scoreRange: [2, 2], risk: 'Estadio B (Beginning Shock)', recommendation: 'Hipotensión o taquicardia sin hipoperfusión. Vigilar estrechamente y tratar causa subyacente (fluidos, revascularización).', color: 'green' };
        case 1:
        default:
          return { scoreRange: [1, 1], risk: 'Estadio A (At Risk)', recommendation: 'Paciente estable pero con riesgo. Prevenir progresión. Monitorización estándar en unidad crítica o intermedia.', color: 'green' };
      }
    }
  },
  {
    slug: 'mayo-amiloidosis',
    name: 'Estadificación de Mayo 2012 (Amiloidosis AL)',
    category: 'Amiloidosis',
    description: 'Estadificación pronóstica de Amiloidosis AL basada en biomarcadores',
    reference: 'Kumar S, et al. J Clin Oncol. 2012;30(9):989-95.',
    inputs: [
      {
        id: 'ntprobnp',
        label: 'NT-proBNP ≥ 1800 pg/mL',
        type: 'checkbox',
        options: [{ id: 'bnp', label: 'Sí', points: 1 }]
      },
      {
        id: 'troponina',
        label: 'Troponina T de alta sensibilidad ≥ 0.025 ng/mL (o TnI ≥ 0.1)',
        type: 'checkbox',
        options: [{ id: 'tropo', label: 'Sí', points: 1 }]
      },
      {
        id: 'dflc',
        label: 'Diferencia de Cadenas Ligeras Libres (dFLC) ≥ 18 mg/dL',
        type: 'checkbox',
        options: [{ id: 'flc', label: 'Sí', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.ntprobnp) score += 1;
      if (values.troponina) score += 1;
      if (values.dflc) score += 1;
      return score;
    },
    interpret: (score) => {
      switch (score) {
        case 3:
          return { scoreRange: [3, 3], risk: 'Estadio IV', recommendation: 'Supervivencia global mediana: 5.8 meses.', color: 'red' };
        case 2:
          return { scoreRange: [2, 2], risk: 'Estadio III', recommendation: 'Supervivencia global mediana: 14 meses.', color: 'red' };
        case 1:
          return { scoreRange: [1, 1], risk: 'Estadio II', recommendation: 'Supervivencia global mediana: 40.3 meses.', color: 'yellow' };
        case 0:
        default:
          return { scoreRange: [0, 0], risk: 'Estadio I', recommendation: 'Supervivencia global mediana: 94.1 meses.', color: 'green' };
      }
    }
  },
  {
    slug: 'bsa',
    name: 'Superficie Corporal (BSA - Mosteller)',
    category: 'Parámetros Clínicos Básicos',
    description: 'Cálculo de la Superficie Corporal para indexar parámetros ecocardiográficos y dosis de fármacos',
    reference: 'Mosteller RD. N Engl J Med. 1987;317(17):1098.',
    inputs: [
      {
        id: 'peso',
        label: 'Peso (kg)',
        type: 'number',
        min: 2, max: 300, unit: 'kg'
      },
      {
        id: 'altura',
        label: 'Altura (cm)',
        type: 'number',
        min: 40, max: 250, unit: 'cm'
      }
    ],
    calculate: (values) => {
      const p = values.peso || 0;
      const a = values.altura || 0;
      if (p === 0 || a === 0) return 0;
      
      const bsa = Math.sqrt((p * a) / 3600);
      return Math.round(bsa * 100) / 100; // 2 decimales
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Incompleto', recommendation: 'Ingrese peso y altura.', color: 'blue' };
      return {
        scoreRange: [0, 5], risk: 'Superficie Corporal',
        recommendation: `BSA: ${score} m². Utilice este valor para indexar volúmenes ventriculares y auriculares en el ecocardiograma.`, color: 'green'
      };
    }
  },
  {
    slug: 'add-rs',
    name: 'Aortic Dissection Detection (ADD-RS)',
    category: 'Emergencias Aórticas',
    description: 'Estratifica el riesgo de Síndrome Aórtico Agudo en pacientes con dolor torácico',
    reference: 'Rogers AM, et al. Circulation. 2011;123(20):2213-21.',
    inputs: [
      {
        id: 'condiciones',
        label: 'Condiciones de Alto Riesgo',
        description: 'Marfan, Loeys-Dietz, historia familiar de patología aórtica, válvula aórtica bicúspide, manipulación aórtica reciente, aneurisma aórtico conocido',
        type: 'checkbox',
        options: [{ id: 'cond', label: 'Presente', points: 1 }]
      },
      {
        id: 'dolor',
        label: 'Características del Dolor de Alto Riesgo',
        description: 'Dolor de pecho, espalda o abdominal de inicio súbito, intensidad severa, o de calidad desgarradora/pulsátil',
        type: 'checkbox',
        options: [{ id: 'dolor', label: 'Presente', points: 1 }]
      },
      {
        id: 'examen',
        label: 'Hallazgos de Examen Físico de Alto Riesgo',
        description: 'Déficit de pulso, asimetría de PA, déficit neurológico focal, soplo de regurgitación aórtica nuevo, hipotensión o shock',
        type: 'checkbox',
        options: [{ id: 'examen', label: 'Presente', points: 1 }]
      }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.condiciones) score += 1;
      if (values.dolor) score += 1;
      if (values.examen) score += 1;
      return score;
    },
    interpret: (score) => {
      if (score === 0) {
        return { scoreRange: [0, 0], risk: 'Riesgo Bajo (ADD-RS 0)', recommendation: 'Solicitar Dímero-D. Si el Dímero-D es negativo (< 500 ng/mL), se excluye el diagnóstico de disección aórtica de forma segura.', color: 'green' };
      } else if (score === 1) {
        return { scoreRange: [1, 1], risk: 'Riesgo Intermedio (ADD-RS 1)', recommendation: 'Riesgo moderado. Evaluar según contexto clínico. Un Dímero-D negativo hace el diagnóstico muy improbable, pero considere AngioTC si la sospecha persiste.', color: 'yellow' };
      } else {
        return { scoreRange: [2, 3], risk: 'Riesgo Alto (ADD-RS > 1)', recommendation: 'Alta probabilidad de Síndrome Aórtico Agudo. Solicitar de urgencia una AngioTC de aorta toraco-abdominal o ETE. No retrasar imágenes por Dímero-D.', color: 'red' };
      }
    }
  },
  {
    slug: 'criterios-duke',
    name: 'Criterios de Duke Modificados',
    category: 'Parámetros Clínicos Básicos',
    description: 'Diagnóstico clínico de Endocarditis Infecciosa',
    reference: 'Li JS, et al. Clin Infect Dis. 2000;30(4):633-8.',
    inputs: [
      {
        id: 'criterios_mayores',
        label: 'Criterios Mayores',
        type: 'checkbox',
        options: [
          { id: 'hemocultivo', label: 'Hemocultivos positivos típicos (x2) o persistentes', points: 100 },
          { id: 'imagen', label: 'Evidencia en imagen de compromiso endocárdico (Vegetación, absceso, dehiscencia en Eco/PET/TC)', points: 100 }
        ]
      },
      {
        id: 'criterios_menores',
        label: 'Criterios Menores',
        type: 'checkbox',
        options: [
          { id: 'predisposicion', label: 'Condición cardíaca predisponente o uso de drogas IV', points: 10 },
          { id: 'fiebre', label: 'Fiebre ≥ 38.0°C', points: 10 },
          { id: 'vascular', label: 'Fenómenos vasculares (Embolos, infartos, aneurismas micóticos, Janeway)', points: 10 },
          { id: 'inmunologico', label: 'Fenómenos inmunológicos (Nódulos de Osler, manchas de Roth, Factor Reumatoideo)', points: 10 },
          { id: 'micro', label: 'Evidencia microbiológica que no cumple criterio mayor', points: 10 }
        ]
      }
    ],
    calculate: (values) => {
      let mayores = 0;
      let menores = 0;
      Object.keys(values).forEach(k => {
        if (values[k] === 'hemocultivo' || values[k] === 'imagen') mayores += 1;
        else if (['predisposicion', 'fiebre', 'vascular', 'inmunologico', 'micro'].includes(values[k])) menores += 1;
      });
      // Codificamos el score artificialmente: Mayores en centenas, menores en unidades
      return (mayores * 100) + menores;
    },
    interpret: (score) => {
      const mayores = Math.floor(score / 100);
      const menores = score % 100;
      
      const definitivo = (mayores >= 2) || (mayores === 1 && menores >= 3) || (menores >= 5);
      const posible = (mayores === 1 && menores >= 1) || (menores >= 3);
      
      if (definitivo) {
        return { scoreRange: [score, score], risk: 'Endocarditis Definitiva', recommendation: `${mayores} Criterios Mayores y ${menores} Criterios Menores. Cumple criterios para Endocarditis Infecciosa Definitiva.`, color: 'red' };
      } else if (posible) {
        return { scoreRange: [score, score], risk: 'Endocarditis Posible', recommendation: `${mayores} Criterios Mayores y ${menores} Criterios Menores. Endocarditis Infecciosa Posible.`, color: 'yellow' };
      } else {
        return { scoreRange: [score, score], risk: 'Endocarditis Rechazada', recommendation: `No cumple criterios suficientes para diagnóstico clínico (${mayores} mayores, ${menores} menores).`, color: 'green' };
      }
    }
  },
  {
    slug: 'timi-nstemi',
    name: 'TIMI Risk Score (NSTEMI)',
    category: 'Enfermedad Coronaria',
    description: 'Estima mortalidad, IAM o isquemia recurrente a 14 días en NSTEMI/Angina Inestable',
    reference: 'Antman EM, et al. JAMA. 2000;284(7):835-42.',
    inputs: [
      { id: 'edad', label: 'Edad ≥ 65 años', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'factores', label: '≥ 3 factores de riesgo CV (HTA, DBT, DLP, AF, Tabaquismo)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'estenosis', label: 'Estenosis coronaria conocida ≥ 50%', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'aas', label: 'Uso de aspirina en los últimos 7 días', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'angina', label: 'Angina severa (≥ 2 episodios en 24h)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'ecg', label: 'Desviación del segmento ST ≥ 0.5 mm', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'biomarcadores', label: 'Biomarcadores cardíacos elevados', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] }
    ],
    calculate: (values) => {
      let score = 0;
      if (values.edad) score += 1;
      if (values.factores) score += 1;
      if (values.estenosis) score += 1;
      if (values.aas) score += 1;
      if (values.angina) score += 1;
      if (values.ecg) score += 1;
      if (values.biomarcadores) score += 1;
      return score;
    },
    interpret: (score) => {
      if (score <= 2) return { scoreRange: [0, score], risk: 'Riesgo Bajo', recommendation: 'Mortalidad/IAM/Isquemia a 14 días: 4.7% - 8.3%', color: 'green' };
      if (score <= 4) return { scoreRange: [3, 4], risk: 'Riesgo Moderado', recommendation: 'Mortalidad/IAM/Isquemia a 14 días: 13.2% - 19.9%', color: 'yellow' };
      return { scoreRange: [5, 7], risk: 'Riesgo Alto', recommendation: 'Mortalidad/IAM/Isquemia a 14 días: 26.2% - 40.9%', color: 'red' };
    }
  },
  {
    slug: 'killip',
    name: 'Killip Class',
    category: 'Insuficiencia Cardíaca',
    description: 'Estratificación de riesgo clínico en pacientes con IAM',
    reference: 'Killip T, et al. Am J Cardiol. 1967;20(4):457-64.',
    inputs: [
      { id: 'clase', label: 'Hallazgos clínicos', type: 'radio', options: [
        { id: '1', label: 'Clase I: Sin congestión pulmonar o tercer ruido', points: 1 },
        { id: '2', label: 'Clase II: Rales basales, S3, o congestión yugular', points: 2 },
        { id: '3', label: 'Clase III: Edema agudo de pulmón', points: 3 },
        { id: '4', label: 'Clase IV: Shock cardiogénico', points: 4 }
      ] }
    ],
    calculate: (values) => Number(values.clase) || 1,
    interpret: (score) => {
      if (score === 1) return { scoreRange: [1, 1], risk: 'Killip I', recommendation: 'Mortalidad a 30 días estimada: ~6%', color: 'green' };
      if (score === 2) return { scoreRange: [2, 2], risk: 'Killip II', recommendation: 'Mortalidad a 30 días estimada: ~17%', color: 'yellow' };
      if (score === 3) return { scoreRange: [3, 3], risk: 'Killip III', recommendation: 'Mortalidad a 30 días estimada: ~38%', color: 'red' };
      return { scoreRange: [4, 4], risk: 'Killip IV', recommendation: 'Mortalidad a 30 días estimada: ~81%', color: 'red' };
    }
  },
  {
    slug: 'chads2',
    name: 'CHADS2 Score',
    category: 'Fibrilación Auricular',
    description: 'Score clásico de riesgo de ACV en Fibrilación Auricular.',
    reference: 'Gage BF, et al. JAMA. 2001;285(22):2864-70.',
    relatedGuidelines: ['fa-2022', 'consenso-fibrilacion-auricular', 'consenso-arritmias'],
    inputs: [
      { id: 'icc', label: 'Insuficiencia Cardíaca Congestiva (Historia)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'hta', label: 'Hipertensión', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'edad', label: 'Edad ≥ 75 años', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'dbts', label: 'Diabetes', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'acv', label: 'ACV/AIT previo', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 2 }] }
    ],
    calculate: (v) => (v.icc ? 1 : 0) + (v.hta ? 1 : 0) + (v.edad ? 1 : 0) + (v.dbts ? 1 : 0) + (v.acv ? 2 : 0),
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Bajo', recommendation: 'Riesgo ACV anual: 1.9%. AAS sugerida (según guías previas).', color: 'green' };
      if (score === 1) return { scoreRange: [1, 1], risk: 'Moderado', recommendation: 'Riesgo ACV anual: 2.8%. Considerar anticoagulación.', color: 'yellow' };
      return { scoreRange: [2, 6], risk: 'Alto', recommendation: 'Riesgo ACV anual: 4.0% - 18.2%. Anticoagulación indicada.', color: 'red' };
    }
  },
  {
    slug: 'atria',
    name: 'ATRIA Bleeding Risk',
    category: 'Fibrilación Auricular',
    description: 'Riesgo de sangrado mayor en pacientes con FA en anticoagulación',
    reference: 'Fang MC, et al. J Am Coll Cardiol. 2011;58(4):395-401.',
    inputs: [
      { id: 'anemia', label: 'Anemia (Hb <13 g/dL ♂ / <12 g/dL ♀)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 3 }] },
      { id: 'renal', label: 'Falla renal severa (eGFR <30 o diálisis)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 3 }] },
      { id: 'edad', label: 'Edad ≥ 75 años', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 2 }] },
      { id: 'sangrado', label: 'Sangrado previo (GI, intracraneal)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'hta', label: 'Historia de hipertensión', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] }
    ],
    calculate: (v) => (v.anemia ? 3 : 0) + (v.renal ? 3 : 0) + (v.edad ? 2 : 0) + (v.sangrado ? 1 : 0) + (v.hta ? 1 : 0),
    interpret: (score) => {
      if (score <= 3) return { scoreRange: [0, score], risk: 'Riesgo Bajo', recommendation: 'Incidencia sangrado: 0.8% anual.', color: 'green' };
      if (score === 4) return { scoreRange: [4, 4], risk: 'Riesgo Moderado', recommendation: 'Incidencia sangrado: 2.6% anual.', color: 'yellow' };
      return { scoreRange: [5, 10], risk: 'Riesgo Alto', recommendation: 'Incidencia sangrado: 5.8% anual.', color: 'red' };
    }
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco Syncope Rule',
    category: 'Síncope',
    description: 'Identifica pacientes con síncope con alto riesgo a 7 días',
    reference: 'Quinn J, et al. Ann Emerg Med. 2004;43(2):224-32.',
    inputs: [
      { id: 'chf', label: 'Historia de Insuficiencia Cardíaca', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'hct', label: 'Hematocrito < 30%', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'ecg', label: 'ECG anormal (no sinusal o cambios nuevos)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'sob', label: 'Disnea (Shortness of Breath) en guardia', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] },
      { id: 'sbp', label: 'PAS < 90 mmHg en el triage', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 1 }] }
    ],
    calculate: (v) => (v.chf || v.hct || v.ecg || v.sob || v.sbp) ? 1 : 0,
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Bajo Riesgo', recommendation: 'Seguro para alta domiciliaria (muy bajo riesgo de eventos a 7 días).', color: 'green' };
      return { scoreRange: [1, 1], risk: 'Alto Riesgo', recommendation: 'Regla Positiva (CHESS). Se sugiere observación, internación o estudios adicionales.', color: 'red' };
    }
  },
  {
    slug: 'egsys',
    name: 'EGSYS Syncope Score',
    category: 'Síncope',
    description: 'Evaluation of Guidelines in Syncope Study - Etiología cardíaca',
    reference: 'Del Rosso A, et al. Eur Heart J. 2008;29(2):226-34.',
    inputs: [
      { id: 'palp', label: 'Palpitaciones precendiendo el síncope', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 4 }] },
      { id: 'heartd', label: 'Enfermedad cardíaca conocida', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 3 }] },
      { id: 'ecg', label: 'ECG anormal', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 3 }] },
      { id: 'effort', label: 'Síncope durante esfuerzo físico', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 3 }] },
      { id: 'supine', label: 'Síncope en decúbito supino', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: 2 }] },
      { id: 'neuro', label: 'Pródromos autonómicos (náuseas/vómitos)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: -1 }] },
      { id: 'prec', label: 'Factores precipitantes (dolor, bipedestación)', type: 'checkbox', options: [{ id: 'y', label: 'Sí', points: -1 }] }
    ],
    calculate: (v) => {
      let score = 0;
      if (v.palp) score += 4;
      if (v.heartd) score += 3;
      if (v.ecg) score += 3;
      if (v.effort) score += 3;
      if (v.supine) score += 2;
      if (v.neuro) score -= 1;
      if (v.prec) score -= 1;
      return score;
    },
    interpret: (score) => {
      if (score < 3) return { scoreRange: [-2, 2], risk: 'Baja Probabilidad', recommendation: 'Síncope cardíaco improbable.', color: 'green' };
      if (score === 3) return { scoreRange: [3, 3], risk: 'Probabilidad Intermedia', recommendation: 'Evaluar clínicamente. Mortalidad 13%.', color: 'yellow' };
      return { scoreRange: [4, 15], risk: 'Alta Probabilidad', recommendation: 'Síncope cardíaco muy probable (Mortalidad >20%). Admisión.', color: 'red' };
    }
  },
  {
    slug: 'framingham-chf',
    name: 'Framingham HF Criteria',
    category: 'Insuficiencia Cardíaca',
    description: 'Criterios clínicos para diagnóstico de Insuficiencia Cardíaca',
    reference: 'McKee PA, et al. N Engl J Med. 1971;285(26):1441-6.',
    inputs: [
      { id: 'pnd', label: 'DPM o disnea de decúbito', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'yug', label: 'Ingurgitación yugular', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'rales', label: 'Estertores crepitantes', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'rx', label: 'Cardiomegalia en Rx', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'epa', label: 'Edema Agudo de Pulmón', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'gallop', label: 'Tercer ruido (S3)', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'pvp', label: 'PVC > 16 cmH2O', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'hep', label: 'Reflujo hepatoyugular positivo', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      { id: 'wl', label: 'Pérdida peso >4.5kg en 5 días bajo tratamiento', type: 'checkbox', options: [{ id: 'M', label: 'Mayor', points: 10 }] },
      
      { id: 'edema', label: 'Edema maleolar bilateral', type: 'checkbox', options: [{ id: 'm', label: 'Menor', points: 1 }] },
      { id: 'tos', label: 'Tos nocturna', type: 'checkbox', options: [{ id: 'm', label: 'Menor', points: 1 }] },
      { id: 'dys', label: 'Disnea de esfuerzo', type: 'checkbox', options: [{ id: 'm', label: 'Menor', points: 1 }] },
      { id: 'hepm', label: 'Hepatomegalia', type: 'checkbox', options: [{ id: 'm', label: 'Menor', points: 1 }] },
      { id: 'pleur', label: 'Derrame pleural', type: 'checkbox', options: [{ id: 'm', label: 'Menor', points: 1 }] },
      { id: 'tachy', label: 'Taquicardia (>120 lpm)', type: 'checkbox', options: [{ id: 'm', label: 'Menor', points: 1 }] }
    ],
    calculate: (v) => {
      let mayores = 0, menores = 0;
      Object.keys(v).forEach(k => { if(v[k] === 'M') mayores++; if(v[k] === 'm') menores++; });
      return mayores * 100 + menores;
    },
    interpret: (score) => {
      const mayores = Math.floor(score / 100);
      const menores = score % 100;
      if (mayores >= 2 || (mayores >= 1 && menores >= 2)) return { scoreRange: [score, score], risk: 'Diagnóstico Positivo', recommendation: `Cumple criterios de HF (Mayores: ${mayores}, Menores: ${menores}).`, color: 'red' };
      return { scoreRange: [score, score], risk: 'Diagnóstico Negativo', recommendation: `No cumple criterios suficientes (Mayores: ${mayores}, Menores: ${menores}).`, color: 'green' };
    }
  },
  {
    slug: 'ava-continuity',
    name: 'Aortic Valve Area (Continuity)',
    category: 'Ecocardiografía',
    description: 'Área Valvular Aórtica mediante la Ecuación de Continuidad',
    reference: 'Oh JK, et al. The Echo Manual. 3rd ed.',
    inputs: [
      { id: 'lvotd', label: 'Diámetro del TSVI (cm)', type: 'number', min: 0.1, max: 10, step: 0.1, unit: 'cm' },
      { id: 'lvotvti', label: 'VTI del TSVI (cm)', type: 'number', min: 1, max: 100, step: 0.1, unit: 'cm' },
      { id: 'avvti', label: 'VTI Valvular Aórtico (cm)', type: 'number', min: 1, max: 200, step: 0.1, unit: 'cm' }
    ],
    calculate: (v) => {
      const { lvotd, lvotvti, avvti } = v;
      if (!lvotd || !lvotvti || !avvti) return 0;
      const areaLvot = Math.PI * Math.pow(lvotd / 2, 2);
      return (areaLvot * lvotvti) / avvti;
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Faltan datos', recommendation: 'Completá todos los campos.', color: 'blue' };
      if (score > 1.5) return { scoreRange: [1.5, 10], risk: 'Normal / Leve', recommendation: `Área: ${score.toFixed(2)} cm². Estenosis Leve o Normal.`, color: 'green' };
      if (score > 1.0) return { scoreRange: [1.0, 1.5], risk: 'Estenosis Moderada', recommendation: `Área: ${score.toFixed(2)} cm². Estenosis Aórtica Moderada.`, color: 'yellow' };
      return { scoreRange: [0, 1.0], risk: 'Estenosis Severa', recommendation: `Área: ${score.toFixed(2)} cm². Estenosis Aórtica Severa (AVA < 1.0 cm²).`, color: 'red' };
    }
  },
  {
    slug: 'hakki',
    name: 'Hakki Equation (Valve Area)',
    category: 'Hemodinamia Invasiva',
    description: 'Estimación simplificada del Área Valvular (Aórtica o Mitral) en laboratorio de hemodinamia',
    reference: 'Hakki AH, et al. Circulation. 1981;63(5):1050-5.',
    inputs: [
      { id: 'co', label: 'Gasto Cardíaco (L/min)', type: 'number', min: 0.5, max: 20, step: 0.1, unit: 'L/min' },
      { id: 'grad', label: 'Gradiente Pico a Pico (mmHg)', type: 'number', min: 1, max: 200, step: 1, unit: 'mmHg' }
    ],
    calculate: (v) => {
      if (!v.co || !v.grad) return 0;
      return v.co / Math.sqrt(v.grad);
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Faltan datos', recommendation: 'Completá todos los campos.', color: 'blue' };
      return { scoreRange: [score, score], risk: 'Área Calculada', recommendation: `Área Valvular estimada: ${score.toFixed(2)} cm²`, color: 'yellow' };
    }
  },
  {
    slug: 'pisa-mr',
    name: 'MR Quantification (PISA)',
    category: 'Ecocardiografía',
    description: 'Cuantificación de Insuficiencia Mitral mediante método PISA (EROA)',
    reference: 'Zoghbi WA, et al. J Am Soc Echocardiogr. 2003;16(7):777-802.',
    inputs: [
      { id: 'r', label: 'Radio PISA (cm)', type: 'number', min: 0.1, max: 5, step: 0.1, unit: 'cm' },
      { id: 'va', label: 'Velocidad de Aliasing (cm/s)', type: 'number', min: 10, max: 100, step: 1, unit: 'cm/s' },
      { id: 'vp', label: 'Velocidad Pico IM (cm/s)', type: 'number', min: 100, max: 800, step: 10, unit: 'cm/s' }
    ],
    calculate: (v) => {
      if (!v.r || !v.va || !v.vp) return 0;
      const flow = 2 * Math.PI * Math.pow(v.r, 2) * v.va;
      return flow / v.vp; // EROA in cm2
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Faltan datos', recommendation: 'Completá todos los campos.', color: 'blue' };
      if (score < 0.20) return { scoreRange: [0, 0.20], risk: 'IM Leve', recommendation: `EROA: ${score.toFixed(2)} cm². Insuficiencia Mitral Leve.`, color: 'green' };
      if (score < 0.40) return { scoreRange: [0.20, 0.40], risk: 'IM Moderada', recommendation: `EROA: ${score.toFixed(2)} cm². Insuficiencia Mitral Moderada.`, color: 'yellow' };
      return { scoreRange: [0.40, 5], risk: 'IM Severa', recommendation: `EROA: ${score.toFixed(2)} cm². Insuficiencia Mitral Severa (EROA ≥ 0.40 cm²).`, color: 'red' };
    }
  },
  {
    slug: 'pht-mva',
    name: 'Mitral Valve Area (PHT)',
    category: 'Ecocardiografía',
    description: 'Área Valvular Mitral usando Tiempo de Hemipresión (Pressure Half-Time)',
    reference: 'Hatle L, et al. Br Heart J. 1979;42(5):604-9.',
    inputs: [
      { id: 'pht', label: 'Tiempo de Hemipresión - PHT (ms)', type: 'number', min: 20, max: 800, step: 1, unit: 'ms' }
    ],
    calculate: (v) => {
      if (!v.pht) return 0;
      return 220 / v.pht;
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Faltan datos', recommendation: 'Completá el campo.', color: 'blue' };
      if (score > 1.5) return { scoreRange: [1.5, 5], risk: 'Normal / Leve', recommendation: `MVA: ${score.toFixed(2)} cm². Estenosis Leve o Normal.`, color: 'green' };
      if (score > 1.0) return { scoreRange: [1.0, 1.5], risk: 'Estenosis Moderada', recommendation: `MVA: ${score.toFixed(2)} cm². Estenosis Mitral Moderada.`, color: 'yellow' };
      return { scoreRange: [0, 1.0], risk: 'Estenosis Severa', recommendation: `MVA: ${score.toFixed(2)} cm². Estenosis Mitral Severa.`, color: 'red' };
    }
  },
  {
    slug: 'fractional-shortening',
    name: 'Fractional Shortening',
    category: 'Ecocardiografía',
    description: 'Fracción de Acortamiento del Ventrículo Izquierdo',
    reference: 'Lang RM, et al. J Am Soc Echocardiogr. 2015;28(1):1-39.',
    inputs: [
      { id: 'lvidd', label: 'LVIDd - Diámetro Diastólico (cm)', type: 'number', min: 1, max: 10, step: 0.1, unit: 'cm' },
      { id: 'lvids', label: 'LVIDs - Diámetro Sistólico (cm)', type: 'number', min: 1, max: 10, step: 0.1, unit: 'cm' }
    ],
    calculate: (v) => {
      if (!v.lvidd || !v.lvids || v.lvidd <= v.lvids) return 0;
      return ((v.lvidd - v.lvids) / v.lvidd) * 100;
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Faltan datos', recommendation: 'Revisá los diámetros (LVIDd > LVIDs).', color: 'blue' };
      if (score >= 25) return { scoreRange: [25, 100], risk: 'Normal', recommendation: `FS: ${score.toFixed(1)}%. Función sistólica conservada.`, color: 'green' };
      return { scoreRange: [0, 25], risk: 'Disminuida', recommendation: `FS: ${score.toFixed(1)}%. Función sistólica reducida.`, color: 'red' };
    }
  },
  {
    slug: 'rvsp',
    name: 'RV Systolic Pressure (RVSP)',
    category: 'Ecocardiografía',
    description: 'Presión Sistólica del Ventrículo Derecho estimada por Jet Tricuspídeo',
    reference: 'Yock PG, Popp RL. Circulation. 1984;70(4):657-62.',
    inputs: [
      { id: 'trv', label: 'Velocidad Máxima IT (m/s)', type: 'number', min: 0.5, max: 8, step: 0.1, unit: 'm/s' },
      { id: 'rap', label: 'Presión Aurícula Derecha (mmHg) - Estimada por VCI', type: 'number', min: 3, max: 20, step: 1, unit: 'mmHg' }
    ],
    calculate: (v) => {
      if (!v.trv || !v.rap) return 0;
      return 4 * Math.pow(v.trv, 2) + v.rap;
    },
    interpret: (score) => {
      if (score === 0) return { scoreRange: [0, 0], risk: 'Faltan datos', recommendation: 'Completá todos los campos.', color: 'blue' };
      if (score <= 35) return { scoreRange: [0, 35], risk: 'Normal', recommendation: `RVSP: ${score.toFixed(0)} mmHg. Presión pulmonar normal.`, color: 'green' };
      if (score <= 50) return { scoreRange: [36, 50], risk: 'HTP Leve a Moderada', recommendation: `RVSP: ${score.toFixed(0)} mmHg. Hipertensión Pulmonar probable.`, color: 'yellow' };
      return { scoreRange: [50, 200], risk: 'HTP Severa', recommendation: `RVSP: ${score.toFixed(0)} mmHg. Alta probabilidad de HTP Severa.`, color: 'red' };
    }
  }
];

export function getCalculatorBySlug(slug: string): CalculatorConfig | undefined {
  return calculators.find(c => c.slug === slug);
}

export function getAllCalculators(): CalculatorConfig[] {
  return calculators;
}
