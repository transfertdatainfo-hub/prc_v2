// src\app\api\interest-filters\[id]\route.ts

// src/app/api/interest-filters/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1'; // Temporaire

// GET - Récupérer un filtre spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filter = await prisma.interestFilter.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        keywords: true
      }
    });
    
    if (!filter) {
      return NextResponse.json({ error: 'Filtre non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Erreur GET /api/interest-filters/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour un filtre
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { label, keywords } = await request.json();
    
    // Vérifier que le filtre existe et appartient à l'utilisateur
    const existing = await prisma.interestFilter.findFirst({
      where: {
        id: params.id,
        userId
      }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Filtre non trouvé' }, { status: 404 });
    }
    
    // Mettre à jour dans une transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens mots-clés
      await tx.keyword.deleteMany({
        where: { filterId: params.id }
      });
      
      // Mettre à jour le filtre et créer les nouveaux mots-clés
      return tx.interestFilter.update({
        where: { id: params.id },
        data: {
          label: label?.trim() || existing.label,
          keywords: {
            create: keywords.map((word: string) => ({
              word: word.trim().toLowerCase()
            }))
          }
        },
        include: {
          keywords: true
        }
      });
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur PUT /api/interest-filters/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un filtre
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que le filtre existe et appartient à l'utilisateur
    const existing = await prisma.interestFilter.findFirst({
      where: {
        id: params.id,
        userId
      }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Filtre non trouvé' }, { status: 404 });
    }
    
    // Supprimer (les mots-clés seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.interestFilter.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/interest-filters/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}