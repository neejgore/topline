import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vertical = searchParams.get('vertical') || 'ALL'
    const type = searchParams.get('type') || 'articles'

    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    if (type === 'articles') {
      let query = `
        SELECT 
          id, title, summary, "sourceUrl", "sourceName", 
          "whyItMatters", "talkTrack", category, vertical, 
          priority, status, "publishedAt", "createdAt", "updatedAt"
        FROM articles 
        WHERE status = 'PUBLISHED' 
          AND "publishedAt" >= $1
          AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
          AND category != 'METRICS'
      `
      
      const params: any[] = [oneWeekAgo]
      
      if (vertical && vertical !== 'ALL') {
        query += ` AND vertical = $2`
        params.push(vertical)
      }
      
      query += `
        ORDER BY 
          CASE priority 
            WHEN 'HIGH' THEN 3 
            WHEN 'MEDIUM' THEN 2 
            ELSE 1 
          END DESC,
          "publishedAt" DESC
        LIMIT 15
      `

      const result = await pool.query(query, params)
      await pool.end()

      return NextResponse.json({
        success: true,
        articles: result.rows.map((article: any) => ({
          ...article,
          tags: []
        }))
      })

    } else if (type === 'metrics') {
      let query = `
        SELECT 
          id, title, summary as description, "sourceUrl", "sourceName" as source, 
          "whyItMatters" as "howToUse", "talkTrack", vertical, 
          priority, status, "publishedAt", "createdAt", "updatedAt"
        FROM articles 
        WHERE status = 'PUBLISHED' 
          AND "publishedAt" >= $1
          AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
          AND category = 'METRICS'
      `
      
      const params: any[] = [oneWeekAgo]
      
      if (vertical && vertical !== 'ALL') {
        query += ` AND vertical = $2`
        params.push(vertical)
      }
      
      query += `
        ORDER BY 
          CASE priority 
            WHEN 'HIGH' THEN 3 
            WHEN 'MEDIUM' THEN 2 
            ELSE 1 
          END DESC,
          "publishedAt" DESC
        LIMIT 5
      `

      const result = await pool.query(query, params)
      await pool.end()

      return NextResponse.json({
        success: true,
        metrics: result.rows.map((metric: any) => ({
          ...metric,
          tags: []
        }))
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid type parameter' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error fetching filtered content:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 