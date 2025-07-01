import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Parser from 'rss-parser'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'

interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  contentSnippet?: string
  content?: string
}

export async function POST() {
  try {
    console.log('🔄 Starting simple RSS refresh...')
    
    const parser = new Parser()
    const sources = [
      { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/', vertical: 'Technology & Media' },
      { name: 'Digiday', url: 'https://digiday.com/feed/', vertical: 'Technology & Media' },
      { name: 'Ad Age', url: 'https://adage.com/rss.xml', vertical: 'Technology & Media' },
      { name: 'Marketing Land', url: 'https://marketingland.com/feed', vertical: 'Technology & Media' },
      { name: 'Retail Dive', url: 'https://www.retaildive.com/feeds/news/', vertical: 'Consumer & Retail' },
      { name: 'American Banker', url: 'https://www.americanbanker.com/feed', vertical: 'Financial Services' },
      { name: 'Modern Healthcare', url: 'https://www.modernhealthcare.com/rss.xml', vertical: 'Healthcare' }
    ]

    let totalAdded = 0
    let totalProcessed = 0

    for (const source of sources) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.url)
        const items = feed.items || []
        totalProcessed += items.length

        console.log(`Found ${items.length} items from ${source.name}`)

        let sourceAdded = 0
        for (const item of items.slice(0, 8)) { // Take first 8 items per source
          if (!item.title || !item.link) continue

          // Very lenient filtering - accept almost everything
          const title = item.title.trim()
          const summary = (item.contentSnippet || item.content || '').trim().slice(0, 500)
          
          if (title.length < 10) continue // Skip very short titles

          // Create article ID from URL
          const articleId = `rss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          try {
            const result = await duplicatePreventionService.createArticleSafely({
              title: title,
              summary: summary || `Latest news from ${source.name}: ${title}`,
              sourceUrl: item.link,
              sourceName: source.name,
              whyItMatters: `This ${source.name} article covers important industry developments that could impact your business strategy and competitive positioning.`,
              talkTrack: `Ask: "Are you seeing similar trends in your industry?" Use this as conversation starter about market dynamics and competitive intelligence.`,
              vertical: source.vertical,
              priority: 'MEDIUM',
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
            })
            
            if (result.success) {
              sourceAdded++
              totalAdded++
              console.log(`✅ Added: ${title.slice(0, 60)}...`)
            } else {
              console.log(`⏭️  Skipped: ${title.slice(0, 60)}... (${result.reason})`)
            }
            
          } catch (createError) {
            console.log(`❌ Error: ${title.slice(0, 60)}... (${createError})`)
          }
        }

        console.log(`✅ ${source.name}: Added ${sourceAdded} articles`)
        
      } catch (sourceError) {
        console.error(`❌ Error processing ${source.name}:`, sourceError)
      }
    }

    // Get final stats
    const [totalArticles, totalMetrics] = await Promise.all([
      prisma.article.count(),
      prisma.metric.count()
    ])

    console.log(`🎉 RSS refresh complete: ${totalAdded} new articles`)

    return NextResponse.json({
      success: true,
      message: `Simple RSS refresh completed successfully`,
      results: {
        sourcesProcessed: sources.length,
        totalItemsProcessed: totalProcessed,
        articlesAdded: totalAdded,
        finalStats: {
          totalArticles,
          totalMetrics
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Simple RSS refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 