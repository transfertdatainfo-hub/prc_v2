// src/types/CategoryNode.ts

import { RSSFeed } from './RSSFeed';
import { Article } from './Article';

export type CategoryNode = {
  id: string;
  title: string;
  url?: string | null;
  nodeType: 'category' | 'feed';
  sourceId?: string | null;
  sourceName?: string;
  parentId?: string | null;
  children: CategoryNode[];
  articles?: Article[];
  isExpanded?: boolean; // Pour l'UI
  level?: number; // Pour l'indentation
};

export type TreeSettings = {
  maxDepth: number; // Niveau max d'arborescence à afficher
  defaultExpanded: boolean; // Par défaut, tout développer ?
  showArticleCount: boolean; // Afficher le nombre d'articles ?
};

export type CategoryViewProps = {
  articles: Article[];
  filters: any;
  loading?: boolean;
};