// src/lib/rss/contentDetector.ts

/**
 * Détecte si un flux fournit le contenu complet d'un article
 * À utiliser dans fetchArticles et fetchAllArticles
 */
export function detectFullContent(item: any): boolean {
  // Méthode 1 : Présence du champ content:encoded (commun dans RSS)
  if (item['content:encoded'] && item['content:encoded'].length > 0) {
    return true;
  }
  
  // Méthode 2 : Présence du champ content (Atom)
  if (item.content && item.content.length > 0) {
    return true;
  }
  
  // Méthode 3 : La description est longue (plus de 500 caractères)
  if (item.description && item.description.length > 500) {
    return true;
  }
  
  // Méthode 4 : La description contient du HTML élaboré
  if (item.description && 
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
  
  // Liste de domaines connus pour avoir des paywalls
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