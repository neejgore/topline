import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔧 Starting metrics fix...')
    
    // Clear existing metrics
    await prisma.metric.deleteMany({})
    console.log('🧹 Cleared existing metrics')
    
    // Simple metrics array - exactly what should be created
    const metrics = [
      {
        title: 'AI Marketing Spend Growth',
        value: '47%',
        unit: 'YoY Growth',
        context: 'Enterprise marketing teams are rapidly adopting AI-powered solutions',
        source: 'MarTech Outlook 2025',
        sourceUrl: 'https://example.com/martech-outlook',
        whyItMatters: 'Shows accelerating demand for AI marketing solutions that Zeta Global specializes in',
        talkTrack: 'Marketing leaders are prioritizing AI investments - 47% growth in AI marketing spend shows this is where budgets are flowing. Perfect timing to discuss Zeta\'s AI-powered CDP capabilities.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Retail Media Growth Rate',
        value: '28%',
        unit: 'YoY Growth',
        context: 'Retail media networks are becoming major advertising channels',
        source: 'IAB Retail Media Report',
        sourceUrl: 'https://example.com/retail-media-report',
        whyItMatters: 'Retail media is the fastest-growing advertising channel, critical for consumer brands',
        talkTrack: 'Retail media is exploding at 28% growth - every consumer brand needs a retail media strategy. Zeta\'s retail media solutions help brands navigate this complex landscape.',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Third-Party Cookie Deprecation Impact',
        value: '68%',
        unit: 'of Marketers Concerned',
        context: 'Cookie deprecation continues to be top concern for digital marketers',
        source: 'Digital Marketing Trends Report',
        sourceUrl: 'https://example.com/cookie-deprecation-survey',
        whyItMatters: 'Universal concern about cookie deprecation drives need for alternative data strategies',
        talkTrack: '68% of marketers are concerned about cookie deprecation - this creates urgency for first-party data solutions. Zeta\'s cookieless approach solves this exact problem.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    ]
    
    let totalCreated = 0
    const createdMetrics = []
    
    for (const metric of metrics) {
      try {
        const created = await prisma.metric.create({
          data: metric
        })
        totalCreated++
        createdMetrics.push({
          id: created.id,
          title: created.title,
          value: created.value,
          vertical: created.vertical
        })
        console.log(`✅ Created: ${created.title}`)
      } catch (error) {
        console.error(`❌ Failed to create ${metric.title}:`, error)
      }
    }
    
    // Verify final count
    const finalCount = await prisma.metric.count()
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${totalCreated} metrics`,
      results: {
        metricsAttempted: metrics.length,
        metricsCreated: totalCreated,
        finalDatabaseCount: finalCount,
        createdMetrics
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Fix metrics failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 