// src/app/api/interest-filters/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KeywordBlock, InterestFilterInput } from '@/types/InterestFilter';

const userId = 'user-1'; // Temporaire, à remplacer par l'auth plus tard

// GET - Récupérer tous les filtres d'intérêts de l'utilisateur
export async function GET() {
  try {
    const filters = await prisma.interestFilter.findMany({
      where: { userId },
      include: {
        keywords: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transformer le JSON blocks en objet pour l'interface
    const formattedFilters = filters.map(filter => ({
      ...filter,
      blocks: filter.blocks ? JSON.parse(JSON.stringify(filter.blocks)) : []
    }));
    
    return NextResponse.json(formattedFilters);
  } catch (error) {
    console.error('Erreur GET /api/interest-filters:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau filtre d'intérêt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { label, blocks } = body;
    
    // Validation
    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 });
    }
    
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json({ error: 'Au moins un bloc de mots-clés est requis' }, { status: 400 });
    }
    
    // Vérifier qu'il y a au moins un mot-clé
    const hasKeywords = blocks.some((block: KeywordBlock) => block.keywords.length > 0);
    if (!hasKeywords) {
      return NextResponse.json({ error: 'Au moins un mot-clé est requis' }, { status: 400 });
    }
    
    // Vérifier qu'un seul bloc d'exclusion maximum
    const exclusionBlocks = blocks.filter((block: KeywordBlock) => block.isExclusion);
    if (exclusionBlocks.length > 1) {
      return NextResponse.json({ error: 'Un seul bloc d\'exclusion est autorisé' }, { status: 400 });
    }
    
    // Vérifier si un filtre avec ce nom existe déjà
    const existing = await prisma.interestFilter.findFirst({
      where: {
        userId,
        label: label.trim()
      }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Un filtre avec ce nom existe déjà' }, { status: 400 });
    }
    
    // Extraire tous les mots-clés pour la compatibilité (champ keywords)
    const allKeywords = blocks.flatMap((block: KeywordBlock) => 
      block.isExclusion ? [] : block.keywords
    );
    
    // Créer le filtre avec les blocs en JSON
    const filter = await prisma.interestFilter.create({
      data: {
        label: label.trim(),
        userId,
        blocks: blocks, // Stocker les blocs en JSON
        keywords: {
          create: allKeywords.map((word: string) => ({
            word: word.trim().toLowerCase()
          }))
        }
      },
      include: {
        keywords: true
      }
    });
    
    return NextResponse.json({
      ...filter,
      blocks: filter.blocks ? JSON.parse(JSON.stringify(filter.blocks)) : []
    });
  } catch (error) {
    console.error('Erreur POST /api/interest-filters:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}