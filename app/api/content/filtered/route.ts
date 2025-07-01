import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getArticlesByVertical } from '@/lib/content'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vertical = searchParams.get('vertical') || 'ALL'
    const limit = parseInt(searchParams.get('limit') || '15')
    const search = searchParams.get('search') || ''

    console.log(`🔍 Filtering content: vertical=${vertical}, limit=${limit}, search=${search}`)

    // Build where conditions for articles
    const articleWhere: any = {
      status: 'PUBLISHED',
      category: { not: 'METRICS' }
    }

    if (vertical && vertical !== 'ALL') {
      articleWhere.vertical = vertical
    }

    if (search) {
      articleWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { sourceName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build where conditions for metrics - SIMPLIFIED to avoid schema issues
    const metricWhere: any = {
      status: 'PUBLISHED'
    }

    if (vertical && vertical !== 'ALL') {
      metricWhere.vertical = vertical
    }

    if (search) {
      metricWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { value: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Use new diverse content system for articles
    const articles = await getArticlesByVertical(
      vertical === 'ALL' ? 'All' : vertical,
      limit
    )

    // Keep existing metrics logic for now (fewer metrics than articles)
    const metrics = await prisma.metric.findMany({
      where: metricWhere,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: Math.floor(limit / 3) // Roughly 1/3 metrics to 2/3 articles
    })

    console.log(`✅ Found ${articles.length} articles and ${metrics.length} metrics`)

    return NextResponse.json({
      success: true,
      articles,
      metrics,
      totalArticles: articles.length,
      totalMetrics: metrics.length,
      filters: {
        vertical,
        search,
        limit
      }
    })

  } catch (error) {
    console.error('❌ Content filtering failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      articles: [],
      metrics: []
    }, { status: 500 })
  }
} 