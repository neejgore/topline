import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CONTENT_SOURCES, EXCLUDE_KEYWORDS } from '../../../../lib/content-sources'
import { generateAIContent } from '../../../../lib/ai-content-generator'
import { OpenAI } from 'openai'

const Parser = require('rss-parser')
const parser = new Parser()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Use OpenAI to assess if an article is relevant to sales intelligence for target verticals
 */
async function assessSalesRelevanceWithAI(title: string, content: string, vertical: string): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ No OpenAI key - falling back to basic relevance check')
    // Fallback: Accept articles from target verticals only
    const targetVerticals = [
      'Technology & Media', 'Consumer & Retail', 'Healthcare', 
      'Financial Services', 'Insurance', 'Automotive', 
      'Travel & Hospitality', 'Education', 'Telecom', 
      'Services', 'Political Candidate & Advocacy', 'Other'
    ]
    return targetVerticals.includes(vertical)
  }

  try {
    const prompt = `
You are an expert at identifying content relevant to enterprise sales professionals and business intelligence.

Analyze this article:
Title: ${title}
Content: ${content}
Vertical: ${vertical}

Is this article relevant to sales intelligence for enterprise sales professionals? Consider:
- Business trends, market conditions, industry developments
- Technology adoption, platform updates, software developments  
- Company news (acquisitions, funding, leadership changes, hiring)
- Revenue, budget, and spending trends
- Marketing, advertising, and sales technology developments
- Industry regulations affecting business operations
- Economic indicators affecting business decisions
- Consumer behavior and market demand shifts
- Digital transformation and business strategy
- Competition and market positioning intelligence

CRITICAL: Only approve articles that provide actionable business intelligence for sales professionals in target verticals: Technology & Media, Consumer & Retail, Healthcare, Financial Services, Insurance, Automotive, Travel & Hospitality, Education, Telecom, Services, Political Candidate & Advocacy.

Reject if: sports, entertainment, personal health, celebrity news, or irrelevant verticals.

Respond with ONLY "YES" or "NO" - nothing else.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying sales intelligence content for target business verticals. Be selective - only approve content with clear business value for sales professionals. Respond only with YES or NO."
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
    // Fallback: Check for excluded content
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

    console.log('🔄 Starting systematic daily content refresh with full AI intelligence...')
    console.log('📅 Time:', new Date().toLocaleString())

    // Check if it's a weekday (Monday-Friday only)
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

    // STEP 1: Archive old content (older than 48 hours)
    console.log('🗄️  Step 1: Archiving content older than 48 hours...')
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    
    const { data: publishedArticles } = await supabase
      .from('articles')
      .select('id, publishedAt, createdAt')
      .eq('status', 'PUBLISHED')
    
    console.log(`📊 Found ${publishedArticles?.length || 0} published articles`)
    
    const articlesToArchive = publishedArticles?.filter(article => {
      const publishedDate = new Date(article.publishedAt)
      const createdDate = new Date(article.createdAt)
      return publishedDate < fortyEightHoursAgo || createdDate < fortyEightHoursAgo
    }) || []
    
    console.log(`📦 Archiving ${articlesToArchive.length} old articles`)
    
    if (articlesToArchive.length > 0) {
      await supabase
        .from('articles')
        .update({ 
          status: 'ARCHIVED',
          lastViewedAt: new Date().toISOString() 
        })
        .in('id', articlesToArchive.map(a => a.id))
    }

    // STEP 2: Process articles with 48-hour lookback, AI relevance assessment, and strict no-reuse policy
    console.log('📰 Step 2: Processing articles with AI intelligence and no-reuse policy...')
    let totalArticles = 0
    let skippedArticles = 0

    for (const source of CONTENT_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`)
        
        const feed = await parser.parseURL(source.rssUrl)
        
        if (feed.items && feed.items.length > 0) {
          console.log(`📰 Found ${feed.items.length} items from ${source.name}`)
          
          for (const item of feed.items.slice(0, 3)) { // Process up to 3 items per source
            try {
              if (!item.title || !item.link) continue

              // Check if article is from the last 48 hours
              const itemDate = item.pubDate ? new Date(item.pubDate) : new Date()
              if (itemDate < fortyEightHoursAgo) {
                continue
              }

              // Strict no-reuse policy: Check if article already exists
              const { data: existingArticle } = await supabase
                .from('articles')
                .select('id')
                .eq('sourceUrl', item.link)
                .single()

              if (existingArticle) {
                skippedArticles++
                continue
              }

              // OpenAI-powered relevance assessment for target verticals
              console.log(`🤖 AI assessing relevance: ${item.title.substring(0, 50)}...`)
              const isRelevant = await assessSalesRelevanceWithAI(
                item.title,
                item.contentSnippet || item.content || '',
                source.vertical
              )

              if (!isRelevant) {
                console.log(`❌ AI rejected: ${item.title.substring(0, 50)}...`)
                skippedArticles++
                continue
              }

              console.log(`✅ AI approved: ${item.title.substring(0, 50)}...`)
              console.log(`🤖 Generating AI content...`)
              
              // Generate AI-powered content with enhanced intelligence
              const aiContent = await generateAIContent(
                item.title,
                item.contentSnippet || item.content || '',
                source.name,
                source.vertical
              )

              // Create article with full AI intelligence
              const { error: insertError } = await supabase
                .from('articles')
                .insert({
                  title: item.title,
                  summary: item.contentSnippet || item.content || null,
                  sourceUrl: item.link,
                  sourceName: source.name,
                  publishedAt: itemDate.toISOString(),
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
                console.error('❌ Database insertion error:', insertError)
                skippedArticles++
                continue
              }

              totalArticles++
              console.log(`✅ Successfully published with AI content: ${item.title.substring(0, 50)}...`)

              // Rate limit to avoid overwhelming OpenAI
              await new Promise(resolve => setTimeout(resolve, 2000))

            } catch (itemError) {
              console.error('❌ Error processing article:', itemError)
              skippedArticles++
            }
          }
        }

      } catch (sourceError) {
        console.error(`❌ Error fetching from ${source.name}:`, sourceError)
        skippedArticles++
      }
    }

    console.log(`🎉 Intelligent content refresh completed: ${totalArticles} articles published, ${skippedArticles} skipped`)

    return NextResponse.json({ 
      success: true, 
      message: 'Intelligent content refresh completed',
      totalArticles: totalArticles,
      skippedArticles: skippedArticles
    })

  } catch (error) {
    console.error('❌ Content refresh failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}