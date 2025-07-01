import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Parser from 'rss-parser'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'
import { contentAnalysisService } from '@/lib/content-analysis'

const parser = new Parser()

export async function POST() {
  try {
    console.log('🚀 Refreshing content with concise talk tracks...')
    
    const startTime = Date.now()

    // Clear existing content first
    console.log('🧹 Clearing old content...')
    await prisma.article.deleteMany({})
    console.log('✅ Cleared old content')

    // Process key feeds with new concise insights
    const feeds = [
      { name: 'MediaPost - Social Media Marketing', url: 'http://feeds.mediapost.com/social-media-marketing-daily', vertical: 'Technology & Media' },
      { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/', vertical: 'Technology & Media' },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', vertical: 'Technology & Media' },
      { name: 'Digiday', url: 'https://digiday.com/feed/', vertical: 'Technology & Media' },
      { name: 'Forbes CMO Network', url: 'https://www.forbes.com/sites/cmo/feed/', vertical: 'Services' }
    ]

    let totalArticles = 0

    for (const source of feeds) {
      try {
        console.log(`📰 Processing ${source.name}...`)
        
        const feed = await parser.parseURL(source.url)
        const items = feed.items?.slice(0, 4) || [] // 4 per source

        for (const item of items) {
          if (!item.title || !item.link || item.title.length < 10) continue

          const title = item.title.trim()
          const summary = (item.contentSnippet || '').trim().slice(0, 400)

          // Generate NEW concise insights
          const insights = await contentAnalysisService.generateInsights({
            title,
            summary: summary || `Latest from ${source.name}: ${title}`,
            sourceName: source.name
          })

          const result = await duplicatePreventionService.createArticleSafely({
            title,
            summary: summary || `Latest from ${source.name}: ${title}`,
            sourceUrl: item.link,
            sourceName: source.name,
            whyItMatters: insights.whyItMatters,
            talkTrack: insights.talkTrack,
            vertical: source.vertical,
            priority: 'MEDIUM',
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
          })

          if (result.success) {
            totalArticles++
            console.log(`✅ Added: ${title.slice(0, 50)}...`)
            console.log(`   💬 Talk Track: ${insights.talkTrack.slice(0, 80)}...`)
          }
        }
        
      } catch (error) {
        console.error(`❌ Error with ${source.name}:`, error)
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log(`🎉 Content refreshed: ${totalArticles} articles with concise talk tracks in ${duration}s`)

    return NextResponse.json({
      success: true,
      message: `Content refreshed with concise, non-truncated talk tracks`,
      results: {
        articlesAdded: totalArticles,
        feedsProcessed: feeds.length
      },
      fixes: [
        "✅ Talk tracks are now concise and won't get cut off",
        "✅ Removed verbose specific claims that caused truncation", 
        "✅ Focus on actionable conversation starters",
        "✅ Include only key metrics and numbers, not full sentences",
        "✅ All insights fit properly in UI components"
      ],
      duration: `${duration} seconds`
    })

  } catch (error) {
    console.error('❌ Talk track refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 