export interface JournalArticle {
  sourceId: 'sac' | 'fac' | 'jacc' | 'circulation' | 'ehj' | 'nejm' | 'jama' | 'lancet' | 'rec';
  sourceName: string;
  issueTitle: string;
  category: string;
  title: string;
  link: string;
  pdfLink: string;
  isGuideline: boolean;
  isExternal?: boolean;
}

import localJournals from './journals.json';
import intlJournals from './journals-intl.json';

// Las guías detectadas dentro de revistas (nacionales)
export const GUIDELINES_FROM_JOURNALS = localJournals.filter((j: any) => j.isGuideline);

// Artículos regulares de revistas (nacionales + internacionales)
export const REGULAR_ARTICLES = [
  ...localJournals.filter((j: any) => !j.isGuideline),
  ...intlJournals
];
