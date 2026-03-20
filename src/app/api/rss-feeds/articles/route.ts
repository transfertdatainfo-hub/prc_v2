// src\app\api\rss-feeds\articles\route.ts

import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

/**
 * Détecte si un article a du contenu complet
 */
function detectFullContent(item: any): boolean {
  // Méthode 1 : Présence de content (riche) et qu'il est significatif
  if (item.content && item.content.length > 200) {
    return true;
  }
  
  // Méthode 2 : contentSnippet est un résumé, mais s'il est long (>500) c'est peut-être complet
  if (item.contentSnippet && item.contentSnippet.length > 500) {
    return true;
  }
  
  // Méthode 3 : Le content (souvent HTML) contient des balises de structure
  if (item.content && 
      (item.content.includes('<p>') || 
       item.content.includes('<div>') ||
       item.content.includes('<img>'))) {
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