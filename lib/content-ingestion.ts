import Parser from 'rss-parser'
import { PrismaClient } from '@prisma/client'
import { CONTENT_SOURCES, CONTENT_SCHEDULE } from './content-sources'

const parser = new Parser()
const prisma = new PrismaClient()

interface ParsedArticle {
  title: string
  summary: string
  sourceUrl: string
  sourceName: string
  publishedAt: Date
  category: string
  priority: string
}

export class ContentIngestionService {
  
  async ingestFromRSSFeeds(): Promise<{ articles: number; skipped: number }> {
    console.log('🔄 Starting RSS feed ingestion...')
    
    let totalArticles = 0
    let totalSkipped = 0
    
    for (const source of CONTENT_SOURCES.rssFeeds) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        const feed = await parser.parseURL(source.url)
        
        const relevantItems = feed.items?.filter(item => 
          this.isRelevantContent(item.title || '', item.contentSnippet || '')
        ).slice(0, 5) // Limit to 5 articles per source
        
        if (!relevantItems?.length) {
          console.log(`⚠️  No relevant content from ${source.name}`)
          continue
        }
        
        for (const item of relevantItems) {
          const article = await this.processRSSItem(item, source)
          if (article) {
            await this.saveArticle(article)
            totalArticles++
            console.log(`✅ Added: ${article.title}`)
          } else {
            totalSkipped++
          }
        }
        
      } catch (error) {
        console.error(`❌ Error fetching from ${source.name}:`, error)
      }
    }
    
    console.log(`🎉 Ingestion complete: ${totalArticles} added, ${totalSkipped} skipped`)
    return { articles: totalArticles, skipped: totalSkipped }
  }
  
  private isRelevantContent(title: string, content: string): boolean {
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
  
  private async processRSSItem(item: any, source: any): Promise<ParsedArticle | null> {
    if (!item.title || !item.link) return null
    
    // Check if article already exists
    const existing = await prisma.article.findFirst({
      where: { sourceUrl: item.link }
    })
    if (existing) return null
    
    // Generate AI-powered summary and insights
    const summary = await this.generateSummary(item.title, item.contentSnippet || '')
    const insights = await this.generateInsights(item.title, summary)
    
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
  
  private async generateSummary(title: string, content: string): Promise<string> {
    // For now, use the first 200 characters of content
    // TODO: Integrate with OpenAI API for better summaries
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    return cleanContent.length > 200 
      ? cleanContent.substring(0, 200) + '...'
      : cleanContent
  }
  
  private async generateInsights(title: string, summary: string): Promise<{
    whyItMatters: string
    talkTrack: string
  }> {
    // TODO: Use AI to generate "Why it Matters" and "Talk Track" sections
    // For now, return template-based insights
    
    const isAIContent = title.toLowerCase().includes('ai') || title.toLowerCase().includes('artificial intelligence')
    const isPrivacyContent = title.toLowerCase().includes('privacy') || title.toLowerCase().includes('cookie')
    const isMergerContent = title.toLowerCase().includes('merger') || title.toLowerCase().includes('acquisition')
    
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
  
  private async saveArticle(articleData: ParsedArticle): Promise<void> {
    const insights = await this.generateInsights(articleData.title, articleData.summary)
    
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
  
  async cleanupExpiredContent(): Promise<number> {
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
  
  async getContentStats(): Promise<{
    totalArticles: number
    publishedArticles: number
    expiredArticles: number
    recentArticles: number
  }> {
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