async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
    console.log(`Content-Disposition: ${res.headers.get('content-disposition')}`);
    console.log('---');
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  const sacView = 'https://www.rac.sac.org.ar/index.php/rac/article/view/3423/6268';
  const sacDl = sacView.replace('/view/', '/download/');
  
  const facView = 'https://revistafac.org.ar/ojs/index.php/revistafac/article/view/804/534';
  const facDl = facView.replace('/view/', '/download/');

  await checkUrl(sacView);
  await checkUrl(sacDl);
  await checkUrl(facView);
  await checkUrl(facDl);
}

main();
