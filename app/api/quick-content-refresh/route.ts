import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Parser from 'rss-parser'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'
import { contentAnalysisService } from '@/lib/content-analysis'

const parser = new Parser()

export async function POST() {
  try {
    console.log('🚀 Starting quick content refresh with new analysis system...')
    
    const startTime = Date.now()

    // Step 1: Clear old content (faster than full refresh) 
    console.log('🧹 Clearing old content...')
    const [deletedArticles, deletedMetrics] = await Promise.all([
      prisma.article.deleteMany({}),
      prisma.metric.deleteMany({})
    ])
    console.log(`🗑️ Deleted ${deletedArticles.count} articles and ${deletedMetrics.count} metrics`)

    // Step 2: Process only the most active RSS feeds (smaller batch)
    const priorityFeeds = [
      { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/', vertical: 'Technology & Media' },
      { name: 'MediaPost - Online Media Daily', url: 'http://feeds.mediapost.com/online-media-daily', vertical: 'Technology & Media' },
      { name: 'MediaPost - Social Media Marketing', url: 'http://feeds.mediapost.com/social-media-marketing-daily', vertical: 'Technology & Media' },
      { name: 'Digiday', url: 'https://digiday.com/feed/', vertical: 'Technology & Media' },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', vertical: 'Technology & Media' },
      { name: 'Forbes CMO Network', url: 'https://www.forbes.com/sites/cmo/feed/', vertical: 'Services' }
    ]

    let totalArticles = 0
    let totalSkipped = 0

    console.log(`📡 Processing ${priorityFeeds.length} priority RSS feeds...`)

    for (const source of priorityFeeds) {
      try {
        console.log(`📰 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.url)
        const items = feed.items || []
        
        console.log(`Found ${items.length} items from ${source.name}`)

        let sourceAdded = 0
        for (const item of items.slice(0, 5)) { // Take only 5 per source for speed
          if (!item.title || !item.link) continue

          const title = item.title.trim()
          const summary = (item.contentSnippet || item.content || '').trim().slice(0, 500)
          
          if (title.length < 10) continue

          try {
            // Generate NEW content-analyzed insights
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
              console.log(`   💡 Topics: ${insights.keyTopics.join(', ')}`)
              console.log(`   🎯 Why: ${insights.whyItMatters.slice(0, 100)}...`)
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

    console.log(`🎉 Quick content refresh complete: ${totalArticles} articles with new insights in ${duration}s`)

    return NextResponse.json({
      success: true,
      message: `Quick content refresh completed with NEW content analysis system`,
      results: {
        sourcesProcessed: priorityFeeds.length,
        articlesAdded: totalArticles,
        articlesSkipped: totalSkipped,
        finalStats: {
          totalArticles: finalArticles,
          totalMetrics: finalMetrics
        }
      },
      improvements: [
        "✅ Articles now use actual content analysis instead of generic keywords",
        "✅ Why it Matters sections reference specific details from articles", 
        "✅ Talk Tracks include real data points and company names",
        "✅ Multiple topics identified per article",
        "✅ Urgency levels based on content analysis"
      ],
      duration: `${duration} seconds`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Quick content refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 