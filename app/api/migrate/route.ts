import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting vertical migration process...')

    // Fix vertical names in production database
    console.log('📰 Updating article verticals...')
    
    // Update MARTECH to Technology & Media
    const martechArticles = await prisma.article.updateMany({
      where: {
        vertical: 'MARTECH'
      },
      data: {
        vertical: 'Technology & Media'
      }
    })

    // Update ADTECH to Technology & Media
    const adtechArticles = await prisma.article.updateMany({
      where: {
        vertical: 'ADTECH'
      },
      data: {
        vertical: 'Technology & Media'
      }
    })

    // Update RETAIL to Consumer & Retail
    const retailArticles = await prisma.article.updateMany({
      where: {
        vertical: 'RETAIL'
      },
      data: {
        vertical: 'Consumer & Retail'
      }
    })

    console.log('📊 Updating metric verticals...')
    
    // Update MARTECH to Technology & Media for metrics
    const martechMetrics = await prisma.metric.updateMany({
      where: {
        vertical: 'MARTECH'
      },
      data: {
        vertical: 'Technology & Media'
      }
    })

    // Update ADTECH to Technology & Media for metrics
    const adtechMetrics = await prisma.metric.updateMany({
      where: {
        vertical: 'ADTECH'
      },
      data: {
        vertical: 'Technology & Media'
      }
    })

    // Update RETAIL to Consumer & Retail for metrics
    const retailMetrics = await prisma.metric.updateMany({
      where: {
        vertical: 'RETAIL'
      },
      data: {
        vertical: 'Consumer & Retail'
      }
    })

    // Update REVENUE_OPS to Services for metrics
    const revenueOpsMetrics = await prisma.metric.updateMany({
      where: {
        vertical: 'REVENUE_OPS'
      },
      data: {
        vertical: 'Services'
      }
    })

    // Get current verticals after migration
    const [currentArticleVerticals, currentMetricVerticals] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: { vertical: true },
        distinct: ['vertical']
      }),
      prisma.metric.findMany({
        where: { status: 'PUBLISHED' },
        select: { vertical: true },
        distinct: ['vertical']
      })
    ])

         const uniqueVerticals = Array.from(new Set([
       ...currentArticleVerticals.map(a => a.vertical),
       ...currentMetricVerticals.map(m => m.vertical)
     ])).filter(Boolean).sort()

    return NextResponse.json({
      success: true,
      message: 'Vertical migration completed successfully',
      details: {
        articlesUpdated: {
          martech: martechArticles.count,
          adtech: adtechArticles.count,
          retail: retailArticles.count
        },
        metricsUpdated: {
          martech: martechMetrics.count,
          adtech: adtechMetrics.count,
          retail: retailMetrics.count,
          revenueOps: revenueOpsMetrics.count
        },
        currentVerticals: uniqueVerticals
      }
    })

  } catch (error) {
    console.error('❌ Vertical migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  // Allow GET for easy testing
  const mockRequest = new Request('https://example.com', { method: 'POST' }) as NextRequest
  return POST(mockRequest)
} 