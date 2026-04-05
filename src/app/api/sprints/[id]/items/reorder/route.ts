import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1';

// POST - Réorganiser les items d'un sprint
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { items } = body;

    // Mettre à jour les positions dans une transaction
    await prisma.$transaction(
      items.map((item: { id: string; position: number }) =>
        prisma.sprintItem.update({
          where: { id: item.id },
          data: { position: item.position }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}