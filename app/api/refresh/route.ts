import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import Parser from 'rss-parser'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS } from '@/lib/content-sources'

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
                whyItMatters: generateWhyItMatters(item.title, item.contentSnippet || ''),
                talkTrack: generateTalkTrack(item.title, source.vertical),
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

// Helper function to generate "Why It Matters" content
function generateWhyItMatters(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase()
  
  // Check for key themes and return relevant context
  if (text.includes('ai') || text.includes('artificial intelligence')) {
    return 'AI and automation are transforming marketing technology. Understanding these developments helps position solutions in the context of the industry\'s future.'
  }
  
  if (text.includes('privacy') || text.includes('cookie') || text.includes('gdpr')) {
    return 'Privacy changes are reshaping digital marketing. This impacts how brands think about customer data and personalization strategies.'
  }
  
  if (text.includes('retail') || text.includes('commerce')) {
    return 'The retail and commerce landscape is rapidly evolving. This affects how brands approach customer acquisition and retention.'
  }
  
  if (text.includes('data') || text.includes('analytics')) {
    return 'Data strategy is central to modern marketing. This development shows how the industry is evolving in its approach to customer insights.'
  }
  
  // Default response for other content
  return 'This industry development signals important changes in how enterprises approach marketing and customer engagement.'
}

// Helper function to generate talk tracks
function generateTalkTrack(title: string, vertical: string): string {
  const text = title.toLowerCase()
  
  // Vertical-specific talk tracks
  switch (vertical) {
    case 'Technology & Media':
      return `How is your team thinking about these technology changes? What impact do you see this having on your marketing strategy?`
    
    case 'Consumer & Retail':
      return `How are these retail industry changes affecting your customer engagement strategy? What opportunities do you see?`
    
    case 'Financial Services':
      return `How is your institution adapting to these market changes? What role does technology play in your strategy?`
    
    case 'Healthcare':
      return `How are these healthcare industry developments impacting your patient engagement approach? What challenges are you facing?`
    
    default:
      return `How do you see these industry changes affecting your business? What opportunities or challenges do they present?`
  }
} 