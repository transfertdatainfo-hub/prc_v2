// src/app/api/rss-feeds/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un flux spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const feed = await prisma.rSSFeed.findUnique({
      where: { id: params.id },
      include: { source: true }
    });
    
    if (!feed) {
      return NextResponse.json({ error: 'Flux non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(feed);
  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un flux (titre, parentId, nodeType, url, sourceId)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, parentId, url, sourceId, nodeType } = body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (url !== undefined) updateData.url = url || null;
    if (sourceId !== undefined) updateData.sourceId = sourceId || null;
    if (nodeType !== undefined) updateData.nodeType = nodeType;
    
    const updated = await prisma.rSSFeed.update({
      where: { id: params.id },
      data: updateData,
      include: { source: true }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur PUT:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Supprimer un flux
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le flux pour connaître sa sourceId
    const feed = await prisma.rSSFeed.findUnique({
      where: { id: params.id },
      select: { sourceId: true }
    });

    if (!feed) {
      return NextResponse.json({ error: 'Flux non trouvé' }, { status: 404 });
    }

    // Supprimer le flux (les enfants seront supprimés si cascade)
    await prisma.rSSFeed.delete({
      where: { id: params.id }
    });

    // Vérifier si la source a encore d'autres flux
    if (feed.sourceId) {
      const remainingFeeds = await prisma.rSSFeed.count({
        where: { sourceId: feed.sourceId }
      });

      // Si plus aucun flux, supprimer la source
      if (remainingFeeds === 0) {
        await prisma.source.delete({
          where: { id: feed.sourceId }
        });
        console.log(`🗑️ Source supprimée car plus de flux associés`);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}