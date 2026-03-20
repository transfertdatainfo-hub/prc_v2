// src\types\Article.ts

export type Article = {
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  author?: string;
  feedId?: string;
  feedTitle?: string;
  feedUrl?: string;
  hasFullContent?: boolean;    // true si le flux fournit le contenu complet
  isPaywalled?: boolean;       // true si l'article est derrière un paywall
  paywallSource?: string;      // Optionnel : comment on l'a détecté
  content?: string;            // Optionnel : le contenu complet si disponible
};