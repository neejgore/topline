import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔍 Debug metrics creation...')
    
    // Clear existing metrics first
    await prisma.metric.deleteMany({})
    console.log('🧹 Cleared existing metrics')
    
    // Test with just one simple metric first
    const testMetric = {
      title: 'Test AI Growth',
      value: '47%',
      unit: 'YoY Growth',
      context: 'Test metric for debugging',
      source: 'Test Source',
      sourceUrl: 'https://example.com/test-unique-url-' + Date.now(),
      whyItMatters: 'Testing if metrics can be created',
      talkTrack: 'Test talk track',
      vertical: 'Technology & Media',
      priority: 'HIGH',
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
    
    console.log('Creating test metric:', testMetric.title)
    console.log('Test metric data:', JSON.stringify(testMetric, null, 2))
    
    const createdMetric = await prisma.metric.create({
      data: testMetric
    })
    
    console.log('✅ Test metric created successfully:', createdMetric.id)
    
    // Check if it exists in database
    const countAfterCreate = await prisma.metric.count()
    console.log('Database count after create:', countAfterCreate)
    
    // Try to fetch the created metric
    const fetchedMetric = await prisma.metric.findFirst({
      where: { id: createdMetric.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Debug metrics creation completed',
      results: {
        created: true,
        metricId: createdMetric.id,
        databaseCount: countAfterCreate,
        fetchedMetric: fetchedMetric ? {
          id: fetchedMetric.id,
          title: fetchedMetric.title,
          value: fetchedMetric.value,
          vertical: fetchedMetric.vertical
        } : null
      },
      testMetric: testMetric,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug metrics creation failed:', error)
    
    // Get detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create debug metrics',
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 