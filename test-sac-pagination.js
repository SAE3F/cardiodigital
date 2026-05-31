const puppeteer = require('puppeteer');

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const url = 'https://www.sac.org.ar/consensos/?unidadtematica=&orden=&keyword=';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('sac_page_test.html', html);
  
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => a.href && a.href.toLowerCase().includes('.pdf'))
      .map(a => a.href);
  });
  
  console.log(`Found ${links.length} PDF links directly on first load.`);
  
  await browser.close();
}

run();
