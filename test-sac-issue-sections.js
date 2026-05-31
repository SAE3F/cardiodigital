const cheerio = require('cheerio');

async function testSACIssue() {
  console.log('Fetching SAC issue...');
  const res = await fetch('https://www.rac.sac.org.ar/index.php/rac/issue/view/145');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const articles = [];
  
  // In OJS, articles are grouped by section. The section title usually precedes the articles.
  $('.sections > .section').each((i, sectionEl) => {
    const category = $(sectionEl).find('h2, h3').first().text().trim() || 'General';
    
    $(sectionEl).find('.obj_article_summary').each((j, el) => {
      const title = $(el).find('.title a').text().trim();
      const link = $(el).find('.title a').attr('href');
      const pdfLink = $(el).find('a.obj_galley_link.pdf').attr('href');
      
      articles.push({ category, title, link, pdfLink });
    });
  });
  
  console.log('Articles in issue:', articles.length);
  console.log(articles.slice(0, 5));
}

testSACIssue().catch(console.error);
