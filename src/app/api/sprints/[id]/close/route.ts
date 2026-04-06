// src/app/api/sprints/[id]/close/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que le sprint existe et appartient à l'utilisateur
    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, userId }
    });

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint non trouvé' }, { status: 404 });
    }

    if (sprint.status !== 'active') {
      return NextResponse.json({ error: 'Le sprint n\'est pas actif' }, { status: 400 });
    }

    // Vérifier que tous les items sont clôturés
    const sprintItems = await prisma.sprintItem.findMany({
      where: { sprintId: params.id },
      include: { backlog: true }
    });

    const allClosed = sprintItems.every(
      si => si.backlog.status === 'done' || si.backlog.status === 'cancelled'
    );

    if (!allClosed) {
      return NextResponse.json(
        { error: 'Tous les items doivent être terminés ou annulés' },
        { status: 400 }
      );
    }

    // Calculer le statut final côté serveur
    // Si au moins un item est "done" → sprint "done", sinon "cancelled"
    const hasDone = sprintItems.some(si => si.backlog.status === 'done');
    const finalStatus = hasDone ? 'done' : 'cancelled';

    const updatedSprint = await prisma.sprint.update({
      where: { id: params.id },
      data: {
        status: finalStatus,
        endedAt: new Date()
      }
    });

    return NextResponse.json(updatedSprint);
  } catch (error) {
    console.error('Erreur POST /api/sprints/[id]/close:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}