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

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to be large
  await page.setViewport({ width: 1280, height: 800 });
  
  const url = 'https://www.sac.org.ar/consensos/?unidadtematica=&orden=&keyword=';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  let allLinks = [];
  let pageNum = 1;
  let hasNext = true;
  
  while (hasNext) {
    console.log(`Extracting from page ${pageNum}...`);
    // Extract PDFs from current view
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter(a => a.href && a.href.toLowerCase().includes('.pdf'))
        .map(a => ({
          title: a.innerText.trim() || a.getAttribute('title') || 'SAC Document',
          href: a.href
        }))
        .filter(l => l.title.length > 3);
    });
    
    allLinks = allLinks.concat(links);
    console.log(`Got ${links.length} links from page ${pageNum}. Total so far: ${allLinks.length}`);
    
    // Try to find the "next" button
    const nextBtnSelector = 'a.next.page-numbers';
    const nextBtn = await page.$(nextBtnSelector);
    
    if (nextBtn) {
      console.log(`Clicking next button...`);
      // Use Promise.all to wait for navigation or ajax
      await Promise.all([
        page.waitForResponse(response => response.url().includes('admin-ajax.php') || response.url().includes('page/')),
        nextBtn.click(),
      ]).catch(() => {
        // Sometimes wait for response times out if it's very fast or slow, just wait a bit
      });
      // Wait extra just in case
      await new Promise(r => setTimeout(r, 3000));
      pageNum++;
      
      // Safety limit
      if (pageNum > 20) break;
    } else {
      console.log('No next button found. Finished pagination.');
      hasNext = false;
    }
  }
  
  await browser.close();
  
  // Deduplicate
  const uniqueDocs = [];
  const seenHrefs = new Set();
  for (const r of allLinks) {
    if (!seenHrefs.has(r.href)) {
      seenHrefs.add(r.href);
      uniqueDocs.push(r);
    }
  }
  console.log(`\nFound ${uniqueDocs.length} UNIQUE PDF links total.`);
  
  let added = 0;
  let existingCount = 0;
  
  for (const doc of uniqueDocs) {
    let docTitle = doc.title;
    const lowerTitle = docTitle.toLowerCase().trim();
    if (lowerTitle === 'ver más' || lowerTitle === 'ver mas' || lowerTitle === 'descargar' || lowerTitle === 'descargar pdf' || docTitle.length < 10) {
      // Extract from URL filename
      const urlParts = doc.href.split('/');
      const filename = decodeURIComponent(urlParts[urlParts.length - 1]).replace('.pdf', '').replace(/-/g, ' ');
      // Capitalize first letter of words
      docTitle = filename.replace(/\b\w/g, c => c.toUpperCase());
    }
    
    const { data: existing } = await supabase.from('guias').select('id').eq('url_fuente', doc.href).single();
    if (existing) {
      existingCount++;
      continue;
    }
    
    let year = 2024;
    const yearMatch = docTitle.match(/20[0-2][0-9]/);
    if (yearMatch) year = parseInt(yearMatch[0]);
    else {
      const urlYearMatch = doc.href.match(/20[0-2][0-9]/);
      if (urlYearMatch) year = parseInt(urlYearMatch[0]);
    }
    
    const slug = docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const guiaData = {
      titulo: docTitle,
      slug: slug,
      fuente: 'SAC',
      anio_publicacion: year,
      categoria: categorize(docTitle),
      url_fuente: doc.href,
      contenido_md: "",
      resumen_rapido: `Documento oficial de la Sociedad Argentina de Cardiología: ${docTitle}`
    };
    
    const { error } = await supabase.from('guias').insert(guiaData);
    if (error) {
      console.error(`❌ Error inserting ${docTitle}: ${error.message}`);
    } else {
      console.log(`✅ Added: ${docTitle}`);
      added++;
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`Already in database: ${existingCount}`);
  console.log(`New added: ${added}`);
}

run().catch(console.error);
