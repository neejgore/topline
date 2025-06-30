import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { Pool } = require('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Get all articles with their dates
    const articlesResult = await pool.query(`
      SELECT id, title, status, "publishedAt", "createdAt" 
      FROM articles 
      ORDER BY "createdAt" DESC
    `)

    // Get all metrics with their dates
    const metricsResult = await pool.query(`
      SELECT id, title, status, "publishedAt", "createdAt" 
      FROM metrics 
      ORDER BY "createdAt" DESC
    `)

    const now = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    await pool.end()

    const response = {
      success: true,
      debugInfo: {
        currentTime: now.toISOString(),
        oneWeekAgo: oneWeekAgo.toISOString(),
        articles: articlesResult.rows,
        metrics: metricsResult.rows,
        articleCount: articlesResult.rowCount,
        metricCount: metricsResult.rowCount
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Debug query failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 