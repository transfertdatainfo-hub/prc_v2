import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// GET - Récupérer un backlog spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const backlog = await prisma.backlog.findFirst({
      where: { id: params.id, userId }
    });

    if (!backlog) {
      return NextResponse.json({ error: 'Backlog non trouvé' }, { status: 404 });
    }

    return NextResponse.json(backlog);
  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un backlog
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, parentId, type, backlogType, highlightColor, status } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (type !== undefined) updateData.type = type;
    if (backlogType !== undefined) updateData.backlogType = backlogType;
    if (highlightColor !== undefined) updateData.highlightColor = highlightColor;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.backlog.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur PUT:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Supprimer un backlog
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si l'item a des enfants
    const children = await prisma.backlog.count({
      where: { parentId: params.id }
    });

    if (children > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un élément qui a des enfants' },
        { status: 400 }
      );
    }

    await prisma.backlog.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}