import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }
  
  try {
    const feed = await parser.parseURL(url)
    const articles = feed.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      description: item.contentSnippet || item.content || '',
      pubDate: item.pubDate || '',
      author: item.creator || ''
    }))
    
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json({ error: 'Impossible de récupérer les articles' }, { status: 500 })
  }
}
