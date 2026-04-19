
// src/app/api/sources/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les sources pour le filtre "Média"
export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { feeds: true }
        }
      }
    });
    
    console.log(`✅ API sources: ${sources.length} sources trouvées`);
    
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Erreur GET /api/sources:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sources' },
      { status: 500 }
    );
  }
}