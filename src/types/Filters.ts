// src/types/Filters.ts

export type Filters = {
  language: string;
  category: string;
  sourceId?: string;
  activeInterestFilters: string[];
  showPaywallOnly?: boolean;
  showContentOnly?: boolean;
  showFreeOnly?: boolean;
};