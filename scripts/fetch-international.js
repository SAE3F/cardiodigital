const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Retmax de 350 para cubrir hasta 2025/2026 e incluir Revista Española de Cardiología
const PUBMED_JOURNALS = [
  { term: '"Journal of the American College of Cardiology"[Journal]', sourceId: 'jacc' },
  { term: '"Circulation"[Journal]', sourceId: 'circulation' },
  { term: '"European Heart Journal"[Journal]', sourceId: 'ehj' },
  { term: '"The New England Journal of Medicine"[Journal] AND (cardiology OR cardiovascular OR heart OR coronary)', sourceId: 'nejm' },
  { term: '"JAMA Cardiology"[Journal]', sourceId: 'jama' },
  { term: '"The Lancet. Cardiology"[Journal] OR "Lancet (London, England)"[Journal] AND (cardiology OR cardiovascular OR heart OR coronary)', sourceId: 'lancet' },
  { term: '"Revista espanola de cardiologia"[Journal]', sourceId: 'rec' }
];

async function fetchPubMedJournals() {
  const articles = [];
  
  for (const journal of PUBMED_JOURNALS) {
    console.log(`Fetching PubMed for ${journal.sourceId}...`);
    try {
      const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(journal.term)}&retmax=350&retmode=json`);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult?.idlist;
      
      if (!ids || ids.length === 0) continue;
      
      // PubMed esummary can handle around 300-400 IDs in one GET request, but safer in chunks if needed
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
        
        const isRec = journal.sourceId === 'rec';
        const link = doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${uid}/`;
        
        articles.push({
          title: fullTitle,
          link: link,
          pdfLink: link,
          sourceId: journal.sourceId,
          issueTitle: `${item.source} ${year}`,
          category: 'artículo',
          isExternal: true // REC blocks iframes with frame-ancestors, must be external
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

async function run() {
  const all = await fetchPubMedJournals();
  console.log(`Scraped ${all.length} international/REC articles.`);
  
  fs.writeFileSync(
    path.join(__dirname, '../lib/data/journals-intl.json'),
    JSON.stringify(all, null, 2)
  );
}

run().catch(console.error);
