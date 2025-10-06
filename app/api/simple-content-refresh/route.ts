import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const Parser = require('rss-parser')
const parser = new Parser()

// Top working sources for quick refresh - expanded for better daily coverage
const QUICK_SOURCES = [
  { name: 'MarTech', url: 'https://martech.org/feed/', vertical: 'Technology & Media' },
  { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/', vertical: 'Technology & Media' },
  { name: 'Digiday', url: 'https://digiday.com/feed/', vertical: 'Technology & Media' },
  { name: 'Search Engine Land', url: 'https://searchengineland.com/feed', vertical: 'Technology & Media' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', vertical: 'Technology & Media' },
  { name: 'Retail Dive', url: 'https://www.retaildive.com/feeds/news/', vertical: 'Consumer & Retail' },
  { name: 'Banking Dive', url: 'https://www.bankingdive.com/feeds/news/', vertical: 'Financial Services' },
  { name: 'Marketing Land', url: 'https://marketingland.com/feed', vertical: 'Technology & Media' },
  { name: 'HubSpot Marketing Blog', url: 'https://blog.hubspot.com/marketing/rss.xml', vertical: 'Technology & Media' },
  { name: 'Content Marketing Institute', url: 'https://contentmarketinginstitute.com/feed/', vertical: 'Technology & Media' },
  { name: 'Search Engine Journal', url: 'https://www.searchenginejournal.com/feed/', vertical: 'Technology & Media' },
  { name: 'Marketing Week', url: 'https://www.marketingweek.com/feed/', vertical: 'Technology & Media' }
]

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔄 Starting FAST multi-source refresh...')
    console.log('📅 Time:', new Date().toLocaleString())
    
    // Check if it's a weekday (Monday-Friday only)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('⏸️  Skipping refresh - weekend detected')
      return NextResponse.json({ 
        success: true, 
        message: 'Skipped refresh - weekends only',
        isWeekend: true
      })
    }
    
    const lookbackHours = 48
    const lookbackCutoff = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)
    let totalInserted = 0
    
    for (const source of QUICK_SOURCES) {
      try {
        console.log(`📡 Fetching: ${source.name}`)
        const feed = await parser.parseURL(source.url)
        console.log(`  📰 Found ${feed.items.length} items`)
        
        // Process up to 10 items per source for better coverage
        for (let i = 0; i < Math.min(10, feed.items.length); i++) {
          const item = feed.items[i]
          
          if (!item.title || !item.link) continue
          
          // Check freshness
          const itemDate = item.pubDate ? new Date(item.pubDate) : new Date()
          if (itemDate < lookbackCutoff) {
            console.log(`  ⏸️  Too old: ${item.title.substring(0, 50)}`)
            continue
          }
          
          // Check for duplicates
          const { data: existing } = await supabase
            .from('articles')
            .select('id')
            .eq('sourceUrl', item.link)
            .single()
          
          if (existing) {
            console.log(`  ⏭️  Duplicate: ${item.title.substring(0, 50)}`)
            continue
          }
          
          const article = {
            id: Math.floor(Math.random() * 1000000000),
            title: item.title,
            summary: item.contentSnippet || item.content || 'No summary available',
            sourceUrl: item.link,
            sourceName: source.name,
            publishedAt: itemDate.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            vertical: source.vertical,
            status: 'PUBLISHED',
            priority: 'MEDIUM',
            category: 'NEWS',
            whyItMatters: `This ${source.vertical} development impacts market trends and business strategy.`,
            talkTrack: `I noticed this update from ${source.name} - thought it might be relevant to our conversation.`,
            importanceScore: 50,
            views: 0,
            clicks: 0,
            shares: 0
          }
          
          const { error } = await supabase.from('articles').insert(article)
          
          if (error) {
            console.error(`  ❌ Failed: ${error.message}`)
          } else {
            console.log(`  ✅ Added: ${item.title.substring(0, 60)}`)
            totalInserted++
          }
        }
      } catch (sourceError) {
        console.error(`❌ Error with ${source.name}:`, (sourceError as Error).message)
      }
    }
    
    console.log(`🎉 Fast refresh complete: ${totalInserted} articles added`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Fast refresh completed - inserted ${totalInserted} articles`,
      totalArticles: totalInserted
    })

  } catch (error) {
    console.error('❌ Fast refresh failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 