async function testRecPubMed() {
  const term = '"Revista espanola de cardiologia (English ed.)"[Journal] OR "Revista espanola de cardiologia"[Journal]';
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=5&retmode=json&sort=date`;
  const res = await fetch(url);
  const data = await res.json();
  const ids = data.esearchresult.idlist.join(',');
  console.log(`\nTerm: ${term}`);
  console.log('Top IDs:', ids);
  
  if (!ids) {
    console.log('No results');
    return;
  }
  
  const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`);
  const summaryData = await summaryRes.json();
  
  for (const uid of data.esearchresult.idlist) {
    const item = summaryData.result[uid];
    if (item) {
      console.log(`- ${item.pubdate}: ${item.title}`);
    }
  }
}

testRecPubMed();
