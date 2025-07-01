import { NextResponse } from 'next/server'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'

export async function POST() {
  try {
    console.log('🧹 Starting comprehensive duplicate cleanup...')
    
    const startTime = Date.now()
    
    // Run the duplicate cleanup service
    const results = await duplicatePreventionService.cleanupDuplicates()
    
    const duration = Math.round((Date.now() - startTime) / 1000)
    
    console.log(`✅ Duplicate cleanup completed in ${duration}s`)
    console.log(`📊 Results: ${results.articlesRemoved} articles, ${results.metricsRemoved} metrics removed`)

    return NextResponse.json({
      success: true,
      message: 'Duplicate cleanup completed successfully',
      results: {
        articlesRemoved: results.articlesRemoved,
        metricsRemoved: results.metricsRemoved,
        totalDuplicatesRemoved: results.articlesRemoved + results.metricsRemoved
      },
      duration: `${duration} seconds`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Duplicate cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 