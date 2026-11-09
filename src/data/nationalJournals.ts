import rawJournals from './nationalJournals.json';

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

export interface OfficialPortal {
  id: string;
  name: string;
  society: 'SAC' | 'FAC';
  description: string;
  url: string;
  badge: string;
}

export const OFFICIAL_PORTALS: OfficialPortal[] = [
  {
    id: 'sac-web',
    name: 'Sociedad Argentina de Cardiología (SAC)',
    society: 'SAC',
    description: 'Portal institucional oficial: novedades científicas, áreas temáticas, distritos y eventos de la comunidad cardiológica.',
    url: 'https://www.sac.org.ar',
    badge: 'Portal Oficial'
  },
  {
    id: 'sac-rac',
    name: 'Revista Argentina de Cardiología (RAC)',
    society: 'SAC',
    description: 'Órgano científico oficial de la SAC. Indexada en PubMed/MEDLINE, SciELO, LILACS y Scopus con revisión por pares.',
    url: 'https://www.rac.sac.org.ar',
    badge: 'Revista Científica'
  },
  {
    id: 'sac-consensos',
    name: 'Biblioteca de Consensos y Guías SAC',
    society: 'SAC',
    description: 'Repositorio oficial completo de todos los consensos, guías de práctica clínica y documentos de posición de la SAC.',
    url: 'https://www.sac.org.ar/consensos-y-guias/',
    badge: 'Guías de Práctica'
  },
  {
    id: 'sac-campus',
    name: 'Campus Virtual SAC',
    society: 'SAC',
    description: 'Plataforma educativa oficial: cursos de posgrado, webinars, ateneos clínicos y programas de certificación profesional.',
    url: 'https://campus.sac.org.ar',
    badge: 'Educación Continua'
  },
  {
    id: 'fac-web',
    name: 'Federación Argentina de Cardiología (FAC)',
    society: 'FAC',
    description: 'Portal institucional federal: comités científicos, federaciones y sociedades de cardiología de todo el país.',
    url: 'https://fac.org.ar',
    badge: 'Portal Oficial'
  },
  {
    id: 'fac-rfac',
    name: 'Revista de la FAC (RFAC)',
    society: 'FAC',
    description: 'Publicación oficial trimestral con artículos originales, revisiones, casuística y consensos federales.',
    url: 'https://revistafac.org.ar',
    badge: 'Revista Científica'
  },
  {
    id: 'fac-guias',
    name: 'Guías y Consensos de la FAC',
    society: 'FAC',
    description: 'Documentos normativos y consensos de los diferentes comités científicos federales de la FAC.',
    url: 'https://fac.org.ar/guias-y-consensos/',
    badge: 'Guías de Práctica'
  },
  {
    id: 'fac-educacion',
    name: 'Campus y Cursos FAC',
    society: 'FAC',
    description: 'Cursos virtuales interactivos, ateneos intersocietarios y recursos de capacitación médica continua.',
    url: 'https://fac.org.ar/educacion/',
    badge: 'Educación Continua'
  }
];

export const NATIONAL_ARTICLES: JournalArticle[] = rawJournals as JournalArticle[];

export function filterNationalArticles(params: {
  search?: string;
  sourceId?: 'all' | 'sac' | 'fac';
  category?: string;
  limit?: number;
}): { articles: JournalArticle[]; totalMatches: number } {
  const { search = '', sourceId = 'all', category = 'all', limit = 50 } = params;
  const q = search.trim().toLowerCase();

  const filtered = NATIONAL_ARTICLES.filter(item => {
    if (sourceId !== 'all' && item.sourceId !== sourceId) return false;
    
    if (category !== 'all') {
      const catLower = (item.category || '').toLowerCase();
      if (category === 'original' && !catLower.includes('original')) return false;
      if (category === 'revision' && !catLower.includes('revis')) return false;
      if (category === 'editorial' && !catLower.includes('editorial') && !catLower.includes('director') && !catLower.includes('presidente')) return false;
      if (category === 'casos' && !catLower.includes('caso') && !catLower.includes('carta')) return false;
      if (category === 'imagenes' && !catLower.includes('imág') && !catLower.includes('imagen')) return false;
      if (category === 'consenso' && !item.isGuideline && !catLower.includes('consenso')) return false;
    }

    if (!q) return true;

    return (
      item.title.toLowerCase().includes(q) ||
      item.issueTitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return {
    articles: filtered.slice(0, limit),
    totalMatches: filtered.length
  };
}
