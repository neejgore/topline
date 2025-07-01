import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🧪 Testing simple metrics without unit field...')
    
    // Clear existing metrics
    await prisma.metric.deleteMany({})
    console.log('🧹 Cleared existing metrics')
    
    // Simple metrics without the problematic 'unit' field
    const simpleMetrics = [
      {
        title: 'AI Marketing Growth',
        value: '47% YoY Growth',
        context: 'Enterprise marketing teams adopting AI solutions',
        source: 'MarTech Report 2025',
        sourceUrl: 'https://martech-insights.com/ai-growth-2025',
        whyItMatters: 'Shows accelerating demand for AI marketing solutions that Zeta Global specializes in',
        talkTrack: 'AI marketing spend up 47% - perfect timing for Zeta\'s AI-powered CDP capabilities.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Retail Media Explosion',
        value: '28% YoY Growth',
        context: 'Retail media networks becoming major advertising channels',
        source: 'IAB Retail Media Study',
        sourceUrl: 'https://iab.com/retail-media-growth-2025',
        whyItMatters: 'Retail media is fastest-growing ad channel, critical for consumer brands',
        talkTrack: 'Retail media growing 28% - every consumer brand needs a strategy. Zeta leads this space.',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Cookie Deprecation Urgency',
        value: '68% of Marketers Concerned',
        context: 'Cookie deprecation remains top concern for digital marketers',
        source: 'Digital Marketing Trends',
        sourceUrl: 'https://digital-marketing-trends.com/cookies-2025',
        whyItMatters: 'Universal concern drives urgency for first-party data solutions',
        talkTrack: '68% worried about cookies - creates urgency for Zeta\'s cookieless approach.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    ]
    
    let createdCount = 0
    const createdMetrics = []
    
    for (const metric of simpleMetrics) {
      try {
        const created = await prisma.metric.create({
          data: metric
        })
        createdCount++
        createdMetrics.push({
          id: created.id,
          title: created.title,
          value: created.value,
          vertical: created.vertical
        })
        console.log(`✅ Created: ${created.title}`)
      } catch (error) {
        console.error(`❌ Failed to create ${metric.title}:`, error)
        return NextResponse.json({
          success: false,
          error: `Failed to create metric: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metric: metric.title
        }, { status: 500 })
      }
    }
    
    // Verify they exist
    const finalCount = await prisma.metric.count()
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCount} metrics without unit field`,
      results: {
        metricsCreated: createdCount,
        finalDatabaseCount: finalCount,
        createdMetrics
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Simple fix metrics failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 