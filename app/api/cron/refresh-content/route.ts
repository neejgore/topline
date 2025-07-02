import { NextResponse } from 'next/server'
import { ContentIngestionService } from '@/lib/content-ingestion'

export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.log('❌ Unauthorized cron request')
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    console.log('🔄 Starting daily content refresh...')
    const contentService = new ContentIngestionService()
    
    // Clean up expired content first
    const cleanupCount = await contentService.cleanupExpiredContent()
    console.log(`🧹 Cleaned up ${cleanupCount} expired articles`)
    
    // Fetch new content
    const result = await contentService.ingestFromRSSFeeds()
    console.log(`📡 Ingested ${result.articles} new articles, skipped ${result.skipped}`)
    
    // Get updated stats
    const stats = await contentService.getContentStats()
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        articlesAdded: result.articles,
        articlesSkipped: result.skipped,
        expiredArticlesRemoved: cleanupCount
      },
      stats: {
        totalArticles: stats.totalArticles,
        publishedArticles: stats.publishedArticles,
        recentArticles: stats.recentArticles
      }
    }
    
    console.log('✅ Daily content refresh completed:', response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Content refresh failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request)
} 