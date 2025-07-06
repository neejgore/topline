import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS } from '../../../../lib/content-sources'
import { generateAIContent } from '../../../../lib/ai-content-generator'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔄 Starting autonomous AI content refresh...')

    // Archive old content first
    const { error: archiveError } = await supabase
      .from('articles')
      .update({ status: 'ARCHIVED' })
      .eq('status', 'PUBLISHED')
      .lt('publishedAt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (archiveError) {
      console.error('Error archiving old articles:', archiveError)
    }

    let totalArticles = 0
    let skippedArticles = 0

    // Process all 18 RSS feeds with AI content generation
    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        
        if (feed.items) {
          for (const item of feed.items.slice(0, 3)) {
            try {
              if (!item.title || !item.link) continue

              // Check if article already exists
              const { data: existingArticle } = await supabase
                .from('articles')
                .select('id')
                .eq('sourceUrl', item.link)
                .single()

              if (existingArticle) {
                skippedArticles++
                continue
              }

              console.log(`🤖 Generating AI content for: ${item.title}`)
              
              // Generate AI-powered content (no more generic fallbacks!)
              const aiContent = await generateAIContent(
                item.title,
                item.contentSnippet || item.content || '',
                source.name,
                source.vertical
              )

              // Create new article with AI content
              const { error: insertError } = await supabase
                .from('articles')
                .insert({
                  title: item.title,
                  summary: item.contentSnippet || item.content || null,
                  sourceUrl: item.link,
                  sourceName: source.name,
                  publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                  vertical: source.vertical,
                  status: 'PUBLISHED',
                  priority: source.priority,
                  category: 'NEWS',
                  whyItMatters: aiContent.whyItMatters,
                  talkTrack: aiContent.talkTrack,
                  importanceScore: 0,
                  views: 0,
                  clicks: 0,
                  shares: 0
                })

              if (insertError) {
                console.error('Error inserting article:', insertError)
                skippedArticles++
                continue
              }

              totalArticles++
              console.log(`✅ Added with AI content: ${item.title}`)

              // Rate limit to avoid overwhelming AI API
              await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (itemError) {
              console.error('Error processing item:', itemError)
              skippedArticles++
            }
          }
        }

      } catch (sourceError) {
        console.error(`Error fetching from ${source.name}:`, sourceError)
      }
    }

    // Refresh daily metrics (simplified)
    console.log('📊 Refreshing daily metrics...')
    const metricsResult = await refreshDailyMetrics(supabase)

    console.log(`🎉 Autonomous AI content refresh complete! Added ${totalArticles} articles, skipped ${skippedArticles}`)

    return NextResponse.json({
      success: true,
      totalArticles,
      skippedArticles,
      metricsResult
    })

  } catch (error) {
    console.error('Error in autonomous content refresh:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simplified metrics refresh function
async function refreshDailyMetrics(supabase: any) {
  try {
    // Archive current published metrics
    await supabase
      .from('metrics')
      .update({ status: 'ARCHIVED' })
      .eq('status', 'PUBLISHED')

    // Get available metrics from the last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const { data: availableMetrics } = await supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .eq('status', 'ARCHIVED')
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
      .order('publishedAt', { ascending: false })

    if (availableMetrics && availableMetrics.length > 0) {
      // Select 1 metric (newest available)
      const selectedMetric = availableMetrics[0]

      // Publish it
      await supabase
        .from('metrics')
        .update({ 
          status: 'PUBLISHED',
          lastViewedAt: new Date().toISOString()
        })
        .eq('id', selectedMetric.id)

      console.log(`✅ Selected metric: ${selectedMetric.title}`)
      return { success: true, metricsSelected: 1 }
    } else {
      console.log('No available metrics to select')
      return { success: false, metricsSelected: 0 }
    }

  } catch (error) {
    console.error('Error refreshing metrics:', error)
    return { success: false, metricsSelected: 0 }
  }
}

export async function POST(request: Request) {
  return GET(request)
} 