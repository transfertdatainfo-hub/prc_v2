// src/app/api/interest-filters/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KeywordBlock } from '@/types/InterestFilter';

const userId = 'user-1'; // Temporaire

// GET - Récupérer un filtre spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filter = await prisma.interestFilter.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        keywords: true
      }
    });
    
    if (!filter) {
      return NextResponse.json({ error: 'Filtre non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({
      ...filter,
      blocks: filter.blocks ? JSON.parse(JSON.stringify(filter.blocks)) : []
    });
  } catch (error) {
    console.error('Erreur GET /api/interest-filters/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un filtre
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { label, blocks } = body;
    
    // Vérifier que le filtre existe et appartient à l'utilisateur
    const existing = await prisma.interestFilter.findFirst({
      where: {
        id: params.id,
        userId
      }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Filtre non trouvé' }, { status: 404 });
    }
    
    // Validation
    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 });
    }
    
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json({ error: 'Au moins un bloc de mots-clés est requis' }, { status: 400 });
    }
    
    const hasKeywords = blocks.some((block: KeywordBlock) => block.keywords.length > 0);
    if (!hasKeywords) {
      return NextResponse.json({ error: 'Au moins un mot-clé est requis' }, { status: 400 });
    }
    
    const exclusionBlocks = blocks.filter((block: KeywordBlock) => block.isExclusion);
    if (exclusionBlocks.length > 1) {
      return NextResponse.json({ error: 'Un seul bloc d\'exclusion est autorisé' }, { status: 400 });
    }
    
    // Extraire tous les mots-clés pour la compatibilité
    const allKeywords = blocks.flatMap((block: KeywordBlock) => 
      block.isExclusion ? [] : block.keywords
    );
    
    // Mettre à jour dans une transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens mots-clés
      await tx.keyword.deleteMany({
        where: { filterId: params.id }
      });
      
      // Mettre à jour le filtre
      return tx.interestFilter.update({
        where: { id: params.id },
        data: {
          label: label.trim(),
          blocks: blocks, // Mettre à jour les blocs
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
    });
    
    return NextResponse.json({
      ...updated,
      blocks: updated.blocks ? JSON.parse(JSON.stringify(updated.blocks)) : []
    });
  } catch (error) {
    console.error('Erreur PUT /api/interest-filters/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un filtre
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.interestFilter.findFirst({
      where: {
        id: params.id,
        userId
      }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Filtre non trouvé' }, { status: 404 });
    }
    
    // Supprimer (les mots-clés seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.interestFilter.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/interest-filters/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}