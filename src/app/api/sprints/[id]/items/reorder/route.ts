import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1'; // À remplacer par l'auth

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items requis' }, { status: 400 });
    }

    // Vérifier que le sprint existe et est actif
    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, userId }
    });

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint non trouvé' }, { status: 404 });
    }

    if (sprint.status !== 'active') {
      return NextResponse.json({ error: 'Le sprint n\'est pas actif' }, { status: 400 });
    }

    // Mettre à jour les positions
    await Promise.all(
      items.map((item: { id: string; position: number }) =>
        prisma.sprintItem.update({
          where: {
            sprintId_backlogId: {
              sprintId: params.id,
              backlogId: item.id
            }
          },
          data: { position: item.position }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST /api/sprints/[id]/items/reorder:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}