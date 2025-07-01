import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔧 Starting immediate vertical fix...')
    
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Direct SQL updates to fix all vertical issues
    const updates = [
      {
        from: 'ADTECH',
        to: 'Technology & Media',
        description: 'ADTECH → Technology & Media'
      },
      {
        from: 'MARTECH', 
        to: 'Technology & Media',
        description: 'MARTECH → Technology & Media'
      },
      {
        from: 'RETAIL',
        to: 'Consumer & Retail', 
        description: 'RETAIL → Consumer & Retail'
      },
      {
        from: 'ECOMMERCE',
        to: 'Consumer & Retail',
        description: 'ECOMMERCE → Consumer & Retail'
      },
      {
        from: 'CPG',
        to: 'Consumer & Retail',
        description: 'CPG → Consumer & Retail'
      },
      {
        from: 'MOBILE',
        to: 'Technology & Media',
        description: 'MOBILE → Technology & Media'
      }
    ]

    let totalUpdates = 0
    const results = []

    for (const update of updates) {
      // Update articles table - both category and vertical fields
      const articleResult = await pool.query(`
        UPDATE articles 
        SET 
          category = $2,
          vertical = $2,
          "updatedAt" = NOW()
        WHERE category = $1 OR vertical = $1
        RETURNING id, title
      `, [update.from, update.to])

      if (articleResult.rows.length > 0) {
        console.log(`✅ Updated ${articleResult.rows.length} articles: ${update.description}`)
        totalUpdates += articleResult.rows.length
        results.push({
          update: update.description,
          articlesUpdated: articleResult.rows.length,
          articles: articleResult.rows.map((row: any) => ({ id: row.id, title: row.title }))
        })
      }

      // Update metrics table if it exists
      try {
        const metricsResult = await pool.query(`
          UPDATE metrics 
          SET 
            vertical = $2,
            "updatedAt" = NOW()
          WHERE vertical = $1
          RETURNING id, title
        `, [update.from, update.to])

        if (metricsResult.rows.length > 0) {
          console.log(`✅ Updated ${metricsResult.rows.length} metrics: ${update.description}`)
          results.push({
            update: `${update.description} (metrics)`,
            metricsUpdated: metricsResult.rows.length
          })
        }
      } catch (error) {
        // Metrics table might not exist, that's okay
        console.log('📝 Metrics table not found, skipping metrics update')
      }
    }

    await pool.end()

    return NextResponse.json({
      success: true,
      message: `✅ Fixed ${totalUpdates} articles with proper vertical names!`,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error fixing verticals:', error)
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