import Parser from 'rss-parser'
import { prisma } from '@/lib/db'
import { CONTENT_SOURCES } from './content-sources'
import { duplicatePreventionService } from './duplicate-prevention'
import { contentAnalysisService } from './content-analysis'

const parser = new Parser()

interface DiverseArticle {
  title: string
  summary: string
  sourceUrl: string
  sourceName: string
  publishedAt: Date
  vertical: string
  priority: string
  whyItMatters: string
  talkTrack: string
  zetaRelevanceScore: number
}

export class DiverseContentIngestionService {
  
  /**
   * Ingests up to 50 articles from diverse verticals
   */
  async ingestDiverseContent(): Promise<{ articles: number; verticals: string[] }> {
    console.log('🌍 Starting diverse content ingestion across all verticals...')
    
    const startTime = Date.now()
    
    // Clear existing content
    await prisma.article.deleteMany({})
    console.log('🧹 Cleared existing content')
    
    // Group sources by vertical for balanced intake
    const sourcesByVertical = this.groupSourcesByVertical()
    
    // Target articles per vertical (balanced distribution)
    const articlesPerVertical = Math.floor(50 / Object.keys(sourcesByVertical).length)
    const extraArticles = 50 % Object.keys(sourcesByVertical).length
    
    const allArticles: DiverseArticle[] = []
    const processedVerticals: string[] = []
    
    for (const [vertical, sources] of Object.entries(sourcesByVertical)) {
      try {
        console.log(`📰 Processing ${vertical} vertical (${sources.length} sources)...`)
        
        // Calculate target for this vertical
        const targetForVertical = articlesPerVertical + 
          (processedVerticals.length < extraArticles ? 1 : 0)
        
        const verticalArticles = await this.processVerticalSources(
          sources, 
          vertical, 
          targetForVertical
        )
        
        allArticles.push(...verticalArticles)
        processedVerticals.push(vertical)
        
        console.log(`✅ ${vertical}: Added ${verticalArticles.length} articles`)
        
      } catch (error) {
        console.error(`❌ Error processing ${vertical}:`, error)
      }
    }
    
    // Sort articles by Zeta relevance score for storage order
    allArticles.sort((a, b) => b.zetaRelevanceScore - a.zetaRelevanceScore)
    
    // Save all articles to database
    let savedCount = 0
    for (const article of allArticles) {
      try {
        const result = await duplicatePreventionService.createArticleSafely({
          title: article.title,
          summary: article.summary,
          sourceUrl: article.sourceUrl,
          sourceName: article.sourceName,
          publishedAt: article.publishedAt,
          vertical: article.vertical,
          priority: article.priority,
          whyItMatters: article.whyItMatters,
          talkTrack: article.talkTrack,
          importanceScore: article.zetaRelevanceScore
        })
        
        if (result.success) {
          savedCount++
        }
      } catch (error) {
        console.error('Error saving article:', error)
      }
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log(`🎉 Diverse ingestion complete: ${savedCount} articles across ${processedVerticals.length} verticals in ${duration}s`)
    
    return {
      articles: savedCount,
      verticals: processedVerticals
    }
  }
  
  /**
   * Groups RSS sources by vertical for balanced processing
   */
  private groupSourcesByVertical(): Record<string, any[]> {
    const grouped: Record<string, any[]> = {}
    
    for (const source of CONTENT_SOURCES.rssFeeds) {
      const vertical = source.category
      if (!grouped[vertical]) {
        grouped[vertical] = []
      }
      grouped[vertical].push({
        ...source,
        vertical: this.normalizeVertical(vertical)
      })
    }
    
    return grouped
  }
  
  /**
   * Normalizes vertical names to match UI expectations
   */
  private normalizeVertical(category: string): string {
    const mapping: Record<string, string> = {
      'Technology & Media': 'Technology & Media',
      'Consumer & Retail': 'Consumer & Retail',
      'Financial Services': 'Financial Services',
      'Healthcare': 'Healthcare',
      'Insurance': 'Insurance',
      'Education': 'Education',
      'Travel & Hospitality': 'Travel & Hospitality',
      'Automotive': 'Automotive',
      'Telecom': 'Telecom',
      'Services': 'Services'
    }
    
    return mapping[category] || 'Other'
  }
  
  /**
   * Processes sources for a specific vertical
   */
  private async processVerticalSources(
    sources: any[], 
    vertical: string, 
    targetCount: number
  ): Promise<DiverseArticle[]> {
    const articles: DiverseArticle[] = []
    const articlesPerSource = Math.ceil(targetCount / sources.length)
    
    for (const source of sources) {
      try {
        console.log(`  📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.url)
        const items = feed.items?.slice(0, articlesPerSource) || []
        
        for (const item of items) {
          if (!item.title || !item.link || item.title.length < 10) continue
          
          const title = item.title.trim()
          const summary = (item.contentSnippet || '').trim().slice(0, 400)
          
          // Generate content analysis
          const insights = await contentAnalysisService.generateInsights({
            title,
            summary: summary || `Latest from ${source.name}: ${title}`,
            sourceName: source.name
          })
          
          // Calculate Zeta Global relevance score
          const zetaScore = this.calculateZetaRelevanceScore(title, summary, insights.keyTopics)
          
          const article: DiverseArticle = {
            title,
            summary: summary || `Latest from ${source.name}: ${title}`,
            sourceUrl: item.link,
            sourceName: source.name,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            vertical: source.vertical,
            priority: insights.urgencyLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
            whyItMatters: insights.whyItMatters,
            talkTrack: insights.talkTrack,
            zetaRelevanceScore: zetaScore
          }
          
          articles.push(article)
          
          if (articles.length >= targetCount) break
        }
        
        if (articles.length >= targetCount) break
        
      } catch (error) {
        console.error(`  ❌ Error with ${source.name}:`, error)
      }
    }
    
    return articles
  }
  
  /**
   * Calculates relevance score for Zeta Global business focus
   */
  private calculateZetaRelevanceScore(title: string, summary: string, topics: string[]): number {
    const content = `${title} ${summary}`.toLowerCase()
    const { zetaGlobalRelevance } = CONTENT_SOURCES
    
    let score = 0
    
    // Primary focus areas (highest weight)
    for (const keyword of zetaGlobalRelevance.primaryFocus) {
      if (content.includes(keyword.toLowerCase())) {
        score += 10
      }
    }
    
    // Secondary focus areas (medium weight)
    for (const keyword of zetaGlobalRelevance.secondaryFocus) {
      if (content.includes(keyword.toLowerCase())) {
        score += 5
      }
    }
    
    // Industry relevance (lower weight)
    for (const industry of zetaGlobalRelevance.industries) {
      if (content.includes(industry.toLowerCase())) {
        score += 3
      }
    }
    
    // Topic bonus from content analysis
    const relevantTopics = ['AI & Automation', 'Data & Analytics', 'Retail Media', 'Performance & ROI']
    for (const topic of topics) {
      if (relevantTopics.includes(topic)) {
        score += 7
      }
    }
    
    // Recency bonus (articles from last 3 days get boost)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const publishDate = new Date()
    if (publishDate > threeDaysAgo) {
      score += 2
    }
    
    return Math.min(score, 100) // Cap at 100
  }
  
  /**
   * Get articles for "ALL" page (top 12 most relevant for Zeta Global)
   */
  async getZetaRelevantArticles(limit: number = 12) {
    return await prisma.article.findMany({
      orderBy: [
        { publishedAt: 'desc' }
      ],
      take: limit,
      where: {
        status: 'PUBLISHED'
      }
    })
  }
  
  /**
   * Get articles filtered by specific vertical
   */
  async getVerticalArticles(vertical: string, limit: number = 12) {
    if (vertical === 'All') {
      return this.getZetaRelevantArticles(limit)
    }
    
    return await prisma.article.findMany({
      where: {
        vertical: vertical,
        status: 'PUBLISHED'
      },
      orderBy: [
        { publishedAt: 'desc' }
      ],
      take: limit
    })
  }
}

export const diverseContentIngestionService = new DiverseContentIngestionService() 