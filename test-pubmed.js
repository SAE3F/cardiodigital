async function run() {
  const query = '("European heart journal"[Journal] OR "Circulation"[Journal] OR "Journal of the American College of Cardiology"[Journal]) AND ("guideline"[Title] OR "guidelines"[Title]) AND ("2023"[Date - Publication] : "3000"[Date - Publication])';
  
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=5&term=${encodeURIComponent(query)}`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult.idlist;
  
  console.log('Found PMIDs:', ids);
  
  if (ids.length > 0) {
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();
    
    for (const id of ids) {
      const article = summaryData.result[id];
      const doi = article.articleids.find(a => a.idtype === 'doi');
      console.log(`\nTitle: ${article.title}`);
      console.log(`Journal: ${article.source}`);
      console.log(`Year: ${article.pubdate.split(' ')[0]}`);
      console.log(`DOI: ${doi ? doi.value : 'N/A'}`);
    }
  }
}

run();
