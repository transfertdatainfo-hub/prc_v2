// src\app\api\rss-feeds\articles\route.ts

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

/**
 * Détecte si un article a du contenu complet
 * 
 * Règles (dans l'ordre) :
 * 1. Présence de content:encoded → Contenu
 * 2. Présence de content (Atom) → Contenu
 * 3. Présence de <p>, <div> ou <img> dans description ET longueur >= 1000 → Contenu
 */
function detectFullContent(item: any): boolean {
  
  // Règle 1 : content:encoded (RSS avec extension)
  if (item['content:encoded'] && item['content:encoded'].length > 0) {
    return true;
  }
  
  // Règle 2 : content (Atom)
  if (item.content && item.content.length > 0) {
    return true;
  }
  
  // Règle 3 : description avec HTML ET longueur >= 1000 caractères
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
  
  // Liste de domaines connus pour avoir des paywalls
  const paywallDomains = [
    'ft.com',
    'wsj.com',
    'bloomberg.com',
    'lesechos.fr',
    'lemonde.fr',
    'lefigaro.fr',
    'latimes.com',
    'nytimes.com',
    'theglobeandmail.com',  // Canada
    'thestar.com',           // Canada
    'lapresse.ca'            // Québec
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }
  
  try {
    const feed = await parser.parseURL(url)
    
    const articles = feed.items.map(item => {
      // Détection du contenu
      const hasFullContent = detectFullContent(item);
      const paywallInfo = detectPaywall(item.link || '');
      
      return {
        // Champs existants
        title: item.title || '',
        link: item.link || '',
        description: item.contentSnippet || item.content || '',
        pubDate: item.pubDate || '',
        author: item.creator || '',
        
        // ✅ NOUVEAUX CHAMPS
        hasFullContent: hasFullContent,
        isPaywalled: paywallInfo.isPaywalled,
        paywallSource: paywallInfo.paywallSource,
        
        // Optionnel : inclure le contenu complet si disponible
        content: item.content || '',
        
        // Debug (optionnel, à enlever en production)
        _debug: {
          contentLength: item.content?.length || 0,
          snippetLength: item.contentSnippet?.length || 0
        }
      };
    });
    
    // Log pour voir ce qu'on reçoit (à enlever en production)
    if (articles.length > 0) {
      console.log('🔍 Premier article:', {
        titre: articles[0].title,
        aContenu: articles[0].hasFullContent,
        estPayant: articles[0].isPaywalled,
        longueurContenu: articles[0].content?.length || 0,
        longueurDescription: articles[0].description?.length || 0
      });
    }
    
    return NextResponse.json(articles)
  } catch (error) {
    console.error('❌ Erreur RSS:', error);
    return NextResponse.json({ error: 'Impossible de récupérer les articles' }, { status: 500 })
  }
}