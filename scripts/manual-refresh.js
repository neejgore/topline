const { createClient } = require('@supabase/supabase-js')
const Parser = require('rss-parser')

// Content sources from the TypeScript file
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
    name: 'Campaign US',
    rssUrl: 'https://www.campaignlive.com/rss',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'MediaPost - Social Media Marketing',
    rssUrl: 'http://feeds.mediapost.com/social-media-marketing-daily',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Marketing Brew',
    rssUrl: 'https://www.marketingbrew.com/feed',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Adweek - Mobile',
    rssUrl: 'https://www.adweek.com/category/mobile/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Adweek - Advertising Exclusive',
    rssUrl: 'https://www.adweek.com/category/advertising/exclusive/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Adweek - Intelligence',
    rssUrl: 'https://www.adweek.com/category/adweek-intelligence/feed/',
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
    name: 'Forbes CMO Network',
    rssUrl: 'https://www.forbes.com/sites/cmo/feed/',
    vertical: 'Services',
    priority: 'MEDIUM'
  },
  {
    name: 'Retail Dive',
    rssUrl: 'https://www.retaildive.com/feeds/news/',
    vertical: 'Consumer & Retail',
    priority: 'MEDIUM'
  },
  {
    name: 'Modern Healthcare',
    rssUrl: 'https://www.modernhealthcare.com/rss.xml',
    vertical: 'Healthcare',
    priority: 'MEDIUM'
  },
  {
    name: 'American Banker',
    rssUrl: 'https://www.americanbanker.com/feed',
    vertical: 'Financial Services',
    priority: 'MEDIUM'
  },
  {
    name: 'Banking Dive',
    rssUrl: 'https://www.bankingdive.com/feeds/news/',
    vertical: 'Financial Services',
    priority: 'MEDIUM'
  },
  {
    name: 'Search Engine Land',
    rssUrl: 'https://searchengineland.com/feed',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'Content Marketing Institute',
    rssUrl: 'https://contentmarketinginstitute.com/feed/',
    vertical: 'Technology & Media',
    priority: 'HIGH'
  },
  {
    name: 'MarketingProfs',
    rssUrl: 'https://www.marketingprofs.com/feed.xml',
    vertical: 'Technology & Media',
    priority: 'MEDIUM'
  },
  {
    name: 'HubSpot Marketing Blog',
    rssUrl: 'https://blog.hubspot.com/marketing/rss.xml',
    vertical: 'Technology & Media',
    priority: 'MEDIUM'
  }
]

const RELEVANT_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'AI advertising', 'programmatic AI',
  'generative AI', 'AI marketing', 'chatGPT', 'automation',
  'third-party cookies', 'privacy regulations', 'GDPR', 'CCPA', 'data privacy',
  'consent management', 'first-party data', 'cookieless',
  'customer data platform', 'CDP', 'marketing automation', 'personalization',
  'attribution', 'marketing mix modeling', 'MMM', 'martech stack',
  'customer journey', 'omnichannel', 'marketing technology',
  'programmatic advertising', 'demand side platform', 'DSP', 'supply side platform', 'SSP',
  'header bidding', 'real-time bidding', 'RTB', 'connected TV', 'CTV',
  'addressable advertising', 'ad fraud', 'viewability',
  'merger', 'acquisition', 'funding', 'IPO', 'valuation', 'partnership',
  'revenue', 'growth', 'earnings', 'investment',
  'social media marketing', 'influencer marketing', 'content marketing',
  'email marketing', 'search marketing', 'SEO', 'SEM', 'PPC',
  'retail media', 'e-commerce', 'omnichannel retail', 'direct-to-consumer',
  'marketplace advertising', 'product discovery'
]

const EXCLUDE_KEYWORDS = [
  'celebrity', 'entertainment', 'sports', 'politics', 'weather',
  'gossip', 'fashion', 'lifestyle', 'travel', 'food'
]

