const { createClient } = require('@supabase/supabase-js')
const Parser = require('rss-parser')
const { randomUUID } = require('crypto')

// Supabase connection
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
const supabase = createClient(supabaseUrl, supabaseKey)

const parser = new Parser()

// Content sources from the actual config
const CONTENT_SOURCES = [
  {
    name: 'AdExchanger',
    rssUrl: 'https://www.adexchanger.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'MarTech Today',
    rssUrl: 'https://martech.org/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Digiday',
    rssUrl: 'https://digiday.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Ad Age',
    rssUrl: 'https://adage.com/rss.xml',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Marketing Land',
    rssUrl: 'https://marketingland.com/feed',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'TechCrunch',
    rssUrl: 'https://techcrunch.com/feed/',
    vertical: 'Technology & Media',
    priority: 'MEDIUM'
  },
  {
    name: 'Retail Dive',
    rssUrl: 'https://www.retaildive.com/feeds/news/',
    vertical: 'Consumer & Retail',
    priority: 'MEDIUM'
  }
]

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

function generateWhyItMatters(title, vertical) {
  if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('artificial intelligence')) {
    return `AI adoption in ${vertical} is accelerating rapidly, with early adopters gaining significant competitive advantages. This development signals where the market is heading and what capabilities will become table stakes.`
  }
  
  if (title.toLowerCase().includes('privacy') || title.toLowerCase().includes('cookie')) {
    return `Privacy regulations and data changes are forcing immediate strategic shifts in how brands collect and activate customer data. Companies that don't adapt quickly risk losing competitive positioning.`
  }
  
  if (title.toLowerCase().includes('programmatic') || title.toLowerCase().includes('advertising')) {
    return `The advertising technology landscape is evolving rapidly, with new formats and measurement capabilities creating opportunities for brands to reach customers more effectively.`
  }
  
  return `This ${vertical} development represents a significant shift in industry dynamics that will impact how enterprises approach marketing technology strategy and vendor partnerships.`
}

function generateTalkTrack(title, vertical) {
  if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('artificial intelligence')) {
    return `Reference this AI trend to discuss how your prospects' competitors might be leveraging similar technology, and position your solution in the context of this market evolution.`
  }
  
  if (title.toLowerCase().includes('privacy') || title.toLowerCase().includes('cookie')) {
    return `Use this development to discuss the urgency of building first-party data capabilities and ask prospects how they're preparing for these privacy changes.`
  }
  
  return `Reference this trend to demonstrate your understanding of market forces affecting your prospects' business and position your solution as aligned with industry direction.`
}

async function refreshContent() {
  console.log('🔄 Starting manual content refresh...')
  
  try {
    // First, archive old content
    console.log('🧹 Archiving old content...')
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 24)
    
    const { data: oldArticles, error: archiveError } = await supabase
      .from('articles')
      .update({ status: 'ARCHIVED' })
      .eq('status', 'PUBLISHED')
      .lt('publishedAt', cutoffDate.toISOString())
      .select()
    
    if (archiveError) {
      console.error('Error archiving old articles:', archiveError)
    } else {
      console.log(`📦 Archived ${oldArticles?.length || 0} old articles`)
    }
    
    // Fetch new content from RSS feeds
    let totalArticles = 0
    let skippedArticles = 0
    
    for (const source of CONTENT_SOURCES.slice(0, 5)) { // Limit to first 5 sources for testing
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        console.log(`Found ${feed.items?.length || 0} items from ${source.name}`)
        
        if (feed.items) {
          for (const item of feed.items.slice(0, 3)) { // Limit to 3 most recent per source
            try {
              const title = item.title || 'Untitled'
              const content = item.contentSnippet || item.content || ''
              const link = item.link || '#'
              
              // Skip if not relevant
              if (!isRelevantContent(title, content)) {
                skippedArticles++
                continue
              }
              
              // Check if already exists
              const { data: existing } = await supabase
                .from('articles')
                .select('id')
                .eq('sourceUrl', link)
                .limit(1)
              
              if (existing && existing.length > 0) {
                console.log(`⏭️  Skipping duplicate: ${title}`)
                continue
              }
              
              // Create new article
              const { error: insertError } = await supabase
                .from('articles')
                .insert({
                  id: randomUUID(),
                  title: title,
                  summary: content.substring(0, 300),
                  sourceUrl: link,
                  sourceName: source.name,
                  publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                  vertical: source.vertical,
                  status: 'PUBLISHED',
                  priority: source.priority,
                  category: 'NEWS',
                  whyItMatters: generateWhyItMatters(title, source.vertical),
                  talkTrack: generateTalkTrack(title, source.vertical),
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
              console.log(`✅ Added: ${title}`)
              
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
    
    // Get final stats
    const { count: totalCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED')
    
    console.log(`\n🎉 Content refresh completed!`)
    console.log(`📰 Added ${totalArticles} new articles`)
    console.log(`⏭️  Skipped ${skippedArticles} articles`)
    console.log(`📈 Total published articles: ${totalCount}`)
    
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
    
    // Select 3 diverse metrics
    const selectedMetrics = selectDiverseMetrics(availableMetrics, 3)
    
    // Publish selected metrics
    const { error: publishError } = await supabase
      .from('metrics')
      .update({ status: 'PUBLISHED' })
      .in('id', selectedMetrics.map(m => m.id))
    
    if (publishError) {
      console.error('Error publishing metrics:', publishError)
    } else {
      console.log(`📊 Published ${selectedMetrics.length} metrics`)
      selectedMetrics.forEach(m => console.log(`  - ${m.title}: ${m.value}`))
    }
    
  } catch (error) {
    console.error('Error refreshing metrics:', error)
  }
}

function selectDiverseMetrics(metrics, count) {
  const verticals = ['Technology & Media', 'Consumer & Retail', 'Financial Services', 'Healthcare & Life Sciences']
  const selected = []
  
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
    console.log('✅ Manual content refresh completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Manual content refresh failed:', error)
    process.exit(1)
  }) 