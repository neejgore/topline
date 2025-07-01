const { prisma } = require('../lib/db')

async function checkSetup() {
  console.log('🔍 Checking database setup...')
  
  try {
    // Check articles
    const articleCount = await prisma.article.count()
    console.log(`📰 Articles: ${articleCount}`)
    
    // Check metrics  
    const metricCount = await prisma.metric.count()
    console.log(`📊 Metrics: ${metricCount}`)
    
    // Check tags
    const tagCount = await prisma.tag.count()
    console.log(`🏷️  Tags: ${tagCount}`)
    
    // Check sources
    const sourceCount = await prisma.source.count()
    console.log(`📡 Sources: ${sourceCount}`)
    
    // Check recent content
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentArticles = await prisma.article.count({
      where: {
        publishedAt: { gte: oneWeekAgo },
        status: 'PUBLISHED'
      }
    })
    console.log(`📅 Recent articles (7 days): ${recentArticles}`)
    
    if (articleCount === 0) {
      console.log('⚠️  No articles found. Run: npm run db:seed')
    }
    
    if (recentArticles === 0) {
      console.log('⚠️  No recent articles. Content may need refresh.')
    }
    
    console.log('✅ Setup check complete')
    
  } catch (error) {
    console.error('❌ Setup check failed:', error.message)
  }
}

checkSetup() 