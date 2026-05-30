const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to SAC consensos...');
  await page.goto('https://www.sac.org.ar/consensos-filtros/', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for content to render...');
  // Intentar esperar a que haya algún elemento de consenso, o simplemente esperar unos segundos
  await new Promise(r => setTimeout(r, 5000));
  
  const results = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links
      .filter(a => a.href && a.href.toLowerCase().includes('pdf'))
      .map(a => ({
        text: a.innerText.trim(),
        href: a.href,
        class: a.className
      }))
      .filter(l => l.text.length > 5);
  });
  
  console.log(`Found ${results.length} PDF links.`);
  console.log(results.slice(0, 10)); // Mostrar los primeros 10
  
  await browser.close();
})();
