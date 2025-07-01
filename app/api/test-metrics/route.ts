import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🧪 Testing metrics creation...')
    
    // Clear existing metrics first
    await prisma.metric.deleteMany({})
    console.log('🧹 Cleared existing metrics')
    
    // Try to create a simple test metric
    const testMetric = {
      title: 'Test AI Marketing Growth',
      value: '47%',
      unit: 'YoY Growth',
      context: 'Test metric for debugging',
      source: 'Test Source',
      sourceUrl: 'https://example.com/test',
      whyItMatters: 'Test metric creation functionality',
      talkTrack: 'Test talk track for metric creation',
      vertical: 'Technology & Media',
      priority: 'HIGH',
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
    
    console.log('Creating test metric:', testMetric.title)
    
    const createdMetric = await prisma.metric.create({
      data: testMetric
    })
    
    console.log('✅ Test metric created successfully:', createdMetric.id)
    
    // Try to create a few more metrics
    const metrics = [
      {
        title: 'Retail Media Growth',
        value: '28%',
        unit: 'YoY Growth', 
        context: 'Retail media expansion',
        source: 'Industry Report',
        sourceUrl: 'https://example.com/retail',
        whyItMatters: 'Retail media is exploding',
        talkTrack: 'Perfect opportunity for retail clients',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Cookie Deprecation Concerns',
        value: '68%',
        unit: 'of Marketers',
        context: 'Privacy changes impact',
        source: 'Marketing Survey',
        sourceUrl: 'https://example.com/cookies',
        whyItMatters: 'Drives need for first-party data',
        talkTrack: 'Urgency for cookieless solutions',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    ]
    
    let createdCount = 1 // Already created one above
    
    for (const metric of metrics) {
      try {
        const created = await prisma.metric.create({
          data: metric
        })
        createdCount++
        console.log(`✅ Created metric: ${created.title}`)
      } catch (error) {
        console.error(`❌ Failed to create metric ${metric.title}:`, error)
      }
    }
    
    // Fetch all metrics to verify
    const allMetrics = await prisma.metric.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Total metrics in database: ${allMetrics.length}`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCount} test metrics`,
      metricsCreated: createdCount,
      totalInDatabase: allMetrics.length,
      testResults: {
        metricsAttempted: metrics.length + 1,
        metricsCreated: createdCount,
        allMetrics: allMetrics.map(m => ({
          id: m.id,
          title: m.title,
          value: m.value,
          vertical: m.vertical
        }))
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Test metrics creation failed:', error)
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