require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const cheerio = require('cheerio');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function categorize(title) {
  const t = title.toLowerCase();
  if (t.includes('fibrilación') || t.includes('arritmia') || t.includes('taquicardia') || t.includes('marcapasos') || t.includes('síncope')) return 'Arritmias y Fibrilación Auricular';
  if (t.includes('insuficiencia cardíaca') || t.includes('miocardiopatía') || t.includes('chagas') || t.includes('miocarditis')) return 'Insuficiencia Cardíaca';
  if (t.includes('isquémica') || t.includes('infarto') || t.includes('coronariopatía') || t.includes('revascularización')) return 'Cardiopatía Isquémica';
  if (t.includes('hipertensión') || t.includes('prevención') || t.includes('lípidos') || t.includes('colesterol') || t.includes('diabetes') || t.includes('deportes')) return 'Prevención';
  if (t.includes('valvular') || t.includes('valvulopatía') || t.includes('endocarditis')) return 'Valvulopatías';
  if (t.includes('aórtica') || t.includes('vascular') || t.includes('periférica')) return 'Enfermedad Vascular';
  if (t.includes('imágenes') || t.includes('ecocardiografía') || t.includes('resonancia')) return 'Imágenes Cardiovasculares';
  return 'Otros';
}

async function run() {
  const html = fs.readFileSync('sac_guias.html', 'utf8');
  const $ = cheerio.load(html);
  
  const results = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && href.toLowerCase().includes('.pdf') && text.length > 5) {
      results.push({ href, text });
    }
  });
  
  console.log(`Found ${results.length} raw PDF links in sac_guias.html.`);
  
  // Clean up and distinct
  const uniqueDocs = [];
  const seenHrefs = new Set();
  for (const r of results) {
    if (!seenHrefs.has(r.href)) {
      seenHrefs.add(r.href);
      uniqueDocs.push(r);
    }
  }
  
  console.log(`Found ${uniqueDocs.length} UNIQUE PDF links.`);
  
  let added = 0;
  let existingCount = 0;
  
  for (const doc of uniqueDocs) {
    // Check if exists by URL
    const { data: existingUrl } = await supabase.from('guias').select('id').eq('url_fuente', doc.href).single();
    if (existingUrl) {
      existingCount++;
      continue;
    }
    
    // Fuzzy match title
    const cleanDocTitle = doc.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const { data: allSac } = await supabase.from('guias').select('titulo').eq('fuente', 'SAC');
    let titleExists = false;
    for (const s of allSac) {
      const sTitle = s.titulo.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sTitle.includes(cleanDocTitle) || cleanDocTitle.includes(sTitle)) {
        titleExists = true;
        break;
      }
    }
    
    if (titleExists) {
      existingCount++;
      continue;
    }
    
    // Insert new
    let year = 2024;
    const yearMatch = doc.text.match(/20[0-2][0-9]/);
    if (yearMatch) year = parseInt(yearMatch[0]);
    else {
      const urlYearMatch = doc.href.match(/20[0-2][0-9]/);
      if (urlYearMatch) year = parseInt(urlYearMatch[0]);
    }
    
    const slug = doc.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const guiaData = {
      titulo: doc.text,
      slug: slug,
      fuente: 'SAC',
      anio_publicacion: year,
      categoria: categorize(doc.text),
      url_fuente: doc.href,
      contenido_md: "",
      resumen_rapido: `Documento oficial de la Sociedad Argentina de Cardiología: ${doc.text}`
    };
    
    const { error } = await supabase.from('guias').insert(guiaData);
    if (error) {
      console.error(`❌ Error inserting ${doc.text}: ${error.message}`);
    } else {
      console.log(`✅ Added: ${doc.text}`);
      added++;
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`Already in database: ${existingCount}`);
  console.log(`New added: ${added}`);
}

run();
