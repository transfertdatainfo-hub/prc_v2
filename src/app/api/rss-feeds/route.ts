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
        source: true,
        children: {
          include: { source: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Erreur GET /api/rss-feeds:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter un nouveau flux RSS ou une catégorie
export async function POST(request: Request) {
  try {
    const { url, parentId, nodeType, title, sourceId } = await request.json();
    const userId = 'user-1'; // À remplacer par l'auth

    // ============================================================
    // CAS 1 : CRÉATION D'UNE CATÉGORIE
    // ============================================================
    if (nodeType === 'category') {
      // Validation du nom
      if (!title || !title.trim()) {
        return NextResponse.json(
          { error: 'Le nom de la catégorie est requis' },
          { status: 400 }
        );
      }

      // Vérifier que le parent existe si spécifié
      if (parentId) {
        const parent = await prisma.rSSFeed.findFirst({
          where: { id: parentId, userId }
        });
        if (!parent) {
          return NextResponse.json(
            { error: 'Catégorie parente non trouvée' },
            { status: 400 }
          );
        }
      }

      // Vérifier que la source existe si spécifiée
      if (sourceId) {
        const source = await prisma.source.findUnique({
          where: { id: sourceId }
        });
        if (!source) {
          return NextResponse.json(
            { error: 'Source non trouvée' },
            { status: 400 }
          );
        }
      }

      // Créer la catégorie
      const category = await prisma.rSSFeed.create({
        data: {
          title: title.trim(),
          userId,
          parentId: parentId || null,
          nodeType: 'category',
          url: url || null,        // URL optionnelle pour la catégorie
          sourceId: sourceId || null, // Associer la source à la catégorie
        },
        include: { source: true }
      });

      console.log('✅ Catégorie créée:', {
        id: category.id,
        title: category.title,
        source: category.source?.name || 'Aucune source',
        url: category.url || 'Pas d\'URL'
      });

      return NextResponse.json(category);
    }

    // ============================================================
    // CAS 2 : CRÉATION D'UN FLUX RSS
    // ============================================================

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

    // 5. Récupérer ou créer la source
    const detectedSourceId = await getOrCreateSource(url);

    // 6. Vérifier que le parent existe si spécifié
    if (parentId) {
      const parent = await prisma.rSSFeed.findFirst({
        where: { id: parentId, userId }
      });
      if (!parent) {
        return NextResponse.json(
          { error: 'Catégorie parente non trouvée' },
          { status: 400 }
        );
      }
    }

    // 7. Déterminer la sourceId finale
    //    - Si un sourceId est fourni explicitement (ex: pour un flux dans une catégorie), l'utiliser
    //    - Sinon, utiliser la source détectée
    const finalSourceId = sourceId || detectedSourceId;

    // 8. Créer le flux
    const rssFeed = await prisma.rSSFeed.create({
      data: {
        title: feedData.title || 'Sans titre',
        url,
        sourceId: finalSourceId,
        userId,
        parentId: parentId || null,
        nodeType: 'feed',
      },
      include: {
        source: true
      }
    });

    console.log('✅ Flux ajouté:', {
      id: rssFeed.id,
      title: rssFeed.title,
      source: rssFeed.source?.name || 'Aucune source',
      parentId: rssFeed.parentId || 'racine'
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