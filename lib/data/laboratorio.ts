export type LabValue = {
  name: string;
  normalValue: string;
  unit: string;
  category: string;
  notes?: string;
};

export const LAB_VALUES: LabValue[] = [
  // Biomarcadores Cardíacos
  { name: 'Troponina I (TnI)', normalValue: '< 0.04', unit: 'ng/mL', category: 'Biomarcadores Cardíacos', notes: 'Depende del ensayo (ultrasensible vs convencional).' },
  { name: 'Troponina T (TnT)', normalValue: '< 0.01', unit: 'ng/mL', category: 'Biomarcadores Cardíacos', notes: 'Corte percentil 99 para ultrasensible suele ser 14 ng/L (0.014 ng/mL).' },
  { name: 'CK-MB', normalValue: '0 - 5', unit: 'ng/mL', category: 'Biomarcadores Cardíacos', notes: 'Suele ser < 5% de la CK total.' },
  { name: 'NT-proBNP', normalValue: '< 125', unit: 'pg/mL', category: 'Biomarcadores Cardíacos', notes: 'Sube con la edad. Puntos de corte para IC aguda: <50a: >450; 50-75a: >900; >75a: >1800.' },
  { name: 'BNP', normalValue: '< 100', unit: 'pg/mL', category: 'Biomarcadores Cardíacos', notes: 'Punto de corte para exclusión de IC.' },
  
  // Reactantes y Coagulación
  { name: 'Dímero D', normalValue: '< 500', unit: 'ng/mL FEU', category: 'Coagulación y Reactantes', notes: 'Ajuste por edad: Edad x 10 en >50 años.' },
  { name: 'Fibrinógeno', normalValue: '200 - 400', unit: 'mg/dL', category: 'Coagulación y Reactantes' },
  { name: 'TP (Tiempo de Protrombina)', normalValue: '11 - 13.5', unit: 'seg', category: 'Coagulación y Reactantes' },
  { name: 'RIN (INR)', normalValue: '0.8 - 1.1', unit: '', category: 'Coagulación y Reactantes', notes: 'Pacientes anticoagulados con AVK: objetivo 2.0 - 3.0 (hasta 3.5 en válvulas mecánicas).' },
  { name: 'KPTT (aPTT)', normalValue: '25 - 35', unit: 'seg', category: 'Coagulación y Reactantes', notes: 'Objetivo heparina: 1.5 - 2.5 veces el valor control.' },
  { name: 'PCR (Proteína C Reactiva)', normalValue: '< 10', unit: 'mg/L', category: 'Coagulación y Reactantes' },
  { name: 'Procalcitonina (PCT)', normalValue: '< 0.1', unit: 'ng/mL', category: 'Coagulación y Reactantes', notes: '>0.5 alta probabilidad de infección bacteriana.' },
  { name: 'Lactato', normalValue: '0.5 - 2.2', unit: 'mmol/L', category: 'Coagulación y Reactantes', notes: 'Marcador de hipoperfusión en shock.' },

  // Medio Interno e Iones
  { name: 'Sodio (Na)', normalValue: '135 - 145', unit: 'mEq/L', category: 'Ionograma' },
  { name: 'Potasio (K)', normalValue: '3.5 - 5.0', unit: 'mEq/L', category: 'Ionograma', notes: 'Objetivo en patología CV > 4.0 mEq/L.' },
  { name: 'Cloro (Cl)', normalValue: '98 - 106', unit: 'mEq/L', category: 'Ionograma' },
  { name: 'Magnesio (Mg)', normalValue: '1.7 - 2.2', unit: 'mg/dL', category: 'Ionograma', notes: 'Objetivo en arritmias/IAM > 2.0 mg/dL.' },
  { name: 'Calcio Total (Ca)', normalValue: '8.5 - 10.5', unit: 'mg/dL', category: 'Ionograma', notes: 'Corregir por albúmina: Ca + 0.8 x (4 - Alb).' },
  { name: 'Calcio Iónico', normalValue: '4.5 - 5.6', unit: 'mg/dL', category: 'Ionograma', notes: 'Fracción activa.' },
  { name: 'Fósforo (P)', normalValue: '2.5 - 4.5', unit: 'mg/dL', category: 'Ionograma' },

  // Función Renal
  { name: 'Creatinina (Cr)', normalValue: '0.6 - 1.2', unit: 'mg/dL', category: 'Función Renal', notes: 'Varía según masa muscular y sexo.' },
  { name: 'Urea', normalValue: '15 - 40', unit: 'mg/dL', category: 'Función Renal' },
  { name: 'BUN', normalValue: '7 - 20', unit: 'mg/dL', category: 'Función Renal', notes: 'Urea ≈ BUN x 2.14' },
  { name: 'Ácido Úrico', normalValue: '3.5 - 7.2', unit: 'mg/dL', category: 'Función Renal' },

  // Gases en Sangre Arterial
  { name: 'pH', normalValue: '7.35 - 7.45', unit: '', category: 'Gases Arteriales' },
  { name: 'pCO2', normalValue: '35 - 45', unit: 'mmHg', category: 'Gases Arteriales' },
  { name: 'pO2', normalValue: '80 - 100', unit: 'mmHg', category: 'Gases Arteriales' },
  { name: 'HCO3 (Bicarbonato)', normalValue: '22 - 26', unit: 'mEq/L', category: 'Gases Arteriales' },
  { name: 'SatO2', normalValue: '> 95', unit: '%', category: 'Gases Arteriales' },
  { name: 'Exceso de Bases (EB)', normalValue: '-2 a +2', unit: 'mEq/L', category: 'Gases Arteriales' },

  // Perfil Lipídico
  { name: 'Colesterol Total', normalValue: '< 200', unit: 'mg/dL', category: 'Perfil Lipídico' },
  { name: 'LDL Colesterol', normalValue: '< 100', unit: 'mg/dL', category: 'Perfil Lipídico', notes: 'Objetivos: <70 muy alto riesgo, <55 altísimo riesgo.' },
  { name: 'HDL Colesterol', normalValue: '> 40 (H) / > 50 (M)', unit: 'mg/dL', category: 'Perfil Lipídico' },
  { name: 'Triglicéridos', normalValue: '< 150', unit: 'mg/dL', category: 'Perfil Lipídico' },
  { name: 'No-HDL', normalValue: '< 130', unit: 'mg/dL', category: 'Perfil Lipídico', notes: 'Objetivo suele ser LDL objetivo + 30.' },

  // Hemograma
  { name: 'Hemoglobina (Hb)', normalValue: '13 - 17 (H) / 12 - 15 (M)', unit: 'g/dL', category: 'Hemograma' },
  { name: 'Hematocrito (Hto)', normalValue: '40 - 50 (H) / 36 - 45 (M)', unit: '%', category: 'Hemograma' },
  { name: 'Glóbulos Blancos', normalValue: '4.500 - 11.000', unit: '/mm³', category: 'Hemograma' },
  { name: 'Plaquetas', normalValue: '150.000 - 450.000', unit: '/mm³', category: 'Hemograma' }
];
