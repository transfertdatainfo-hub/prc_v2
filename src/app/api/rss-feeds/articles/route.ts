// src/app/api/rss-feeds/articles/route.ts

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

/**
 * Détecte si un article a du contenu complet
 * 
 * Règles (dans l'ordre) :
 * 1. Présence de content:encoded → Contenu
 * 2. Présence de content (Atom) → Contenu
 * 3. Description de plus de 1000 caractères → Contenu
 */
function detectFullContent(item: any): boolean {
  
  // Règle 1 : content:encoded (RSS avec extension)
  if (item['content:encoded'] && item['content:encoded'].length > 0) {
    return true;
  }
  
  // Règle 2 : content (Atom)
  if (item.content) {
    if (typeof item.content === 'string' && item.content.length > 0) {
      return true;
    }
    if (typeof item.content === 'object') {
      const contentObj = item.content as any;
      const contentStr = contentObj._ || contentObj['#'] || '';
      if (contentStr.length > 0) {
        return true;
      }
    }
  }
  
  // Règle 3 : Description de plus de 1000 caractères
  if (item.description && item.description.length > 1000) {
    return true;
  }
  
  return false;
}

/**
 * Détecte si l'article est probablement payant
 */
function detectPaywall(link: string): { isPaywalled: boolean; paywallSource?: string } {
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
      return { isPaywalled: true, paywallSource: 'url_pattern' };
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
    'nytimes.com',
    'theglobeandmail.com',
    'thestar.com',
    'lapresse.ca'
  ];
  
  try {
    const domain = new URL(link).hostname.replace('www.', '');
    if (paywallDomains.includes(domain)) {
      return { isPaywalled: true, paywallSource: 'known_domain' };
    }
  } catch (e) {
    // Ignorer les URLs invalides
  }
  
  return { isPaywalled: false };
}

/**
 * Extrait le contenu d'un item (gère les différents formats)
 */
function extractContent(item: any): string {
  // Cas 1 : content:encoded (RSS avec extension)
  if (item['content:encoded'] && typeof item['content:encoded'] === 'string') {
    return item['content:encoded'];
  }
  
  // Cas 2 : content (Atom) - peut être une chaîne ou un objet
  if (item.content) {
    if (typeof item.content === 'string') {
      return item.content;
    }
    if (typeof item.content === 'object') {
      const contentObj = item.content as any;
      return contentObj._ || contentObj['#'] || '';
    }
  }
  
  // Cas 3 : fallback sur la description
  return item.description || '';
}

/**
 * Extrait la description d'un item
 */
function extractDescription(item: any): string {
  // Priorité à contentSnippet (résumé court)
  if (item.contentSnippet && typeof item.contentSnippet === 'string') {
    return item.contentSnippet;
  }
  
  // Sinon summary (Atom)
  if (item.summary && typeof item.summary === 'string') {
    return item.summary;
  }
  
  // Sinon description
  if (item.description && typeof item.description === 'string') {
    return item.description;
  }
  
  // Fallback sur le contenu (tronqué)
  const content = extractContent(item);
  if (content.length > 500) {
    return content.substring(0, 500) + '...';
  }
  
  return content;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }
  
  try {
    const feed = await parser.parseURL(url)
    
    console.log('📡 Flux chargé:', {
      url,
      itemsCount: feed.items.length,
      firstItemKeys: feed.items[0] ? Object.keys(feed.items[0]) : []
    })
    
    const articles = feed.items.map((item: any, index: number) => {
      const hasFullContent = detectFullContent(item);
      const paywallInfo = detectPaywall(item.link || '');
      const content = extractContent(item);
      const description = extractDescription(item);
      
      // Log pour debug (seulement les 3 premiers articles)
      if (index < 3) {
        console.log(`📄 Article ${index + 1}:`, {
          title: item.title?.substring(0, 50),
          hasFullContent,
          descriptionLength: description.length,
          hasContentEncoded: !!item['content:encoded'],
          hasContent: !!item.content
        });
      }
      
      return {
        title: item.title || '',
        link: item.link || '',
        description: description,
        pubDate: item.pubDate || item.published || item.updated || '',
        author: item.creator || item.author || '',
        hasFullContent: hasFullContent,
        isPaywalled: paywallInfo.isPaywalled,
        paywallSource: paywallInfo.paywallSource,
        content: content,
      };
    });
    
    return NextResponse.json(articles)
  } catch (error) {
    console.error('❌ Erreur RSS:', error);
    return NextResponse.json({ error: 'Impossible de récupérer les articles' }, { status: 500 })
  }
}