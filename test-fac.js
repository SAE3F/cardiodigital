const cheerio = require('cheerio');

async function testFAC() {
  console.log('Fetching page 1...');
  const res = await fetch('https://revistafac.org.ar/ojs/index.php/revistafac/issue/archive');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const issues = [];
  $('.obj_issue_summary').each((i, el) => {
    const title = $(el).find('.title').text().trim();
    const series = $(el).find('.series').text().trim();
    const link = $(el).find('a.title').attr('href');
    issues.push({ title, series, link });
  });
  
  console.log('Found issues:', issues.length);
  console.log(issues.slice(0, 3));
}

testFAC().catch(console.error);
