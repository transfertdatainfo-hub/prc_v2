// src/types/InterestFilter.ts

export type InterestFilter = {
  id: string;
  label: string;
  userId: string;
  keywords: Keyword[];
  createdAt: Date;
  updatedAt: Date;
};

export type Keyword = {
  id: string;
  word: string;
  filterId: string;
  createdAt: Date;
};

// Pour la création/édition
export type InterestFilterInput = {
  label: string;
  keywords: string[]; // Liste des mots-clés sous forme de chaînes
};

// Pour l'état local des filtres (ce qui est actif ou non)
export type ActiveFilter = {
  id: string;
  label: string;
  isActive: boolean;
  keywords: string[];
};