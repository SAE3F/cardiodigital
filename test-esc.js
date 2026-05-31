const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.escardio.org/Guidelines', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('Guidelines')).map(a => a.href).slice(0, 10);
  });
  console.log(content);
  await browser.close();
}
run();
