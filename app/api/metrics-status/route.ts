import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const metrics = await prisma.metric.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const count = await prisma.metric.count()
    
    return NextResponse.json({
      success: true,
      totalMetrics: count,
      metrics: metrics,
      message: count > 0 ? `Found ${count} metrics in database` : 'No metrics found in database'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 