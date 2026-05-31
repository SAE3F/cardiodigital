import journalsData from './journals.json';

export interface JournalArticle {
  sourceId: 'sac' | 'fac';
  sourceName: string;
  issueTitle: string;
  category: string;
  title: string;
  link: string;
  pdfLink: string;
  isGuideline: boolean;
}

export const JOURNALS: JournalArticle[] = journalsData as JournalArticle[];

export const GUIDELINES_FROM_JOURNALS = JOURNALS.filter(j => j.isGuideline);
export const REGULAR_ARTICLES = JOURNALS.filter(j => !j.isGuideline);
