// src/lib/filters/newsFilters.ts
import { Article } from '@/types/Article';
import { Filters } from '@/types/Filters';
import { applyInterestFilters, containsAnyKeyword } from './interestFilterEngine';

// Import des anciennes fonctions de détection (à garder pour la compatibilité)
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
 * Fonction principale de filtrage
 * Combine les anciens filtres (langue, catégorie) avec les nouveaux filtres d'intérêts
 */
export function filterArticles(
  articles: Article[],
  filters: Filters,
  interestFilters: { id: string; keywords: string[] }[] = [] // Les filtres d'intérêts avec leurs mots-clés
): Article[] {
  if (!articles.length) return [];
  
  let result = [...articles];
  
  // 1. FILTRES EXISTANTS (langue, catégorie, etc.)
  
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
  
  // Anciens filtres "Ma recherche" (à garder pour l'instant)
    
  // 2. NOUVEAU : Filtres d'intérêts personnalisés
  if (filters.activeInterestFilters && filters.activeInterestFilters.length > 0) {
    // Récupérer les filtres actifs avec leurs mots-clés
    const activeFiltersWithKeywords = interestFilters.filter(f => 
      filters.activeInterestFilters.includes(f.id)
    );
    
    if (activeFiltersWithKeywords.length > 0) {
      // Appliquer le moteur de filtrage modulaire
      result = applyInterestFilters(result, activeFiltersWithKeywords, containsAnyKeyword);
    }
  }
  
  return result;
}