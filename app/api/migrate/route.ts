import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Starting comprehensive vertical migration...')

    // Map ALL existing verticals to the 13 approved verticals only
    console.log('📰 Updating ALL article verticals to approved list...')
    
    const articleUpdates = await prisma.$executeRawUnsafe(`
      UPDATE articles 
      SET vertical = CASE 
        WHEN vertical IN ('MARTECH', 'ADTECH') THEN 'Technology & Media'
        WHEN vertical IN ('RETAIL', 'ECOMMERCE', 'CPG') THEN 'Consumer & Retail'
        WHEN vertical IN ('REVENUE_OPS', 'CONSULTING') THEN 'Services'
        WHEN vertical IN ('FINTECH', 'BANKING') THEN 'Financial Services'
        WHEN vertical IN ('HEALTHTECH', 'PHARMA', 'MEDICAL') THEN 'Healthcare'
        WHEN vertical IN ('AUTOMOTIVE', 'AUTO') THEN 'Automotive'
        WHEN vertical IN ('EDTECH', 'EDUCATION') THEN 'Education'
        WHEN vertical IN ('TRAVEL', 'HOSPITALITY') THEN 'Travel & Hospitality'
        WHEN vertical IN ('TELECOM', 'WIRELESS') THEN 'Telecom'
        WHEN vertical IN ('INSURANCE', 'INSURER') THEN 'Insurance'
        WHEN vertical IN ('POLITICAL', 'ADVOCACY', 'GOVERNMENT') THEN 'Political Candidate & Advocacy'
        ELSE 'Other'
      END
    `)

    console.log('📊 Updating ALL metric verticals to approved list...')
    
    const metricUpdates = await prisma.$executeRawUnsafe(`
      UPDATE metrics 
      SET vertical = CASE 
        WHEN vertical IN ('MARTECH', 'ADTECH') THEN 'Technology & Media'
        WHEN vertical IN ('RETAIL', 'ECOMMERCE', 'CPG') THEN 'Consumer & Retail'
        WHEN vertical IN ('REVENUE_OPS', 'CONSULTING') THEN 'Services'
        WHEN vertical IN ('FINTECH', 'BANKING') THEN 'Financial Services'
        WHEN vertical IN ('HEALTHTECH', 'PHARMA', 'MEDICAL') THEN 'Healthcare'
        WHEN vertical IN ('AUTOMOTIVE', 'AUTO') THEN 'Automotive'
        WHEN vertical IN ('EDTECH', 'EDUCATION') THEN 'Education'
        WHEN vertical IN ('TRAVEL', 'HOSPITALITY') THEN 'Travel & Hospitality'
        WHEN vertical IN ('TELECOM', 'WIRELESS') THEN 'Telecom'
        WHEN vertical IN ('INSURANCE', 'INSURER') THEN 'Insurance'
        WHEN vertical IN ('POLITICAL', 'ADVOCACY', 'GOVERNMENT') THEN 'Political Candidate & Advocacy'
        ELSE 'Other'
      END
    `)

    // Get current verticals after migration - should only be the 13 approved ones
    const verticals = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT vertical FROM (
        SELECT vertical FROM articles WHERE status = 'PUBLISHED' AND vertical IS NOT NULL
        UNION
        SELECT vertical FROM metrics WHERE status = 'PUBLISHED' AND vertical IS NOT NULL
      ) AS combined_verticals
      ORDER BY vertical
    `) as Array<{ vertical: string }>

    const uniqueVerticals = verticals.map(v => v.vertical).filter(Boolean)

    // Check for any links that might be broken
    const brokenLinks = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM articles 
      WHERE status = 'PUBLISHED' 
      AND (sourceUrl IS NULL OR sourceUrl = '' OR sourceUrl LIKE '%example.com%')
    `) as Array<{ count: number }>

    return NextResponse.json({
      success: true,
      message: 'Comprehensive vertical migration completed successfully',
      details: {
        articlesUpdated: articleUpdates,
        metricsUpdated: metricUpdates,
        currentVerticals: uniqueVerticals,
        brokenLinksFound: brokenLinks[0]?.count || 0,
        approvedVerticals: [
          'Consumer & Retail', 'Insurance', 'Telecom', 'Financial Services',
          'Political Candidate & Advocacy', 'Services', 'Education', 
          'Travel & Hospitality', 'Technology & Media', 'Healthcare', 
          'Automotive', 'Other'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Comprehensive migration failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  const mockRequest = new Request('https://example.com', { method: 'POST' }) as NextRequest
  return POST(mockRequest)
} 