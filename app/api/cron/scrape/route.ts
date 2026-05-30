import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'

export const maxDuration = 60 // Segundos

const CATEGORIAS_SAC = [
  { id: 'arritmias-y-fibrilacion-auricular', nombre: 'Arritmias y Fibrilación Auricular' },
  { id: 'cardiologia-clinica', nombre: 'Cardiología Clínica' },
  { id: 'cardiopatia-isquemica', nombre: 'Cardiopatía Isquémica' },
  { id: 'cirugia-cardiovascular-y-cardiologia-critica', nombre: 'Cirugía y Crítica' },
  { id: 'imagenes-en-cardiologia', nombre: 'Imágenes' },
  { id: 'insuficiencia-cardiaca-e-hipertension-pulmonar', nombre: 'Insuficiencia Cardíaca' },
  { id: 'prevencion-cardiovascular', nombre: 'Prevención' }
];

export async function GET(request: Request) {
  let browser = null;
  try {
    const IS_LOCAL = process.env.NODE_ENV === 'development'
    console.log('Iniciando scraper avanzado. Modo local:', IS_LOCAL);

    if (IS_LOCAL) {
      const puppeteerModule = (await import('puppeteer')).default || await import('puppeteer');
      browser = await puppeteerModule.launch({
        headless: true,
      });
    } else {
      const sparticuz = chromium as any;
      browser = await puppeteerCore.launch({
        args: sparticuz.args,
        defaultViewport: sparticuz.defaultViewport,
        executablePath: await sparticuz.executablePath(),
        headless: sparticuz.headless,
      });
    }

    const page = await browser.newPage();
    const todasLasGuias: any[] = [];
    
    // Recorrer cada categoría para extraer PDFs
    for (const cat of CATEGORIAS_SAC) {
      console.log(`Navegando a SAC categoría: ${cat.nombre}...`);
      await page.goto(`https://www.sac.org.ar/consensos/?unidadtematica=${cat.id}`, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const guiasCategoria = await page.evaluate((categoriaNombre) => {
        const links = Array.from(document.querySelectorAll('a'));
        const encontradas: any[] = [];
        
        links.forEach(a => {
          const href = a.href || '';
          if (href.toLowerCase().includes('.pdf') && href.includes('wp-content/uploads')) {
            const parts = href.split('/');
            const filename = parts[parts.length - 1].replace('.pdf', '');
            
            let textoLimpio = '';
            const container = a.closest('.wpb_column') || a.closest('div');
            if (container) {
              const lines = (container as HTMLElement).innerText.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
              const idx = lines.findIndex(l => l.toLowerCase().includes('descargar') || l.toLowerCase().includes('ver consenso'));
              if (idx > 0) {
                textoLimpio = lines[idx - 1];
              }
            }
            
            if (!textoLimpio || textoLimpio.length < 5) {
              textoLimpio = filename
                .replace(/-/g, ' ')
                .replace(/_/g, '')
                .replace(/\s\d+$/, '')
                .trim();
            }
              
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

    console.log(`Se encontraron ${todasLasGuias.length} guías en total.`);

    const unicas = new Map();
    for (const g of todasLasGuias) {
      if (!unicas.has(g.slug)) {
        unicas.set(g.slug, g);
      }
    }
    const nuevasGuias = Array.from(unicas.values());

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let insertCount = 0
    let skippedCount = 0
    const errors: any[] = []

    for (const guia of nuevasGuias) {
      const { data: existente } = await supabase
        .from('guias')
        .select('id')
        .eq('slug', guia.slug)
        .maybeSingle()
      
      if (!existente) {
        const { error } = await supabase.from('guias').insert(guia)
        if (!error) {
          insertCount++
        } else {
          errors.push({ slug: guia.slug, error })
        }
      } else {
        // Actualizar la categoría si ya existía pero no estaba categorizada correctamente
        const { error } = await supabase.from('guias').update({ categoria: guia.categoria }).eq('slug', guia.slug);
        skippedCount++
      }
    }

    if (browser) await browser.close();

    return NextResponse.json({
      success: true,
      mensaje: `Scraping por categorías completado. ${insertCount} insertadas, ${skippedCount} actualizadas/saltadas. Total extraídas: ${nuevasGuias.length}.`,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    if (browser) await browser.close().catch(() => {});
    console.error('Scraper Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
