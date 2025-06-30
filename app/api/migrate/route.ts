import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Starting vertical migration process...')

    // Use raw SQL to avoid prepared statement conflicts
    console.log('📰 Updating article verticals...')
    
    const articleUpdates = await prisma.$executeRawUnsafe(`
      UPDATE articles 
      SET vertical = CASE 
        WHEN vertical = 'MARTECH' THEN 'Technology & Media'
        WHEN vertical = 'ADTECH' THEN 'Technology & Media'
        WHEN vertical = 'RETAIL' THEN 'Consumer & Retail'
        ELSE vertical
      END
      WHERE vertical IN ('MARTECH', 'ADTECH', 'RETAIL')
    `)

    console.log('📊 Updating metric verticals...')
    
    const metricUpdates = await prisma.$executeRawUnsafe(`
      UPDATE metrics 
      SET vertical = CASE 
        WHEN vertical = 'MARTECH' THEN 'Technology & Media'
        WHEN vertical = 'ADTECH' THEN 'Technology & Media'
        WHEN vertical = 'RETAIL' THEN 'Consumer & Retail'
        WHEN vertical = 'REVENUE_OPS' THEN 'Services'
        ELSE vertical
      END
      WHERE vertical IN ('MARTECH', 'ADTECH', 'RETAIL', 'REVENUE_OPS')
    `)

    // Get current verticals after migration using raw SQL
    const verticals = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT vertical FROM (
        SELECT vertical FROM articles WHERE status = 'PUBLISHED' AND vertical IS NOT NULL
        UNION
        SELECT vertical FROM metrics WHERE status = 'PUBLISHED' AND vertical IS NOT NULL
      ) AS combined_verticals
      ORDER BY vertical
    `) as Array<{ vertical: string }>

    const uniqueVerticals = verticals.map(v => v.vertical).filter(Boolean)

    return NextResponse.json({
      success: true,
      message: 'Vertical migration completed successfully',
      details: {
        articlesUpdated: articleUpdates,
        metricsUpdated: metricUpdates,
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