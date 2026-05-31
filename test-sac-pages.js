const cheerio = require('cheerio');

async function testSACPages() {
  const res = await fetch('https://www.rac.sac.org.ar/index.php/rac/issue/archive');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const nextLinks = [];
  $('.cmp_pagination a').each((i, el) => {
    nextLinks.push($(el).text().trim());
  });
  
  console.log('Pagination links found:', nextLinks);
  
  // also get the first and last issue titles on page 1
  const issues = [];
  $('.obj_issue_summary a.title').each((i, el) => {
    issues.push($(el).text().trim());
  });
  
  console.log('First issue:', issues[0]);
  console.log('Last issue:', issues[issues.length - 1]);
}

testSACPages().catch(console.error);
