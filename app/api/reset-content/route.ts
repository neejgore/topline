import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ContentIngestionService } from '@/lib/content-ingestion'

export async function POST() {
  try {
    console.log('🔄 Resetting content and fetching real articles...')

    // Clear all existing articles (including sample articles)
    console.log('🧹 Clearing existing content...')
    const deletedArticles = await prisma.article.deleteMany({})
    console.log(`🗑️  Deleted ${deletedArticles.count} existing articles`)

    // Clear all existing metrics
    const deletedMetrics = await prisma.metric.deleteMany({})
    console.log(`🗑️  Deleted ${deletedMetrics.count} existing metrics`)

    // Fetch real articles using enhanced RSS ingestion
    console.log('📡 Fetching real articles from RSS feeds with OpenAI evaluation...')
    const contentService = new ContentIngestionService()
    const result = await contentService.ingestFromRSSFeeds()

    // Get final stats
    const stats = await contentService.getContentStats()

    const response = {
      success: true,
      message: 'Content reset and real articles fetched successfully!',
      results: {
        articlesDeleted: deletedArticles.count,
        metricsDeleted: deletedMetrics.count,
        realArticlesAdded: result.articles,
        articlesSkipped: result.skipped
      },
      stats: {
        totalArticles: stats.totalArticles,
        publishedArticles: stats.publishedArticles,
        recentArticles: stats.recentArticles
      },
      note: 'All articles now come from real RSS feeds with OpenAI importance evaluation',
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Content reset completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Content reset failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 