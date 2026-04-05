import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1'; // Temporaire, à remplacer par l'auth

// GET - Récupérer tous les backlogs
export async function GET() {
  try {
    const backlogs = await prisma.backlog.findMany({
      where: { userId },
      orderBy: { position: 'asc' }
    });
    return NextResponse.json(backlogs);
  } catch (error) {
    console.error('Erreur GET /api/backlogs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau backlog
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, backlogType, type, description, parentId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    // Calculer la position
    const lastItem = await prisma.backlog.findFirst({
      where: { userId, type, parentId: parentId || null },
      orderBy: { position: 'desc' }
    });

    const position = lastItem ? lastItem.position + 1 : 0;

    const backlog = await prisma.backlog.create({
      data: {
        title: title.trim(),
        backlogType: backlogType || 'task',
        type: type || 'project',
        description: description || null,
        parentId: parentId || null,
        userId,
        position,
        status: 'draft' // Statut initial
      }
    });

    return NextResponse.json(backlog);
  } catch (error) {
    console.error('Erreur POST /api/backlogs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}