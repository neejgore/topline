import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔗 Starting URL fix process...')

    // Map of broken URLs to real external industry sources
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

    let totalUpdated = 0
    const results = []

    for (const [oldUrl, newData] of Object.entries(urlMap)) {
      try {
        const result = await prisma.article.updateMany({
          where: { sourceUrl: oldUrl },
          data: { 
            sourceUrl: newData.url,
            sourceName: newData.source
          }
        })
        
        totalUpdated += result.count
        results.push({
          oldUrl,
          newUrl: newData.url,
          source: newData.source,
          updated: result.count
        })
        
        console.log(`✅ Updated ${result.count} articles from ${oldUrl} to ${newData.url}`)
      } catch (error) {
        console.error(`❌ Failed to update ${oldUrl}:`, error)
        results.push({
          oldUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Verify the fix
    const remainingBrokenUrls = await prisma.article.count({
      where: {
        sourceUrl: {
          contains: 'topline.platform'
        }
      }
    })

    const response = {
      success: true,
      message: `Fixed ${totalUpdated} URLs successfully!`,
      results: {
        totalUpdated,
        remainingBrokenUrls,
        details: results
      },
      isComplete: remainingBrokenUrls === 0
    }

    console.log('🎉 URL fix completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ URL fix failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 