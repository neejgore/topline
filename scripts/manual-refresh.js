require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS, VERTICALS } = require('../lib/content-sources.ts')
const { generateAIContent, generateMetricsAIContent } = require('../lib/ai-content-generator')
const { classifyVerticalAutonomous } = require('../lib/content-classifier')
const Parser = require('rss-parser')

const parser = new Parser()

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function manualRefresh() {
  console.log('🔄 Starting manual systematic refresh...')
  console.log('📅 Time:', new Date().toLocaleString())
  console.log('=' .repeat(50))

  try {
    // STEP 1: Archive old content (older than 24 hours OR if we're refreshing on a new day)
    console.log('\n🗄️  Step 1: Archiving content older than 24 hours...')
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
      } else {
        console.log('✅ Old articles archived')
      }
    } else {
      console.log('✅ No old articles to archive')
    }

    // STEP 2: Process articles with 24-hour lookback
    console.log('\n📰 Step 2: Processing articles with 24-hour lookback...')
    let totalArticles = 0
    let skippedArticles = 0
    let sourceStats = {}

    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        let sourceAdded = 0
        
        if (feed.items) {
          for (const item of feed.items.slice(0, 5)) {
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

              console.log(`🤖 Generating AI content for: ${item.title.substring(0, 50)}...`)
              
              // Classify vertical based on content, not source
              const contentVertical = classifyVerticalAutonomous(
                item.title,
                item.contentSnippet || item.content || '',
                source.name
              )
              
              // Generate AI-powered content
              const aiContent = await generateAIContent(
                item.title,
                item.contentSnippet || item.content || '',
                source.name,
                contentVertical
              )

              // Create new article with AI content
              const { error: insertError } = await supabase
                .from('articles')
                .insert({
                  title: item.title,
                  summary: item.contentSnippet || item.content || null,
                  sourceUrl: item.link,
                  sourceName: source.name,
                  publishedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  vertical: contentVertical,
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
              sourceAdded++
              console.log(`✅ Added: ${item.title.substring(0, 50)}...`)

              // Rate limit to avoid overwhelming AI API
              await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (itemError) {
              console.error('Error processing item:', itemError)
              skippedArticles++
            }
          }
        }

        sourceStats[source.name] = sourceAdded
        console.log(`📊 ${source.name}: ${sourceAdded} articles added`)

      } catch (sourceError) {
        console.error(`Error fetching from ${source.name}:`, sourceError)
        sourceStats[source.name] = 0
      }
    }

    // STEP 3: Refresh daily metrics with 90-day lookback
    console.log('\n📊 Step 3: Refreshing daily metrics with 90-day lookback...')
    const metricsResult = await refreshDailyMetrics()

    // STEP 4: Summary
    console.log('\n🎉 Manual systematic refresh complete!')
    console.log('=' .repeat(50))
    console.log(`📰 Articles: ${totalArticles} added, ${skippedArticles} skipped`)
    console.log(`📊 Metrics: ${metricsResult.metricsSelected} selected`)
    
    console.log('\n📈 Source breakdown:')
    Object.entries(sourceStats).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} articles`)
    })

    if (metricsResult.selectedMetric) {
      console.log(`\n📊 Selected metric: ${metricsResult.selectedMetric}`)
    }

    console.log('\n🔗 Links to check:')
    console.log('- Website: https://topline-tlwi.vercel.app/')
    console.log('- Newsletter: https://topline-tlwi.vercel.app/newsletter/preview')
    console.log('- Archive: https://topline-tlwi.vercel.app/archive')

  } catch (error) {
    console.error('❌ Error in manual refresh:', error)
  }
}

// Systematic metrics refresh with 90-day lookback and no reuse
async function refreshDailyMetrics() {
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

      console.log(`✅ Selected metric: ${selectedMetric.title}`)
      return { success: true, metricsSelected: 1, selectedMetric: selectedMetric.title }
    } else {
      console.log('⚠️  No available unused metrics found in 90-day window')
      return { success: false, metricsSelected: 0, message: 'No unused metrics available' }
    }

  } catch (error) {
    console.error('Error refreshing metrics:', error)
    return { success: false, metricsSelected: 0, error: error.message }
  }
}

// Run the manual refresh
manualRefresh().then(() => {
  console.log('\n✅ Manual refresh completed successfully')
  process.exit(0)
}).catch(error => {
  console.error('❌ Fatal error in manual refresh:', error)
  process.exit(1)
}) 