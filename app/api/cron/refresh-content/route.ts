import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS, VERTICALS } from '../../../../lib/content-sources'
import { generateAIContent, generateMetricsAIContent } from '../../../../lib/ai-content-generator'
import Parser from 'rss-parser'

const parser = new Parser()

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

    console.log('🔄 Starting systematic daily content refresh...')
    console.log('📅 Time:', new Date().toLocaleString())

    // Check if it's a weekday (Monday-Friday)
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

    // STEP 1: Archive old content (older than 24 hours OR if we're refreshing on a new day)
    console.log('🗄️  Step 1: Archiving content older than 24 hours...')
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Get current published articles to check their age
    const { data: publishedArticles } = await supabase
      .from('articles')
      .select('id, publishedAt, createdAt')
      .eq('status', 'PUBLISHED')
    
    console.log(`📊 Found ${publishedArticles?.length || 0} published articles`)
    
    // Archive articles that are old OR were created more than 24 hours ago
    const articlesToArchive = publishedArticles?.filter(article => {
      const publishedDate = new Date(article.publishedAt)
      const createdDate = new Date(article.createdAt)
      const isOldByPublished = publishedDate < twentyFourHoursAgo
      const isOldByCreated = createdDate < twentyFourHoursAgo
      return isOldByPublished || isOldByCreated
    }) || []
    
    console.log(`📦 Archiving ${articlesToArchive.length} old articles`)
    
    if (articlesToArchive.length > 0) {
      const { error: archiveArticlesError } = await supabase
        .from('articles')
        .update({ 
          status: 'ARCHIVED',
          lastViewedAt: new Date().toISOString() 
        })
        .in('id', articlesToArchive.map(a => a.id))
      
      if (archiveArticlesError) {
        console.error('Error archiving old articles:', archiveArticlesError)
      }
    }

    // STEP 2: Process articles with 24-hour lookback
    console.log('📰 Step 2: Processing articles with 24-hour lookback...')
    let totalArticles = 0
    let skippedArticles = 0

    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        
        if (feed.items) {
          for (const item of feed.items.slice(0, 5)) { // Increased to 5 items per source
            try {
              if (!item.title || !item.link) continue

              // Check if article is from the last 24 hours
              const itemDate = item.pubDate ? new Date(item.pubDate) : new Date()
              if (itemDate < twentyFourHoursAgo) {
                continue // Skip articles older than 24 hours
              }

              // Check if article already exists (no reuse rule)
              const { data: existingArticle } = await supabase
                .from('articles')
                .select('id')
                .eq('sourceUrl', item.link)
                .single()

              if (existingArticle) {
                skippedArticles++
                continue
              }

              // Check relevance to sales/marketing/tech professionals
              const title = item.title.toLowerCase()
              const content = (item.contentSnippet || item.content || '').toLowerCase()
              
              const isRelevant = RELEVANT_KEYWORDS.some(keyword => 
                title.includes(keyword) || content.includes(keyword)
              )
              
              const hasExcludedContent = EXCLUDE_KEYWORDS.some(keyword => 
                title.includes(keyword) || content.includes(keyword)
              )

              if (!isRelevant || hasExcludedContent) {
                skippedArticles++
                continue
              }

              console.log(`🤖 Generating AI content for: ${item.title}`)
              
              // Generate AI-powered content
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
                  publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(), // Use actual RSS date
                  createdAt: new Date().toISOString(),
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

    // STEP 3: Refresh daily metrics with 90-day lookback
    console.log('📊 Step 3: Refreshing daily metrics with 90-day lookback...')
    const metricsResult = await refreshDailyMetrics(supabase)

    console.log(`🎉 Systematic daily refresh complete!`)
    console.log(`📰 Articles: ${totalArticles} added, ${skippedArticles} skipped`)
    console.log(`📊 Metrics: ${metricsResult.metricsSelected} selected`)

    return NextResponse.json({
      success: true,
      totalArticles,
      skippedArticles,
      metricsResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in systematic content refresh:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Systematic metrics refresh with 90-day lookback and no reuse
async function refreshDailyMetrics(supabase: any) {
  try {
    console.log('🔄 Starting systematic metrics refresh...')
    
    // Archive current published metrics
    await supabase
      .from('metrics')
      .update({ 
        status: 'ARCHIVED',
        lastViewedAt: new Date().toISOString()
      })
      .eq('status', 'PUBLISHED')

    // Get available metrics from the last 90 days that haven't been used
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    
    console.log(`📊 Looking for metrics from ${ninetyDaysAgo.toISOString()} to now...`)

    const { data: availableMetrics } = await supabase
      .from('metrics')
      .select('*')
      .gte('createdAt', ninetyDaysAgo.toISOString())
      .eq('status', 'ARCHIVED')
      .in('vertical', VERTICALS)
      .or('lastViewedAt.is.null,lastViewedAt.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Allow reuse after 7 days
      .order('createdAt', { ascending: false })

    console.log(`📊 Found ${availableMetrics?.length || 0} unused metrics in 90-day window`)

    if (availableMetrics && availableMetrics.length > 0) {
      // Select 1 metric (newest available that hasn't been used)
      const selectedMetric = availableMetrics[0]

      console.log(`🤖 Generating AI content for metric: ${selectedMetric.title}`)

      // Generate AI-powered content for the metric
      const aiContent = await generateMetricsAIContent(
        selectedMetric.title,
        selectedMetric.value,
        selectedMetric.source,
        selectedMetric.whyItMatters || '',
        selectedMetric.vertical
      )

      // Publish it with enhanced AI content
      await supabase
        .from('metrics')
        .update({ 
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
          lastViewedAt: new Date().toISOString(),
          whyItMatters: aiContent.whyItMatters,
          talkTrack: aiContent.talkTrack
        })
        .eq('id', selectedMetric.id)

      console.log(`✅ Selected metric with AI content: ${selectedMetric.title}`)
      return { success: true, metricsSelected: 1, selectedMetric: selectedMetric.title }
    } else {
      console.log('⚠️  No available unused metrics found in 90-day window')
      
      // If no unused metrics, try to discover new ones
      const discoveryResult = await discoverNewMetrics(supabase)
      return { success: discoveryResult.success, metricsSelected: discoveryResult.metricsSelected }
    }

  } catch (error) {
    console.error('Error refreshing metrics:', error)
    return { success: false, metricsSelected: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Discover new metrics when none are available
async function discoverNewMetrics(supabase: any) {
  try {
    console.log('🔍 Discovering new metrics...')
    
    // This would be where you could add logic to generate new metrics
    // For now, return that no new metrics were found
    return { success: false, metricsSelected: 0, message: 'No new metrics discovered' }
  } catch (error) {
    console.error('Error discovering new metrics:', error)
    return { success: false, metricsSelected: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function POST(request: Request) {
  return GET(request)
} 