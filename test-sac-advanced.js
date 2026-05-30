const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://www.sac.org.ar/consensos-filtros/', { waitUntil: 'networkidle0' });
  
  // Esperar un poco extra
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.content();
  fs.writeFileSync('sac_page.html', html);
  
  await page.screenshot({ path: 'sac_screenshot.png', fullPage: true });

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: a.innerText.trim(), href: a.href }))
      .filter(l => l.text.length > 0 && l.href);
  });
  
  fs.writeFileSync('sac_links.json', JSON.stringify(links, null, 2));

  console.log('Done.');
  await browser.close();
})();
