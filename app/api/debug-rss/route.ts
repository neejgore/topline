import { NextResponse } from 'next/server'
import { CONTENT_SOURCES } from '@/lib/content-sources'
import { ContentIngestionService } from '@/lib/content-ingestion'
import { prisma } from '@/lib/db'

const Parser = require('rss-parser')
const parser = new Parser()

export async function POST() {
  try {
    console.log('🔍 COMPREHENSIVE RSS DEBUG STARTING...')

    const results = {
      totalSources: CONTENT_SOURCES.rssFeeds.length,
      sourceTests: [] as any[],
      currentArticles: 0,
      ingestionTest: null as any,
      dateTest: {
        sixDaysAgo: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        now: new Date().toISOString(),
        lookbackHours: 144
      }
    }

    // Test 1: Check current articles in database
    const currentArticles = await prisma.article.count({
      where: { status: 'PUBLISHED' }
    })
    results.currentArticles = currentArticles
    console.log(`📊 Current published articles: ${currentArticles}`)

    // Test 2: Test each RSS source individually
    console.log('🌐 Testing individual RSS sources...')
    for (let i = 0; i < Math.min(5, CONTENT_SOURCES.rssFeeds.length); i++) {
      const source = CONTENT_SOURCES.rssFeeds[i]
      const sourceTest = {
        name: source.name,
        url: source.url,
        category: source.category,
        accessible: false,
        totalItems: 0,
        recentItems: 0,
        sampleTitles: [] as string[],
        error: null as string | null
      }
      
      try {
        console.log(`Testing ${source.name}...`)
        const feed = await parser.parseURL(source.url)
        sourceTest.accessible = true
        sourceTest.totalItems = feed.items?.length || 0
        
        if (feed.items) {
          const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          
          sourceTest.recentItems = feed.items.filter((item: any) => {
            const pubDate = new Date(item.pubDate || item.isoDate || Date.now())
            return pubDate >= sixDaysAgo
          }).length
          
          sourceTest.sampleTitles = feed.items.slice(0, 3).map((item: any) => item.title)
        }
        
        console.log(`✅ ${source.name}: ${sourceTest.totalItems} total, ${sourceTest.recentItems} recent`)
        
      } catch (error) {
        sourceTest.error = error instanceof Error ? error.message : 'Unknown error'
        console.log(`❌ ${source.name}: ${sourceTest.error}`)
      }
      
      results.sourceTests.push(sourceTest)
    }

    // Test 3: Run a small ingestion test
    console.log('🔄 Testing ingestion service...')
    try {
      const ingestionService = new ContentIngestionService()
      
      // Test with just first 2 sources
      const testSources = CONTENT_SOURCES.rssFeeds.slice(0, 2)
      const ingestionResult = await ingestionService.ingestFromRSSFeeds()
      
      results.ingestionTest = {
        success: true,
        articlesAdded: ingestionResult.articles,
        articlesSkipped: ingestionResult.skipped,
        message: `Ingested ${ingestionResult.articles} articles, skipped ${ingestionResult.skipped}`
      }
      
    } catch (error) {
      results.ingestionTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test 4: Check OpenAI configuration
    const openaiConfigured = !!process.env.OPEN_AI_KEY
    console.log(`🤖 OpenAI configured: ${openaiConfigured}`)

    // Final article count
    const finalArticles = await prisma.article.count({
      where: { status: 'PUBLISHED' }
    })
    
    console.log('🎯 RSS DEBUG COMPLETE')

    return NextResponse.json({
      success: true,
      debug: results,
      summary: {
        totalSources: results.totalSources,
        workingSources: results.sourceTests.filter(s => s.accessible).length,
        currentArticles: results.currentArticles,
        finalArticles: finalArticles,
        openaiConfigured,
        recommendations: [
          results.sourceTests.filter(s => !s.accessible).length > 0 ? 
            `${results.sourceTests.filter(s => !s.accessible).length} RSS feeds are not accessible` : null,
          results.sourceTests.filter(s => s.recentItems === 0).length > 0 ?
            `${results.sourceTests.filter(s => s.recentItems === 0).length} sources have no recent content` : null,
          !openaiConfigured ? 'OpenAI not configured - using fallback evaluation' : null
        ].filter(Boolean)
      }
    })

  } catch (error) {
    console.error('❌ RSS Debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 