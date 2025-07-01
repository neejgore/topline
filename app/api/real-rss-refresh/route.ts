import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Parser from 'rss-parser'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'
import { contentAnalysisService } from '@/lib/content-analysis'

const parser = new Parser()

export async function POST() {
  try {
    console.log('🚀 Starting REAL RSS content refresh...')
    
    const startTime = Date.now()

    // Step 1: Clear ALL old content (start fresh)
    console.log('🧹 Clearing all old content...')
    const [deletedArticles, deletedMetrics] = await Promise.all([
      prisma.article.deleteMany({}),
      prisma.metric.deleteMany({})
    ])
    console.log(`🗑️ Deleted ${deletedArticles.count} articles and ${deletedMetrics.count} metrics`)

    // Step 2: Pull ONLY from our working RSS feeds  
    const workingFeeds = [
      { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/', vertical: 'Technology & Media' },
      { name: 'MarTech Today', url: 'https://martech.org/feed/', vertical: 'Technology & Media' },
      { name: 'Digiday', url: 'https://digiday.com/feed/', vertical: 'Technology & Media' },
      { name: 'Marketing Land', url: 'https://marketingland.com/feed', vertical: 'Technology & Media' },
      { name: 'MediaPost - Online Media Daily', url: 'http://feeds.mediapost.com/online-media-daily', vertical: 'Technology & Media' },
      { name: 'MediaPost - Media Daily News', url: 'http://feeds.mediapost.com/mediadailynews', vertical: 'Technology & Media' },
      { name: 'MediaPost - TV News Daily', url: 'http://feeds.mediapost.com/television-news-daily', vertical: 'Technology & Media' },
      { name: 'MediaPost - Social Media Marketing', url: 'http://feeds.mediapost.com/social-media-marketing-daily', vertical: 'Technology & Media' },
      { name: 'VentureBeat Marketing', url: 'https://venturebeat.com/category/marketing/feed/', vertical: 'Technology & Media' },
      { name: 'Chief Marketer', url: 'https://www.chiefmarketer.com/feed/', vertical: 'Technology & Media' },
      { name: 'Retail Dive', url: 'https://www.retaildive.com/feeds/news/', vertical: 'Consumer & Retail' },
      { name: 'Adweek', url: 'https://www.adweek.com/feed/', vertical: 'Technology & Media' },
      { name: 'Forbes CMO Network', url: 'https://www.forbes.com/sites/cmo/feed/', vertical: 'Services' },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', vertical: 'Technology & Media' }
    ]

    let totalArticles = 0
    let totalSkipped = 0

    console.log(`📡 Processing ${workingFeeds.length} working RSS feeds...`)

    for (const source of workingFeeds) {
      try {
        console.log(`📰 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.url)
        const items = feed.items || []
        
        console.log(`Found ${items.length} items from ${source.name}`)

        let sourceAdded = 0
        for (const item of items.slice(0, 10)) { // Take first 10 per source
          if (!item.title || !item.link) continue

          const title = item.title.trim()
          const summary = (item.contentSnippet || item.content || '').trim().slice(0, 500)
          
          if (title.length < 10) continue // Skip very short titles

          try {
            // Generate contextual insights based on actual article content
            const insights = await contentAnalysisService.generateInsights({
              title: title,
              summary: summary || `Latest news from ${source.name}: ${title}`,
              sourceName: source.name
            })

            const result = await duplicatePreventionService.createArticleSafely({
              title: title,
              summary: summary || `Latest news from ${source.name}: ${title}`,
              sourceUrl: item.link,
              sourceName: source.name,
              whyItMatters: insights.whyItMatters,
              talkTrack: insights.talkTrack,
              vertical: source.vertical,
              priority: insights.urgencyLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
            })
            
            if (result.success) {
              sourceAdded++
              totalArticles++
              console.log(`✅ Added: ${title.slice(0, 60)}...`)
            } else {
              totalSkipped++
              console.log(`⏭️  Skipped: ${title.slice(0, 60)}... (${result.reason})`)
            }
            
          } catch (createError) {
            totalSkipped++
            console.log(`❌ Error: ${title.slice(0, 60)}... (${createError})`)
          }
        }

        console.log(`📊 ${source.name}: Added ${sourceAdded} articles`)
        
      } catch (sourceError) {
        console.error(`❌ Error processing ${source.name}:`, sourceError)
      }
    }

    // Step 3: Get final stats
    const [finalArticles, finalMetrics] = await Promise.all([
      prisma.article.count(),
      prisma.metric.count()
    ])

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`🎉 Real RSS refresh complete: ${totalArticles} articles added in ${duration}s`)

    return NextResponse.json({
      success: true,
      message: `Real RSS refresh completed successfully`,
      results: {
        sourcesProcessed: workingFeeds.length,
        articlesAdded: totalArticles,
        articlesSkipped: totalSkipped,
        finalStats: {
          totalArticles: finalArticles,
          totalMetrics: finalMetrics
        }
      },
      duration: `${duration} seconds`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Real RSS refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}



export async function GET() {
  return POST()
} 