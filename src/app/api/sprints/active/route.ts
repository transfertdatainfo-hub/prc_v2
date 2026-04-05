import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// GET - Récupérer le sprint actif
export async function GET() {
  try {
    const sprint = await prisma.sprint.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Erreur GET /api/sprints/active:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}