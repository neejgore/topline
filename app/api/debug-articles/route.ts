import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { Pool } = require('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Get all articles with details
    const result = await pool.query(`
      SELECT 
        id, title, summary, status, 
        "publishedAt", "createdAt",
        "whyItMatters", "talkTrack",
        category, vertical, priority
      FROM articles 
      ORDER BY "publishedAt" DESC
    `)

    // Also check what the one week ago filter would be
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const filteredResult = await pool.query(`
      SELECT id, title, status, "publishedAt"
      FROM articles 
      WHERE status = 'PUBLISHED' 
        AND "publishedAt" >= $1
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      ORDER BY priority DESC, "publishedAt" DESC
    `, [oneWeekAgo])

    await pool.end()

    return NextResponse.json({
      success: true,
      currentTime: new Date().toISOString(),
      oneWeekAgo: oneWeekAgo.toISOString(),
      allArticles: result.rows,
      filteredArticles: filteredResult.rows,
      totalCount: result.rowCount,
      filteredCount: filteredResult.rowCount
    })

  } catch (error) {
    console.error('Debug articles error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 