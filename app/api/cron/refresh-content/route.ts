import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import Parser from 'rss-parser'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS } from '@/lib/content-sources'
import alertService from '@/lib/alert-service'

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
        expiredArticlesRemoved: articlesToArchive?.length || 0,
        metricsRefreshed: metricsRefreshResult.newMetricsSelected || 0
      },
      stats: {
        totalArticles: totalCountResult.count || 0,
        publishedArticles: publishedCountResult.count || 0,
        recentArticles: recentCountResult.count || 0,
        activeMetrics: metricsRefreshResult.totalActiveMetrics || 0,
        metricsPoolSize: poolStatus.poolSize || 0
      }
    }
    
    console.log('✅ Daily content refresh completed:', response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Content refresh failed:', error)
    
    // Send alert about cron job failure
    await alertService.alertCronJobFailed('daily-content-refresh', error as Error)
    
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

    // Check if lastViewedAt column exists
    let hasViewTrackingColumn = false
    try {
      await supabase
        .from('metrics')
        .select('lastViewedAt')
        .limit(1)
      hasViewTrackingColumn = true
    } catch (e) {
      console.log('lastViewedAt column not found, using fallback mode')
      hasViewTrackingColumn = false
    }

    // First, archive metrics that have been viewed (move to archive like content does)
    const archiveData: any = { status: 'ARCHIVED' }
    
    let archiveQuery = supabase
      .from('metrics')
      .update(archiveData)
      .eq('status', 'PUBLISHED')

    // If we have view tracking, also archive metrics that have been viewed
    if (hasViewTrackingColumn) {
      // Archive metrics that have been viewed (have lastViewedAt set)
      const { error: archiveViewedError } = await supabase
        .from('metrics')
        .update(archiveData)
        .not('lastViewedAt', 'is', null)
        .eq('status', 'PUBLISHED')

      if (archiveViewedError) {
        console.error('Error archiving viewed metrics:', archiveViewedError)
        await alertService.alertDatabaseError(archiveViewedError)
      }
    }

    // Archive any remaining published metrics
    const { error: archiveError } = await archiveQuery

    if (archiveError) {
      console.error('Error archiving current metrics:', archiveError)
      await alertService.alertDatabaseError(archiveError)
    }

    // Get metrics from the last 90 days that haven't been recently viewed
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    let metricsQuery = supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .neq('status', 'PUBLISHED') // Don't select already published metrics
      .order('publishedAt', { ascending: false }) // Prioritize newer metrics

    // Add view tracking filter only if column exists
    if (hasViewTrackingColumn) {
      metricsQuery = metricsQuery.or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
    }

    const { data: availableMetrics, error: fetchError } = await metricsQuery

    if (fetchError) {
      console.error('Error fetching available metrics:', fetchError)
      await alertService.alertDatabaseError(fetchError)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    if (!availableMetrics || availableMetrics.length === 0) {
      console.log('No available metrics to select from')
      await alertService.alertMetricsPoolLow(0)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    // Select 3 metrics with industry diversity, prioritizing newer ones
    const selectedMetrics = selectDiverseMetricsWithPriority(availableMetrics, 3)

    // Update selected metrics to PUBLISHED
    const publishData: any = { status: 'PUBLISHED' }
    if (hasViewTrackingColumn) {
      publishData.lastViewedAt = new Date().toISOString()
    }

    const { error: publishError } = await supabase
      .from('metrics')
      .update(publishData)
      .in('id', selectedMetrics.map((m: any) => m.id))

    if (publishError) {
      console.error('Error publishing selected metrics:', publishError)
      await alertService.alertDatabaseError(publishError)
      return { newMetricsSelected: 0, totalActiveMetrics: 0 }
    }

    console.log(`📊 Selected ${selectedMetrics.length} new metrics for today`)
    
    return {
      newMetricsSelected: selectedMetrics.length,
      totalActiveMetrics: selectedMetrics.length
    }

  } catch (error) {
    console.error('Error in refreshDailyMetrics:', error)
    await alertService.alertCronJobFailed('refreshDailyMetrics', error as Error)
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

function selectDiverseMetricsWithPriority(metrics: any[], count: number): any[] {
  const verticals = ['Technology & Media', 'Consumer & Retail', 'Financial Services', 'Healthcare & Life Sciences', 'Energy & Utilities']
  const selected: any[] = []

  // Sort metrics by publishedAt (newest first) - they should already be sorted but ensure it
  const sortedMetrics = metrics.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // First pass: one newest metric per vertical
  for (const vertical of verticals) {
    if (selected.length >= count) break
    
    const verticalMetrics = sortedMetrics.filter(m => m.vertical === vertical && !selected.includes(m))
    if (verticalMetrics.length > 0) {
      // Take the newest metric from this vertical
      selected.push(verticalMetrics[0])
    }
  }

  // Second pass: fill remaining slots with newest available metrics
  while (selected.length < count && selected.length < sortedMetrics.length) {
    const remainingMetrics = sortedMetrics.filter(m => !selected.includes(m))
    if (remainingMetrics.length === 0) break
    
    // Take the newest remaining metric
    selected.push(remainingMetrics[0])
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

    // Check if lastViewedAt column exists
    let hasViewTrackingColumn = false
    try {
      await supabase
        .from('metrics')
        .select('lastViewedAt')
        .limit(1)
      hasViewTrackingColumn = true
    } catch (e) {
      hasViewTrackingColumn = false
    }

    // Check available metrics in the pool
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    let poolQuery = supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .neq('status', 'PUBLISHED')

    // Add view tracking filter only if column exists
    if (hasViewTrackingColumn) {
      poolQuery = poolQuery.or(`lastViewedAt.is.null,lastViewedAt.lt.${threeDaysAgo.toISOString()}`)
    }

    const { data: availableMetrics, error: fetchError } = await poolQuery

    if (fetchError) {
      console.error('Error checking metrics pool:', fetchError)
      await alertService.alertDatabaseError(fetchError)
      return { message: 'Error checking pool', poolSize: 0 }
    }

    const poolSize = availableMetrics?.length || 0
    
    if (poolSize < 10) {
      console.log(`⚠️  Metrics pool low (${poolSize} available). Sending alert.`)
      
      // Send alert about low pool
      await alertService.alertMetricsPoolLow(poolSize)
      
      // Try to trigger auto-replenishment by calling the populate API
      try {
        console.log('🔄 Attempting auto-replenishment...')
        const populateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/populate-metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`
          }
        })

        const populateResult = await populateResponse.json()
        
        if (populateResult.success) {
          console.log('✅ Auto-replenishment successful')
          return { 
            message: `Pool was low (${poolSize} available) - auto-replenished successfully`, 
            poolSize: populateResult.totalMetrics || poolSize,
            needsReplenishment: false,
            autoReplenished: true
          }
        } else {
          console.error('❌ Auto-replenishment failed:', populateResult.error)
          return { 
            message: `Pool low (${poolSize} available) - auto-replenishment failed`, 
            poolSize,
            needsReplenishment: true,
            autoReplenishmentError: populateResult.error
          }
        }
      } catch (replenishError) {
        console.error('❌ Auto-replenishment error:', replenishError)
        return { 
          message: `Pool low (${poolSize} available) - auto-replenishment error`, 
          poolSize,
          needsReplenishment: true,
          autoReplenishmentError: replenishError
        }
      }
    }

    return { 
      message: `Pool healthy (${poolSize} available)`, 
      poolSize,
      needsReplenishment: false
    }

  } catch (error) {
    console.error('Error in checkAndReplenishMetricsPool:', error)
    await alertService.alertCronJobFailed('checkAndReplenishMetricsPool', error as Error)
    return { message: 'Error checking pool', poolSize: 0 }
  }
}

export async function POST(request: Request) {
  return GET(request)
} 