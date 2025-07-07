import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Import the content classifier
const { classifyVerticalAutonomous } = require('../../../lib/content-classifier')

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting vertical reclassification...')
    
    // Get all published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false })

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    console.log(`📰 Found ${articles.length} published articles`)

    let reclassifiedCount = 0
    let unchangedCount = 0
    const results = []

    for (const article of articles) {
      try {
        // Classify the vertical based on content
        const newVertical = classifyVerticalAutonomous(
          article.title || '',
          article.summary || '',
          article.sourceName || ''
        )

        // Check if the vertical changed
        if (newVertical !== article.vertical) {
          // Update the article with the new vertical
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              vertical: newVertical,
              updatedAt: new Date().toISOString()
            })
            .eq('id', article.id)

          if (updateError) {
            throw new Error(`Error updating article: ${updateError.message}`)
          }

          console.log(`📊 Reclassified "${article.title.substring(0, 50)}..." from "${article.vertical}" to "${newVertical}"`)
          reclassifiedCount++
          
          results.push({
            id: article.id,
            title: article.title.substring(0, 50),
            oldVertical: article.vertical,
            newVertical: newVertical,
            status: 'reclassified'
          })
        } else {
          unchangedCount++
          results.push({
            id: article.id,
            title: article.title.substring(0, 50),
            vertical: article.vertical,
            status: 'unchanged'
          })
        }

      } catch (error) {
        console.error(`❌ Failed to reclassify article ${article.id}:`, (error as Error).message)
        results.push({
          id: article.id,
          title: article.title.substring(0, 50),
          status: 'failed',
          error: (error as Error).message
        })
      }
    }

    console.log(`🎉 Vertical reclassification complete!`)
    console.log(`📊 Reclassified: ${reclassifiedCount} articles`)
    console.log(`📊 Unchanged: ${unchangedCount} articles`)

    return NextResponse.json({
      success: true,
      message: 'Vertical reclassification completed',
      stats: {
        totalArticles: articles.length,
        reclassifiedCount,
        unchangedCount
      },
      results: results.slice(0, 10) // Return first 10 results as sample
    })

  } catch (error) {
    console.error('❌ Error in vertical reclassification:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get preview of what would be reclassified
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, vertical, summary, sourceName')
      .eq('status', 'PUBLISHED')
      .limit(10)

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    const preview = articles.map(article => {
      const currentVertical = article.vertical
      const suggestedVertical = classifyVerticalAutonomous(
        article.title || '',
        article.summary || '',
        article.sourceName || ''
      )
      
      return {
        id: article.id,
        title: article.title,
        currentVertical,
        suggestedVertical,
        needsReclassification: currentVertical !== suggestedVertical
      }
    })

    const needsReclassification = preview.filter(p => p.needsReclassification).length

    return NextResponse.json({
      success: true,
      preview,
      stats: {
        totalPreviewArticles: preview.length,
        needsReclassification
      }
    })

  } catch (error) {
    console.error('❌ Error in reclassification preview:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
} 