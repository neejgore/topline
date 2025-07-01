import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vertical = searchParams.get('vertical') || 'ALL'
    const limit = parseInt(searchParams.get('limit') || '15')

    console.log(`📰 Fetching articles: vertical=${vertical}, limit=${limit}`)

    // Build where conditions for articles only
    const articleWhere: any = {
      status: 'PUBLISHED'
    }

    if (vertical && vertical !== 'ALL') {
      articleWhere.vertical = vertical
    }

    // Fetch articles
    const articles = await prisma.article.findMany({
      where: articleWhere,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit
    })

    console.log(`✅ Found ${articles.length} articles`)

    return NextResponse.json({
      success: true,
      articles,
      totalArticles: articles.length,
      filters: {
        vertical,
        limit
      }
    })

  } catch (error) {
    console.error('❌ Articles fetch failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      articles: []
    }, { status: 500 })
  }
} 