import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting simplified vertical cleanup...')

    // Get current state first
    console.log('📊 Checking current verticals...')
    const currentArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { vertical: true, id: true }
    })
    
    const currentMetrics = await prisma.metric.findMany({
      where: { status: 'PUBLISHED' },
      select: { vertical: true, id: true }
    })

    // Count what needs to be updated
    const articlesToUpdate = currentArticles.filter(a => 
      a.vertical && ['MARTECH', 'ADTECH', 'RETAIL', 'ECOMMERCE', 'CPG', 'REVENUE_OPS', 'CONSULTING', 'FINTECH', 'BANKING', 'HEALTHTECH', 'MEDTECH'].includes(a.vertical)
    )
    
    const metricsToUpdate = currentMetrics.filter(m => 
      m.vertical && ['MARTECH', 'ADTECH', 'RETAIL', 'ECOMMERCE', 'CPG', 'REVENUE_OPS', 'CONSULTING', 'FINTECH', 'BANKING', 'HEALTHTECH', 'MEDTECH'].includes(m.vertical)
    )

    console.log(`📰 Found ${articlesToUpdate.length} articles to update`)
    console.log(`📊 Found ${metricsToUpdate.length} metrics to update`)

    let updatedArticles = 0
    let updatedMetrics = 0

    // Update articles one by one to avoid prepared statement conflicts
    for (const article of articlesToUpdate) {
      let newVertical = 'Other'
      
      if (article.vertical && ['MARTECH', 'ADTECH'].includes(article.vertical)) {
        newVertical = 'Technology & Media'
      } else if (article.vertical && ['RETAIL', 'ECOMMERCE', 'CPG'].includes(article.vertical)) {
        newVertical = 'Consumer & Retail'
      } else if (article.vertical && ['REVENUE_OPS', 'CONSULTING'].includes(article.vertical)) {
        newVertical = 'Services'
      } else if (article.vertical && ['FINTECH', 'BANKING'].includes(article.vertical)) {
        newVertical = 'Financial Services'
      } else if (article.vertical && ['HEALTHTECH', 'MEDTECH'].includes(article.vertical)) {
        newVertical = 'Healthcare'
      }

      await prisma.article.update({
        where: { id: article.id },
        data: { vertical: newVertical }
      })
      updatedArticles++
    }

    // Update metrics one by one
    for (const metric of metricsToUpdate) {
      let newVertical = 'Other'
      
      if (metric.vertical && ['MARTECH', 'ADTECH'].includes(metric.vertical)) {
        newVertical = 'Technology & Media'
      } else if (metric.vertical && ['RETAIL', 'ECOMMERCE', 'CPG'].includes(metric.vertical)) {
        newVertical = 'Consumer & Retail'
      } else if (metric.vertical && ['REVENUE_OPS', 'CONSULTING'].includes(metric.vertical)) {
        newVertical = 'Services'
      } else if (metric.vertical && ['FINTECH', 'BANKING'].includes(metric.vertical)) {
        newVertical = 'Financial Services'
      } else if (metric.vertical && ['HEALTHTECH', 'MEDTECH'].includes(metric.vertical)) {
        newVertical = 'Healthcare'
      }

      await prisma.metric.update({
        where: { id: metric.id },
        data: { vertical: newVertical }
      })
      updatedMetrics++
    }

    // Get final state
    const finalArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { vertical: true },
      distinct: ['vertical']
    })
    
    const finalMetrics = await prisma.metric.findMany({
      where: { status: 'PUBLISHED' },
      select: { vertical: true },
      distinct: ['vertical']
    })

    const finalVerticals = Array.from(new Set([
      ...finalArticles.map(a => a.vertical),
      ...finalMetrics.map(m => m.vertical)
    ])).filter(Boolean).sort()

    return NextResponse.json({
      success: true,
      message: 'Vertical cleanup completed with individual updates',
      updated: {
        articles: updatedArticles,
        metrics: updatedMetrics
      },
      currentVerticals: finalVerticals,
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