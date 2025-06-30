import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPublishedArticles() {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const articles = await prisma.article.findMany({
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