const { PrismaClient } = require('@prisma/client')
const { ContentIngestionService } = require('../lib/content-ingestion.js')

const prisma = new PrismaClient()

async function fetchRealContent() {
  console.log('🔄 Fetching real content for Topline...\n')

  try {
    // Step 1: Clear example data
    console.log('1. 🗑️  Clearing example data...')
    const deletedArticles = await prisma.article.deleteMany({
      where: {
        sourceUrl: {
          startsWith: 'https://example.com'
        }
      }
    })
    
    const deletedMetrics = await prisma.metric.deleteMany({
      where: {
        sourceUrl: {
          startsWith: 'https://example.com'
        }
      }
    })
    
    console.log(`   ✅ Removed ${deletedArticles.count} example articles`)
    console.log(`   ✅ Removed ${deletedMetrics.count} example metrics\n`)

    // Step 2: Fetch real content
    console.log('2. 📡 Fetching real content from RSS feeds...')
    const contentService = new ContentIngestionService()
    const result = await contentService.ingestFromRSSFeeds()
    
    console.log(`   ✅ Added ${result.articles} real articles`)
    console.log(`   ⚠️  Skipped ${result.skipped} irrelevant articles\n`)

    // Step 3: Show content stats
    console.log('3. 📊 Content statistics:')
    const stats = await contentService.getContentStats()
    console.log(`   📰 Total articles: ${stats.totalArticles}`)
    console.log(`   ✅ Published articles: ${stats.publishedArticles}`)
    console.log(`   🆕 Recent articles (24h): ${stats.recentArticles}`)
    
    if (stats.expiredArticles > 0) {
      console.log(`   🗑️  Expired articles: ${stats.expiredArticles}`)
    }

    // Step 4: Show sample of new content
    console.log('\n4. 📖 Sample of new content:')
    const sampleArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        title: true,
        sourceName: true,
        vertical: true
      }
    })

    sampleArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. "${article.title}" (${article.sourceName} - ${article.vertical})`)
    })

    console.log('\n🎉 Real content fetch completed!')
    console.log('\nNext steps:')
    console.log('- Visit http://localhost:3000 to see real content')
    console.log('- Check the archive page for search functionality')
    console.log('- Set up automated scheduling for Tuesday 12am PST')

  } catch (error) {
    console.error('❌ Error fetching real content:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if this script is being run directly
if (require.main === module) {
  fetchRealContent()
}

module.exports = { fetchRealContent } 