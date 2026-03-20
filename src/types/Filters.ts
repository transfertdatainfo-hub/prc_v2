// src/types/Filters.ts

export type Filters = {
  language: string;
  category: string;
  mediaFilter?: string;
  activeInterestFilters: string[];
  showPaywallOnly?: boolean;
  showContentOnly?: boolean;
  showFreeOnly?: boolean;
};