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

    return NextResponse.json({
      success: true,
      message: 'Comprehensive vertical cleanup completed',
      updated: {
        articles: updatedArticles,
        metrics: updatedMetrics
      },
      verification: {
        allVerticals: allVerticals,
        remainingOldVerticals: remainingOldVerticals,
        isClean: remainingOldVerticals.length === 0
      },
      approvedVerticals: [
        'Consumer & Retail', 'Insurance', 'Telecom', 'Financial Services',
        'Political Candidate & Advocacy', 'Services', 'Education', 
        'Travel & Hospitality', 'Technology & Media', 'Healthcare', 
        'Automotive', 'Other'
      ]
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