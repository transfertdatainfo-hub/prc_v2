// l'ancien type Article ne contenait pas les champs liés au flux (feedId, feedTitle, feedUrl), ce qui posait problème pour l'affichage des articles dans la section "All Articles" où ces informations sont nécessaires. En ajoutant ces champs au type Article, nous pouvons désormais afficher correctement les articles avec les informations du flux associé.
/*export type Article = {
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  author?: string;
};*/

export type Article = {
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  author?: string;
  feedId?: string;
  feedTitle?: string;
  feedUrl?: string;
};