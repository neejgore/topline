import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔧 FORCING VERTICAL UPDATE - Direct Database Fix')

    // Step 1: Update all old vertical names to new ones
    const verticalMappings = [
      { old: 'ADTECH', new: 'Technology & Media' },
      { old: 'MARTECH', new: 'Technology & Media' },
      { old: 'RETAIL', new: 'Consumer & Retail' },
      { old: 'ECOMMERCE', new: 'Consumer & Retail' },
      { old: 'CPG', new: 'Consumer & Retail' },
      { old: 'FINTECH', new: 'Financial Services' },
      { old: 'BANKING', new: 'Financial Services' },
      { old: 'HEALTHTECH', new: 'Healthcare' },
      { old: 'AUTOTECH', new: 'Automotive' },
      { old: 'TRAVELTECH', new: 'Travel & Hospitality' },
      { old: 'EDTECH', new: 'Education' },
      { old: 'TELECOM', new: 'Telecom' },
      { old: 'POLITICS', new: 'Political Candidate & Advocacy' },
      { old: 'ADVOCACY', new: 'Political Candidate & Advocacy' },
      { old: 'SERVICES', new: 'Services' },
      { old: 'OTHER', new: 'Services' }
    ]

    let totalUpdated = 0

    for (const mapping of verticalMappings) {
      // Update articles
      const articleUpdate = await prisma.article.updateMany({
        where: { vertical: mapping.old },
        data: { vertical: mapping.new }
      })
      
      // Update metrics
      const metricUpdate = await prisma.metric.updateMany({
        where: { vertical: mapping.old },
        data: { vertical: mapping.new }
      })
      
      const mappingTotal = articleUpdate.count + metricUpdate.count
      if (mappingTotal > 0) {
        console.log(`✅ Updated ${mappingTotal} records: ${mapping.old} → ${mapping.new}`)
        totalUpdated += mappingTotal
      }
    }

    // Step 2: Fix any remaining null or invalid verticals
    const nullVerticalFix = await prisma.article.updateMany({
      where: { 
        OR: [
          { vertical: null },
          { vertical: '' },
          { vertical: 'undefined' },
          { vertical: 'null' }
        ]
      },
      data: { vertical: 'Technology & Media' }
    })

    if (nullVerticalFix.count > 0) {
      console.log(`✅ Fixed ${nullVerticalFix.count} null/invalid verticals`)
      totalUpdated += nullVerticalFix.count
    }

    // Step 3: Get current vertical distribution
    const verticalStats = await prisma.article.groupBy({
      by: ['vertical'],
      _count: { vertical: true }
    })

    // Step 4: Fix any category/vertical mismatches
    const categoryFix = await prisma.article.updateMany({
      where: { 
        category: { 
          notIn: ['NEWS', 'METRICS', 'Technology & Media', 'Consumer & Retail', 'Healthcare', 
                  'Financial Services', 'Insurance', 'Automotive', 'Travel & Hospitality', 
                  'Education', 'Telecom', 'Services', 'Political Candidate & Advocacy'] 
        }
      },
      data: { category: 'NEWS' }
    })

    if (categoryFix.count > 0) {
      console.log(`✅ Fixed ${categoryFix.count} invalid categories`)
      totalUpdated += categoryFix.count
    }

    console.log('🎉 VERTICAL UPDATE COMPLETE!')

    return NextResponse.json({
      success: true,
      message: `Force updated ${totalUpdated} records with correct verticals`,
      details: {
        totalUpdated,
        verticalMappings: verticalMappings.length,
        currentDistribution: verticalStats
      },
      approvedVerticals: [
        'Technology & Media',
        'Consumer & Retail', 
        'Healthcare',
        'Financial Services',
        'Insurance',
        'Automotive',
        'Travel & Hospitality',
        'Education',
        'Telecom',
        'Services',
        'Political Candidate & Advocacy'
      ]
    })

  } catch (error) {
    console.error('❌ Vertical update failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 