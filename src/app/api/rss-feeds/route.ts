// src/app/api/rss-feeds/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';
import { getOrCreateSource } from '@/lib/rss/sourceDetector';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// GET - Récupérer tous les flux RSS
export async function GET() {
  try {
    const userId = 'user-1'; // À remplacer par l'auth
    
    const feeds = await prisma.rSSFeed.findMany({
      where: { userId },
      include: {
        source: true // Inclure la source associée
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Erreur GET /api/rss-feeds:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter un nouveau flux RSS
export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    const userId = 'user-1'; // À remplacer par l'auth

    // 1. Valider l'URL
    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: 'URL manquante' },
        { status: 400 }
      );
    }

    // 2. Vérifier que c'est une URL valide
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    // 3. Parser le flux RSS
    let feedData;
    try {
      feedData = await parser.parseURL(url);
    } catch (error: any) {
      console.error('Erreur parsing RSS:', error.message);
      return NextResponse.json(
        { error: 'Impossible de lire le flux RSS. Vérifiez que l\'URL pointe vers un flux RSS valide.' },
        { status: 400 }
      );
    }

    // 4. Vérifier si le flux existe déjà pour cet utilisateur
    const existingFeed = await prisma.rSSFeed.findFirst({
      where: { url, userId }
    });

    if (existingFeed) {
      return NextResponse.json(
        { error: 'Ce flux RSS est déjà dans votre liste' },
        { status: 400 }
      );
    }

    // 5. Récupérer ou créer la source (⭐ ÉTAPE CLÉ)
    const sourceId = await getOrCreateSource(url);

    // 6. Créer le flux
    const rssFeed = await prisma.rSSFeed.create({
      data: {
        title: feedData.title || 'Sans titre',
        url,
        sourceId, // 👈 Seulement l'ID de la source
        userId
      },
      include: {
        source: true // Inclure la source dans la réponse
      }
    });

    console.log('✅ Flux ajouté:', {
      title: rssFeed.title,
      source: rssFeed.source?.name || 'Aucune source'
    });

    return NextResponse.json(rssFeed);

  } catch (error: any) {
    console.error('Erreur POST /api/rss-feeds:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'ajout du flux RSS' },
      { status: 500 }
    );
  }
}