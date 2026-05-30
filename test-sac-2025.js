const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.sac.org.ar/consensos/?unidadtematica=consensos-2026', { waitUntil: 'networkidle0' });
  
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => a.href && (a.href.includes('.pdf') || a.href.includes('wp-content/uploads')))
      .map(a => ({ text: a.innerText.trim(), href: a.href }))
      .filter(l => l.text.length > 5);
  });
  
  console.log("Resultados 2026:", links);
  
  await page.goto('https://www.sac.org.ar/consensos/?unidadtematica=consensos-2025', { waitUntil: 'networkidle0' });
  
  const links2025 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => a.href && (a.href.includes('.pdf') || a.href.includes('wp-content/uploads')))
      .map(a => ({ text: a.innerText.trim(), href: a.href }))
      .filter(l => l.text.length > 5);
  });
  
  console.log("Resultados 2025:", links2025);

  await browser.close();
})();
