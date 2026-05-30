require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const CATEGORIAS_SAC = [
  { id: 'arritmias-y-fibrilacion-auricular', nombre: 'Arritmias y Fibrilación Auricular' },
  { id: 'cardiologia-clinica', nombre: 'Cardiología Clínica' },
  { id: 'cardiopatia-isquemica', nombre: 'Cardiopatía Isquémica' },
  { id: 'cirugia-cardiovascular-y-cardiologia-critica', nombre: 'Cirugía y Crítica' },
  { id: 'imagenes-en-cardiologia', nombre: 'Imágenes' },
  { id: 'insuficiencia-cardiaca-e-hipertension-pulmonar', nombre: 'Insuficiencia Cardíaca' },
  { id: 'prevencion-cardiovascular', nombre: 'Prevención' }
];

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const todasLasGuias = [];
  
  for (const cat of CATEGORIAS_SAC) {
    console.log(`Navegando a SAC categoría: ${cat.nombre}...`);
    await page.goto(`https://www.sac.org.ar/consensos/?unidadtematica=${cat.id}`, { waitUntil: 'networkidle2', timeout: 60000 });
    
    const guiasCategoria = await page.evaluate((categoriaNombre) => {
      const links = Array.from(document.querySelectorAll('a'));
      const encontradas = [];
      
      links.forEach(a => {
        const href = a.href || '';
        if (href.toLowerCase().includes('.pdf') && href.includes('wp-content/uploads')) {
          const parts = href.split('/');
          const filename = parts[parts.length - 1].replace('.pdf', '');
          
          let textoLimpio = filename
            .replace(/-/g, ' ')
            .replace(/_/g, '')
            .replace(/\s\d+$/, '')
            .trim();
            
          textoLimpio = textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
          
          if (textoLimpio.toLowerCase().includes('recertificados') || textoLimpio.toLowerCase().includes('completo c 70')) return;

          let anioReal = new Date().getFullYear();
          const yearMatch = href.match(/20\d{2}/);
          if (yearMatch) anioReal = parseInt(yearMatch[0]);

          encontradas.push({
            titulo: textoLimpio,
            url_fuente: href,
            fuente: 'SAC',
            anio_publicacion: anioReal,
            categoria: categoriaNombre,
            contenido_md: `## ${textoLimpio}\n\nEste consenso fue extraído automáticamente.\n\n[Ver PDF oficial](${href})`,
            activa: true,
            slug: textoLimpio.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            resumen_rapido: `Consenso/Guía de ${categoriaNombre} extraída automáticamente desde el portal de la SAC.`
          });
        }
      });
      return encontradas;
    }, cat.nombre);
    
    console.log(`- Encontradas ${guiasCategoria.length} guías en ${cat.nombre}`);
    todasLasGuias.push(...guiasCategoria);
  }

  const unicas = new Map();
  for (const g of todasLasGuias) {
    if (!unicas.has(g.slug)) { unicas.set(g.slug, g); }
  }
  const nuevasGuias = Array.from(unicas.values());

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  let insertCount = 0;

  for (const guia of nuevasGuias) {
    const { data: existente } = await supabase.from('guias').select('id').eq('slug', guia.slug).maybeSingle();
    if (!existente) {
      const { error } = await supabase.from('guias').insert(guia);
      if (!error) insertCount++;
    } else {
      const { error } = await supabase.from('guias').update({ categoria: guia.categoria }).eq('slug', guia.slug);
      if (!error) insertCount++;
    }
  }

  console.log(`Completado. Insertadas: ${insertCount}. Total: ${nuevasGuias.length}`);
  await browser.close();
}

run().catch(console.error);
