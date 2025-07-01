import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingId?: string
  reason?: string
}

export interface ArticleData {
  title: string
  sourceUrl?: string
  sourceName?: string
  summary?: string
  publishedAt?: Date
}

export interface MetricData {
  title: string
  source?: string
  sourceUrl?: string
  value?: string
  unit?: string
}

export class DuplicatePreventionService {
  
  /**
   * Comprehensive article duplicate checking with multiple strategies
   */
  async checkArticleDuplicate(articleData: ArticleData): Promise<DuplicateCheckResult> {
    try {
      // Strategy 1: Exact URL match (most reliable)
      if (articleData.sourceUrl) {
        const urlMatch = await prisma.article.findFirst({
          where: { sourceUrl: articleData.sourceUrl },
          select: { id: true }
        })
        
        if (urlMatch) {
          return {
            isDuplicate: true,
            existingId: urlMatch.id,
            reason: 'Exact URL match'
          }
        }
      }

      // Strategy 2: Title + Source combination
      if (articleData.title && articleData.sourceName) {
        const titleSourceMatch = await prisma.article.findFirst({
          where: {
            title: articleData.title,
            sourceName: articleData.sourceName
          },
          select: { id: true }
        })
        
        if (titleSourceMatch) {
          return {
            isDuplicate: true,
            existingId: titleSourceMatch.id,
            reason: 'Title + Source match'
          }
        }
      }

      // Strategy 3: Similar title match (fuzzy matching)
      const similarTitleMatch = await this.findSimilarTitle(articleData.title, articleData.sourceName)
      if (similarTitleMatch) {
        return {
          isDuplicate: true,
          existingId: similarTitleMatch.id,
          reason: 'Similar title match'
        }
      }

      // Strategy 4: Content-based similarity (if summary available)
      if (articleData.summary && articleData.summary.length > 50) {
        const contentMatch = await this.findSimilarContent(articleData.summary, articleData.sourceName)
        if (contentMatch) {
          return {
            isDuplicate: true,
            existingId: contentMatch.id,
            reason: 'Similar content match'
          }
        }
      }

      return { isDuplicate: false }
      
    } catch (error) {
      console.error('Error checking article duplicate:', error)
      // If error occurs, err on the side of allowing (false negative better than false positive)
      return { isDuplicate: false }
    }
  }

  /**
   * Comprehensive metric duplicate checking
   */
  async checkMetricDuplicate(metricData: MetricData): Promise<DuplicateCheckResult> {
    try {
      // Strategy 1: Exact URL match
      if (metricData.sourceUrl) {
        const urlMatch = await prisma.metric.findFirst({
          where: { sourceUrl: metricData.sourceUrl },
          select: { id: true }
        })
        
        if (urlMatch) {
          return {
            isDuplicate: true,
            existingId: urlMatch.id,
            reason: 'Exact URL match'
          }
        }
      }

      // Strategy 2: Title + Source combination
      if (metricData.title && metricData.source) {
        const titleSourceMatch = await prisma.metric.findFirst({
          where: {
            title: metricData.title,
            source: metricData.source
          },
          select: { id: true }
        })
        
        if (titleSourceMatch) {
          return {
            isDuplicate: true,
            existingId: titleSourceMatch.id,
            reason: 'Title + Source match'
          }
        }
      }

      // Strategy 3: Title similarity within same time window
      const similarMetric = await this.findSimilarMetric(metricData.title, metricData.source)
      if (similarMetric) {
        return {
          isDuplicate: true,
          existingId: similarMetric.id,
          reason: 'Similar metric match'
        }
      }

      return { isDuplicate: false }
      
    } catch (error) {
      console.error('Error checking metric duplicate:', error)
      return { isDuplicate: false }
    }
  }

  /**
   * Safe article creation with duplicate handling
   */
  async createArticleSafely(articleData: any): Promise<{ success: boolean; id?: string; reason?: string }> {
    try {
      const duplicateCheck = await this.checkArticleDuplicate(articleData)
      
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          id: duplicateCheck.existingId,
          reason: `Duplicate article: ${duplicateCheck.reason}`
        }
      }

      const article = await prisma.article.create({
        data: {
          ...articleData,
          status: 'PUBLISHED'
        }
      })

