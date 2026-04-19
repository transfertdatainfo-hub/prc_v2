//src\app\api\backlogs\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// GET - Récupérer tous les backlogs (plus de filtre par type)
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
    const { title, description, backlogType, status, parentId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    const backlog = await prisma.backlog.create({
      data: {
        title: title.trim(),
        description: description || null,
        backlogType: backlogType || 'task',
        status: status || 'draft',
        parentId: parentId || null,
        userId
      }
    });

    return NextResponse.json(backlog);
  } catch (error) {
    console.error('Erreur POST /api/backlogs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}