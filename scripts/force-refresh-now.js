/**
 * Force content refresh - direct database access
 * Bypasses API authentication for emergency use
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const Parser = require('rss-parser')
const parser = new Parser()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Content sources (copied from lib/content-sources.ts for standalone execution)
const CONTENT_SOURCES = [
  { name: 'AdExchanger', rssUrl: 'https://www.adexchanger.com/feed/', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'MarTech Today', rssUrl: 'https://martech.org/feed/', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'Digiday', rssUrl: 'https://digiday.com/feed/', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'Marketing Land', rssUrl: 'https://marketingland.com/feed', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'MediaPost - Social Media Marketing', rssUrl: 'http://feeds.mediapost.com/social-media-marketing-daily', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'Search Engine Land', rssUrl: 'https://searchengineland.com/feed', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'Content Marketing Institute', rssUrl: 'https://contentmarketinginstitute.com/feed/', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'MarketingProfs', rssUrl: 'https://www.marketingprofs.com/feed.xml', vertical: 'Technology & Media', priority: 'MEDIUM', enabled: true },
  { name: 'HubSpot Marketing Blog', rssUrl: 'https://blog.hubspot.com/marketing/rss.xml', vertical: 'Technology & Media', priority: 'MEDIUM', enabled: true },
  { name: 'TechCrunch', rssUrl: 'https://techcrunch.com/feed/', vertical: 'Technology & Media', priority: 'MEDIUM', enabled: true },
  { name: 'Forbes CMO Network', rssUrl: 'https://www.forbes.com/sites/cmo/feed/', vertical: 'Services', priority: 'MEDIUM', enabled: true },
  { name: 'Retail Dive', rssUrl: 'https://www.retaildive.com/feeds/news/', vertical: 'Consumer & Retail', priority: 'MEDIUM', enabled: true },
  { name: 'Banking Dive', rssUrl: 'https://www.bankingdive.com/feeds/news/', vertical: 'Financial Services', priority: 'MEDIUM', enabled: true },
  { name: 'Search Engine Journal', rssUrl: 'https://www.searchenginejournal.com/feed/', vertical: 'Technology & Media', priority: 'HIGH', enabled: true },
  { name: 'Marketing Week', rssUrl: 'https://www.marketingweek.com/feed/', vertical: 'Technology & Media', priority: 'MEDIUM', enabled: true },
  { name: 'CMSWire Marketing', rssUrl: 'https://www.cmswire.com/marketing/rss/', vertical: 'Technology & Media', priority: 'MEDIUM', enabled: true }
]

async function forceRefresh() {
  console.log('🚀 FORCE REFRESH STARTING...')
  console.log(`📅 Time: ${new Date().toLocaleString()}`)
  
  let totalProcessed = 0
  let totalSuccess = 0
  
  // Get enabled sources
  const enabledSources = CONTENT_SOURCES.filter(s => s.enabled !== false)
  console.log(`📡 Processing ${enabledSources.length} enabled sources...`)
  
  const lookbackHours = 48
  const lookbackCutoff = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)
  console.log(`⏰ Lookback cutoff: ${lookbackCutoff.toISOString()}`)
  
  for (const source of enabledSources) {
    try {
      console.log(`\n📡 Fetching: ${source.name}`)
      const feed = await parser.parseURL(source.rssUrl)
      
      if (!feed.items || feed.items.length === 0) {
        console.log(`  ⚠️  No items found`)
        continue
      }
      
      console.log(`  📰 Found ${feed.items.length} items`)
      
      // Process up to 15 items per source
      const itemsToProcess = feed.items.slice(0, 15)
      
      for (const item of itemsToProcess) {
        totalProcessed++
        
        if (!item.title || !item.link) {
          console.log(`  ❌ Skipped: missing title/link`)
          continue
        }
        
        // Check freshness
        const itemDate = item.pubDate ? new Date(item.pubDate) : new Date()
        if (itemDate < lookbackCutoff) {
          console.log(`  ⏸️  Skipped: ${item.title.substring(0, 50)}... (too old)`)
          continue
        }
        
        // Check for duplicates
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('sourceUrl', item.link)
          .single()
        
        if (existing) {
          console.log(`  ⏭️  Skipped: ${item.title.substring(0, 50)}... (duplicate)`)
          continue
        }
        
        // Insert article with minimal AI processing (just insert the raw content for now)
        const articleData = {
          id: Math.floor(Math.random() * 1000000000),
          title: item.title,
          summary: item.contentSnippet || item.content || 'No summary available',
          sourceUrl: item.link,
          sourceName: source.name,
          publishedAt: itemDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          vertical: source.vertical,
          status: 'PUBLISHED',
          priority: source.priority,
          category: 'NEWS',
          whyItMatters: `This ${source.vertical} development impacts market trends and business strategy.`,
          talkTrack: `I noticed this update from ${source.name} - thought it might be relevant to our conversation.`,
          importanceScore: 50, // Default medium importance
          views: 0,
          clicks: 0,
          shares: 0
        }
        
        const { error } = await supabase
          .from('articles')
          .insert(articleData)
        
        if (error) {
          console.log(`  ❌ Failed: ${error.message}`)
        } else {
          console.log(`  ✅ Added: ${item.title.substring(0, 60)}...`)
          totalSuccess++
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
    } catch (error) {
      console.error(`  ❌ Error with ${source.name}:`, error.message)
    }
  }
  
  console.log(`\n🎉 REFRESH COMPLETE`)
  console.log(`   Processed: ${totalProcessed} items`)
  console.log(`   Success: ${totalSuccess} articles added`)
  console.log(`   Skipped: ${totalProcessed - totalSuccess} items`)
}

forceRefresh()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

