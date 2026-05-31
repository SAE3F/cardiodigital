require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const accGuidelines = [
  "2026 AHA/ACC/AMSSM/HRS/PACES/SCMR Guideline for the Management of Dyslipidemia",
  "2026 AHA/ACC Guideline for Acute Pulmonary Embolism",
  "2025 AHA/ACC Guideline for Adults With Congenital Heart Disease",
  "2025 AHA/ACC Guideline for High Blood Pressure",
  "2025 AHA/ACC Guideline for Acute Coronary Syndromes",
  "2024 AHA/ACC Guideline on Perioperative CV Management for Noncardiac Surgery",
  "2024 AHA/ACC Guideline for Lower Extremity Peripheral Artery Disease",
  "2024 AHA/ACC Guideline for Hypertrophic Cardiomyopathy",
  "2023 AHA/ACC/ACCP/ASPC/NLA/PCNA Guideline for the Management of Patients With Chronic Coronary Disease",
  "2023 AHA/ACC/HRS Guideline for the Management of Patients With Atrial Fibrillation",
  "2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure",
  "2022 AHA/ACC Guideline for the Diagnosis and Management of Aortic Disease",
  "2021 AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR Guideline for the Evaluation and Diagnosis of Chest Pain",
  "2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization",
  "2020 ACC/AHA Guideline for the Management of Patients With Valvular Heart Disease",
  "2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease",
  "2018 ACC/AHA/HRS Guideline on the Evaluation and Management of Patients With Bradycardia and Cardiac Conduction Delay",
  "2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death",
  "2017 ACC/AHA/HRS Guideline for the Evaluation and Management of Patients With Syncope",
  "2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia",
  "2013 AHA/ACC Guideline on Lifestyle Management to Reduce Cardiovascular Risk",
  "2013 AHA/ACC Guideline for the Management of Overweight and Obesity in Adults",
  "2012 ACCF/AHA/HRS Focused Update Incorporated Into the ACCF/AHA/HRS 2008 Guidelines for Device-Based Therapy of Cardiac Rhythm Abnormalities",
  "2011 AHA/ACC Update on Cardiovascular Disease Prevention in Women",
  "2025 ACC Expert Consensus Decision Pathway on Implantable Cardioverter-Defibrillators, Cardiac Resynchronization Therapy, and Pacing",
  "2024 ACC Expert Consensus Decision Pathway on Multimodality Imaging in CV Evaluation of Patients Undergoing Nonemergent, Noncardiac Surgery",
  "2023 ACC Expert Consensus Decision Pathway on Multimodality Detection and Risk Assessment of Chronic Coronary Disease",
  "2020 ACC Expert Consensus Decision Pathway on Multimodality Imaging During Follow-Up Care of Congenital Heart Disease",
  "2019 ACC Expert Consensus Decision Pathway on Multimodality Imaging in the Assessment of Cardiac Structure and Function in Nonvalvular Heart Disease",
  "2018 ACC Expert Consensus Decision Pathway on Peripheral Artery Intervention",
  "2017 ACC Expert Consensus Decision Pathway on Severe Aortic Stenosis",
  "2017 ACC Expert Consensus Decision Pathway on Multimodality Imaging in Valvular Heart Disease",
  "2017 ACC Expert Consensus Decision Pathway on Coronary Revascularization in Patients With Stable Ischemic Heart Disease",
  "2016 ACC Expert Consensus Decision Pathway on Coronary Revascularization in Patients With Acute Coronary Syndromes",
  "2016 ACC Expert Consensus Decision Pathway on Cardiovascular Imaging in Emergency Department Patients With Chest Pain",
  "2014 ACC Expert Consensus Decision Pathway on Initial Transthoracic Echocardiography in Outpatient Pediatric Cardiology",
  "2026 ACC Concise Clinical Guidance on Outpatient Management of Isolated Left-to-Right Shunt Lesions in Pediatric Patients",
  "2025 ACC Concise Clinical Guidance on Cardiovascular Adverse Effects of Targeted Oncology Therapies",
  "2025 ACC Concise Clinical Guidance on Nutrition and Front-of-Package Food Labeling as a Catalyst For CV Health",
  "2025 ACC Concise Clinical Guidance on Transthyretin Cardiac Amyloidosis Evaluation and Management",
  "2025 ACC Concise Clinical Guidance on Adult Immunizations as Part of Cardiovascular Care",
  "2025 ACC Concise Clinical Guidance on Diagnosis and Management of Pericarditis",
  "2025 ACC Concise Clinical Guidance on Medical Weight Management for Optimization of Cardiovascular Health",
  "2025 ACC Concise Clinical Guidance on Evaluation and Management of Cardiogenic Shock",
  "2026 ACC Expert Consensus Decision Pathway on Optimization of Postpartum Care for Patients With and at Risk for Premature and Long-Term Cardiovascular Disease",
  "2025 ACC Expert Consensus Decision Pathway on 10 Issues for the Clinician in Tricuspid Regurgitation Evaluation and Management",
  "2024 ACC Expert Consensus Decision Pathway on Practical Approaches for Arrhythmia Monitoring After Stroke",
  "2024 ACC Expert Consensus Decision Pathway on Diagnosis and Management of Myocarditis",
  "2024 ACC Expert Consensus Decision Pathway on Patients Hospitalized With Heart Failure",
  "2024 ACC Expert Consensus Decision Pathway on Treatment of Heart Failure With Reduced Ejection Fraction",
  "2023 ACC Expert Consensus Decision Pathway on Management of Heart Failure With Preserved Ejection Fraction",
  "2023 ACC Expert Consensus Decision Pathway on Comprehensive Multidisciplinary Care for the Patient With Cardiac Amyloidosis",
  "2022 ACC Expert Consensus Decision Pathway on Integrating Atherosclerotic Cardiovascular Disease and Multimorbidity Treatment",
  "2022 ACC Expert Consensus Decision Pathway on Evaluation and Disposition of Acute Chest Pain in the Emergency Department",
  "2022 ACC Expert Consensus Decision Pathway on Role of Nonstatin Therapies for LDL-Cholesterol Lowering in Atherosclerotic CV Disease Risk Management",
  "2022 ACC Expert Consensus Decision Pathway on Cardiovascular Sequelae of COVID-19 in Adults",
  "2021 ACC Expert Consensus Decision Pathway on Management of ASCVD Risk Reduction in Patients With Persistent Hypertriglyceridemia",
  "2021 ACC Expert Consensus Decision Pathway on Same-Day Discharge After Percutaneous Coronary Intervention",
  "2020 ACC Expert Consensus Decision Pathway on Anticoagulant and Antiplatelet Therapy for AF/VTE and PCI/ASCVD",
  "2020 ACC Expert Consensus Decision Pathway on Management of Conduction Disturbances in Patients Undergoing TAVR",
  "2020 ACC Expert Consensus Decision Pathway on Novel Therapies for Cardiovascular Risk Reduction in Patients With Type 2 Diabetes",
  "2020 ACC Expert Consensus Decision Pathway on Management of Bleeding in Patients on Oral Anticoagulants",
  "2020 ACC Expert Consensus Decision Pathway on Mitral Regurgitation Management",
  "2018 ACC Expert Consensus Decision Pathway on Tobacco Cessation Treatment",
  "2018 ACC Expert Consensus Decision Pathway on Optimal Use of Ionizing Radiation in Cardiovascular Imaging",
  "2017 ACC Expert Consensus Decision Pathway on Periprocedural Management of Anticoagulation in Patients With Nonvalvular Atrial Fibrillation",
  "2017 ACC Expert Consensus Decision Pathway on Transcatheter Aortic Valve Replacement in the Management of Adults With Aortic Stenosis"
];