      return {
        success: true,
        id: article.id,
        reason: 'Article created successfully'
      }
      
    } catch (error) {
      // Handle Prisma unique constraint violations gracefully
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            success: false,
            reason: `Duplicate article: ${error.meta?.target || 'unknown constraint'}`
          }
        }
      }
      
      console.error('Error creating article:', error)
      return {
        success: false,
        reason: 'Database error creating article'
      }
    }
  }

  /**
   * Safe metric creation with duplicate handling
   */
  async createMetricSafely(metricData: any): Promise<{ success: boolean; id?: string; reason?: string }> {
    try {
      const duplicateCheck = await this.checkMetricDuplicate(metricData)
      
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          id: duplicateCheck.existingId,
          reason: `Duplicate metric: ${duplicateCheck.reason}`
        }
      }

      const metric = await prisma.metric.create({
        data: {
          ...metricData,
          status: 'PUBLISHED'
        }
      })

      return {
        success: true,
        id: metric.id,
        reason: 'Metric created successfully'
      }
      
    } catch (error) {
      // Handle Prisma unique constraint violations gracefully
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            success: false,
            reason: `Duplicate metric: ${error.meta?.target || 'unknown constraint'}`
          }
        }
      }
      
      console.error('Error creating metric:', error)
      return {
        success: false,
        reason: 'Database error creating metric'
      }
    }
  }

  /**
   * Find similar article titles using fuzzy matching
   */
  private async findSimilarTitle(title: string, sourceName?: string): Promise<{ id: string } | null> {
    if (!title || title.length < 20) return null

    // Get articles from the same source in the last 7 days
    const candidates = await prisma.article.findMany({
      where: {
        sourceName: sourceName || undefined,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: { id: true, title: true }
    })

    // Simple similarity check - look for titles that are 80%+ similar
    const normalizedTitle = this.normalizeTitle(title)
    
    for (const candidate of candidates) {
      const candidateTitle = this.normalizeTitle(candidate.title)
      const similarity = this.calculateStringSimilarity(normalizedTitle, candidateTitle)
      
      if (similarity > 0.8) {
        return { id: candidate.id }
      }
    }

    return null
  }

  /**
   * Find similar content using basic text matching
   */
  private async findSimilarContent(summary: string, sourceName?: string): Promise<{ id: string } | null> {
    if (!summary || summary.length < 50) return null

    // Get articles from the same source in the last 3 days
    const candidates = await prisma.article.findMany({
      where: {
        sourceName: sourceName || undefined,
        createdAt: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Last 3 days
        },
        summary: {
          not: null
        }
      },
      select: { id: true, summary: true }
    })

    const normalizedSummary = this.normalizeContent(summary)
    
    for (const candidate of candidates) {
      if (!candidate.summary) continue
      
      const candidateSummary = this.normalizeContent(candidate.summary)
      const similarity = this.calculateStringSimilarity(normalizedSummary, candidateSummary)
      
      if (similarity > 0.7) {
        return { id: candidate.id }
      }
    }

    return null
  }

  /**
   * Find similar metrics
   */
  private async findSimilarMetric(title: string, source?: string): Promise<{ id: string } | null> {
    if (!title || title.length < 10) return null

    // Get metrics from the last 30 days
    const candidates = await prisma.metric.findMany({
      where: {
        source: source || undefined,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: { id: true, title: true }
    })

    const normalizedTitle = this.normalizeTitle(title)
    
    for (const candidate of candidates) {
      const candidateTitle = this.normalizeTitle(candidate.title)
      const similarity = this.calculateStringSimilarity(normalizedTitle, candidateTitle)
      
      if (similarity > 0.85) {
        return { id: candidate.id }
      }
    }

    return null
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Normalize content for comparison
   */
  private normalizeContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200) // First 200 chars for comparison
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    
    if (len1 === 0) return len2 === 0 ? 1 : 0
    if (len2 === 0) return 0
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null))
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i
    for (let j = 0; j <= len2; j++) matrix[0][j] = j
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }
    
    const maxLen = Math.max(len1, len2)
    return (maxLen - matrix[len1][len2]) / maxLen
  }

  /**
   * Clean up old duplicate entries (maintenance function)
   */
  async cleanupDuplicates(): Promise<{ articlesRemoved: number; metricsRemoved: number }> {
    console.log('🧹 Starting duplicate cleanup...')
    
    let articlesRemoved = 0
    let metricsRemoved = 0

    try {
      // Find and remove duplicate articles (keep the oldest one)
      const duplicateArticles = await prisma.$queryRaw`
        SELECT id, title, sourceName, MIN(createdAt) as firstCreated
        FROM articles 
        GROUP BY title, sourceName 
        HAVING COUNT(*) > 1
      ` as Array<{ id: string; title: string; sourceName: string; firstCreated: Date }>

      for (const group of duplicateArticles) {
        const duplicates = await prisma.article.findMany({
          where: {
            title: group.title,
            sourceName: group.sourceName
          },
          orderBy: { createdAt: 'asc' }
        })

        // Keep the first one, delete the rest
        const toDelete = duplicates.slice(1)
        for (const article of toDelete) {
          await prisma.article.delete({ where: { id: article.id } })
          articlesRemoved++
        }
      }

      // Similar cleanup for metrics
      const duplicateMetrics = await prisma.$queryRaw`
        SELECT id, title, source, MIN(createdAt) as firstCreated
        FROM metrics 
        GROUP BY title, source 
        HAVING COUNT(*) > 1
      ` as Array<{ id: string; title: string; source: string; firstCreated: Date }>

      for (const group of duplicateMetrics) {
        const duplicates = await prisma.metric.findMany({
          where: {
            title: group.title,
            source: group.source
          },
          orderBy: { createdAt: 'asc' }
        })

        // Keep the first one, delete the rest
        const toDelete = duplicates.slice(1)
        for (const metric of toDelete) {
          await prisma.metric.delete({ where: { id: metric.id } })
          metricsRemoved++
        }
      }

      console.log(`✅ Cleanup complete: ${articlesRemoved} articles, ${metricsRemoved} metrics removed`)
      
    } catch (error) {
      console.error('Error during duplicate cleanup:', error)
    }

    return { articlesRemoved, metricsRemoved }
  }
}

export const duplicatePreventionService = new DuplicatePreventionService() 