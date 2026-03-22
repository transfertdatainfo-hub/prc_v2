// src\types\RSSFeed.ts
import { Source } from './Source';

export type RSSFeed = {
  id: string;
  title: string;
  url: string;
  sourceId?: string;
  source?: Source; // Relation incluse
  userId: string;
  createdAt: Date;
};