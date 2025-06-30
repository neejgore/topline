import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting simple vertical cleanup with raw SQL...')

    // Step 1: Fix articles using raw SQL to avoid prepared statement conflicts
    console.log('📰 Cleaning article verticals...')
    
    // Technology & Media
    await prisma.$executeRaw`
      UPDATE articles 
      SET vertical = 'Technology & Media', "updatedAt" = NOW()
      WHERE vertical IN ('MARTECH', 'ADTECH')
    `
    
    // Consumer & Retail  
    await prisma.$executeRaw`
      UPDATE articles 
      SET vertical = 'Consumer & Retail', "updatedAt" = NOW()
      WHERE vertical IN ('RETAIL', 'ECOMMERCE', 'CPG')
    `
    
    // Services
    await prisma.$executeRaw`
      UPDATE articles 
      SET vertical = 'Services', "updatedAt" = NOW()
      WHERE vertical IN ('REVENUE_OPS', 'CONSULTING')
    `
    
    // Financial Services
    await prisma.$executeRaw`
      UPDATE articles 
      SET vertical = 'Financial Services', "updatedAt" = NOW()
      WHERE vertical IN ('FINTECH', 'BANKING')
    `
    
    // Healthcare
    await prisma.$executeRaw`
      UPDATE articles 
      SET vertical = 'Healthcare', "updatedAt" = NOW()
      WHERE vertical IN ('HEALTHTECH', 'MEDTECH')
    `
    
    // Map any remaining unknowns to Other
    await prisma.$executeRaw`
      UPDATE articles 
      SET vertical = 'Other', "updatedAt" = NOW()
      WHERE vertical NOT IN ('Consumer & Retail', 'Insurance', 'Telecom', 'Financial Services',
                            'Political Candidate & Advocacy', 'Services', 'Education', 
                            'Travel & Hospitality', 'Technology & Media', 'Healthcare', 
                            'Automotive', 'Other')
    `

    // Step 2: Fix metrics using raw SQL
    console.log('📊 Cleaning metric verticals...')
    
    // Technology & Media
    await prisma.$executeRaw`
      UPDATE metrics 
      SET vertical = 'Technology & Media', "updatedAt" = NOW()
      WHERE vertical IN ('MARTECH', 'ADTECH')
    `
    
    // Consumer & Retail  
    await prisma.$executeRaw`
      UPDATE metrics 
      SET vertical = 'Consumer & Retail', "updatedAt" = NOW()
      WHERE vertical IN ('RETAIL', 'ECOMMERCE', 'CPG')
    `
    
    // Services
    await prisma.$executeRaw`
      UPDATE metrics 
      SET vertical = 'Services', "updatedAt" = NOW()
      WHERE vertical IN ('REVENUE_OPS', 'CONSULTING')
    `
    
    // Financial Services
    await prisma.$executeRaw`
      UPDATE metrics 
      SET vertical = 'Financial Services', "updatedAt" = NOW()
      WHERE vertical IN ('FINTECH', 'BANKING')
    `
    
    // Healthcare
    await prisma.$executeRaw`
      UPDATE metrics 
      SET vertical = 'Healthcare', "updatedAt" = NOW()
      WHERE vertical IN ('HEALTHTECH', 'MEDTECH')
    `
    
    // Map any remaining unknowns to Other
    await prisma.$executeRaw`
      UPDATE metrics 
      SET vertical = 'Other', "updatedAt" = NOW()
      WHERE vertical NOT IN ('Consumer & Retail', 'Insurance', 'Telecom', 'Financial Services',
                            'Political Candidate & Advocacy', 'Services', 'Education', 
                            'Travel & Hospitality', 'Technology & Media', 'Healthcare', 
                            'Automotive', 'Other')
    `

    // Step 3: Get current state using raw SQL
    const articleVerticals = await prisma.$queryRaw<Array<{vertical: string}>>`
      SELECT DISTINCT vertical FROM articles WHERE status = 'PUBLISHED' ORDER BY vertical
    `
    
    const metricVerticals = await prisma.$queryRaw<Array<{vertical: string}>>`
      SELECT DISTINCT vertical FROM metrics WHERE status = 'PUBLISHED' ORDER BY vertical
    `

    const verticals = Array.from(new Set([
      ...articleVerticals.map(a => a.vertical),
      ...metricVerticals.map(m => m.vertical)
    ])).filter(Boolean).sort()

    return NextResponse.json({
      success: true,
      message: 'Vertical cleanup completed using raw SQL',
      currentVerticals: verticals,
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