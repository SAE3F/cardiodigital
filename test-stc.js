async function test() {
  const doi = '10.1016/j.jacc.2023.08.026';
  const urls = [
    `https://stc.id/${doi}`,
    `https://annas-archive.org/search?q=${doi}`
  ];
  
  for (const url of urls) {
    try {
      console.log(`\nTesting ${url}`);
      const res = await fetch(url, { redirect: 'manual' });
      console.log('Status:', res.status);
      console.log('Location header:', res.headers.get('location'));
    } catch (e) {
      console.error(e.message);
    }
  }
}
test();
