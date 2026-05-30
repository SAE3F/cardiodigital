const puppeteer = require('puppeteer');

(async () => {
  console.log('Lanzando navegador...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navegando a SAC Consensos...');
  await page.goto('https://www.sac.org.ar/consensos/', { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log('Página cargada. Extrayendo estructura...');
  const data = await page.evaluate(() => {
    const urls = Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: a.innerText.trim(), href: a.href }))
      .filter(link => link.href.includes('unidadtematica='));
      
    const selects = Array.from(document.querySelectorAll('select option'))
      .map(opt => ({ text: opt.innerText.trim(), value: opt.value }));

    // Extract all PDFs just in case they are shown by default
    const pdfs = Array.from(document.querySelectorAll('a[href*=".pdf"]')).map(a => a.href);

    return { 
      filterLinks: urls.slice(0, 50),
      selectOptions: selects,
      pdfCount: pdfs.length
    };
  });
  
  console.log('Resultados:', JSON.stringify(data, null, 2));
  
  await browser.close();
})();
