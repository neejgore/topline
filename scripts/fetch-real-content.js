const { CONTENT_SOURCES } = require('../lib/content-sources.js')
const { prisma } = require('../lib/db')
const Parser = require('rss-parser')
const parser = new Parser()

async function main() {
  console.log('🚀 Fetching real content from RSS feeds...')
  
  let totalArticles = 0
  
  for (const source of CONTENT_SOURCES.rssFeeds.slice(0, 5)) { // Limit to first 5 for testing
    try {
      console.log(`📡 Fetching from ${source.name}...`)
      
      const feed = await parser.parseURL(source.url)
      console.log(`Found ${feed.items?.length || 0} items`)
      
      if (feed.items) {
        for (const item of feed.items.slice(0, 2)) { // Limit to 2 per source
          try {
            await prisma.article.create({
              data: {
                title: item.title,
                summary: item.contentSnippet?.substring(0, 300) || 'No summary available',
                sourceUrl: item.link,
                sourceName: source.name,
                whyItMatters: 'This article provides important industry insights for sales professionals.',
                talkTrack: 'Use this information to understand current market trends and engage prospects.',
                category: 'NEWS',
                vertical: source.category || 'Technology & Media',
                priority: source.priority || 'MEDIUM',
                status: 'PUBLISHED',
                publishedAt: new Date(item.pubDate || Date.now())
              }
            })
            totalArticles++
            console.log(`✅ Added: ${item.title}`)
          } catch (error) {
            console.error(`❌ Error adding article: ${error.message}`)
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching from ${source.name}: ${error.message}`)
    }
  }
  
  console.log(`🎉 Fetched ${totalArticles} total articles`)
}

main()
  .catch(console.error)
  .finally(() => {
    console.log('✅ Content fetch complete')
  })

module.exports = { main } 