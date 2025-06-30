import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting migration process...')

    const now = new Date()
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 3) // 3 days ago to ensure it's within the week

    // Update articles to have current week dates
    console.log('📰 Updating article publication dates...')
    const articleUpdates = await prisma.article.updateMany({
      where: {
        status: 'PUBLISHED'
      },
      data: {
        publishedAt: thisWeek,
        updatedAt: now
      }
    })

    // Update metrics to have current week dates
    console.log('📊 Updating metric publication dates...')
    const metricUpdates = await prisma.metric.updateMany({
      where: {
        status: 'PUBLISHED'
      },
      data: {
        publishedAt: thisWeek,
        updatedAt: now
      }
    })

    // Get updated content counts
    const [articles, metrics] = await Promise.all([
      prisma.article.findMany({
        where: { 
          status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: { id: true, title: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' }
      }),
      prisma.metric.findMany({
        where: { 
          status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: { id: true, title: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      details: {
        articlesUpdated: articleUpdates.count,
        metricsUpdated: metricUpdates.count,
        currentlyVisible: {
          articles: articles.length,
          metrics: metrics.length
        },
        updatedContent: {
          articles: articles.map(a => ({ title: a.title, publishedAt: a.publishedAt })),
          metrics: metrics.map(m => ({ title: m.title, publishedAt: m.publishedAt }))
        }
      }
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  // Allow GET for easy testing - create a mock request
  const mockRequest = new Request('https://example.com', { method: 'POST' }) as NextRequest
  return POST(mockRequest)
} 