// src/types/RSSFeed.ts

import { Source } from './Source';

export type RSSFeed = {
  id: string;
  title: string;
  url?: string | null;  // nullable
  sourceId?: string | null;  // nullable
  source?: Source | null;
  userId: string;
  parentId?: string | null;
  nodeType: 'category' | 'feed';
  createdAt: Date;
  children?: RSSFeed[];  //pour l'arborescence
};