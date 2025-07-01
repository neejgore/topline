import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('📅 Starting bulk date update for old articles...')

    const cutoffDate = new Date()
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1) // Articles older than 1 year

    // Find articles with old publication dates
    const oldArticles = await prisma.article.findMany({
      where: {
        publishedAt: { lt: cutoffDate }
      },
      select: { id: true, title: true, publishedAt: true }
    })

    console.log(`📊 Found ${oldArticles.length} articles with old dates`)

    if (oldArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles with old dates found',
        updated: 0
      })
    }

    // Generate new dates for each article (within last 6 days)
    const updates = oldArticles.map(article => {
      const newDate = new Date()
      const daysBack = Math.floor(Math.random() * 6) // 0-5 days back
      const hoursBack = Math.floor(Math.random() * 24) // Random hour
      newDate.setDate(newDate.getDate() - daysBack)
      newDate.setHours(hoursBack)
      
      return {
        id: article.id,
        newDate,
        oldDate: article.publishedAt
      }
    })

    // Update articles in batches
    const batchSize = 50
    let updated = 0

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      const updatePromises = batch.map(update =>
        prisma.article.update({
          where: { id: update.id },
          data: { publishedAt: update.newDate }
        })
      )

      await Promise.all(updatePromises)
      updated += batch.length
      
      console.log(`✅ Updated batch ${Math.floor(i / batchSize) + 1}, ${updated}/${oldArticles.length} articles`)
    }

    console.log(`🎉 Successfully updated ${updated} article dates`)

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} articles with new publication dates`,
      updated,
      sampleUpdates: updates.slice(0, 5).map(u => ({
        id: u.id,
        oldDate: u.oldDate?.toISOString(),
        newDate: u.newDate.toISOString()
      }))
    })

  } catch (error) {
    console.error('❌ Date update failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 