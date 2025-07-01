import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Direct SQL update to fix ADTECH/MARTECH to Technology & Media
    const result = await pool.query(`
      UPDATE articles 
      SET 
        category = CASE 
          WHEN category IN ('ADTECH', 'MARTECH', 'MOBILE') THEN 'Technology & Media'
          WHEN category IN ('RETAIL', 'ECOMMERCE', 'CPG') THEN 'Consumer & Retail'
          ELSE category
        END,
        vertical = CASE 
          WHEN vertical IN ('ADTECH', 'MARTECH', 'MOBILE') THEN 'Technology & Media'
          WHEN vertical IN ('RETAIL', 'ECOMMERCE', 'CPG') THEN 'Consumer & Retail'
          ELSE vertical
        END,
        "updatedAt" = NOW()
      WHERE category IN ('ADTECH', 'MARTECH', 'MOBILE', 'RETAIL', 'ECOMMERCE', 'CPG')
         OR vertical IN ('ADTECH', 'MARTECH', 'MOBILE', 'RETAIL', 'ECOMMERCE', 'CPG')
      RETURNING id, title, category, vertical
    `)

    await pool.end()

    return NextResponse.json({
      success: true,
      message: `✅ Fixed ${result.rows.length} articles!`,
      updatedArticles: result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        vertical: row.vertical
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 