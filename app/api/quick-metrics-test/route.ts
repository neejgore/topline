import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🧪 Quick metrics test with unique data...')
    
    // Clear existing metrics first
    await prisma.metric.deleteMany({})
    console.log('🧹 Cleared existing metrics')
    
    // Create one simple metric with completely unique data
    const uniqueTimestamp = Date.now()
    const testMetric = {
      title: `Test Marketing Growth ${uniqueTimestamp}`,
      value: '47% YoY Growth',
      context: 'Test metric for debugging purposes',
      source: `Test Source ${uniqueTimestamp}`,
      sourceUrl: `https://test-unique-${uniqueTimestamp}.com/report`,
      whyItMatters: 'Testing if metrics can be created without constraint violations',
      talkTrack: 'This is a test metric to debug the creation process',
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
    
    // Verify it exists
    const count = await prisma.metric.count()
    
    return NextResponse.json({
      success: true,
      message: 'Test metric created successfully',
      results: {
        metricId: createdMetric.id,
        title: createdMetric.title,
        value: createdMetric.value,
        databaseCount: count
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Quick metrics test failed:', error)
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