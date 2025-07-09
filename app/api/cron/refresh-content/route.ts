import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CONTENT_SOURCES, RELEVANT_KEYWORDS, EXCLUDE_KEYWORDS, VERTICALS } from '../../../../lib/content-sources'
import { generateAIContent, generateMetricsAIContent } from '../../../../lib/ai-content-generator'
import Parser from 'rss-parser'
import { OpenAI } from 'openai'

const parser = new Parser()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Use OpenAI to assess if an article is relevant to sales intelligence
 */
async function assessSalesRelevanceWithAI(title: string, content: string, vertical: string): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ No OpenAI key - falling back to basic relevance check')
    // Fallback to simple exclusion check
    const combinedText = (title + ' ' + content).toLowerCase()
    const hasExcludedContent = EXCLUDE_KEYWORDS.some(keyword => 
      combinedText.includes(keyword)
    )
    return !hasExcludedContent
  }

  try {
    const prompt = `
You are an expert at identifying content relevant to enterprise sales professionals and business intelligence.

Analyze this article:
Title: ${title}
Content: ${content}
Vertical: ${vertical}

Is this article relevant to sales intelligence for enterprise sales professionals? Consider any content about:
- Business trends, market conditions, industry changes
- Technology adoption, platform updates, software developments
- Company news (acquisitions, funding, leadership changes, hiring)
- Revenue, budget, and spending trends
- Marketing, advertising, and sales technology
- Industry regulations affecting business
- Economic indicators affecting business
- Consumer behavior and market demand
- Digital transformation and business strategy
- Any business intelligence that helps sales professionals understand market conditions

Be INCLUSIVE - if it has business value for sales professionals, answer YES.
Only reject if it's clearly not business-related (sports, entertainment, personal health, etc.).

Respond with ONLY "YES" or "NO" - nothing else.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying sales intelligence content. Be INCLUSIVE - if it has business value for sales professionals, answer YES. Respond only with YES or NO."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 5,
    })

    const result = response.choices[0].message.content?.trim().toUpperCase()
    return result === 'YES'

  } catch (error) {
    console.error('Error assessing article relevance with AI:', error)
    // Fallback to simple exclusion check if AI fails
    const combinedText = (title + ' ' + content).toLowerCase()
    const hasExcludedContent = EXCLUDE_KEYWORDS.some(keyword => 
      combinedText.includes(keyword)
    )
    return !hasExcludedContent
  }
}

export async function GET(request: Request) {
  try {
    // Check if this is a Vercel cron job (internal call) or manual call
    const authHeader = request.headers.get('authorization')
    const userAgent = request.headers.get('user-agent')
    const isVercelCron = userAgent?.includes('vercel-cron') || 
                        request.headers.get('x-vercel-cron') === '1' ||
                        request.headers.get('x-vercel-deployment-url')
    
    // For manual calls, require CRON_SECRET
    if (!isVercelCron) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.log('🔄 Manual cron job triggered...')
    } else {
      console.log('🔄 Vercel cron job triggered...')
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔄 Starting systematic daily content refresh...')
    console.log('📅 Time:', new Date().toLocaleString())

    // Check if it's a weekday (Monday-Friday)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('⏸️  Skipping refresh - weekend detected')
      return NextResponse.json({ 
        success: true, 
        message: 'Skipped refresh - weekends only',
        isWeekend: true
      })
    }

    // STEP 1: Archive old content (older than 48 hours OR if we're refreshing on a new day)
    console.log('🗄️  Step 1: Archiving content older than 48 hours...')
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    
    // Get current published articles to check their age
    const { data: publishedArticles } = await supabase
      .from('articles')
      .select('id, publishedAt, createdAt')
      .eq('status', 'PUBLISHED')
    
    console.log(`📊 Found ${publishedArticles?.length || 0} published articles`)
    
    // Archive articles that are old OR were created more than 48 hours ago
    const articlesToArchive = publishedArticles?.filter(article => {
      const publishedDate = new Date(article.publishedAt)
      const createdDate = new Date(article.createdAt)
      const isOldByPublished = publishedDate < fortyEightHoursAgo
      const isOldByCreated = createdDate < fortyEightHoursAgo
      return isOldByPublished || isOldByCreated
    }) || []
    
    console.log(`📦 Archiving ${articlesToArchive.length} old articles`)
    
    if (articlesToArchive.length > 0) {
      const { error: archiveArticlesError } = await supabase
        .from('articles')
        .update({ 
          status: 'ARCHIVED',
          lastViewedAt: new Date().toISOString() 
        })
        .in('id', articlesToArchive.map(a => a.id))
      
      if (archiveArticlesError) {
        console.error('Error archiving old articles:', archiveArticlesError)
      }
    }

    // STEP 2: Process articles with 48-hour lookback using AI relevance assessment (NO REUSE)
    console.log('📰 Step 2: Processing articles with 48-hour lookback using AI relevance assessment...')
    let totalArticles = 0
    let skippedArticles = 0

    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        
        if (feed.items) {
          for (const item of feed.items.slice(0, 5)) { // Increased to 5 items per source
            try {
              if (!item.title || !item.link) continue

              // Check if article is from the last 48 hours (expanded lookback)
              const itemDate = item.pubDate ? new Date(item.pubDate) : new Date()
              if (itemDate < fortyEightHoursAgo) {
                continue // Skip articles older than 48 hours
              }

              // Check if article already exists (STRICT NO REUSE POLICY)
              const { data: existingArticle } = await supabase
                .from('articles')
                .select('id')
                .eq('sourceUrl', item.link)
                .single()

              if (existingArticle) {
                skippedArticles++
                continue
              }

              // Use OpenAI to determine relevance to sales intelligence
              const isRelevant = await assessSalesRelevanceWithAI(
                item.title,
                item.contentSnippet || item.content || '',
                source.vertical
              )

              if (!isRelevant) {
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

              // Create new article with AI content
              const { error: insertError } = await supabase
                .from('articles')
                .insert({
                  title: item.title,
                  summary: item.contentSnippet || item.content || null,
                  sourceUrl: item.link,
                  sourceName: source.name,
                  publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(), // Use actual RSS date
                  createdAt: new Date().toISOString(),
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

              // Rate limit to avoid overwhelming AI API
              await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (itemError) {
              console.error('Error processing item:', itemError)
              skippedArticles++
            }
          }
        }

      } catch (sourceError) {
        console.error(`Error fetching from ${source.name}:`, sourceError)
        skippedArticles++
      }
    }

    console.log(`📊 Processed ${totalArticles} articles, skipped ${skippedArticles} articles`)

    return NextResponse.json({ 
      success: true, 
      message: 'Content refresh completed',
      totalArticles: totalArticles,
      skippedArticles: skippedArticles
    })

  } catch (error) {
    console.error('Error refreshing content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}