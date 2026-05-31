const cheerio = require('cheerio');

async function testREC() {
  try {
    const res = await fetch('https://www.revespcardiol.org/es-numeros-anteriores', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // find how they list the previous numbers
    const issues = [];
    $('.list-group-item').each((i, el) => {
      issues.push({
        title: $(el).text().trim().substring(0, 100),
        link: $(el).attr('href')
      });
    });
    
    console.log('Found elements with .list-group-item:', issues.length);
    console.log('First 5:', issues.slice(0, 5));
    
    // Check if there's another selector
    const issuesAlt = [];
    $('a').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      if (text.includes('Vol.') || href?.includes('sumario')) {
        issuesAlt.push({ text, href });
      }
    });
    
    console.log('Found elements with Vol. or sumario:', issuesAlt.slice(0, 5));
    
  } catch (err) {
    console.error(err);
  }
}

testREC();
