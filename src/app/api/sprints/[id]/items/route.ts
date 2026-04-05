import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// GET - Récupérer les items d'un sprint
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sprintItems = await prisma.sprintItem.findMany({
      where: { sprintId: params.id },
      include: { backlog: true },
      orderBy: { position: 'asc' }
    });

    const items = sprintItems.map(si => ({
      ...si.backlog,
      sprintItemId: si.id,
      position: si.position
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter un item au sprint
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { backlogId, position } = body;

    // Vérifier que le sprint existe
    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, userId }
    });

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint non trouvé' }, { status: 404 });
    }

    // Vérifier que le backlog existe
    const backlog = await prisma.backlog.findFirst({
      where: { id: backlogId, userId }
    });

    if (!backlog) {
      return NextResponse.json({ error: 'Backlog non trouvé' }, { status: 404 });
    }

    // Vérifier qu'il n'est pas déjà dans le sprint
    const existing = await prisma.sprintItem.findFirst({
      where: { sprintId: params.id, backlogId }
    });

    if (existing) {
      return NextResponse.json({ error: 'Item déjà dans le sprint' }, { status: 400 });
    }

    const sprintItem = await prisma.sprintItem.create({
      data: {
        sprintId: params.id,
        backlogId,
        position: position || 0
      }
    });

    // Mettre à jour le statut du backlog à "active"
    await prisma.backlog.update({
      where: { id: backlogId },
      data: { status: 'active' }
    });

    return NextResponse.json(sprintItem);
  } catch (error) {
    console.error('Erreur POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}