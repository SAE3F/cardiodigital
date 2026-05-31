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
  
  await page.setViewport({ width: 1280, height: 800 });
  
  const url = 'https://www.sac.org.ar/consensos/?unidadtematica=&orden=&keyword=';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  let allLinks = [];
  let pageNum = 1;
  let hasNext = true;
  
  while (hasNext) {
    console.log(`Extracting from page ${pageNum}...`);
    
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter(a => a.href && a.href.toLowerCase().includes('.pdf'))
        .map(a => {
          let title = a.innerText.trim();
          
          // Find the actual title element nearby
          // Method 1: It's inside a slide
          const slide = a.closest('.consensus-preview-slide, .post, article');
          if (slide) {
            const titleEl = slide.querySelector('.consensus-preview-slide__title, .entry-title, h2, h3');
            if (titleEl && titleEl.innerText.trim().length > 5) {
              title = titleEl.innerText.trim();
            }
          } else {
            // Method 2: Check previous element sibling
            let prev = a.previousElementSibling;
            if (prev && prev.tagName.match(/^H[1-6]$|P/) && prev.innerText.trim().length > 5) {
              title = prev.innerText.trim();
            } else if (a.parentElement && a.parentElement.previousElementSibling) {
               let parentPrev = a.parentElement.previousElementSibling;
               if (parentPrev.innerText.trim().length > 5) {
                 title = parentPrev.innerText.trim();
               }
            }
          }
          
          return {
            title: title || a.getAttribute('title') || 'SAC Document',
            href: a.href
          };
        });
    });
    
    allLinks = allLinks.concat(links);
    console.log(`Got ${links.length} links from page ${pageNum}.`);
    
    const nextBtn = await page.$('a.next.page-numbers');
    if (nextBtn) {
      await Promise.all([
        page.waitForResponse(response => response.url().includes('admin-ajax.php') || response.url().includes('page/')),
        nextBtn.click(),
      ]).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      pageNum++;
      if (pageNum > 20) break;
    } else {
      hasNext = false;
    }
  }
  
  await browser.close();
  
  // Clean titles
  allLinks.forEach(doc => {
    let docTitle = doc.title;
    if (docTitle.toLowerCase() === 'ver más' || docTitle.toLowerCase() === 'ver mas' || docTitle.toLowerCase() === 'descargar' || docTitle.length < 5) {
      const urlParts = doc.href.split('/');
      const filename = decodeURIComponent(urlParts[urlParts.length - 1]).replace('.pdf', '').replace(/-/g, ' ');
      docTitle = filename.replace(/\b\w/g, c => c.toUpperCase());
    }
    // Clean up typical SAC prefixes like "Consenso de ..." or weird newlines
    docTitle = docTitle.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    doc.title = docTitle;
  });
  
  console.log(`Updating database...`);
  let updated = 0;
  
  for (const doc of allLinks) {
    const { data: existing } = await supabase.from('guias').select('id, titulo').eq('url_fuente', doc.href).single();
    if (existing) {
      // If the current title in DB is just capitalized filename or has no spaces (like COMPLETOE43), update it!
      if (existing.titulo !== doc.title) {
        const slug = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { error } = await supabase.from('guias').update({ 
          titulo: doc.title,
          slug: slug,
          categoria: categorize(doc.title),
          resumen_rapido: `Documento oficial de la Sociedad Argentina de Cardiología: ${doc.title}`
        }).eq('id', existing.id);
        
        if (!error) {
          console.log(`✅ Updated: ${existing.titulo} -> ${doc.title}`);
          updated++;
        }
      }
    }
  }
  
  console.log(`Done! Updated ${updated} titles.`);
}

run().catch(console.error);
