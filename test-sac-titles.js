const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.sac.org.ar/consensos/?unidadtematica=arritmias-y-fibrilacion-auricular', { waitUntil: 'networkidle2' });
  
  const linksInfo = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links
      .filter(a => a.href && a.href.toLowerCase().includes('.pdf'))
      .map(a => {
        const container = a.closest('.wpb_column') || a.closest('div');
        const lines = container ? container.innerText.split('\n').map(l => l.trim()).filter(l => l) : [];
        // The title is usually the longest line or the one before "Descargar"
        return {
          href: a.href,
          lines: lines
        };
      })
      .slice(0, 3);
  });
  
  console.log(JSON.stringify(linksInfo, null, 2));
  await browser.close();
}

run();
