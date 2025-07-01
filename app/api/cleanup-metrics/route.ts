import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🧹 Starting metrics cleanup...')
    
    // Clear all existing metrics
    const deleted = await prisma.metric.deleteMany()
    console.log(`🗑️ Deleted ${deleted.count} existing metrics`)
    
    // Simple metrics array with unique title + source combinations
    const metrics = [
      {
        title: 'Test Metric One',
        value: '123',
        source: 'Test Source One'
      },
      {
        title: 'Test Metric Two',
        value: '456',
        source: 'Test Source Two'
      }
    ]
    
    let totalCreated = 0
    const createdMetrics = []
    
    for (const metric of metrics) {
      try {
        console.log('📊 Attempting to create metric:', metric.title)
        const created = await prisma.metric.create({
          data: metric
        })
        totalCreated++
        createdMetrics.push({
          id: created.id,
          title: created.title,
          value: created.value
        })
        console.log(`✅ Created: ${created.title}`)
      } catch (error) {
        console.error(`❌ Failed to create ${metric.title}:`, error)
      }
    }
    
    // Verify final count
    const finalCount = await prisma.metric.count()
    console.log(`📊 Final metrics count: ${finalCount}`)
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} metrics and created ${totalCreated} new ones`,
      results: {
        metricsDeleted: deleted.count,
        metricsAttempted: metrics.length,
        metricsCreated: totalCreated,
        finalDatabaseCount: finalCount,
        createdMetrics
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Metrics cleanup failed:', error)
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