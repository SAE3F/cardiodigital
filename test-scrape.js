const fs = require('fs');
const cheerio = require('cheerio');

async function run() {
  try {
    const res = await fetch('https://www.sac.org.ar/consensos-filtros/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let count = 0;
    // La mayoría de las páginas de WordPress usan clases como 'post' o 'article' o una tabla
    // Vamos a buscar todos los enlaces a PDFs que tengan texto
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.toLowerCase().includes('pdf') && text.length > 10) {
        console.log(`Guía: ${text}`);
        console.log(`URL: ${href}`);
        console.log('---');
        count++;
      }
    });

    console.log('Total PDFs encontrados:', count);
  } catch (e) {
    console.error(e);
  }
}

run();
