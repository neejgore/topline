const Parser = require('rss-parser')
const { prisma } = require('./db')
const { CONTENT_SOURCES, CONTENT_SCHEDULE } = require('./content-sources')

const parser = new Parser()

class ContentIngestionService {
  async ingestFromRSSFeeds() {
    console.log('⚠️ Using deprecated JavaScript version - switch to TypeScript version')
    return { articles: 0, skipped: 0 }
  }
  
  isRelevantContent(title, content) {
    const text = `${title} ${content}`.toLowerCase()
    
    // Check if content contains excluded keywords
    const hasExcluded = CONTENT_SOURCES.excludeKeywords.some(keyword =>
      text.includes(keyword.toLowerCase())
    )
    if (hasExcluded) return false
    
    // Check if content contains relevant keywords
    const hasRelevant = CONTENT_SOURCES.keywordFilters.some(keyword =>
      text.includes(keyword.toLowerCase())
    )
    
    return hasRelevant
  }
  
  async processRSSItem(item, source) {
    if (!item.title || !item.link) return null
    
    // Check if article already exists
    const existing = await prisma.article.findFirst({
      where: { sourceUrl: item.link }
    })
    if (existing) return null
    
    // Generate summary and insights
    const summary = this.generateSummary(item.title, item.contentSnippet || '')
    
    return {
      title: item.title,
      summary,
      sourceUrl: item.link,
      sourceName: source.name,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: source.category,
      priority: source.priority
    }
  }
  
  generateSummary(title, content) {
    // Clean HTML tags and trim
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    return cleanContent.length > 200 
      ? cleanContent.substring(0, 200) + '...'
      : cleanContent
  }
  
  generateInsights(title, summary) {
    const titleLower = title.toLowerCase()
    
    const isAIContent = titleLower.includes('ai') || titleLower.includes('artificial intelligence')
    const isPrivacyContent = titleLower.includes('privacy') || titleLower.includes('cookie')
    const isMergerContent = titleLower.includes('merger') || titleLower.includes('acquisition')
    
    let whyItMatters = ''
    let talkTrack = ''
    
    if (isAIContent) {
      whyItMatters = 'AI adoption is accelerating across marketing and sales. Companies that don\'t adapt risk falling behind competitors who are leveraging AI for efficiency and personalization.'
      talkTrack = 'Ask: "How is your team currently using AI in your marketing operations?" Position AI solutions as competitive necessities, not experimental tools.'
    } else if (isPrivacyContent) {
      whyItMatters = 'Privacy regulations and cookie deprecation are reshaping digital marketing. Brands need first-party data strategies to maintain targeting effectiveness.'
      talkTrack = 'Lead with: "What\'s your plan for reaching customers as third-party data becomes unavailable?" Focus on first-party data collection and identity resolution.'
    } else if (isMergerContent) {
      whyItMatters = 'Industry consolidation drives efficiency pressure. Companies will scrutinize vendor relationships and demand proof of incremental value.'
      talkTrack = 'Frame around future-proofing: "How are you preparing for increased competition and tighter budgets?" Emphasize measurable ROI and vendor consolidation benefits.'
    } else {
      whyItMatters = 'Market dynamics are shifting rapidly. Staying informed about industry changes helps maintain competitive advantage and strategic alignment.'
      talkTrack = 'Use as conversation starter: "Have you seen this recent development in [specific area]?" Connect the trend to their business challenges and priorities.'
    }
    
    return { whyItMatters, talkTrack }
  }
  
  async saveArticle(articleData) {
    const insights = this.generateInsights(articleData.title, articleData.summary)
    
    await prisma.article.create({
      data: {
        title: articleData.title,
        summary: articleData.summary,
        sourceUrl: articleData.sourceUrl,
        sourceName: articleData.sourceName,
        whyItMatters: insights.whyItMatters,
        talkTrack: insights.talkTrack,
        category: articleData.category,
        vertical: articleData.category,
        priority: articleData.priority,
        status: 'PUBLISHED',
        publishedAt: articleData.publishedAt,
        expiresAt: new Date(Date.now() + CONTENT_SCHEDULE.maxAgeHours * 60 * 60 * 1000)
      }
    })
  }
  
  async cleanupExpiredContent() {
    console.log('🧹 Cleaning up expired content...')
    
    const result = await prisma.article.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    
    console.log(`🗑️  Removed ${result.count} expired articles`)
    return result.count
  }
  
  async getContentStats() {
    const [total, published, expired, recent] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ 
        where: { expiresAt: { lt: new Date() } }
      }),
      prisma.article.count({
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])
    
    return {
      totalArticles: total,
      publishedArticles: published,
      expiredArticles: expired,
      recentArticles: recent
    }
  }
}

module.exports = { ContentIngestionService } 