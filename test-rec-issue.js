const cheerio = require('cheerio');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testRECArticle() {
  try {
    const issueUrl = 'https://www.revespcardiol.org/es-vol-71-num-12-sumario-S0300893218X0012X';
    const res = await fetch(issueUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Buscar todos los articulos
    const articles = [];
    $('.row.ItemSummary').each((i, el) => {
      const titleNode = $(el).find('.ItemSummary-title a');
      const title = titleNode.text().trim();
      let pdfHref = '';
      
      $(el).find('a').each((j, a) => {
        if ($(a).attr('title')?.toLowerCase().includes('pdf') || $(a).text().toLowerCase().includes('pdf')) {
          pdfHref = $(a).attr('href');
        }
      });
      
      if (title && pdfHref) {
        articles.push({
          title,
          pdfUrl: pdfHref.startsWith('http') ? pdfHref : 'https://www.revespcardiol.org' + pdfHref
        });
      }
    });
    
    console.log('Found articles with ItemSummary:', articles.length);
    console.log(articles.slice(0, 3));
    
  } catch (err) {
    console.error(err);
  }
}

testRECArticle();
