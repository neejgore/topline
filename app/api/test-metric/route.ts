import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🧪 Testing metric creation...')

    // Try creating with required fields
    const testMetric = await prisma.metric.create({
      data: {
        title: 'Test Metric',
        value: '123%',
        source: 'Test Source'
      }
    })

    console.log('✅ Test metric created:', testMetric.id)

    return NextResponse.json({
      success: true,
      message: 'Test metric created successfully',
      metric: testMetric
    })

  } catch (error) {
    console.error('❌ Test metric failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 