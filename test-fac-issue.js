const cheerio = require('cheerio');

async function testFACIssue() {
  console.log('Fetching issue 72 (Regular issue)...');
  const res = await fetch('https://revistafac.org.ar/ojs/index.php/revistafac/issue/view/72');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const articles = [];
  $('.obj_article_summary').each((i, el) => {
    const title = $(el).find('.title a').text().trim();
    const link = $(el).find('.title a').attr('href');
    const pdfLink = $(el).find('a.obj_galley_link.pdf').attr('href');
    articles.push({ title, link, pdfLink });
  });
  
  console.log('Articles in issue:', articles.length);
  console.log(articles);
}

testFACIssue().catch(console.error);
