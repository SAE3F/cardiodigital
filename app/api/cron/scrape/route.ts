import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'

// Configuración opcional para evitar timeout (el default de Vercel Pro/Hobby puede variar, 
// pero Next.js app router permite exportar maxDuration).
export const maxDuration = 60 // Segundos

export async function GET(request: Request) {
  let browser = null;
  try {
    const IS_LOCAL = process.env.NODE_ENV === 'development'

    console.log('Iniciando scraper. Modo local:', IS_LOCAL);

    if (IS_LOCAL) {
      // En local, usamos el puppeteer completo que descargó su propio Chrome
      const puppeteerModule = (await import('puppeteer')).default || await import('puppeteer');
      browser = await puppeteerModule.launch({
        headless: true,
      });
    } else {
      // En producción (Vercel), usamos puppeteer-core + sparticuz para no superar los 50MB
      const sparticuz = chromium as any;
      browser = await puppeteerCore.launch({
        args: sparticuz.args,
        defaultViewport: sparticuz.defaultViewport,
        executablePath: await sparticuz.executablePath(),
        headless: sparticuz.headless,
      });
    }

    const page = await browser.newPage();
    
    console.log('Navegando a SAC...');
    await page.goto('https://www.sac.org.ar/consensos/?unidadtematica=consensos-2026', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extraer guías del DOM cargado dinámicamente
    const guiasExtraidas = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      
      const encontradas: any[] = [];
      links.forEach(a => {
        const href = a.href || '';
        
        // Si el enlace apunta a un PDF de la carpeta wp-content/uploads
        if (href.toLowerCase().includes('.pdf') && href.includes('wp-content/uploads')) {
          // Extraemos el título a partir del nombre del archivo PDF
          const parts = href.split('/');
          const filename = parts[parts.length - 1].replace('.pdf', '');
          
          // Limpiamos el texto: quitamos guiones, números sueltos al final, etc.
          let textoLimpio = filename
            .replace(/-/g, ' ')
            .replace(/_/g, '')
            .replace(/\s\d+$/, '') // quita números sueltos al final (ej: "FA 16" -> "FA")
            .trim();
            
          // Capitalizamos la primera letra
          textoLimpio = textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
          
          // Filtramos PDFs que sabemos que no son consensos
          if (textoLimpio.toLowerCase().includes('recertificados') || textoLimpio.toLowerCase().includes('completo c 70')) return;

          encontradas.push({
            titulo: textoLimpio,
            url_fuente: href,
            fuente: 'SAC',
            anio_publicacion: new Date().getFullYear(),
            categoria: 'emergencias', // Idealmente usar IA para clasificarlo, lo dejamos fijo por ahora
            contenido_md: `## ${textoLimpio}\n\nEste consenso fue extraído automáticamente.\n\n[Ver PDF oficial](${href})`,
            activa: true,
            slug: textoLimpio.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            resumen_rapido: 'Consenso/Guía extraída automáticamente desde el portal de la SAC.'
          });
        }
      });
      return encontradas;
    });

    console.log(`Se encontraron ${guiasExtraidas.length} posibles PDFs en la web.`);

    // Eliminar duplicados en base al slug (a veces el mismo PDF aparece 2 veces en la web)
    const unicas = new Map();
    for (const g of guiasExtraidas) {
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
        skippedCount++
      }
    }

    if (browser) await browser.close();

    return NextResponse.json({
      success: true,
      mensaje: `Scraping completado. ${insertCount} guías insertadas, ${skippedCount} saltadas (ya existían). Total extraídas: ${nuevasGuias.length}.`,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    if (browser) await browser.close().catch(() => {});
    console.error('Scraper Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
