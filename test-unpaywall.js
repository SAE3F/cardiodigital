async function testUnpaywall() {
  const doi = '10.1016/j.recesp.2023.09.006'; // Un DOI de prueba de REC
  try {
    const res = await fetch(`https://api.unpaywall.org/v2/${doi}?email=matias@cardiodigital.app`);
    const data = await res.json();
    console.log('Is OA?', data.is_oa);
    console.log('Best OA Location:', data.best_oa_location);
    if (data.best_oa_location?.url_for_pdf) {
      console.log('Direct PDF URL:', data.best_oa_location.url_for_pdf);
    }
  } catch (err) {
    console.error(err);
  }
}

testUnpaywall();
