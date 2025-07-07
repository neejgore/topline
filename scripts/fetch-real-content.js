require('dotenv').config()
const { CONTENT_SOURCES } = require('../lib/content-sources.js')
const { prisma } = require('../lib/db')
const { generateAIContent } = require('../lib/ai-content-generator.js')
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
            console.log(`🤖 Generating AI content for: ${item.title}`)
            
            // Generate AI-powered content
            const aiContent = await generateAIContent(
              item.title, 
              item.contentSnippet || 'No summary available', 
              source.name, 
              source.category || 'Technology & Media'
            )
            
            await prisma.article.create({
              data: {
                title: item.title,
                summary: item.contentSnippet?.substring(0, 300) || 'No summary available',
                sourceUrl: item.link,
                sourceName: source.name,
                whyItMatters: aiContent.whyItMatters,
                talkTrack: aiContent.talkTrack,
                category: 'NEWS',
                vertical: source.category || 'Technology & Media',
                priority: source.priority || 'MEDIUM',
                status: 'PUBLISHED',
                publishedAt: new Date(item.pubDate || Date.now())
              }
            })
            totalArticles++
            console.log(`✅ Added with AI content: ${item.title}`)
            
            // Small delay to avoid overwhelming the AI API
            await new Promise(resolve => setTimeout(resolve, 1000))
            
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