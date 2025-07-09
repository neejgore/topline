import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const Parser = require('rss-parser')
const parser = new Parser()

// Import content sources
import { CONTENT_SOURCES } from '../../../../lib/content-sources'

export async function GET(request: Request) {
  try {
    // Check if this is a Vercel cron job (internal call) or manual call
    const authHeader = request.headers.get('authorization')
    const userAgent = request.headers.get('user-agent')
    const isVercelCron = userAgent?.includes('vercel-cron') || 
                        request.headers.get('x-vercel-cron') === '1' ||
                        request.headers.get('x-vercel-deployment-url')
    
    // For manual calls, require CRON_SECRET
    if (!isVercelCron) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.log('🔄 Manual cron job triggered...')
    } else {
      console.log('🔄 Vercel cron job triggered...')
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔄 Starting FIXED content refresh...')
    console.log('📅 Time:', new Date().toLocaleString())

    let totalArticles = 0
    let skippedArticles = 0

    // Clear old published articles first
    console.log('🗑️ Clearing old published articles...')
    await supabase
      .from('articles')
      .delete()
      .eq('status', 'PUBLISHED')

    // Process articles from all sources
    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        
        if (feed.items && feed.items.length > 0) {
          console.log(`📰 Found ${feed.items.length} items from ${source.name}`)
          
          // Take first 2 items from each source
          for (let i = 0; i < Math.min(2, feed.items.length); i++) {
            const item = feed.items[i]
            
            try {
              if (!item.title || !item.link) {
                console.log(`⚠️  Skipping item ${i}: missing title or link`)
                skippedArticles++
                continue
              }

              console.log(`🔍 Processing: ${item.title.substring(0, 50)}...`)

              // Create article with simple data
              const articleData = {
                title: item.title,
                summary: item.contentSnippet || item.content || 'No summary available',
                sourceUrl: item.link,
                sourceName: source.name,
                publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                createdAt: new Date().toISOString(),
                vertical: source.vertical,
                status: 'PUBLISHED',
                priority: source.priority,
                category: 'NEWS',
                whyItMatters: 'This development represents a significant shift in the market landscape.',
                talkTrack: 'I saw this news and thought of our conversation about industry trends.',
                importanceScore: 0,
                views: 0,
                clicks: 0,
                shares: 0
              }

              console.log(`💾 Inserting article: ${item.title.substring(0, 50)}...`)

              const { error: insertError } = await supabase
                .from('articles')
                .insert(articleData)

              if (insertError) {
                console.error('❌ Error inserting article:', insertError)
                skippedArticles++
                continue
              }

              totalArticles++
              console.log(`✅ Successfully inserted: ${item.title.substring(0, 50)}...`)

            } catch (itemError) {
              console.error(`❌ Error processing item:`, itemError)
              skippedArticles++
            }
          }
        }

      } catch (sourceError) {
        console.error(`❌ Error fetching from ${source.name}:`, sourceError)
        skippedArticles++
      }
    }

    console.log(`🎉 Content refresh completed: ${totalArticles} articles inserted, ${skippedArticles} skipped`)

    return NextResponse.json({ 
      success: true, 
      message: 'Content refresh completed',
      totalArticles: totalArticles,
      skippedArticles: skippedArticles
    })

  } catch (error) {
    console.error('❌ Content refresh failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}