function categorize(title) {
  const t = title.toLowerCase();
  if (t.includes('atrial fibrillation') || t.includes('arritmia') || t.includes('arrhythmias') || t.includes('tachycardia') || t.includes('pacing') || t.includes('syncope') || t.includes('bradycardia')) return 'Arritmias y Fibrilación Auricular';
  if (t.includes('heart failure') || t.includes('insuficiencia cardíaca') || t.includes('cardiomyopathy') || t.includes('myocarditis') || t.includes('shock')) return 'Insuficiencia Cardíaca';
  if (t.includes('coronary') || t.includes('isquémica') || t.includes('myocardial infarction') || t.includes('revascularization') || t.includes('chest pain')) return 'Cardiopatía Isquémica';
  if (t.includes('hypertension') || t.includes('blood pressure') || t.includes('prevention') || t.includes('dyslipidemia') || t.includes('diabetes') || t.includes('obesity') || t.includes('lifestyle')) return 'Prevención';
  if (t.includes('valvular') || t.includes('aortic stenosis') || t.includes('mitral') || t.includes('tricuspid')) return 'Valvulopatías';
  if (t.includes('aortic') || t.includes('peripheral')) return 'Enfermedad Vascular';
  return 'Otros';
}

async function run() {
  for (const title of accGuidelines) {
    console.log(`Searching for: ${title}`);
    
    // Remove year prefix if exists
    const cleanTitle = title.replace(/^[0-9]{4}\s+/, '').replace(/\s+/g, ' ');
    
    const searchUrl = `https://api.crossref.org/works?query.title="${encodeURIComponent(cleanTitle)}"&select=DOI,title,published,container-title&rows=3`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const items = searchData.message.items;
    
    if (items.length === 0) {
      console.log(`❌ Not found in CrossRef: ${title}`);
      continue;
    }
    
    const article = items[0];
    const doi = article.DOI;
    
    if (!doi) {
      console.log(`❌ No DOI found for ${title}`);
      continue;
    }
    
    const yearMatch = title.match(/^[0-9]{4}/);
    let pubYear = yearMatch ? parseInt(yearMatch[0]) : 2024;
    if (article.published && article.published['date-parts'] && article.published['date-parts'][0]) {
      pubYear = yearMatch ? parseInt(yearMatch[0]) : article.published['date-parts'][0][0];
    }
    
    const articleTitle = article.title ? article.title[0] : title;
    const url_fuente = `https://doi.org/${doi}`;
    
    const { data: existing } = await supabase.from('guias').select('id').eq('url_fuente', url_fuente).single();
    
    if (existing) {
      console.log(`⏩ Already exists: ${articleTitle}`);
      continue;
    }
    
    const slug = articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const guiaData = {
      titulo: articleTitle,
      slug: slug,
      fuente: 'ACC',
      anio_publicacion: pubYear,
      categoria: categorize(articleTitle),
      url_fuente: url_fuente,
      contenido_md: "",
      resumen_rapido: `Guía Americana (ACC) oficial sobre ${articleTitle.toLowerCase()}.`
    };
    
    const { error } = await supabase.from('guias').insert(guiaData);
    if (error) {
      console.error(`❌ DB Error: ${error.message}`);
    } else {
      console.log(`✅ Added: ${articleTitle} (DOI: ${doi})`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
}

run();
