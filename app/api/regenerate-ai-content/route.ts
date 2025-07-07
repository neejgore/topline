import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAIContent } from '../../../lib/ai-content-generator.js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting AI content regeneration...')
    
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

    // Generic phrases that indicate articles need regeneration
    const genericPhrases = [
      'AI adoption in Technology & Media is accelerating rapidly',
      'early adopters gaining significant competitive advantages',
      'This development signals where the market is heading',
      'Reference this AI trend to discuss',
      'position your solution in the context of this market evolution',
      'Privacy regulations and data changes are forcing immediate strategic shifts',
      'Market consolidation and funding activities signal investor confidence',
      'The retail media and commerce landscape is evolving rapidly',
      'This [vertical] development represents a significant shift'
    ]

    // Find articles with generic content
    const articlesNeedingRegeneration = articles.filter(article => {
      const content = `${article.whyItMatters || ''} ${article.talkTrack || ''}`.toLowerCase()
      return genericPhrases.some(phrase => content.includes(phrase.toLowerCase())) ||
             !article.whyItMatters || !article.talkTrack ||
             article.whyItMatters.trim() === '' || article.talkTrack.trim() === ''
    })

    console.log(`🔧 Found ${articlesNeedingRegeneration.length} articles needing AI content regeneration`)

    let successCount = 0
    let failureCount = 0
    const results = []

    // Process articles in batches to avoid timeout
    const batchSize = 5
    for (let i = 0; i < articlesNeedingRegeneration.length; i += batchSize) {
      const batch = articlesNeedingRegeneration.slice(i, i + batchSize)
      
      for (const article of batch) {
        try {
          console.log(`🤖 Regenerating AI content for: ${article.title.substring(0, 50)}...`)
          
          // Generate new AI content
          const aiContent = await generateAIContent(
            article.title,
            article.summary || '',
            article.sourceName || 'Unknown',
            article.vertical || 'Technology & Media'
          )

          // Update the article
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              whyItMatters: aiContent.whyItMatters,
              talkTrack: aiContent.talkTrack,
              updatedAt: new Date().toISOString()
            })
            .eq('id', article.id)

          if (updateError) {
            throw new Error(`Error updating article: ${updateError.message}`)
          }

          console.log(`✅ Successfully regenerated AI content for: ${article.title.substring(0, 50)}...`)
          results.push({
            id: article.id,
            title: article.title.substring(0, 50),
            status: 'success',
            whyItMatters: aiContent.whyItMatters,
            talkTrack: aiContent.talkTrack
          })
          successCount++

        } catch (error) {
          console.error(`❌ Failed to regenerate AI content for article ${article.id}:`, (error as Error).message)
          results.push({
            id: article.id,
            title: article.title.substring(0, 50),
            status: 'failed',
            error: (error as Error).message
          })
          failureCount++
        }
      }
      
      // Small delay between batches
      if (i + batchSize < articlesNeedingRegeneration.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`🎉 AI content regeneration complete!`)
    console.log(`✅ Successfully regenerated: ${successCount} articles`)
    console.log(`❌ Failed to regenerate: ${failureCount} articles`)

    return NextResponse.json({
      success: true,
      message: 'AI content regeneration completed',
      stats: {
        totalArticles: articles.length,
        articlesNeedingRegeneration: articlesNeedingRegeneration.length,
        successCount,
        failureCount
      },
      results
    })

  } catch (error) {
    console.error('❌ Error in AI content regeneration:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get stats on articles with generic content
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, whyItMatters, talkTrack, vertical, sourceName')
      .eq('status', 'PUBLISHED')

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    const genericPhrases = [
      'AI adoption in Technology & Media is accelerating rapidly',
      'early adopters gaining significant competitive advantages',
      'This development signals where the market is heading',
      'Reference this AI trend to discuss',
      'position your solution in the context of this market evolution',
      'Privacy regulations and data changes are forcing immediate strategic shifts',
      'Market consolidation and funding activities signal investor confidence',
      'The retail media and commerce landscape is evolving rapidly',
      'This [vertical] development represents a significant shift'
    ]

    const articlesWithGenericContent = articles.filter(article => {
      const content = `${article.whyItMatters || ''} ${article.talkTrack || ''}`.toLowerCase()
      return genericPhrases.some(phrase => content.includes(phrase.toLowerCase())) ||
             !article.whyItMatters || !article.talkTrack ||
             article.whyItMatters.trim() === '' || article.talkTrack.trim() === ''
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles: articles.length,
        articlesWithGenericContent: articlesWithGenericContent.length,
        articlesWithSpecificContent: articles.length - articlesWithGenericContent.length
      },
      genericArticles: articlesWithGenericContent.map(article => ({
        id: article.id,
        title: article.title,
        whyItMatters: article.whyItMatters,
        talkTrack: article.talkTrack,
        vertical: article.vertical,
        sourceName: article.sourceName
      }))
    })

  } catch (error) {
    console.error('❌ Error checking generic content:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
} 