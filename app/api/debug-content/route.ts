import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking database content...')
    
    // Get basic stats
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalMetrics,
      publishedMetrics,
      draftMetrics
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.metric.count(),
      prisma.metric.count({ where: { status: 'PUBLISHED' } }),
      prisma.metric.count({ where: { status: 'DRAFT' } })
    ])

    // Get vertical distribution
    const verticalStats = await prisma.article.groupBy({
      by: ['vertical'],
      _count: {
        vertical: true
      },
      where: {
        status: 'PUBLISHED'
      }
    })

    // Get recent articles for display
    const recentArticles = await prisma.article.findMany({
      where: { 
        status: 'PUBLISHED'
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 15 // Return more articles for frontend use
    })

    // Get recent metrics (avoiding category filter)
    const recentMetrics = await prisma.metric.findMany({
      where: { 
        status: 'PUBLISHED'
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 5
    })

    console.log(`✅ Debug complete: ${totalArticles} articles, ${totalMetrics} metrics`)

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalMetrics,
        publishedMetrics,
        draftMetrics
      },
      verticalStats,
      recentArticles,
      recentMetrics,
      // ADD: Frontend-ready data
      articles: recentArticles, // For frontend consumption
      metrics: recentMetrics,   // For frontend consumption
      totalCount: recentArticles.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug content failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      articles: [],
      metrics: []
    }, { status: 500 })
  }
} 