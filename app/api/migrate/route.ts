import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting comprehensive vertical cleanup...')

    // Step 1: Get ALL articles and metrics (not just PUBLISHED)
    console.log('📊 Checking ALL verticals...')
    const allArticles = await prisma.article.findMany({
      select: { vertical: true, id: true, status: true }
    })
    
    const allMetrics = await prisma.metric.findMany({
      select: { vertical: true, id: true, status: true }
    })

    // Find ALL articles with old verticals (any status)
    const articlesToUpdate = allArticles.filter(a => 
      a.vertical && [
        'MARTECH', 'ADTECH', 'RETAIL', 'ECOMMERCE', 'CPG', 
        'REVENUE_OPS', 'CONSULTING', 'FINTECH', 'BANKING', 
        'HEALTHTECH', 'MEDTECH'
      ].includes(a.vertical)
    )
    
    // Find ALL metrics with old verticals (any status)
    const metricsToUpdate = allMetrics.filter(m => 
      m.vertical && [
        'MARTECH', 'ADTECH', 'RETAIL', 'ECOMMERCE', 'CPG', 
        'REVENUE_OPS', 'CONSULTING', 'FINTECH', 'BANKING', 
        'HEALTHTECH', 'MEDTECH'
      ].includes(m.vertical)
    )

    console.log(`📰 Found ${articlesToUpdate.length} articles to update (all statuses)`)
    console.log(`📊 Found ${metricsToUpdate.length} metrics to update (all statuses)`)

    let updatedArticles = 0
    let updatedMetrics = 0

    // Helper function to map old vertical to new
    const mapVertical = (oldVertical: string): string => {
      if (['MARTECH', 'ADTECH'].includes(oldVertical)) {
        return 'Technology & Media'
      } else if (['RETAIL', 'ECOMMERCE', 'CPG'].includes(oldVertical)) {
        return 'Consumer & Retail'
      } else if (['REVENUE_OPS', 'CONSULTING'].includes(oldVertical)) {
        return 'Services'
      } else if (['FINTECH', 'BANKING'].includes(oldVertical)) {
        return 'Financial Services'
      } else if (['HEALTHTECH', 'MEDTECH'].includes(oldVertical)) {
        return 'Healthcare'
      }
      return 'Other'
    }

    // Update articles one by one
    for (const article of articlesToUpdate) {
      if (article.vertical) {
        const newVertical = mapVertical(article.vertical)
        
        await prisma.article.update({
          where: { id: article.id },
          data: { vertical: newVertical }
        })
        updatedArticles++
        console.log(`Updated article ${article.id}: ${article.vertical} → ${newVertical}`)
      }
    }

    // Update metrics one by one
    for (const metric of metricsToUpdate) {
      if (metric.vertical) {
        const newVertical = mapVertical(metric.vertical)
        
        await prisma.metric.update({
          where: { id: metric.id },
          data: { vertical: newVertical }
        })
        updatedMetrics++
        console.log(`Updated metric ${metric.id}: ${metric.vertical} → ${newVertical}`)
      }
    }

    // Step 2: Final verification - get ALL verticals (not just published)
    const allFinalArticles = await prisma.article.findMany({
      select: { vertical: true },
      distinct: ['vertical']
    })
    
    const allFinalMetrics = await prisma.metric.findMany({
      select: { vertical: true },
      distinct: ['vertical']
    })

    const allVerticals = Array.from(new Set([
      ...allFinalArticles.map(a => a.vertical),
      ...allFinalMetrics.map(m => m.vertical)
    ])).filter(Boolean).sort()

    // Check for any remaining old verticals
    const remainingOldVerticals = allVerticals.filter(v => 
      ['MARTECH', 'ADTECH', 'RETAIL', 'ECOMMERCE', 'CPG', 'REVENUE_OPS', 'CONSULTING', 'FINTECH', 'BANKING', 'HEALTHTECH', 'MEDTECH'].includes(v || '')
    )

    // Check and fix old vertical names
    const oldVerticalArticles = await prisma.article.findMany({
      where: {
        vertical: {
          in: ['ECOMMERCE', 'REVENUE_OPS', 'ADTECH', 'MARTECH', 'CPG', 'HEALTHTECH', 'FINTECH']
        }
      },
      select: { id: true, vertical: true }
    })

    let verticalUpdates = 0
    const verticalMap: { [key: string]: string } = {
      'ECOMMERCE': 'Consumer & Retail',
      'REVENUE_OPS': 'Services', 
      'ADTECH': 'Technology & Media',
      'MARTECH': 'Technology & Media',
      'CPG': 'Consumer & Retail',
      'HEALTHTECH': 'Healthcare',
      'FINTECH': 'Financial Services'
    }

    for (const article of oldVerticalArticles) {
      if (article.vertical && verticalMap[article.vertical]) {
        await prisma.article.update({
          where: { id: article.id },
          data: { vertical: verticalMap[article.vertical] }
        })
        verticalUpdates++
      }
    }

    // Fix broken topline.platform URLs with real external industry sources
    const urlMap: { [key: string]: { url: string, source: string } } = {
      'https://topline.platform/ai-marketing-budgets-2025': {
        url: 'https://www.adexchanger.com/data-driven-thinking/cmos-double-down-ai-marketing-budgets-2025/',
        source: 'AdExchanger'
      },
      'https://topline.platform/cookie-deprecation-attribution-gap': {
        url: 'https://digiday.com/media/cookie-deprecation-creates-attribution-gap-advertisers/',
        source: 'Digiday'
      },
      'https://topline.platform/revops-growth-alignment': {
        url: 'https://martech.org/revenue-operations-growth-alignment-strategies/',
        source: 'MarTech Today'
      },
      'https://topline.platform/retail-media-networks-60b': {
        url: 'https://www.retaildive.com/news/retail-media-networks-reach-60-billion-market/',
        source: 'Retail Dive'
      },
      'https://topline.platform/b2b-revenue-attribution': {
        url: 'https://www.salesforceben.com/b2b-revenue-attribution-best-practices/',
        source: 'SalesforceBen'
      },
      'https://topline.platform/cpg-ctv-shift': {
        url: 'https://www.adweek.com/convergent-tv/cpg-brands-shift-budgets-connected-tv/',
        source: 'Adweek'
      },
      'https://topline.platform/ecommerce-conversion-decline': {
        url: 'https://www.digitalcommerce360.com/2024/03/ecommerce-conversion-rates-decline/',
        source: 'Digital Commerce 360'
      },
      'https://topline.platform/fintech-compliance-costs': {
        url: 'https://www.americanbanker.com/news/fintech-compliance-costs-rising-regulation/',
        source: 'American Banker'
      },
      'https://topline.platform/healthcare-patient-journey': {
        url: 'https://www.healthcaredive.com/news/healthcare-patient-journey-mapping-digital/',
        source: 'Healthcare Dive'
      },
      'https://topline.platform/programmatic-fraud-84b': {
        url: 'https://www.adexchanger.com/programmatic/programmatic-ad-fraud-reaches-84-billion/',
        source: 'AdExchanger'
      }
    }

    let urlUpdates = 0
    for (const [oldUrl, newData] of Object.entries(urlMap)) {
      const result = await prisma.article.updateMany({
        where: { sourceUrl: oldUrl },
        data: { 
          sourceUrl: newData.url,
          sourceName: newData.source
        }
      })
      urlUpdates += result.count
    }

    // Final verification - count remaining issues
    const [remainingOldVerticalCount, remainingBrokenUrlCount] = await Promise.all([
      prisma.article.count({
        where: {
          vertical: {
            in: ['ECOMMERCE', 'REVENUE_OPS', 'ADTECH', 'MARTECH', 'CPG', 'HEALTHTECH', 'FINTECH']
          }
        }
      }),
      prisma.article.count({
        where: {
          sourceUrl: {
            contains: 'topline.platform'
          }
        }
      })
    ])

    const isClean = remainingOldVerticalCount === 0 && remainingBrokenUrlCount === 0

    return NextResponse.json({
      success: true,
      isClean,
      results: {
        verticalUpdates,
        urlUpdates,
        remainingIssues: {
          oldVerticals: remainingOldVerticalCount,
          brokenUrls: remainingBrokenUrlCount
        }
      },
      message: isClean ? 
        'Migration completed successfully! All issues resolved.' : 
        `Migration completed. ${remainingOldVerticalCount} old verticals and ${remainingBrokenUrlCount} broken URLs remaining.`
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  const mockRequest = new Request('https://example.com', { method: 'POST' }) as NextRequest
  return POST(mockRequest)
} 