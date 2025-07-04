import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import Parser from 'rss-parser'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS } from '@/lib/content-sources'

export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.log('❌ Unauthorized cron request')
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    console.log('🔄 Starting daily content refresh...')
    
    // First, archive old content
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 24) // Archive content older than 24 hours

    const { data: articlesToArchive, error: archiveError } = await supabase
      .from('articles')
      .select('id')
      .eq('status', 'PUBLISHED')
      .lt('publishedAt', cutoffDate.toISOString())

    if (archiveError) {
      console.error('Error finding articles to archive:', archiveError)
    }

    if (articlesToArchive && articlesToArchive.length > 0) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'ARCHIVED' })
        .in('id', articlesToArchive.map(a => a.id))

      if (updateError) {
        console.error('Error archiving articles:', updateError)
      }
    }

    console.log(`🧹 Archived ${articlesToArchive?.length || 0} old articles`)
    
    // Now fetch new content
    const parser = new Parser()
    let totalArticles = 0
    let skippedArticles = 0

    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📰 Fetching from ${source.name}...`)
        const feed = await parser.parseURL(source.rssUrl)
        const items = feed.items || []

        for (const item of items) {
          try {
            if (!item.title || !item.link) {
              skippedArticles++
              continue
            }

            const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase()
            
            // Skip excluded content
            if (EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))) {
              skippedArticles++
              continue
            }

            // Check relevance
            const isRelevant = RELEVANT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
            if (!isRelevant) {
              skippedArticles++
              continue
            }

            // Check for duplicates
            const { data: existingArticle, error: duplicateError } = await supabase
              .from('articles')
              .select('id')
              .or(`sourceUrl.eq.${item.link},and(title.eq.${item.title},sourceName.eq.${source.name})`)
              .limit(1)
              .single()

            if (duplicateError && duplicateError.code !== 'PGRST116') {
              console.error('Error checking for duplicates:', duplicateError)
              skippedArticles++
              continue
            }

            if (existingArticle) {
              skippedArticles++
              continue
            }

            // Create new article
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
                whyItMatters: generateWhyItMatters(item.title, item.contentSnippet || ''),
                talkTrack: generateTalkTrack(item.title, source.vertical),
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

          } catch (itemError) {
            console.error('Error processing item:', itemError)
            skippedArticles++
          }
        }

      } catch (sourceError) {
        console.error(`Error fetching from ${source.name}:`, sourceError)
      }
    }

    // Refresh daily metrics selection
    console.log('📊 Starting metrics refresh...')
    const metricsRefreshResult = await refreshDailyMetrics()
    
    // Check if metrics pool needs replenishment
    console.log('🔄 Checking metrics pool status...')
    const poolStatus = await checkAndReplenishMetricsPool()
    console.log(`📊 Metrics pool status: ${poolStatus.message}`)

    // Get stats
    const [totalCountResult, publishedCountResult, recentCountResult] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
      supabase.from('articles').select('*', { count: 'exact', head: true }).gte('publishedAt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ])
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        articlesAdded: totalArticles,
        articlesSkipped: skippedArticles,
        expiredArticlesRemoved: articlesToArchive?.length || 0
      },
      stats: {
        totalArticles: totalCountResult.count || 0,
        publishedArticles: publishedCountResult.count || 0,
        recentArticles: recentCountResult.count || 0
      }
    }
    
    console.log('✅ Daily content refresh completed:', response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Content refresh failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Helper functions
function generateWhyItMatters(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase()
  
  if (text.includes('ai') || text.includes('artificial intelligence')) {
    return 'AI and automation are transforming marketing technology. Understanding these developments helps position solutions in the context of the industry\'s future.'
  }
  
  if (text.includes('privacy') || text.includes('cookie') || text.includes('gdpr')) {
    return 'Privacy changes are reshaping digital marketing. This impacts how brands think about customer data and personalization strategies.'
  }
  
  if (text.includes('retail') || text.includes('commerce')) {
    return 'The retail and commerce landscape is rapidly evolving. This affects how brands approach customer acquisition and retention.'
  }
  
  if (text.includes('data') || text.includes('analytics')) {
    return 'Data strategy is central to modern marketing. This development shows how the industry is evolving in its approach to customer insights.'
  }
  
  return 'This industry development signals important changes in how enterprises approach marketing and customer engagement.'
}

function generateTalkTrack(title: string, vertical: string): string {
  const text = title.toLowerCase()
  
  switch (vertical) {
    case 'Technology & Media':
      return `How is your team thinking about these technology changes? What impact do you see this having on your marketing strategy?`
    
    case 'Consumer & Retail':
      return `How are these retail industry changes affecting your customer engagement strategy? What opportunities do you see?`
    
    case 'Financial Services':
      return `How is your institution adapting to these market changes? What role does technology play in your strategy?`
    
    case 'Healthcare':
      return `How are these healthcare industry developments impacting your patient engagement approach? What challenges are you facing?`
    
    default:
      return `How do you see these industry changes affecting your business? What opportunities or challenges do they present?`
  }
}

async function refreshDailyMetrics() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, archive currently published metrics
    const { error: archiveError } = await supabase
      .from('metrics')
      .update({ 
        status: 'ARCHIVED',
        lastViewedAt: new Date().toISOString()
      })
      .eq('status', 'PUBLISHED')

    if (archiveError) {
      console.error('Error archiving current metrics:', archiveError)
    }

    // Get metrics from the last 90 days that haven't been recently viewed
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const { data: availableMetrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
      .order('publishedAt', { ascending: false })

    if (fetchError) {
      console.error('Error fetching available metrics:', fetchError)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    if (!availableMetrics || availableMetrics.length === 0) {
      console.log('No available metrics to select from')
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    // Select 3 metrics with industry diversity
    const selectedMetrics = selectDiverseMetrics(availableMetrics, 3)

    // Update selected metrics to PUBLISHED
    const { error: publishError } = await supabase
      .from('metrics')
      .update({ 
        status: 'PUBLISHED',
        lastViewedAt: new Date().toISOString()
      })
      .in('id', selectedMetrics.map(m => m.id))

    if (publishError) {
      console.error('Error publishing selected metrics:', publishError)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    console.log(`📊 Selected ${selectedMetrics.length} new metrics for today`)
    
    return {
      newMetricsSelected: selectedMetrics.length,
      totalActiveMetrics: selectedMetrics.length
    }

  } catch (error) {
    console.error('Error in refreshDailyMetrics:', error)
    return { newMetricsSelected: 0, totalActiveMetrics: 0 }
  }
}

function selectDiverseMetrics(metrics: any[], count: number): any[] {
  const verticals = ['Technology & Media', 'Consumer & Retail', 'Financial Services', 'Healthcare & Life Sciences', 'Energy & Utilities']
  const selected: any[] = []

  // First pass: one metric per vertical
  for (const vertical of verticals) {
    if (selected.length >= count) break
    
    const verticalMetrics = metrics.filter(m => m.vertical === vertical && !selected.includes(m))
    if (verticalMetrics.length > 0) {
      const randomMetric = verticalMetrics[Math.floor(Math.random() * verticalMetrics.length)]
      selected.push(randomMetric)
    }
  }

  // Second pass: fill remaining slots with any available metrics
  while (selected.length < count && selected.length < metrics.length) {
    const remainingMetrics = metrics.filter(m => !selected.includes(m))
    if (remainingMetrics.length === 0) break
    
    const randomMetric = remainingMetrics[Math.floor(Math.random() * remainingMetrics.length)]
    selected.push(randomMetric)
  }

  return selected
}

async function checkAndReplenishMetricsPool() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check available metrics in the pool
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const { data: availableMetrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
      .neq('status', 'PUBLISHED')

    if (fetchError) {
      console.error('Error checking metrics pool:', fetchError)
      return { message: 'Error checking pool', poolSize: 0 }
    }

    const poolSize = availableMetrics?.length || 0
    
    if (poolSize < 10) {
      console.log(`⚠️  Metrics pool low (${poolSize} available). Auto-replenishment needed.`)
      
      return { 
        message: `Pool low (${poolSize} available) - replenishment needed`, 
        poolSize,
        needsReplenishment: true
      }
    }

    return { 
      message: `Pool healthy (${poolSize} available)`, 
      poolSize,
      needsReplenishment: false
    }

  } catch (error) {
    console.error('Error in checkAndReplenishMetricsPool:', error)
    return { message: 'Error checking pool', poolSize: 0 }
  }
}

async function refreshDailyMetrics() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, archive currently published metrics
    const { error: archiveError } = await supabase
      .from('metrics')
      .update({ 
        status: 'ARCHIVED',
        lastViewedAt: new Date().toISOString()
      })
      .eq('status', 'PUBLISHED')

    if (archiveError) {
      console.error('Error archiving current metrics:', archiveError)
    }

    // Get metrics from the last 90 days that haven't been recently viewed
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const { data: availableMetrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
      .order('publishedAt', { ascending: false })

    if (fetchError) {
      console.error('Error fetching available metrics:', fetchError)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    if (!availableMetrics || availableMetrics.length === 0) {
      console.log('No available metrics to select from')
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    // Select 3 metrics with industry diversity
    const selectedMetrics = selectDiverseMetrics(availableMetrics, 3)

    // Update selected metrics to PUBLISHED
    const { error: publishError } = await supabase
      .from('metrics')
      .update({ 
        status: 'PUBLISHED',
        lastViewedAt: new Date().toISOString()
      })
      .in('id', selectedMetrics.map(m => m.id))

    if (publishError) {
      console.error('Error publishing selected metrics:', publishError)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    console.log(`📊 Selected ${selectedMetrics.length} new metrics for today`)
    
    return {
      newMetricsSelected: selectedMetrics.length,
      totalActiveMetrics: selectedMetrics.length
    }

  } catch (error) {
    console.error('Error in refreshDailyMetrics:', error)
    return { newMetricsSelected: 0, totalActiveMetrics: 0 }
  }
}

function selectDiverseMetrics(metrics: any[], count: number): any[] {
  const verticals = ['Technology & Media', 'Consumer & Retail', 'Financial Services', 'Healthcare & Life Sciences', 'Energy & Utilities']
  const selected: any[] = []

  // First pass: one metric per vertical
  for (const vertical of verticals) {
    if (selected.length >= count) break
    
    const verticalMetrics = metrics.filter(m => m.vertical === vertical && !selected.includes(m))
    if (verticalMetrics.length > 0) {
      const randomMetric = verticalMetrics[Math.floor(Math.random() * verticalMetrics.length)]
      selected.push(randomMetric)
    }
  }

  // Second pass: fill remaining slots with any available metrics
  while (selected.length < count && selected.length < metrics.length) {
    const remainingMetrics = metrics.filter(m => !selected.includes(m))
    if (remainingMetrics.length === 0) break
    
    const randomMetric = remainingMetrics[Math.floor(Math.random() * remainingMetrics.length)]
    selected.push(randomMetric)
  }

  return selected
}

async function checkAndReplenishMetricsPool() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check available metrics in the pool
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const { data: availableMetrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
      .neq('status', 'PUBLISHED')

    if (fetchError) {
      console.error('Error checking metrics pool:', fetchError)
      return { message: 'Error checking pool', poolSize: 0 }
    }

    const poolSize = availableMetrics?.length || 0
    
    if (poolSize < 10) {
      console.log(`⚠️  Metrics pool low (${poolSize} available). Auto-replenishment needed.`)
      
      return { 
        message: `Pool low (${poolSize} available) - replenishment needed`, 
        poolSize,
        needsReplenishment: true
      }
    }

    return { 
      message: `Pool healthy (${poolSize} available)`, 
      poolSize,
      needsReplenishment: false
    }

  } catch (error) {
    console.error('Error in checkAndReplenishMetricsPool:', error)
    return { message: 'Error checking pool', poolSize: 0 }
  }
}

export async function POST(request: Request) {
  return GET(request)
} 