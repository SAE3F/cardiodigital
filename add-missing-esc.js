require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const missing = [
  "2025 ESC Guidelines for the management of cardiovascular disease and pregnancy",
  "2025 Focused Update of the 2019 ESC/EAS Guidelines for the management of dyslipidaemias",
  "2025 ESC Clinical Consensus Statement on mental health and cardiovascular disease",
  "2025 ESC Guidelines for the management of myocarditis and pericarditis",
  "2025 ESC/EACTS Guidelines for the management of valvular heart disease",
  "2024 ESC Guidelines for the management of peripheral arterial and aortic diseases",
  "2023 ESC Guidelines for the management of cardiomyopathies",
  "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
  "2023 ESC Guidelines for the management of endocarditis",
  "2022 ESC Guidelines on cardio-oncology",
  "2022 ESC Guidelines on Cardiovascular Assessment and Management of Patients Undergoing Non Cardiac Surgery",
  "2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension",
  "2022 ESC Guidelines: management of patients with ventricular arrhythmias and the prevention of sudden cardiac death",
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

function categorize(title) {
  const t = title.toLowerCase();
  if (t.includes('atrial fibrillation') || t.includes('arritmia') || t.includes('arrhythmias') || t.includes('tachycardia') || t.includes('pacing') || t.includes('syncope')) return 'Arritmias y Fibrilación Auricular';
  if (t.includes('heart failure') || t.includes('insuficiencia cardíaca') || t.includes('cardiomyopathies') || t.includes('myocarditis')) return 'Insuficiencia Cardíaca';
  if (t.includes('coronary') || t.includes('isquémica') || t.includes('myocardial infarction') || t.includes('revascularisation')) return 'Cardiopatía Isquémica';
  if (t.includes('hypertension') || t.includes('blood pressure') || t.includes('prevention') || t.includes('dyslipidaemias') || t.includes('diabetes') || t.includes('sports')) return 'Prevención';
  if (t.includes('valvular') || t.includes('endocarditis')) return 'Valvulopatías';
  if (t.includes('aortic') || t.includes('peripheral')) return 'Enfermedad Vascular';
  return 'Otros';
}

async function run() {
  for (const title of missing) {
    console.log(`Searching for: ${title}`);
    
    // Remove year prefix if exists for better search
    const cleanTitle = title.replace(/^[0-9]{4}\s+/, '').replace(/\s+/g, ' ');
    
    const searchUrl = `https://api.crossref.org/works?query.title="${encodeURIComponent(cleanTitle)}"&select=DOI,title,published,container-title&rows=3`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const items = searchData.message.items;
    
    if (items.length === 0) {
      console.log(`❌ Not found in CrossRef: ${title}`);
      continue;
    }
    
    // Pick the first one that looks like a journal article
    const article = items[0];
    const doi = article.DOI;
    
    if (!doi) {
      console.log(`❌ No DOI found for ${title}`);
      continue;
    }
    
    const yearMatch = title.match(/^[0-9]{4}/);
    let pubYear = yearMatch ? parseInt(yearMatch[0]) : 2024;
    if (article.published && article.published['date-parts'] && article.published['date-parts'][0]) {
      // Prioritize the year from the title provided by user, otherwise use CrossRef year
      pubYear = yearMatch ? parseInt(yearMatch[0]) : article.published['date-parts'][0][0];
    }
    
    const articleTitle = article.title ? article.title[0] : title;
    
    const url_fuente = `https://doi.org/${doi}`;
    
    // Check if exists
    const { data: existing } = await supabase.from('guias').select('id').eq('url_fuente', url_fuente).single();
    
    if (existing) {
      console.log(`⏩ Already exists: ${articleTitle}`);
      continue;
    }
    
    const slug = articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const guiaData = {
      titulo: articleTitle,
      slug: slug,
      fuente: 'ESC',
      anio_publicacion: pubYear,
      categoria: categorize(articleTitle),
      url_fuente: url_fuente,
      contenido_md: "",
      resumen_rapido: `Guía Europea oficial sobre ${articleTitle.toLowerCase()}.`
    };
    
    const { error } = await supabase.from('guias').insert(guiaData);
    if (error) {
      console.error(`❌ DB Error: ${error.message}`);
    } else {
      console.log(`✅ Added: ${articleTitle} (DOI: ${doi})`);
    }
    
    // sleep to respect API limits
    await new Promise(r => setTimeout(r, 500));
  }
}

run();
