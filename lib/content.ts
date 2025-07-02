import { prisma } from '@/lib/db'
import { diverseContentIngestionService } from './diverse-content-ingestion'

export async function getPublishedArticles() {
  try {
    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: last24Hours,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 12, // Limit to top 12 for daily view
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export async function getPublishedMetrics() {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const metrics = await prisma.metric.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: oneWeekAgo,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 10, // Limit to top 10 as per spec
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return metrics
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return []
  }
}

export async function getArchivedContent() {
  try {
    const [articles, metrics] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.metric.findMany({
        where: {
          status: 'PUBLISHED',
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      })
    ])

    return { articles, metrics }
  } catch (error) {
    console.error('Error fetching archived content:', error)
    return { articles: [], metrics: [] }
  }
}

export async function searchContent(query: string) {
  try {
    // Handle case-insensitive search for both SQLite and PostgreSQL
    const searchQuery = query.toLowerCase()
    
    const [articles, metrics] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: searchQuery } },
            { summary: { contains: searchQuery } },
            { whyItMatters: { contains: searchQuery } },
            { talkTrack: { contains: searchQuery } }
          ]
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.metric.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: searchQuery } },
            { description: { contains: searchQuery } },
            { howToUse: { contains: searchQuery } },
            { talkTrack: { contains: searchQuery } }
          ]
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      })
    ])

    return { articles, metrics }
  } catch (error) {
    console.error('Error searching content:', error)
    return { articles: [], metrics: [] }
  }
}

/**
 * Get articles for specific vertical or ALL page (Zeta Global relevant)
 * This replaces the old getPublishedArticles for the new vertical system
 */
export async function getArticlesByVertical(vertical: string = 'All', limit: number = 12) {
  try {
    console.log(`🎯 Getting articles for vertical: ${vertical}`)
    
    // Use the new diverse content service for vertical filtering
    const articles = await diverseContentIngestionService.getVerticalArticles(vertical, limit)
    
    console.log(`✅ Found ${articles.length} articles for ${vertical} vertical`)
    return articles
    
  } catch (error) {
    console.error(`Error fetching articles for vertical ${vertical}:`, error)
    return []
  }
}

/**
 * Get available verticals from the current article corpus
 */
export async function getAvailableVerticals() {
  try {
    const verticals = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        vertical: {
          not: null
        }
      },
      select: {
        vertical: true
      },
      distinct: ['vertical']
    })

    // Extract unique vertical names and add "All" option
    const uniqueVerticals = ['All', ...verticals.map(v => v.vertical).filter(Boolean)]
    
    console.log(`📊 Available verticals: ${uniqueVerticals.join(', ')}`)
    return uniqueVerticals
    
  } catch (error) {
    console.error('Error fetching available verticals:', error)
    return ['All', 'Technology & Media'] // Fallback
  }
}

/**
 * Get content statistics by vertical
 */
export async function getVerticalStats() {
  try {
    const stats = await prisma.article.groupBy({
      by: ['vertical'],
      where: {
        status: 'PUBLISHED',
        vertical: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    const totalArticles = await prisma.article.count({
      where: { status: 'PUBLISHED' }
    })

    return {
      totalArticles,
      verticalBreakdown: stats.map(stat => ({
        vertical: stat.vertical,
        count: stat._count.id
      }))
    }
    
  } catch (error) {
    console.error('Error fetching vertical stats:', error)
    return {
      totalArticles: 0,
      verticalBreakdown: []
    }
  }
} 