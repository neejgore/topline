import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Parser from 'rss-parser'
import { CONTENT_SOURCES } from '@/lib/content-sources'

interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  contentSnippet?: string
  content?: string
}

interface SourceStat {
  name: string
  processed: number
  added: number
  priority?: string
  error?: string
}

export async function POST() {
  try {
    console.log('🚀 Starting enhanced RSS refresh from all 22 sources...')
    
    const parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ToplineBot/1.0)'
      }
    })

    // Use all 22 sources from configuration with fallback
    const rssFeeds = CONTENT_SOURCES?.rssFeeds || []
    console.log(`Found ${rssFeeds.length} RSS feeds in configuration`)
    
    // Fallback sources if import fails
    const fallbackSources = [
      { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Digiday', url: 'https://digiday.com/feed/', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Ad Age', url: 'https://adage.com/rss.xml', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Marketing Land', url: 'https://marketingland.com/feed', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'MarTech Today', url: 'https://martech.org/feed/', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Adweek', url: 'https://www.adweek.com/feed/', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Marketing Brew', url: 'https://www.marketingbrew.com/feed', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Retail Dive', url: 'https://www.retaildive.com/feeds/news/', category: 'Consumer & Retail', priority: 'MEDIUM' },
      { name: 'American Banker', url: 'https://www.americanbanker.com/feed', category: 'Financial Services', priority: 'MEDIUM' },
      { name: 'Modern Healthcare', url: 'https://www.modernhealthcare.com/rss.xml', category: 'Healthcare', priority: 'MEDIUM' },
      { name: 'TechCrunch Marketing', url: 'https://techcrunch.com/category/marketing/feed/', category: 'Technology & Media', priority: 'MEDIUM' },
      { name: 'VentureBeat Marketing', url: 'https://venturebeat.com/category/marketing/feed/', category: 'Technology & Media', priority: 'MEDIUM' },
      { name: 'Chief Marketer', url: 'https://www.chiefmarketer.com/feed/', category: 'Technology & Media', priority: 'MEDIUM' },
      { name: 'Mobile Marketer', url: 'https://www.mobilemarketer.com/rss.xml', category: 'Technology & Media', priority: 'MEDIUM' },
      { name: 'MediaPost', url: 'https://www.mediapost.com/rss/', category: 'Technology & Media', priority: 'MEDIUM' },
      { name: 'Campaign US', url: 'https://www.campaignlive.com/rss', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'eMarketer', url: 'https://www.emarketer.com/rss/all/', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'WSJ CMO', url: 'https://feeds.wsj.com/WSJ-com/RSS/WSJCOM-marketing', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Forbes CMO', url: 'https://www.forbes.com/cmo-network/feed/', category: 'Technology & Media', priority: 'MEDIUM' },
      { name: 'HBR Marketing', url: 'https://feeds.hbr.org/harvardbusiness/marketing', category: 'Technology & Media', priority: 'HIGH' },
      { name: 'Automotive News', url: 'https://www.autonews.com/rss.xml', category: 'Consumer & Retail', priority: 'MEDIUM' },
      { name: 'Advertising Age Marketing', url: 'https://adage.com/section/marketing/rss', category: 'Technology & Media', priority: 'HIGH' }
    ]
    
    const sourcesToUse = rssFeeds.length > 0 ? rssFeeds : fallbackSources
    console.log(`Using ${sourcesToUse.length} sources (${rssFeeds.length > 0 ? 'from config' : 'fallback'})`)
    
    const sources = sourcesToUse.map(feed => ({
      name: feed.name,
      url: feed.url,
      vertical: feed.category,
      priority: feed.priority
    }))

    console.log(`📡 Processing ${sources.length} RSS sources...`)

    let totalAdded = 0
    let totalProcessed = 0
    let sourceStats: SourceStat[] = []

    // Process sources in batches to avoid timeout
    for (let i = 0; i < sources.length; i += 4) {
      const batch = sources.slice(i, i + 4)
      console.log(`\n🔄 Processing batch ${Math.floor(i/4) + 1}/${Math.ceil(sources.length/4)}`)
      
      await Promise.all(batch.map(async (source) => {
        try {
          console.log(`📡 Fetching from ${source.name}...`)
          
          const feed = await parser.parseURL(source.url)
          const items = feed.items || []
          totalProcessed += items.length

          console.log(`Found ${items.length} items from ${source.name}`)

          let sourceAdded = 0
          const maxArticles = source.priority === 'HIGH' ? 12 : 8 // More articles from high-priority sources

          for (const item of items.slice(0, maxArticles)) {
            if (!item.title || !item.link) continue

            // Very lenient filtering - accept almost all business content
            const title = item.title.trim()
            const summary = (item.contentSnippet || item.content || '').trim().slice(0, 500)
            
            if (title.length < 10) continue

            // Basic relevance check - very inclusive
            const text = `${title} ${summary}`.toLowerCase()
            const businessTerms = [
              'marketing', 'advertising', 'business', 'technology', 'digital', 'data',
              'company', 'industry', 'revenue', 'growth', 'strategy', 'customer',
              'sales', 'campaign', 'brand', 'commerce', 'analytics', 'platform'
            ]
            
            const isRelevant = businessTerms.some(term => text.includes(term)) || 
                              text.length > 50 // Accept longer articles even without keywords

            if (!isRelevant) continue

            // Create unique article ID
            const articleId = `rss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            try {
              // Map category to correct vertical
              let vertical = source.vertical
              if (vertical === 'Services') vertical = 'Technology & Media'
              if (vertical === 'Automotive') vertical = 'Consumer & Retail'

              const article = await prisma.article.create({
                data: {
                  id: articleId,
                  title: title,
                  summary: summary || `Latest industry insights from ${source.name}: ${title}`,
                  sourceUrl: item.link,
                  sourceName: source.name,
                  whyItMatters: `This ${source.name} article provides critical industry intelligence that could influence your business strategy and competitive positioning.`,
                  talkTrack: `Ask: "How does this trend align with your current initiatives?" Use as conversation starter about industry dynamics and strategic planning.`,
                  vertical: vertical,
                  priority: source.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
                  status: 'PUBLISHED',
                  publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
                }
              })
              
              sourceAdded++
              totalAdded++
              console.log(`✅ Added: ${title.slice(0, 60)}...`)
              
            } catch (createError) {
              // Skip duplicates silently
              const errorMessage = createError instanceof Error ? createError.message : 'Unknown error'
              if (!errorMessage.includes('Unique constraint')) {
                console.log(`⚠️  Error creating article: ${errorMessage}`)
              }
            }
          }

          sourceStats.push({
            name: source.name,
            processed: items.length,
            added: sourceAdded,
            priority: source.priority
          })

          console.log(`✅ ${source.name}: Added ${sourceAdded}/${items.length} articles`)
          
        } catch (sourceError) {
          const errorMessage = sourceError instanceof Error ? sourceError.message : 'Unknown error'
          console.error(`❌ Error processing ${source.name}:`, errorMessage)
          sourceStats.push({
            name: source.name,
            processed: 0,
            added: 0,
            error: errorMessage
          })
        }
      }))

      // Brief pause between batches
      if (i + 4 < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Get final stats
    const [totalArticles, totalMetrics] = await Promise.all([
      prisma.article.count(),
      prisma.metric.count()
    ])

    console.log(`🎉 Enhanced RSS refresh complete: ${totalAdded} new articles from ${sources.length} sources`)

    return NextResponse.json({
      success: true,
      message: `Enhanced RSS refresh completed successfully`,
      results: {
        sourcesConfigured: sources.length,
        sourcesProcessed: sourceStats.filter(s => !s.error).length,
        sourcesWithErrors: sourceStats.filter(s => s.error).length,
        totalItemsProcessed: totalProcessed,
        articlesAdded: totalAdded,
        sourceBreakdown: sourceStats,
        finalStats: {
          totalArticles,
          totalMetrics
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Enhanced RSS refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 