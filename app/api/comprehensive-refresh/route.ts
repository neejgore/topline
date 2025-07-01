import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ContentIngestionService } from '@/lib/content-ingestion'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive content refresh...')
    
    const startTime = Date.now()
    const ingestionService = new ContentIngestionService()

    // Step 1: Clear old content (but keep some recent articles)
    console.log('🧹 Clearing old content...')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // Step 1: Clear old articles only (keep metrics to prevent duplicates)
    const deletedArticles = await prisma.article.deleteMany({
      where: {
        publishedAt: {
          lt: sevenDaysAgo
        }
      }
    })

    console.log(`🗑️ Deleted ${deletedArticles.count} old articles`)

    // Step 2: ONLY REAL CONTENT - No fake metrics
    console.log('📊 Skipping fake metric generation - using ONLY real RSS content')
    const metricsCreated = 0
    const metricsSkipped = 0

    // Step 3: Fetch content from all RSS sources with optimized settings
    console.log('🔄 Fetching from all RSS sources...')
    const rssResults = await ingestionService.ingestFromRSSFeeds()

    // Step 4: Get final stats
    const [
      totalArticles,
      totalMetrics,
      publishedArticles,
      publishedMetrics
    ] = await Promise.all([
      prisma.article.count(),
      prisma.metric.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.metric.count({ where: { status: 'PUBLISHED' } })
    ])

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`🎉 Comprehensive refresh complete in ${duration}s`)

    return NextResponse.json({
      success: true,
      message: 'Comprehensive content refresh completed successfully',
      results: {
        deletedArticles: deletedArticles.count,
        metricsCreated,
        metricsSkipped,
        rssArticlesAdded: rssResults.articles,
        rssArticlesSkipped: rssResults.skipped,
        finalStats: {
          totalArticles,
          publishedArticles,
          totalMetrics,
          publishedMetrics
        }
      },
      duration: `${duration} seconds`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Comprehensive refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 