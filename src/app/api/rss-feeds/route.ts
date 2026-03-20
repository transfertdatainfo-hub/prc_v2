// src\app\api\rss-feeds\route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
})

// GET - Récupérer tous les flux RSS
export async function GET() {
  try {
    const userId = 'user-1'
    
    const feeds = await prisma.rSSFeed.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(feeds)
  } catch (error) {
    console.error('Erreur GET /api/rss-feeds:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Ajouter un nouveau flux RSS
export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    const userId = 'user-1'
    
    console.log('Tentative d\'ajout du flux RSS:', url)
    
    // Validation basique de l'URL
    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: 'URL manquante' }, 
        { status: 400 }
      )
    }
    
    // Vérifier que c'est une URL valide
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'URL invalide' }, 
        { status: 400 }
      )
    }
    
    // Essayer de parser le flux RSS
    let feedData
    try {
      feedData = await parser.parseURL(url)
      console.log('Flux RSS parsé avec succès:', feedData.title)
    } catch (parseError: any) {
      console.error('Erreur de parsing RSS:', parseError.message)
      
      // Messages d'erreur plus explicites
      if (parseError.message.includes('Non-whitespace')) {
        return NextResponse.json(
          { error: 'L\'URL fournie ne contient pas un flux RSS valide. Vérifiez que l\'URL pointe vers un flux RSS (XML).' },
          { status: 400 }
        )
      }
      
      if (parseError.message.includes('404')) {
        return NextResponse.json(
          { error: 'Flux RSS introuvable à cette adresse.' },
          { status: 400 }
        )
      }
      
      if (parseError.message.includes('ECONNREFUSED') || parseError.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Impossible de se connecter au serveur du flux RSS.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Erreur lors de la lecture du flux RSS: ${parseError.message}` },
        { status: 400 }
      )
    }
    
    // Vérifier si le flux existe déjà pour cet utilisateur
    const existingFeed = await prisma.rSSFeed.findFirst({
      where: {
        url,
        userId
      }
    })
    
    if (existingFeed) {
      return NextResponse.json(
        { error: 'Ce flux RSS est déjà dans votre liste' },
        { status: 400 }
      )
    }
    
    // Créer le flux dans la base de données
    const rssFeed = await prisma.rSSFeed.create({
      data: {
        title: feedData.title || 'Sans titre',
        url,
        userId
      }
    })
    
    console.log('Flux RSS ajouté avec succès:', rssFeed)
    return NextResponse.json(rssFeed)
    
  } catch (error: any) {
    console.error('Erreur POST /api/rss-feeds:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'ajout du flux RSS' },
      { status: 500 }
    )
  }
}
