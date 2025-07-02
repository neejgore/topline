import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Test database connection
    const testResult = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      test: testResult
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
