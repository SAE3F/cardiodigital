async function run() {
  const query = '("European heart journal"[Journal] OR "Circulation"[Journal] OR "Journal of the American College of Cardiology"[Journal]) AND ("Practice Guideline"[Publication Type]) AND ("2023"[Date - Publication] : "3000"[Date - Publication])';
  
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=20&term=${encodeURIComponent(query)}`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult.idlist;
  
  if (ids.length > 0) {
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();
    
    for (const id of ids) {
      const article = summaryData.result[id];
      const doiObj = article.articleids.find(a => a.idtype === 'doi');
      const doi = doiObj ? doiObj.value : null;
      
      console.log(`\nTitle: ${article.title}`);
      console.log(`Journal: ${article.source}`);
      console.log(`DOI: ${doi}`);
      
      if (doi) {
        const unpRes = await fetch(`https://api.unpaywall.org/v2/${doi}?email=matias@example.com`);
        if (unpRes.ok) {
          const unpData = await unpRes.json();
          if (unpData.best_oa_location && unpData.best_oa_location.url_for_pdf) {
            console.log(`PDF: ${unpData.best_oa_location.url_for_pdf}`);
          } else {
            console.log(`PDF: Not Found via Unpaywall`);
          }
        }
      }
    }
  }
}

run();
