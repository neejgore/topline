// Direct SQL version of content functions to bypass Prisma issues

export async function getPublishedArticlesDirect() {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const result = await pool.query(`
      SELECT 
        id, title, summary, "sourceUrl", "sourceName", 
        "whyItMatters", "talkTrack", category, vertical, 
        priority, status, "publishedAt", "createdAt", "updatedAt"
      FROM articles 
      WHERE status = 'PUBLISHED' 
        AND "publishedAt" >= $1
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      ORDER BY 
        CASE priority 
          WHEN 'HIGH' THEN 3 
          WHEN 'MEDIUM' THEN 2 
          ELSE 1 
        END DESC,
        "publishedAt" DESC
      LIMIT 10
    `, [oneWeekAgo])

    await pool.end()
    
    // Transform the results to match Prisma format
    return result.rows.map((article: any) => ({
      ...article,
      tags: [] // We'll add tags later if needed
    }))

  } catch (error) {
    console.error('Error fetching articles (direct):', error)
    return []
  }
}

export async function getPublishedMetricsDirect() {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const result = await pool.query(`
      SELECT 
        id, title, value, description, source, 
        "howToUse", "talkTrack", vertical, 
        priority, status, "publishedAt", "createdAt", "updatedAt"
      FROM metrics 
      WHERE status = 'PUBLISHED' 
        AND "publishedAt" >= $1
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      ORDER BY 
        CASE priority 
          WHEN 'HIGH' THEN 3 
          WHEN 'MEDIUM' THEN 2 
          ELSE 1 
        END DESC,
        "publishedAt" DESC
      LIMIT 10
    `, [oneWeekAgo])

    await pool.end()
    
    // Transform the results to match Prisma format
    return result.rows.map((metric: any) => ({
      ...metric,
      tags: [] // We'll add tags later if needed
    }))

  } catch (error) {
    console.error('Error fetching metrics (direct):', error)
    return []
  }
} 