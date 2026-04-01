// src/lib/filters/blockFilterEngine.ts

import { Article } from '@/types/Article';
import { KeywordBlock } from '@/types/InterestFilter';

export type ProcessedFilter = {
  id: string;
  label: string;
  inclusionBlocks: string[][];   // Chaque bloc = tableau de mots (OU)
  exclusionBlock: string[] | null; // Un seul bloc d'exclusion (OU)
};

/**
 * Vérifie si un article correspond à un bloc de mots-clés
 * Dans un bloc : opérateur OU (au moins un mot-clé)
 * Recherche dans le titre ET la description
 */
function matchesBlock(article: Article, blockKeywords: string[]): boolean {
  // Recherche dans le titre et la description (en minuscules)
  const titleToSearch = article.title.toLowerCase();
  const descriptionToSearch = (article.description || '').toLowerCase();
  
  // Vérifier si au moins un mot-clé est présent dans le titre OU dans la description
  return blockKeywords.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    const found = titleToSearch.includes(keywordLower) || descriptionToSearch.includes(keywordLower);
    if (found) {
      console.log(`✅ Match trouvé: "${keyword}" dans "${article.title.substring(0, 50)}"`);
    }
    return found

  });
}

/**
 * Vérifie si un article correspond à un filtre complet
 * - Blocs d'inclusion : opérateur ET (tous les blocs doivent correspondre)
 * - Bloc d'exclusion : si présent, l'article ne doit PAS correspondre
 */
function matchesFilter(article: Article, filter: ProcessedFilter): boolean {
  // 1. Vérifier les blocs d'inclusion (tous doivent être vrais)
  // Si aucun bloc d'inclusion, on considère que c'est vrai (pas de condition)
  if (filter.inclusionBlocks.length > 0) {
    const allInclusionBlocksMatch = filter.inclusionBlocks.every(block => 
      matchesBlock(article, block)
    );
    
    if (!allInclusionBlocksMatch) {
      return false;
    }
  }
  
  // 2. Vérifier le bloc d'exclusion (si présent, l'article ne doit pas correspondre)
  if (filter.exclusionBlock && filter.exclusionBlock.length > 0) {
    const matchesExclusion = matchesBlock(article, filter.exclusionBlock);
    if (matchesExclusion) {
      return false;
    }
  }
  
  return true;
}

/**
 * Transforme les blocs bruts en filtre traité
 */
export function processFilter(
  id: string,
  label: string,
  blocks: KeywordBlock[]
): ProcessedFilter {
  const inclusionBlocks: string[][] = [];
  let exclusionBlock: string[] | null = null;
  
  blocks.forEach(block => {
    // Filtrer les mots-clés vides
    const validKeywords = block.keywords.filter(k => k && k.trim().length > 0);
    
    if (validKeywords.length === 0) return;
    
    if (block.isExclusion) {
      // Un seul bloc d'exclusion (prendre le premier trouvé)
      if (!exclusionBlock) {
        exclusionBlock = validKeywords;
      }
    } else {
      inclusionBlocks.push(validKeywords);
    }
  });
  
  return {
    id,
    label,
    inclusionBlocks,
    exclusionBlock
  };
}

/**
 * Applique les filtres d'intérêts avec la logique ET/OU/Exclusion
 * @param articles - Liste des articles à filtrer
 * @param filters - Liste des filtres actifs (chaque filtre a ses blocs)
 * @returns Articles qui correspondent à AU MOINS UN des filtres actifs
 */
export function applyBlockFilters(
  articles: Article[],
  filters: { id: string; label: string; blocks: KeywordBlock[] }[]
): Article[] {
  if (filters.length === 0) return articles;
  
  // Traiter chaque filtre
  const processedFilters = filters.map(filter => 
    processFilter(filter.id, filter.label, filter.blocks)
  );
  
  // Filtrer les filtres qui ont au moins un bloc d'inclusion ou d'exclusion valide
  const validFilters = processedFilters.filter(filter => 
    filter.inclusionBlocks.length > 0 || filter.exclusionBlock !== null
  );
  
  if (validFilters.length === 0) return articles;
  
  // L'article est conservé s'il correspond à AU MOINS UN des filtres actifs
  return articles.filter(article => {
    return validFilters.some(filter => matchesFilter(article, filter));
  });
}