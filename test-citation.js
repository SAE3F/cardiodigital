const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Test ESC (Oxford Academic)
  console.log('Testing ESC...');
  await page.goto('https://academic.oup.com/eurheartj/article/45/39/3932/59942702', { waitUntil: 'networkidle2' });
  const escPdf = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="citation_pdf_url"]');
    return meta ? meta.content : null;
  });
  console.log('ESC PDF URL:', escPdf);

  // Test AHA (Circulation)
  console.log('Testing AHA...');
  await page.goto('https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063', { waitUntil: 'networkidle2' });
  const ahaPdf = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="citation_pdf_url"]');
    return meta ? meta.content : null;
  });
  console.log('AHA PDF URL:', ahaPdf);

  await browser.close();
}

run();
