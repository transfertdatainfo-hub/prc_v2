// src/lib/filters/newsFilters.ts

import { Article } from '@/types/Article';
import { Filters } from '@/types/Filters';
import { applyBlockFilters } from './blockFilterEngine';
import { InterestFilter, KeywordBlock } from '@/types/InterestFilter';

// Anciennes fonctions de détection (gardées pour compatibilité)
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
const isFrench = (text: string) => /[éèêàùçîô]/i.test(text);
const isEnglish = (text: string) => /^[\x00-\x7F]*$/.test(text);

const isPolitique = (text: string) =>
  /(politique|gouvernement|élection|député|ministre)/i.test(text);
const isGuerre = (text: string) =>
  /(guerre|armée|conflit|attaque|bombardement)/i.test(text);
const isEconomie = (text: string) =>
  /(économie|finance|marché|bourse|inflation)/i.test(text);

/**
 * Transforme un InterestFilter avec ses blocs en format compatible pour le moteur de filtrage
 */
function prepareFilterForEngine(filter: InterestFilter): { id: string; label: string; blocks: KeywordBlock[] } {
  // Si le filtre a des blocs, les utiliser
  if (filter.blocks && Array.isArray(filter.blocks) && filter.blocks.length > 0) {
    return {
      id: filter.id,
      label: filter.label,
      blocks: filter.blocks as KeywordBlock[]
    };
  }
  
  // Fallback pour les anciens filtres sans blocs : créer un bloc unique
  const oldKeywords = filter.keywords.map(k => k.word);
  return {
    id: filter.id,
    label: filter.label,
    blocks: [
      {
        id: `legacy-${filter.id}`,
        keywords: oldKeywords,
        isExclusion: false
      }
    ]
  };
}

/**
 * Fonction principale de filtrage
 * Combine les anciens filtres (langue, catégorie) avec les nouveaux filtres d'intérêts
 * et les filtres spéciaux (payant, contenu)
 */
export function filterArticles(
  articles: Article[],
  filters: Filters,
  interestFilters: InterestFilter[] = []
): Article[] {
  if (!articles.length) return [];
  
  let result = [...articles];
  
  // ==================== FILTRES SPÉCIAUX ====================
  // Ces filtres sont appliqués en premier car ils sont indépendants
  
  // Filtre "Articles payants uniquement"
  if (filters.showPaywallOnly) {
    result = result.filter(article => article.isPaywalled === true);
  }

  // Filtre "Articles gratuits uniquement" (non payants)
  if (filters.showFreeOnly) {
    result = result.filter(article => article.isPaywalled === false);
  }
  
  // Filtre "Articles avec contenu complet uniquement"
  if (filters.showContentOnly) {
    result = result.filter(article => article.hasFullContent === true);
  }
  
  // ==================== FILTRES EXISTANTS ====================
  
  // Filtre langue
  if (filters.language) {
    result = result.filter((a) => {
      const text = `${a.title} ${a.description || ''}`;
      if (filters.language === 'ar') return isArabic(text);
      if (filters.language === 'fr') return isFrench(text);
      if (filters.language === 'en') return isEnglish(text);
      return true;
    });
  }
  
  // Filtre catégorie
  if (filters.category) {
    result = result.filter((a) => {
      const text = `${a.title} ${a.description || ''}`;
      if (filters.category === 'politique') return isPolitique(text);
      if (filters.category === 'guerre') return isGuerre(text);
      if (filters.category === 'economie') return isEconomie(text);
      return true;
    });
  }
  
  // ==================== FILTRES D'INTÉRÊTS PERSONNALISÉS ====================
  // Applique la logique ET/OU/Exclusion avec les blocs
  
  if (filters.activeInterestFilters && filters.activeInterestFilters.length > 0) {
    // Récupérer les filtres actifs avec leurs blocs
    const activeFiltersWithBlocks = interestFilters
      .filter(f => filters.activeInterestFilters.includes(f.id))
      .map(prepareFilterForEngine);
    
    if (activeFiltersWithBlocks.length > 0) {
      // Appliquer le nouveau moteur de filtrage par blocs
      result = applyBlockFilters(result, activeFiltersWithBlocks);
    }
  }
  
  return result;
}