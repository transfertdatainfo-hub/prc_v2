import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// DELETE - Retirer un item du sprint
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    // Trouver le sprintItem
    const sprintItem = await prisma.sprintItem.findFirst({
      where: {
        sprintId: params.id,
        backlogId: params.itemId
      }
    });

    if (!sprintItem) {
      return NextResponse.json({ error: 'Item non trouvé dans le sprint' }, { status: 404 });
    }

    await prisma.sprintItem.delete({
      where: { id: sprintItem.id }
    });

    // Remettre le statut du backlog à "ready"
    await prisma.backlog.update({
      where: { id: params.itemId },
      data: { status: 'ready' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}