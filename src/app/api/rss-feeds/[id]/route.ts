// src/app/api/rss-feeds/[id]/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Récupérer le flux pour connaître sa sourceId
    const feed = await prisma.rSSFeed.findUnique({
      where: { id: params.id },
      select: { sourceId: true }
    })

    if (!feed) {
      return NextResponse.json({ error: 'Flux non trouvé' }, { status: 404 })
    }

    // 2. Supprimer le flux
    await prisma.rSSFeed.delete({
      where: { id: params.id }
    })

    // 3. Vérifier si la source a encore d'autres flux
    if (feed.sourceId) {
      const remainingFeeds = await prisma.rSSFeed.count({
        where: { sourceId: feed.sourceId }
      })

      // 4. Si plus aucun flux, supprimer la source
      if (remainingFeeds === 0) {
        await prisma.source.delete({
          where: { id: feed.sourceId }
        })
        console.log(`🗑️ Source supprimée car plus de flux associés`)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}