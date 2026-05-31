require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

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

async function autoScroll(page){
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 300;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        // try to find load more button
        const loadMore = document.querySelector('.load-more, .ajax-load-more, a.next');
        if (loadMore) loadMore.click();

        if(totalHeight >= scrollHeight - window.innerHeight){
          clearInterval(timer);
          resolve();
        }
      }, 500); // Wait 500ms between scrolls to let ajax load
    });
  });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const url = 'https://www.sac.org.ar/consensos/?unidadtematica=&orden=&keyword=';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  console.log('Scrolling down the page to load all 15 pages...');
  
  let previousHeight = 0;
  let noChangeCount = 0;
  
  while (noChangeCount < 5) {
    await autoScroll(page);
    await new Promise(r => setTimeout(r, 2000));
    
    let currentHeight = await page.evaluate('document.body.scrollHeight');
    if (currentHeight === previousHeight) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
      previousHeight = currentHeight;
      console.log(`Height changed to ${currentHeight}. Continuing scroll...`);
    }
  }
  
  console.log('Finished scrolling. Extracting links...');
  
  const results = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links
      .filter(a => a.href && a.href.toLowerCase().includes('.pdf'))
      .map(a => ({
        title: a.innerText.trim(),
        href: a.href
      }))
      .filter(l => l.title.length > 5);
  });
  
  console.log(`Found ${results.length} total PDF links on the page.`);
  await browser.close();
  
  // Clean up and distinct
  const uniqueDocs = [];
  const seenHrefs = new Set();
  for (const r of results) {
    if (!seenHrefs.has(r.href)) {
      seenHrefs.add(r.href);
      uniqueDocs.push(r);
    }
  }
  console.log(`Found ${uniqueDocs.length} UNIQUE documents.`);
  
  let added = 0;
  let existingCount = 0;
  
  for (const doc of uniqueDocs) {
    // Check if exists by URL
    const { data: existing } = await supabase.from('guias').select('id').eq('url_fuente', doc.href).single();
    if (existing) {
      existingCount++;
      continue;
    }
    
    // Check if exists by fuzzy title matching
    const cleanDocTitle = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '');
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
    const yearMatch = doc.title.match(/20[0-2][0-9]/);
    if (yearMatch) year = parseInt(yearMatch[0]);
    else {
      const urlYearMatch = doc.href.match(/20[0-2][0-9]/);
      if (urlYearMatch) year = parseInt(urlYearMatch[0]);
    }
    
    const slug = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const guiaData = {
      titulo: doc.title,
      slug: slug,
      fuente: 'SAC',
      anio_publicacion: year,
      categoria: categorize(doc.title),
      url_fuente: doc.href,
      contenido_md: "",
      resumen_rapido: `Documento oficial de la Sociedad Argentina de Cardiología: ${doc.title}`
    };
    
    const { error } = await supabase.from('guias').insert(guiaData);
    if (error) {
      console.error(`❌ Error inserting ${doc.title}: ${error.message}`);
    } else {
      console.log(`✅ Added new SAC document: ${doc.title}`);
      added++;
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`Already in database: ${existingCount}`);
  console.log(`New added: ${added}`);
}

run().catch(console.error);
