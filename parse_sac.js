const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('sac_page.html', 'utf8');
const $ = cheerio.load(html);
const links = [];

$('a').each((i, el) => {
  const href = $(el).attr('href') || '';
  const text = $(el).text().trim();
  if (text.toLowerCase().includes('consenso') || href.toLowerCase().includes('.pdf')) {
    links.push({ text, href });
  }
});

console.log(JSON.stringify(links, null, 2));
