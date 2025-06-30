import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get sample articles with their URLs
    const articles = await prisma.article.findMany({
      where: { 
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        sourceName: true,
        vertical: true
      },
      take: 10,
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      articles: articles,
      urlCheck: articles.map(article => ({
        title: article.title,
        hasUrl: !!article.sourceUrl,
        urlValid: article.sourceUrl && !article.sourceUrl.includes('example.com'),
        url: article.sourceUrl,
        vertical: article.vertical
      }))
    })

  } catch (error) {
    console.error('❌ Debug failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 