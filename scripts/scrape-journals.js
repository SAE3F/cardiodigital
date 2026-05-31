const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SOURCES = [
  {
    id: 'fac',
    name: 'Revista de la Federación Argentina de Cardiología',
    archiveUrl: 'https://revistafac.org.ar/ojs/index.php/revistafac/issue/archive',
    pages: 2
  },
  {
    id: 'sac',
    name: 'Revista Argentina de Cardiología',
    archiveUrl: 'https://www.rac.sac.org.ar/index.php/rac/issue/archive',
    pages: 1 // SAC only has 1 page of archives as of current check (25 issues)
  }
];

// Keywords to flag an article as a Guideline/Consensus
const GUIDELINE_KEYWORDS = ['consenso', 'suplemento', 'recomendacion', 'posicionamiento', 'guía', 'guia'];

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  return await res.text();
}

function isGuideline(title, category) {
  const text = `${title} ${category}`.toLowerCase();
  return GUIDELINE_KEYWORDS.some(kw => text.includes(kw));
}

async function scrapeSource(source) {
  console.log(`\n=== Scraping ${source.id.toUpperCase()} ===`);
  const allIssues = [];

  // Scrape archive pages for issue links
  for (let page = 1; page <= source.pages; page++) {
    const url = page === 1 ? source.archiveUrl : `${source.archiveUrl}/${page}`;
    console.log(`Fetching archive page ${page}...`);
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      
      $('.obj_issue_summary').each((i, el) => {
        let title = $(el).find('a.title').text().trim();
        const series = $(el).find('.series').text().trim();
        if (series) {
          // Si tiene serie (ej: "Vol. 55 Núm. 1 (2026)"), lo sumamos al título si no está ya
          title = `${title} - ${series}`;
        }
        
        const link = $(el).find('a.title').attr('href');
        if (link) {
          allIssues.push({ title, link });
        }
      });
    } catch (err) {
      console.error(`Error fetching archive page ${page}:`, err.message);
    }
  }

  console.log(`Found ${allIssues.length} issues for ${source.id.toUpperCase()}`);

  const articlesResult = [];

  // Scrape each issue for articles
  for (let i = 0; i < allIssues.length; i++) {
    const issue = allIssues[i];
    console.log(`[${i+1}/${allIssues.length}] Fetching issue: ${issue.title}`);
    try {
      const html = await fetchHtml(issue.link);
      const $ = cheerio.load(html);
      
      $('.sections > .section').each((_, sectionEl) => {
        let category = $(sectionEl).find('h2, h3').first().text().trim();
        if (!category) category = 'Artículos';
        
        $(sectionEl).find('.obj_article_summary').each((_, el) => {
          const title = $(el).find('.title a').text().trim().replace(/\s+pp\.\s*[\d-]+$/, ''); // Clean up page numbers if any
          const link = $(el).find('.title a').attr('href');
          const pdfLink = $(el).find('a.obj_galley_link.pdf').attr('href');
          
          if (title && pdfLink) {
            articlesResult.push({
              sourceId: source.id,
              sourceName: source.name,
              issueTitle: issue.title,
              category,
              title,
              link,
              pdfLink,
              isGuideline: isGuideline(title, category)
            });
          }
        });
      });
    } catch (err) {
      console.error(`Error fetching issue ${issue.link}:`, err.message);
    }
    
    // Add small delay to not overwhelm servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return articlesResult;
}

async function main() {
  let allArticles = [];
  
  for (const source of SOURCES) {
    const articles = await scrapeSource(source);
    allArticles = allArticles.concat(articles);
  }
  
  const outputPath = path.join(__dirname, '../lib/data/journals.json');
  fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2));
  console.log(`\n✅ Scraped a total of ${allArticles.length} articles.`);
  console.log(`✅ Saved to lib/data/journals.json`);
}

main().catch(console.error);
