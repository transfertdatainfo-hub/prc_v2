// src/app/api/interest-filters/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userId = 'user-1'; // Temporaire, à remplacer par l'auth plus tard

// GET - Récupérer tous les filtres d'intérêts de l'utilisateur
export async function GET() {
  try {
    const filters = await prisma.interestFilter.findMany({
      where: { userId },
      include: {
        keywords: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(filters);
  } catch (error) {
    console.error('Erreur GET /api/interest-filters:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau filtre d'intérêt
export async function POST(request: Request) {
  try {
    const { label, keywords } = await request.json();
    
    // Validation
    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 });
    }
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Au moins un mot-clé est requis' }, { status: 400 });
    }
    
    // Vérifier si un filtre avec ce nom existe déjà
    const existing = await prisma.interestFilter.findFirst({
      where: {
        userId,
        label: label.trim()
      }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Un filtre avec ce nom existe déjà' }, { status: 400 });
    }
    
    // Créer le filtre avec ses mots-clés
    const filter = await prisma.interestFilter.create({
      data: {
        label: label.trim(),
        userId,
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
    
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Erreur POST /api/interest-filters:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}