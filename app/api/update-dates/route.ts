import { NextResponse } from 'next/server'

export async function POST() {
  let pool: any = null
  
  try {
    console.log('🔄 Updating content dates to current week...')
    
    const { Pool } = require('pg')
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    
    const now = new Date()
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 3) // 3 days ago to ensure it's within the week

    // Update articles to have current week dates
    console.log('📰 Updating article publication dates...')
    const articleResult = await pool.query(`
      UPDATE articles 
      SET "publishedAt" = $1, "updatedAt" = $2
      WHERE status = 'PUBLISHED'
      RETURNING id
    `, [thisWeek, now])

    // Update metrics to have current week dates  
    console.log('📊 Updating metric publication dates...')
    const metricResult = await pool.query(`
      UPDATE metrics 
      SET "publishedAt" = $1, "updatedAt" = $2
      WHERE status = 'PUBLISHED'
      RETURNING id
    `, [thisWeek, now])

    // Get current visible counts
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const [articleCount, metricCount] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as count FROM articles 
        WHERE status = 'PUBLISHED' AND "publishedAt" >= $1
      `, [oneWeekAgo]),
      pool.query(`
        SELECT COUNT(*) as count FROM metrics 
        WHERE status = 'PUBLISHED' AND "publishedAt" >= $1
      `, [oneWeekAgo])
    ])

    const articlesVisible = parseInt(articleCount.rows[0].count)
    const metricsVisible = parseInt(metricCount.rows[0].count)

    await pool.end()

    return NextResponse.json({
      success: true,
      message: 'Content dates updated successfully! 🎉',
      details: {
        updateDate: thisWeek.toISOString().split('T')[0],
        articlesUpdated: articleResult.rowCount,
        metricsUpdated: metricResult.rowCount,
        nowVisible: {
          articles: articlesVisible,
          metrics: metricsVisible
        }
      }
    })

  } catch (error) {
    console.error('❌ Update failed:', error)
    
    if (pool) {
      try { await pool.end() } catch {}
    }
    
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