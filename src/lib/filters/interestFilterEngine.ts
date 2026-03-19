// src/lib/filters/interestFilterEngine.ts
import { Article } from '@/types/Article';
import { InterestFilter } from '@/types/InterestFilter';

/**
 * Moteur de filtrage modulaire
 * Chaque filtre est une fonction indépendante
 */

// Interface pour un filtre (structure commune)
export interface FilterFunction {
  (article: Article, keywords: string[]): boolean;
}

// Fonction de filtrage générique : vérifie si l'article contient AU MOINS UN des mots-clés
export const containsAnyKeyword: FilterFunction = (article, keywords) => {
  const textToSearch = [
    article.title,
    article.description || '',
    article.author || '',
    article.feedTitle || ''
  ].join(' ').toLowerCase();
  
  return keywords.some(keyword => textToSearch.includes(keyword.toLowerCase()));
};

// Fonction de filtrage stricte : vérifie si l'article contient TOUS les mots-clés
export const containsAllKeywords: FilterFunction = (article, keywords) => {
  const textToSearch = [
    article.title,
    article.description || '',
    article.author || '',
    article.feedTitle || ''
  ].join(' ').toLowerCase();
  
  return keywords.every(keyword => textToSearch.includes(keyword.toLowerCase()));
};

// Fonction de filtrage par phrase exacte
export const containsExactPhrase: FilterFunction = (article, keywords) => {
  const phrase = keywords.join(' ').toLowerCase();
  const textToSearch = [
    article.title,
    article.description || '',
    article.author || '',
    article.feedTitle || ''
  ].join(' ').toLowerCase();
  
  return textToSearch.includes(phrase);
};

// Fonction principale qui applique tous les filtres actifs
export function applyInterestFilters(
  articles: Article[],
  activeFilters: { id: string; keywords: string[] }[],
  filterFunction: FilterFunction = containsAnyKeyword // Par défaut: "au moins un mot-clé"
): Article[] {
  if (activeFilters.length === 0) return articles;
  
  return articles.filter(article => {
    // L'article est conservé s'il correspond à AU MOINS UN des filtres actifs
    return activeFilters.some(filter => 
      filterFunction(article, filter.keywords)
    );
  });
}

// Pour l'intersection (ET entre filtres) - version alternative
export function applyInterestFiltersStrict(
  articles: Article[],
  activeFilters: { id: string; keywords: string[] }[],
  filterFunction: FilterFunction = containsAnyKeyword
): Article[] {
  if (activeFilters.length === 0) return articles;
  
  return articles.filter(article => {
    // L'article doit correspondre à TOUS les filtres actifs
    return activeFilters.every(filter => 
      filterFunction(article, filter.keywords)
    );
  });
}