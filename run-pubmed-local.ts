import { config } from 'dotenv';
config({ path: '.env.local' });
import { scrapeInternationalPubMed } from './lib/scrapers/internacional-pubmed';

async function main() {
  await scrapeInternationalPubMed();
}
main();
