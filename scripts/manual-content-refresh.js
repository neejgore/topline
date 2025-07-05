const { createClient } = require('@supabase/supabase-js')
const { CONTENT_SOURCES } = require('../lib/content-sources.js')
const { generateAIContent } = require('../lib/ai-content-generator.js')
const { randomUUID } = require('crypto')
const Parser = require('rss-parser')

// Initialize
const supabase = createClient(
  'https://yuwuaadbqgywebfsbjcp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
)

const parser = new Parser()

// Keywords to identify relevant content
const RELEVANT_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'AI advertising', 'programmatic AI',
  'generative AI', 'AI marketing', 'automation', 'third-party cookies', 'privacy regulations',
  'GDPR', 'CCPA', 'data privacy', 'customer data platform', 'CDP', 'marketing automation',
  'personalization', 'attribution', 'programmatic advertising', 'connected TV', 'CTV',
  'retail media', 'e-commerce', 'omnichannel', 'social media marketing', 'influencer marketing'
]

const EXCLUDE_KEYWORDS = [
  'celebrity', 'entertainment', 'sports', 'politics', 'weather',
  'gossip', 'fashion', 'lifestyle', 'travel', 'food'
]

function isRelevantContent(title, content) {
  const text = `${title} ${content || ''}`.toLowerCase()
  
  // Check for excluded keywords first - be more specific
  const specificExcludes = ['celebrity gossip', 'sports scores', 'weather forecast', 'entertainment awards']
  if (specificExcludes.some(keyword => text.includes(keyword))) {
    return false
  }
  
  // More permissive approach - if it contains business/marketing/tech keywords, include it
  const businessKeywords = [
    'marketing', 'advertising', 'brand', 'sales', 'revenue', 'growth', 'company', 'business',
    'technology', 'ai', 'digital', 'platform', 'data', 'analytics', 'automation', 'strategy',
    'retail', 'e-commerce', 'commerce', 'consumer', 'customer', 'financial', 'investment',
    'programmatic', 'media', 'campaign', 'budget', 'roi', 'performance', 'optimization',
    'privacy', 'cookie', 'gdpr', 'regulation', 'compliance', 'security', 'innovation',
    'startup', 'funding', 'acquisition', 'merger', 'ipo', 'valuation', 'partnership'
  ]
  
  // If it contains any business keyword, it's relevant
  if (businessKeywords.some(keyword => text.includes(keyword))) {
    return true
  }
  
  // If it's from a business/marketing publication, it's likely relevant
  return true // Default to including content from our curated sources
}

// Generic functions removed - now using AI content generation for all articles!

async function refreshContent() {
  console.log('🚀 Starting autonomous AI content refresh...')
  
  try {
    // First, archive old content
    const { data: oldArticles, error: archiveError } = await supabase
      .from('articles')
      .update({ status: 'ARCHIVED' })
      .eq('status', 'PUBLISHED')
    
    if (archiveError) {
      console.error('Error archiving old articles:', archiveError)
    } else {
      console.log(`📦 Archived ${oldArticles?.length || 0} old articles`)
    }
    
    let totalArticles = 0
    let skippedArticles = 0
    
    // Process RSS feeds with AI content generation
    for (const source of CONTENT_SOURCES.slice(0, 10)) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        const feed = await parser.parseURL(source.rssUrl)
        
        if (feed.items) {
          for (const item of feed.items.slice(0, 3)) {
            try {
              if (!item.title || !item.link) {
                skippedArticles++
                continue
              }
              
              // Check for duplicates
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
                  id: randomUUID(),
                  title: item.title,
                  summary: (item.contentSnippet || item.content || '').substring(0, 300),
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
                  shares: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
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
        
        // Small delay between sources
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (sourceError) {
        console.error(`❌ Error fetching from ${source.name}:`, sourceError)
      }
    }
    
    // Refresh metrics
    console.log('📊 Refreshing metrics...')
    await refreshMetrics()
    
    console.log(`\n🎉 Autonomous AI content refresh completed!`)
    console.log(`📊 Total articles added: ${totalArticles}`)
    console.log(`📊 Articles skipped: ${skippedArticles}`)
    
  } catch (error) {
    console.error('❌ Content refresh failed:', error)
  }
}

async function refreshMetrics() {
  try {
    // Archive old metrics
    const { data: oldMetrics, error: archiveError } = await supabase
      .from('metrics')
      .update({ status: 'ARCHIVED' })
      .eq('status', 'PUBLISHED')
      .select()
    
    if (archiveError) {
      console.error('Error archiving old metrics:', archiveError)
    } else {
      console.log(`📦 Archived ${oldMetrics?.length || 0} old metrics`)
    }
    
    // Get available metrics from last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    
    const { data: availableMetrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .eq('status', 'ARCHIVED')
      .order('publishedAt', { ascending: false })
      .limit(20)
    
    if (fetchError) {
      console.error('Error fetching available metrics:', fetchError)
      return
    }
    
    if (!availableMetrics || availableMetrics.length === 0) {
      console.log('No available metrics to publish')
      return
    }
    
    // Select 1 metric (newest available)
    const selectedMetrics = selectDiverseMetrics(availableMetrics, 1)
    
    // Publish selected metrics
    const { error: publishError } = await supabase
      .from('metrics')
      .update({ status: 'PUBLISHED' })
      .in('id', selectedMetrics.map(m => m.id))
    
    if (publishError) {
      console.error('Error publishing metrics:', publishError)
    } else {
      console.log(`📊 Published ${selectedMetrics.length} metric${selectedMetrics.length > 1 ? 's' : ''}`)
      selectedMetrics.forEach(m => console.log(`  - ${m.title}: ${m.value}`))
    }
    
  } catch (error) {
    console.error('Error refreshing metrics:', error)
  }
}

function selectDiverseMetrics(metrics, count) {
  const verticals = ['Technology & Media', 'Consumer & Retail', 'Financial Services', 'Healthcare & Life Sciences']
  const selected = []
  
  // For single metric selection, just take the newest available metric
  if (count === 1) {
    return metrics.slice(0, 1)
  }
  
  // Original logic for multiple metrics (kept for future use)
  // Try to get one metric from each vertical
  for (const vertical of verticals) {
    if (selected.length >= count) break
    
    const verticalMetrics = metrics.filter(m => m.vertical === vertical && !selected.includes(m))
    if (verticalMetrics.length > 0) {
      selected.push(verticalMetrics[0])
    }
  }
  
  // Fill remaining slots with newest metrics
  while (selected.length < count && selected.length < metrics.length) {
    const remaining = metrics.filter(m => !selected.includes(m))
    if (remaining.length === 0) break
    selected.push(remaining[0])
  }
  
  return selected
}

// Run the refresh
refreshContent()
  .then(() => {
    console.log('✅ Autonomous AI content refresh completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Autonomous AI content refresh failed:', error)
    process.exit(1)
  }) 