// Supabase connection
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions
function generateWhyItMatters(title, content) {
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

function generateTalkTrack(title, vertical) {
  const text = title.toLowerCase()
  
  if (text.includes('acquisition') || text.includes('merger')) {
    return `Use this ${vertical} industry consolidation as a conversation starter about how market changes impact your prospects' strategic planning.`
  }
  
  if (text.includes('growth') || text.includes('expansion')) {
    return `Reference this growth story to discuss how your prospects are thinking about scaling their operations in ${vertical}.`
  }
  
  return `Leverage this ${vertical} development to show you understand the market forces affecting your prospects' business decisions.`
}

function getImportanceScore(title, content) {
  const text = `${title} ${content}`.toLowerCase()
  let score = 5 // Base score
  
  // High impact keywords
  if (text.includes('acquisition') || text.includes('merger')) score += 3
  if (text.includes('ai') || text.includes('artificial intelligence')) score += 2
  if (text.includes('privacy') || text.includes('gdpr')) score += 2
  if (text.includes('growth') || text.includes('revenue')) score += 1
  
  return Math.min(score, 10) // Cap at 10
}

async function fetchRealContent() {
  console.log('🚀 Starting manual content refresh...')
  console.log(`📡 Testing ${CONTENT_SOURCES.length} RSS sources...`)
  
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ToplineBot/1.0; +https://topline.com)'
    }
  })
  
  let totalArticles = 0
  let skippedArticles = 0
  let sourceResults = []
  
  for (const source of CONTENT_SOURCES) {
    try {
      console.log(`\n📰 Fetching from ${source.name}...`)
      const feed = await parser.parseURL(source.rssUrl)
      const items = feed.items || []
      
      console.log(`   Found ${items.length} articles`)
      
      let sourceArticles = 0
      const recentItems = items.slice(0, 5) // Take first 5 from each source
      
      for (const item of recentItems) {
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

          // Check relevance (be more permissive for manual refresh)
          const isRelevant = RELEVANT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase())) ||
                           text.includes('marketing') || text.includes('advertising') || 
                           text.includes('business') || text.includes('technology')
          
          if (!isRelevant) {
            skippedArticles++
            continue
          }

          // Check for duplicates
          const { data: existingArticle, error: duplicateError } = await supabase
            .from('articles')
            .select('id')
            .eq('sourceUrl', item.link)
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

          // Generate UUID for article
          const id = crypto.randomUUID ? crypto.randomUUID() : 
                     'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
                       const r = Math.random() * 16 | 0
                       const v = c === 'x' ? r : (r & 0x3 | 0x8)
                       return v.toString(16)
                     })

          // Create new article
          const articleData = {
            id: id,
            title: item.title.substring(0, 200), // Limit title length
            summary: (item.contentSnippet || item.content || '').substring(0, 500),
            sourceUrl: item.link,
            sourceName: source.name,
            publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            vertical: source.vertical,
            status: 'PUBLISHED',
            priority: source.priority,
            category: 'NEWS',
            whyItMatters: generateWhyItMatters(item.title, item.contentSnippet || ''),
            talkTrack: generateTalkTrack(item.title, source.vertical),
            importanceScore: getImportanceScore(item.title, item.contentSnippet || ''),
            views: 0,
            clicks: 0,
            shares: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          const { error: insertError } = await supabase
            .from('articles')
            .insert(articleData)

          if (insertError) {
            console.error('Error inserting article:', insertError)
            skippedArticles++
            continue
          }

          sourceArticles++
          totalArticles++
          console.log(`   ✅ Added: ${item.title.substring(0, 60)}...`)

        } catch (itemError) {
          console.error('Error processing item:', itemError)
          skippedArticles++
        }
      }
      
      sourceResults.push({
        name: source.name,
        articlesAdded: sourceArticles,
        status: 'SUCCESS'
      })
      
    } catch (sourceError) {
      console.error(`❌ Error fetching from ${source.name}:`, sourceError.message)
      sourceResults.push({
        name: source.name,
        articlesAdded: 0,
        status: 'FAILED',
        error: sourceError.message
      })
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 CONTENT REFRESH SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Total articles added: ${totalArticles}`)
  console.log(`⏭️  Articles skipped: ${skippedArticles}`)
  console.log(`📡 Sources tested: ${CONTENT_SOURCES.length}`)
  
  const workingSources = sourceResults.filter(s => s.status === 'SUCCESS' && s.articlesAdded > 0)
  const brokenSources = sourceResults.filter(s => s.status === 'FAILED')
  
  console.log(`\n✅ Working sources (${workingSources.length}):`)
  workingSources.forEach(source => {
    console.log(`   ${source.name}: ${source.articlesAdded} articles`)
  })
  
  if (brokenSources.length > 0) {
    console.log(`\n❌ Failed sources (${brokenSources.length}):`)
    brokenSources.forEach(source => {
      console.log(`   ${source.name}: ${source.error}`)
    })
  }
  
  // Get final database stats
  const { count: finalCount, error: countError } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PUBLISHED')
  
  if (!countError) {
    console.log(`\n📈 Total articles in database: ${finalCount}`)
  }
  
  console.log('\n🎉 Manual content refresh completed!')
  
  return {
    success: true,
    articlesAdded: totalArticles,
    articlesSkipped: skippedArticles,
    sourcesWorking: workingSources.length,
    sourcesFailed: brokenSources.length
  }
}

// Add crypto polyfill for Node.js environments that don't have it
if (typeof crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => {
      return 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}

// Run the script
if (require.main === module) {
  fetchRealContent()
    .then(result => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { fetchRealContent } 