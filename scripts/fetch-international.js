const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Retmax de 100 por cada revista top internacional
const PUBMED_JOURNALS = [
  { term: '"Journal of the American College of Cardiology"[Journal]', sourceId: 'jacc' },
  { term: '"Circulation"[Journal]', sourceId: 'circulation' },
  { term: '"European Heart Journal"[Journal]', sourceId: 'ehj' },
  { term: '"The New England Journal of Medicine"[Journal] AND (cardiology OR cardiovascular OR heart OR coronary)', sourceId: 'nejm' },
  { term: '"JAMA Cardiology"[Journal]', sourceId: 'jama' },
  { term: '"The Lancet. Cardiology"[Journal] OR "Lancet (London, England)"[Journal] AND (cardiology OR cardiovascular OR heart OR coronary)', sourceId: 'lancet' }
];

async function fetchPubMedJournals() {
  const articles = [];
  
  for (const journal of PUBMED_JOURNALS) {
    console.log(`Fetching PubMed for ${journal.sourceId}...`);
    try {
      const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(journal.term)}&retmax=150&retmode=json`);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult?.idlist;
      
      if (!ids || ids.length === 0) continue;
      
      const idsChunk = ids.join(',');
      const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idsChunk}&retmode=json`);
      const summaryData = await summaryRes.json();
      
      const uids = summaryData.result.uids;
      for (const uid of uids) {
        const item = summaryData.result[uid];
        
        let doi = '';
        if (item.articleids) {
          const doiObj = item.articleids.find(id => id.idtype === 'doi');
          if (doiObj) doi = doiObj.value;
        }
        
        // Extraer el año del pubdate, p. ej. "2024 May 15" -> "2024"
        const year = item.pubdate ? item.pubdate.split(' ')[0] : 'Desconocido';
        const fullTitle = item.title.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        articles.push({
          title: fullTitle,
          link: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
          pdfLink: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
          sourceId: journal.sourceId,
          issueTitle: `${item.source} ${year}`,
          category: 'artículo',
          isExternal: true
        });
      }
    } catch (e) {
      console.error(`Error fetching ${journal.sourceId}:`, e);
    }
    
    // sleep for 500ms to avoid rate limits
    await new Promise(res => setTimeout(res, 500));
  }
  
  return articles;
}

// Scrape Revista Española de Cardiología
async function fetchREC() {
  const articles = [];
  console.log('Fetching Revista Española de Cardiología...');
  try {
    const res = await fetch('https://www.revespcardiol.org/es-numeros-anteriores', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // REC no expone artículos individuales en la página principal, solo los números
    // Por ende extraemos los números publicados hasta 2018
    const issues = [];
    $('.list-group-item').each((i, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href');
      
      // Parsear el año del texto
      const yearMatch = title.match(/\b(201\d|202\d)\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
      
      if (year >= 2018) {
        if (link && !link.startsWith('http')) {
          link = 'https://www.revespcardiol.org' + link;
        }
        
        articles.push({
          title: title,
          link: link,
          pdfLink: link,
          sourceId: 'rec',
          issueTitle: `REC ${year}`,
          category: 'revista',
          isExternal: true
        });
      }
    });
    
  } catch (e) {
    console.error('Error fetching REC:', e);
  }
  
  return articles;
}

async function run() {
  const intlArticles = await fetchPubMedJournals();
  const recArticles = await fetchREC();
  
  const all = [...intlArticles, ...recArticles];
  console.log(`Scraped ${all.length} international/REC articles.`);
  
  fs.writeFileSync(
    path.join(__dirname, '../lib/data/journals-intl.json'),
    JSON.stringify(all, null, 2)
  );
}

run().catch(console.error);
