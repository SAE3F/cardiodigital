const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('sac_guias.html', 'utf-8');
const $ = cheerio.load(html);

// Intentar encontrar enlaces a PDFs o a las páginas de consensos
let count = 0;
$('a').each((i, el) => {
  const href = $(el).attr('href');
  const text = $(el).text().trim();
  if (href && (href.toLowerCase().includes('consenso') || href.toLowerCase().includes('pdf'))) {
    if (text.length > 5) {
      console.log(`Title: ${text}`);
      console.log(`URL: ${href}`);
      console.log('---');
      count++;
    }
  }
});
console.log('Total found:', count);
