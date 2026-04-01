// src/types/InterestFilter.ts

export type Keyword = {
  id: string;
  word: string;
  filterId: string;
  createdAt: Date;
};

// Type pour un bloc de mots-clés
export type KeywordBlock = {
  id: string;
  keywords: string[];      // Mots-clés du bloc (séparés par OU)
  isExclusion: boolean;    // TRUE = bloc d'exclusion (NOT)
};

// Pour la création/édition
export type InterestFilterInput = {
  label: string;
  blocks: KeywordBlock[];
};

// Pour l'affichage (avec les relations Prisma)
export type InterestFilter = {
  id: string;
  label: string;
  userId: string;
  blocks: KeywordBlock[] | null;   // Stocké comme JSON
  keywords: Keyword[];              // Gardé pour compatibilité
  createdAt: Date;
  updatedAt: Date;
};

// Pour l'état local des filtres (ce qui est actif ou non)
export type ActiveFilter = {
  id: string;
  label: string;
  isActive: boolean;
  blocks: KeywordBlock[];
};