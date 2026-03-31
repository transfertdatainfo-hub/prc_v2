// src/lib/rss/contentDetector.ts

/**
 * Détecte si un flux fournit le contenu complet d'un article
 * 
 * Règles (dans l'ordre) :
 * 1. Présence de <content:encoded> → Contenu
 * 2. Présence de <content> (Atom) → Contenu
 * 3. Présence de <p>, <div> ou <img> dans <description> ET longueur >= 1000 → Contenu
 */
export function detectFullContent(item: any): boolean {
  
  // Règle 1 : Présence du champ content:encoded (RSS avec extension)
  if (item['content:encoded'] && item['content:encoded'].length > 0) {
    return true;
  }
  
  // Règle 2 : Présence du champ content (Atom)
  if (item.content && item.content.length > 0) {
    return true;
  }
  
  // Règle 3 : Description avec balises HTML ET longueur >= 1000 caractères
  if (item.description && 
      item.description.length >= 1000 &&
      (item.description.includes('<p>') || 
       item.description.includes('<div>') ||
       item.description.includes('<img>'))) {
    return true;
  }
  
  return false;
}

/**
 * Détecte si l'article est probablement payant
 */
export function detectPaywall(link: string): { isPaywalled: boolean; source: string } {
  const paywallIndicators = [
    '/paywall/',
    '/premium/',
    '/subscribe/',
    'subscription',
    'premium-content',
    'exclusive',
    'member-only'
  ];
  
  for (const indicator of paywallIndicators) {
    if (link.includes(indicator)) {
      return { isPaywalled: true, source: 'url_pattern' };
    }
  }
  
  const paywallDomains = [
    'ft.com',
    'wsj.com',
    'bloomberg.com',
    'lesechos.fr',
    'lemonde.fr',
    'lefigaro.fr',
    'latimes.com',
    'nytimes.com'
  ];
  
  try {
    const domain = new URL(link).hostname.replace('www.', '');
    if (paywallDomains.includes(domain)) {
      return { isPaywalled: true, source: 'known_domain' };
    }
  } catch (e) {
    // Ignorer les URLs invalides
  }
  
  return { isPaywalled: false, source: 'none' };
}