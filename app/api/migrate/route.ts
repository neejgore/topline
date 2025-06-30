import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    prisma = new PrismaClient()
    console.log('🔄 Starting simple vertical cleanup...')

    // Step 1: Fix articles - map everything to approved verticals
    console.log('📰 Cleaning article verticals...')
    
    await prisma.$transaction(async (tx) => {
      // Technology & Media
      await tx.article.updateMany({
        where: { vertical: { in: ['MARTECH', 'ADTECH'] } },
        data: { vertical: 'Technology & Media' }
      })
      
      // Consumer & Retail  
      await tx.article.updateMany({
        where: { vertical: { in: ['RETAIL', 'ECOMMERCE', 'CPG'] } },
        data: { vertical: 'Consumer & Retail' }
      })
      
      // Services
      await tx.article.updateMany({
        where: { vertical: { in: ['REVENUE_OPS', 'CONSULTING'] } },
        data: { vertical: 'Services' }
      })
      
      // Financial Services
      await tx.article.updateMany({
        where: { vertical: { in: ['FINTECH', 'BANKING'] } },
        data: { vertical: 'Financial Services' }
      })
      
      // Map any remaining unknowns to Other
      await tx.article.updateMany({
        where: { 
          vertical: { 
            notIn: [
              'Consumer & Retail', 'Insurance', 'Telecom', 'Financial Services',
              'Political Candidate & Advocacy', 'Services', 'Education', 
              'Travel & Hospitality', 'Technology & Media', 'Healthcare', 
              'Automotive', 'Other'
            ]
          }
        },
        data: { vertical: 'Other' }
      })
    })

    // Step 2: Fix metrics the same way
    console.log('📊 Cleaning metric verticals...')
    
    await prisma.$transaction(async (tx) => {
      await tx.metric.updateMany({
        where: { vertical: { in: ['MARTECH', 'ADTECH'] } },
        data: { vertical: 'Technology & Media' }
      })
      
      await tx.metric.updateMany({
        where: { vertical: { in: ['RETAIL', 'ECOMMERCE', 'CPG'] } },
        data: { vertical: 'Consumer & Retail' }
      })
      
      await tx.metric.updateMany({
        where: { vertical: { in: ['REVENUE_OPS', 'CONSULTING'] } },
        data: { vertical: 'Services' }
      })
      
      await tx.metric.updateMany({
        where: { vertical: { in: ['FINTECH', 'BANKING'] } },
        data: { vertical: 'Financial Services' }
      })
      
      await tx.metric.updateMany({
        where: { 
          vertical: { 
            notIn: [
              'Consumer & Retail', 'Insurance', 'Telecom', 'Financial Services',
              'Political Candidate & Advocacy', 'Services', 'Education', 
              'Travel & Hospitality', 'Technology & Media', 'Healthcare', 
              'Automotive', 'Other'
            ]
          }
        },
        data: { vertical: 'Other' }
      })
    })

    // Step 3: Check current state
    const [articles, metrics] = await Promise.all([
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

    const verticals = Array.from(new Set([
      ...articles.map(a => a.vertical),
      ...metrics.map(m => m.vertical)
    ])).filter(Boolean).sort()

    return NextResponse.json({
      success: true,
      message: 'Vertical cleanup completed',
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
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

export async function GET() {
  const mockRequest = new Request('https://example.com', { method: 'POST' }) as NextRequest
  return POST(mockRequest)
} 