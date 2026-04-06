// src/app/api/sprints/closed/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// GET - Récupérer l'historique des sprints fermés (done ou cancelled)
export async function GET() {
  try {
    const sprints = await prisma.sprint.findMany({
      where: {
        userId,
        status: { in: ['done', 'cancelled'] }
      },
      orderBy: { endedAt: 'desc' }
    });

    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Erreur GET /api/sprints/closed:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}