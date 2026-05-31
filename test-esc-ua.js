const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.goto('https://www.escardio.org/Guidelines', { waitUntil: 'networkidle2' });
  
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent.trim(), href: a.href })).filter(a => a.text.toLowerCase().includes('guideline'));
  });
  
  console.log('HTML snippet:', html);
  console.log('Links found:', links.slice(0, 10));
  await browser.close();
}
run();
