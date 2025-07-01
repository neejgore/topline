import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking database content...')

    // Get all articles
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get all metrics
    const metrics = await prisma.metric.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get content statistics
    const stats = {
      totalArticles: await prisma.article.count(),
      publishedArticles: await prisma.article.count({ where: { status: 'PUBLISHED' } }),
      draftArticles: await prisma.article.count({ where: { status: 'DRAFT' } }),
      totalMetrics: await prisma.metric.count(),
      publishedMetrics: await prisma.metric.count({ where: { status: 'PUBLISHED' } }),
      draftMetrics: await prisma.metric.count({ where: { status: 'DRAFT' } })
    }

    // Get vertical distribution
    const verticalStats = await prisma.article.groupBy({
      by: ['vertical'],
      _count: { vertical: true }
    })

    console.log(`✅ Debug: Found ${articles.length} articles, ${metrics.length} metrics`)

    return NextResponse.json({
      success: true,
      stats,
      verticalStats,
      recentArticles: articles,
      recentMetrics: metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug content failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 