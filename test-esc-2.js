const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  await page.goto('https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/', { waitUntil: 'networkidle2' });
  
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent.trim(), href: a.href })).filter(a => a.href.includes('pdf') || a.href.includes('academic.oup.com')).slice(0, 10);
  });
  
  console.log('ESC Links found:', links);
  await browser.close();
}
run();
