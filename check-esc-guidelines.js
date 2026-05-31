require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const targetGuidelines = [
  "2025 ESC Guidelines for the management of cardiovascular disease and pregnancy",
  "2025 Focused Update of the 2019 ESC/EAS Guidelines for the management of dyslipidaemias",
  "2025 ESC Clinical Consensus Statement on mental health and cardiovascular disease",
  "2025 ESC Guidelines for the management of myocarditis and pericarditis",
  "2025 ESC/EACTS Guidelines for the management of valvular heart disease",
  "2024 ESC Guidelines for the management of atrial fibrillation",
  "2024 ESC Guidelines for the management of chronic coronary syndromes",
  "2024 ESC Guidelines for the Management of Elevated Blood Pressure and Hypertension",
  "2024 ESC Guidelines for the management of peripheral arterial and aortic diseases",
  "2023 ESC Guidelines for the management of acute coronary syndromes",
  "2023 ESC Guidelines for the management of cardiomyopathies",
  "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
  "2023 ESC Guidelines for the management of endocarditis",
  "2023 Focused Update of the 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure",
  "2022 ESC Guidelines on cardio-oncology",
  "2022 ESC Guidelines on Cardiovascular Assessment and Management of Patients Undergoing Non Cardiac Surgery",
  "2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension",
  "2022 ESC Guidelines: management of patients with ventricular arrhythmias and the prevention of sudden cardiac death",
  "2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure",
  "2021 ESC Guidelines on cardiac pacing and cardiac resynchronization therapy",
  "2021 ESC Guidelines on Cardiovascular Disease Prevention in Clinical Practice",
  "2020 ESC Guidelines for the management of Adult Congenital Heart Disease",
  "2020 ESC Guidelines on Sports Cardiology and Exercise in Patients with Cardiovascular Disease",
  "2019 Guidelines on Acute Pulmonary Embolism",
  "2019 ESC/EAS Guidelines for the management of dyslipidaemias",
  "2019 Guidelines on Supraventricular Tachycardia",
  "2018 Guidelines on Fourth Universal Definition of Myocardial Infarction",
  "2018 ESC/EACTS Guidelines on Myocardial Revascularisation",
  "2018 Guidelines for Diagnosis/Management of Syncope",
  "2002 Guidelines for the management of Neonatal Electrocardiogram"
];

async function run() {
  const { data: existing, error } = await supabase.from('guias').select('*').eq('fuente', 'ESC');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  const existingTitles = existing.map(g => g.titulo.toLowerCase());
  
  const missing = [];
  const found = [];
  
  for (const target of targetGuidelines) {
    const isFound = existingTitles.some(et => {
      // Basic fuzzy matching
      const t1 = et.replace(/[^a-z0-9]/g, '');
      const t2 = target.toLowerCase().replace(/[^a-z0-9]/g, '');
      return t1.includes(t2) || t2.includes(t1);
    });
    
    if (isFound) {
      found.push(target);
    } else {
      missing.push(target);
    }
  }
  
  console.log(`Found: ${found.length}/${targetGuidelines.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log('--- MISSING ---');
  missing.forEach(m => console.log(m));
}

run();
