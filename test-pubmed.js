async function testPubMed() {
  try {
    const searchRes = await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term="Journal of the American College of Cardiology"[Journal]&retmax=5&retmode=json');
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult.idlist.join(',');
    
    console.log('Found IDs:', ids);
    
    const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`);
    const summaryData = await summaryRes.json();
    
    const uids = summaryData.result.uids;
    for (const uid of uids) {
      const article = summaryData.result[uid];
      const title = article.title;
      const pubdate = article.pubdate; // e.g. "2024 May 15"
      const source = article.source; // e.g. "J Am Coll Cardiol"
      
      let doi = '';
      if (article.articleids) {
        const doiObj = article.articleids.find(id => id.idtype === 'doi');
        if (doiObj) doi = doiObj.value;
      }
      
      console.log(`- [${source} ${pubdate}] ${title} (DOI: ${doi})`);
    }
  } catch (err) {
    console.error(err);
  }
}

testPubMed();
