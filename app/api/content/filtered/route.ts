import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Build where conditions for metrics
    const metricWhere: any = {
      status: 'PUBLISHED',
      category: 'METRICS'
    }

    if (vertical && vertical !== 'ALL') {
      metricWhere.vertical = vertical
    }

    if (search) {
      metricWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { context: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch articles and metrics in parallel
    const [articles, metrics] = await Promise.all([
      prisma.article.findMany({
        where: articleWhere,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: limit
      }),
      prisma.metric.findMany({
        where: metricWhere,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: Math.floor(limit / 3) // Roughly 1/3 metrics to 2/3 articles
      })
    ])

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