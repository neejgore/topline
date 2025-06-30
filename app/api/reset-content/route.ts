import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔄 Updating content dates to current week...')
    
    const now = new Date()
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 3) // 3 days ago to ensure it's within the week

    // Update articles to have current week dates
    console.log('📰 Updating article publication dates...')
    await prisma.$executeRaw`
      UPDATE articles 
      SET "publishedAt" = ${thisWeek}, "updatedAt" = ${now}
      WHERE status = 'PUBLISHED'
    `

    // Update metrics to have current week dates  
    console.log('📊 Updating metric publication dates...')
    await prisma.$executeRaw`
      UPDATE metrics 
      SET "publishedAt" = ${thisWeek}, "updatedAt" = ${now}
      WHERE status = 'PUBLISHED'
    `

    // Get counts
    const [articleCount, metricCount] = await Promise.all([
      prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count FROM articles 
        WHERE status = 'PUBLISHED' AND "publishedAt" >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
      `,
      prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count FROM metrics 
        WHERE status = 'PUBLISHED' AND "publishedAt" >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
      `
    ])

    const articlesVisible = Number(articleCount[0]?.count ?? 0)
    const metricsVisible = Number(metricCount[0]?.count ?? 0)

    return NextResponse.json({
      success: true,
      message: 'Content dates updated successfully!',
      details: {
        updateDate: thisWeek.toISOString(),
        articlesNowVisible: articlesVisible,
        metricsNowVisible: metricsVisible
      }
    })

  } catch (error) {
    console.error('❌ Update failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to update content dates'
    }, { status: 500 })
    
  }
}

export async function GET() {
  return POST()
} 