const { createClient } = require('@supabase/supabase-js')
const Parser = require('rss-parser')
const { generateAIContent } = require('../lib/ai-content-generator.js')

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
  let score = 0
  
  // Higher importance for AI/ML topics
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
    score += 3
  }
  
  // Higher importance for privacy/cookie topics
  if (text.includes('privacy') || text.includes('cookie') || text.includes('gdpr')) {
    score += 3
  }
  
  // Higher importance for business changes
  if (text.includes('merger') || text.includes('acquisition') || text.includes('funding')) {
    score += 2
  }
  
  // Higher importance for retail/commerce
  if (text.includes('retail') || text.includes('commerce') || text.includes('marketplace')) {
    score += 2
  }
  
  return Math.min(score, 5) // Cap at 5
}

async function fetchRealContent() {
  console.log('🚀 Starting real content fetch...')
  
  const parser = new Parser()
  let totalArticles = 0
  let skippedArticles = 0
  
  // Limit to first 8 sources to avoid overwhelming the system
  const sourcesToProcess = CONTENT_SOURCES.slice(0, 8)
  
  for (const source of sourcesToProcess) {
    try {
      console.log(`📰 Fetching from ${source.name}...`)
      const feed = await parser.parseURL(source.rssUrl)
      const items = feed.items || []
      
      console.log(`Found ${items.length} items from ${source.name}`)
      
      // Process up to 3 items per source
      for (const item of items.slice(0, 3)) {
        try {
          // Skip if no title or URL
          if (!item.title || !item.link) {
            skippedArticles++
            continue
          }
          
          // Clean and prepare content
          const title = item.title.trim()
          const content = item.contentSnippet || item.content || ''
          const cleanContent = content.substring(0, 500) // Limit content length
          
          // Check if content is relevant
          const text = `${title} ${cleanContent}`.toLowerCase()
          
          // Skip if content contains excluded keywords
          if (EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))) {
            skippedArticles++
            continue
          }
          
          // Check if content is relevant
          const isRelevant = RELEVANT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
          if (!isRelevant) {
            skippedArticles++
            continue
          }
          
          // Check for duplicates
          const { data: existingArticle } = await supabase
            .from('articles')
            .select('id')
            .or(`sourceUrl.eq.${item.link},and(title.eq.${title},sourceName.eq.${source.name})`)
            .limit(1)
            .single()
          
          if (existingArticle) {
            skippedArticles++
            continue
          }
          
          console.log(`🤖 Generating AI content for: ${title}`)
          
          // Generate AI-powered content
          const aiContent = await generateAIContent(title, cleanContent, source.name, source.vertical)
          
          // Create the article with AI-generated content
          const { error } = await supabase
            .from('articles')
            .insert({
              id: crypto.randomUUID(),
              title: title,
              summary: cleanContent || null,
              sourceUrl: item.link,
              sourceName: source.name,
              publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              vertical: source.vertical,
              status: 'PUBLISHED',
              priority: source.priority,
              category: 'NEWS',
              whyItMatters: aiContent.whyItMatters,
              talkTrack: aiContent.talkTrack,
              importanceScore: getImportanceScore(title, cleanContent),
              views: 0,
              clicks: 0,
              shares: 0
            })
          
          if (error) {
            console.error(`❌ Error inserting article: ${error.message}`)
            skippedArticles++
            continue
          }
          
          totalArticles++
          console.log(`✅ Added with AI content: ${title}`)
          
          // Small delay to avoid overwhelming the AI API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (itemError) {
          console.error(`❌ Error processing item: ${itemError.message}`)
          skippedArticles++
        }
      }
      
    } catch (sourceError) {
      console.error(`❌ Error fetching from ${source.name}: ${sourceError.message}`)
    }
  }
  
  console.log(`🎉 Content fetch complete!`)
  console.log(`📊 Added ${totalArticles} articles, skipped ${skippedArticles}`)
  
  // Get current stats
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PUBLISHED')
  
  console.log(`📈 Total articles in database: ${count}`)
  
  return {
    success: true,
    results: {
      articlesAdded: totalArticles,
      articlesSkipped: skippedArticles,
      totalArticles: count
    }
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