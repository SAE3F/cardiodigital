const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.sac.org.ar/consensos/?unidadtematica=consensos-2026', { waitUntil: 'networkidle0' });
  
  const results = await page.evaluate(() => {
    // The consensuses are usually in a grid or list item. Let's find all '.pdf' links and go up to find a title.
    const pdfLinks = Array.from(document.querySelectorAll('a'))
      .filter(a => a.href && a.href.includes('.pdf') && (a.innerText.includes('Descargar') || a.innerText.includes('Ver consenso')));
    
    return pdfLinks.map(a => {
      // Find a heading nearby. Let's traverse up to a common container (e.g. 2-3 levels up) and find an h1/h2/h3/h4
      let container = a.parentElement;
      for (let i = 0; i < 4; i++) {
        if (container) container = container.parentElement;
      }
      
      let title = "Desconocido";
      if (container) {
        const heading = container.querySelector('h1, h2, h3, h4, h5');
        if (heading) title = heading.innerText.trim();
      }
      
      return {
        title,
        href: a.href,
        text: a.innerText
      };
    });
  });
  
  console.log("Resultados:", results);
  await browser.close();
})();
