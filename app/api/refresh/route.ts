import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import Parser from 'rss-parser'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS } from '@/lib/content-sources'

const { generateAIContent } = require('@/lib/ai-content-generator.js')

export const dynamic = 'force-dynamic'

interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  contentSnippet?: string
  content?: string
}

export async function POST() {
  try {
    console.log('🔄 Starting content refresh...')
    const parser = new Parser()
    let totalArticles = 0
    let skippedArticles = 0

    // Process each RSS feed
    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📰 Fetching from ${source.name}...`)
        const feed = await parser.parseURL(source.rssUrl)
        const items = feed.items || []

        for (const item of items) {
          try {
            // Skip if no title or URL
            if (!item.title || !item.link) {
              skippedArticles++
              continue
            }

            // Skip if content contains excluded keywords
            const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase()
            if (EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))) {
              skippedArticles++
              continue
            }

            // Check if content is relevant
            const isRelevant = RELEVANT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
            if (!isRelevant) {
              skippedArticles++
              continue
            }

            // Check for duplicates
            const { data: existingArticle, error: duplicateError } = await supabase
              .from('articles')
              .select('id')
              .or(`sourceUrl.eq.${item.link},and(title.eq.${item.title},sourceName.eq.${source.name})`)
              .limit(1)
              .single()

            if (duplicateError && duplicateError.code !== 'PGRST116') {
              // PGRST116 is "no rows returned", which is what we want
              console.error('Error checking for duplicates:', duplicateError)
              skippedArticles++
              continue
            }

            if (existingArticle) {
              skippedArticles++
              continue
            }

            console.log(`🤖 Generating AI content for: ${item.title}`)
            
            // Generate AI-powered content
            const aiContent = await generateAIContent(
              item.title, 
              item.contentSnippet || item.content || '', 
              source.name, 
              source.vertical
            )

            // Create new article
            const { error: insertError } = await supabase
              .from('articles')
              .insert({
                title: item.title,
                summary: item.contentSnippet || item.content || null,
                sourceUrl: item.link,
                sourceName: source.name,
                publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                vertical: source.vertical,
                status: 'PUBLISHED',
                priority: source.priority,
                category: 'NEWS',
                whyItMatters: aiContent.whyItMatters,
                talkTrack: aiContent.talkTrack,
                importanceScore: 0,
                views: 0,
                clicks: 0,
                shares: 0
              })

            if (insertError) {
              console.error('Error inserting article:', insertError)
              skippedArticles++
              continue
            }

            totalArticles++
            console.log(`✅ Added with AI content: ${item.title}`)

            // Small delay to avoid overwhelming the AI API
            await new Promise(resolve => setTimeout(resolve, 1000))

          } catch (itemError) {
            console.error('Error processing item:', itemError)
            skippedArticles++
          }
        }

      } catch (sourceError) {
        console.error(`Error fetching from ${source.name}:`, sourceError)
      }
    }

    // Get updated content stats
    const { count: totalPublishedArticles, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED')

    if (countError) {
      console.error('Error getting article count:', countError)
    }

    console.log('✅ Content refresh completed')
    
    return NextResponse.json({
      success: true,
      results: {
        articlesAdded: totalArticles,
        articlesSkipped: skippedArticles
      },
      stats: {
        totalPublishedArticles: totalPublishedArticles || 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Content refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also allow GET requests to trigger refresh
export async function GET() {
  return POST()
} 