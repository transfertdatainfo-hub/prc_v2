// src/lib/rss/sourceDetector.ts

import { prisma } from '@/lib/prisma';

// Règles de détection : associe un domaine à un nom de source
export const DOMAIN_TO_SOURCE: Record<string, string> = {
  // France
  'lemonde.fr': 'Le Monde',
  'lefigaro.fr': 'Le Figaro',
  'lesechos.fr': 'Les Échos',
  'liberation.fr': 'Libération',
  'lexpress.fr': 'L\'Express',
  'lepoint.fr': 'Le Point',
  
  // Canada
  'canada.ca': 'Gouvernement du Canada',
  'radio-canada.ca': 'Radio-Canada',
  'ici.radio-canada.ca': 'Radio-Canada',
  'cbc.ca': 'CBC News',
  'theglobeandmail.com': 'The Globe and Mail',
  'thestar.com': 'Toronto Star',
  'lapresse.ca': 'La Presse',
  'ledevoir.com': 'Le Devoir',
  'journaldequebec.com': 'Le Journal de Québec',
  'journaldemontreal.com': 'Le Journal de Montréal',
  
  // International
  'nytimes.com': 'The New York Times',
  'wsj.com': 'The Wall Street Journal',
  'bloomberg.com': 'Bloomberg',
  'reuters.com': 'Reuters',
  'apnews.com': 'Associated Press',
  'bbc.com': 'BBC News',
  'bbc.co.uk': 'BBC News',
  'theguardian.com': 'The Guardian',
  'economist.com': 'The Economist',
};

/**
 * Détecte le nom de la source à partir de l'URL du flux
 */
export function detectSourceNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname.replace('www.', '');
    
    // Rechercher une correspondance exacte
    if (DOMAIN_TO_SOURCE[domain]) {
      return DOMAIN_TO_SOURCE[domain];
    }
    
    // Rechercher une correspondance partielle (sous-domaine)
    for (const [key, value] of Object.entries(DOMAIN_TO_SOURCE)) {
      if (domain.endsWith(`.${key}`)) {
        return value;
      }
    }
    
    // Fallback : utiliser le domaine principal comme nom
    const mainDomain = domain.split('.')[0];
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    
  } catch (error) {
    console.error('Erreur détection source pour URL:', url, error);
    return 'Source inconnue';
  }
}

/**
 * Récupère ou crée une source en base de données
 * @returns L'ID de la source
 */
export async function getOrCreateSource(url: string): Promise<string | null> {
  try {
    const sourceName = detectSourceNameFromUrl(url);
    
    if (!sourceName || sourceName === 'Source inconnue') {
      return null;
    }
    
    // Chercher si la source existe déjà
    let source = await prisma.source.findUnique({
      where: { name: sourceName }
    });
    
    // Si elle n'existe pas, la créer
    if (!source) {
      source = await prisma.source.create({
        data: { name: sourceName }
      });
      console.log('✨ Nouvelle source créée:', sourceName);
    }
    
    return source.id;
    
  } catch (error) {
    console.error('Erreur getOrCreateSource:', error);
    return null;
  }
}