import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('📅 Fixing articles with old publication dates...')
    
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Find articles older than 2 weeks
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const result = await pool.query(`
      UPDATE articles 
      SET 
        "publishedAt" = NOW() - (RANDOM() * INTERVAL '72 hours'),
        "updatedAt" = NOW()
      WHERE "publishedAt" < $1
      RETURNING id, title, "publishedAt"
    `, [twoWeeksAgo])

    await pool.end()

    return NextResponse.json({
      success: true,
      message: `✅ Fixed ${result.rows.length} articles with old dates!`,
      updatedArticles: result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        newDate: row.publishedAt
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error fixing dates:', error)
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