// Direct SQL version of content functions to bypass Prisma issues

import { prisma } from '@/lib/db'

export async function getFilteredContent(
  vertical: string = 'ALL',
  contentType: 'articles' | 'metrics' | 'all' = 'all',
  limit: number = 15
) {
  try {
    console.log(`🔍 Getting ${contentType} for vertical: ${vertical}`)
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    if (contentType === 'articles' || contentType === 'all') {
      const articleWhere: any = {
        status: 'PUBLISHED',
        publishedAt: { gte: oneWeekAgo },
        category: { not: 'METRICS' }
      }

      if (vertical && vertical !== 'ALL') {
        articleWhere.vertical = vertical
      }

      const articles = await prisma.article.findMany({
        where: articleWhere,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: limit
      })

      if (contentType === 'articles') {
        return articles
      }
    }

    if (contentType === 'metrics' || contentType === 'all') {
      const metricWhere: any = {
        status: 'PUBLISHED',
        publishedAt: { gte: oneWeekAgo }
      }

      if (vertical && vertical !== 'ALL') {
        metricWhere.vertical = vertical
      }

      const metrics = await prisma.metric.findMany({
        where: metricWhere,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: Math.floor(limit / 3)
      })

      if (contentType === 'metrics') {
        return metrics
      }
    }

    if (contentType === 'all') {
      const [articles, metrics] = await Promise.all([
        prisma.article.findMany({
          where: {
            status: 'PUBLISHED',
            publishedAt: { gte: oneWeekAgo },
            category: { not: 'METRICS' },
            ...(vertical && vertical !== 'ALL' ? { vertical } : {})
          },
          orderBy: [
            { priority: 'desc' },
            { publishedAt: 'desc' }
          ],
          take: limit
        }),
        prisma.metric.findMany({
          where: {
            status: 'PUBLISHED',
            publishedAt: { gte: oneWeekAgo },
            ...(vertical && vertical !== 'ALL' ? { vertical } : {})
          },
          orderBy: [
            { priority: 'desc' },
            { publishedAt: 'desc' }
          ],
          take: Math.floor(limit / 3)
        })
      ])

      return { articles, metrics }
    }

    return []

  } catch (error) {
    console.error('❌ Error getting filtered content:', error)
    throw error
  }
}

export async function getPublishedArticlesDirect(vertical?: string) {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const where: any = {
      status: 'PUBLISHED',
      publishedAt: { gte: oneWeekAgo },
      category: { not: 'METRICS' }
    }
    
    if (vertical && vertical !== 'ALL') {
      where.vertical = vertical
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 10
    })
    
    return articles

  } catch (error) {
    console.error('Error fetching articles (direct):', error)
    return []
  }
}

export async function getPublishedMetricsDirect() {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const metrics = await prisma.metric.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: oneWeekAgo }
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 10
    })
    
    return metrics

  } catch (error) {
    console.error('Error fetching metrics (direct):', error)
    return []
  }
} 