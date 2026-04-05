import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// POST - Clôturer un sprint
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le sprint
    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, userId },
      include: {
        items: {
          include: { backlog: true }
        }
      }
    });

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint non trouvé' }, { status: 404 });
    }

    // Vérifier que tous les items sont terminés ou annulés
    const allFinished = sprint.items.every(
      item => item.backlog.status === 'done' || item.backlog.status === 'cancelled'
    );

    if (!allFinished) {
      return NextResponse.json(
        { error: 'Tous les items doivent être "Terminé" ou "Annulé" pour clôturer le sprint' },
        { status: 400 }
      );
    }

    // Déterminer le statut final du sprint
    const hasDone = sprint.items.some(item => item.backlog.status === 'done');
    const finalStatus = hasDone ? 'completed' : 'cancelled';

    // Mettre à jour le sprint
    await prisma.sprint.update({
      where: { id: params.id },
      data: {
        status: finalStatus,
        endedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error) {
    console.error('Erreur POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}