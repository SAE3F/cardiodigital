async function run() {
  // Try an ESC guideline DOI: 10.1093/eurheartj/ehae176 (2024 AFib Guideline)
  const doi = '10.1093/eurheartj/ehae176';
  const url = `https://api.unpaywall.org/v2/${doi}?email=test@test.com`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  console.log('Is OA?', data.is_oa);
  if (data.best_oa_location) {
    console.log('PDF URL:', data.best_oa_location.url_for_pdf);
  }
}
run();
