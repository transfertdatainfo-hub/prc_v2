import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// GET - Récupérer tous les sprints
export async function GET() {
  try {
    const sprints = await prisma.sprint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Erreur GET /api/sprints:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau sprint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    const sprint = await prisma.sprint.create({
      data: {
        name: name || `Sprint du ${new Date().toLocaleDateString()}`,
        userId,
        status: 'active'
      }
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Erreur POST /api/sprints:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}