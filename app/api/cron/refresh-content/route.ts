import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CONTENT_SOURCES, EXCLUDE_KEYWORDS } from '../../../../lib/content-sources'
import { generateAIContent } from '../../../../lib/ai-content-generator'
import { classifyContentVertical } from '../../../../lib/content-classifier'
import { calculateRelevanceScore } from '../../../../lib/relevance-scorer'
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

APPROVAL CRITERIA: Accept articles that provide business intelligence for sales professionals in target verticals: Technology & Media, Consumer & Retail, Healthcare, Financial Services, Insurance, Automotive, Travel & Hospitality, Education, Telecom, Services, Political Candidate & Advocacy.

REJECTION CRITERIA: Reject only if clearly irrelevant (sports, entertainment, personal health, celebrity news, or clearly non-business content).

Be moderately inclusive - when in doubt, approve business-related content.

Respond with ONLY "YES" or "NO" - nothing else.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying sales intelligence content for target business verticals. Be moderately inclusive - approve business-related content unless clearly irrelevant. Respond only with YES or NO."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Increased from 0.1 for more balanced responses
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

    // STEP 1: Archive old content (older than 24 hours)
    console.log('🗄️  Step 1: Archiving content older than 24 hours...')
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const { data: publishedArticles } = await supabase
      .from('articles')
      .select('id, publishedAt, createdAt')
      .eq('status', 'PUBLISHED')
    
    console.log(`📊 Found ${publishedArticles?.length || 0} published articles`)
    
    const articlesToArchive = publishedArticles?.filter(article => {
      const publishedDate = new Date(article.publishedAt)
      const createdDate = new Date(article.createdAt)
      return publishedDate < twentyFourHoursAgo || createdDate < twentyFourHoursAgo
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
              console.log(`\n🔍 DEBUGGING ITEM: ${item.title}`)
              console.log(`📅 Item date: ${item.pubDate}`)
              console.log(`🔗 Item URL: ${item.link}`)
              
              if (!item.title || !item.link) {
                console.log(`❌ SKIP: Missing title or link`)
                continue
              }

              // Check if article is from the last 24 hours
              const itemDate = item.pubDate ? new Date(item.pubDate) : new Date()
              console.log(`⏰ Item date parsed: ${itemDate.toISOString()}`)
              console.log(`⏰ 24h cutoff: ${twentyFourHoursAgo.toISOString()}`)
              console.log(`⏰ Is recent? ${itemDate >= twentyFourHoursAgo}`)
              
              if (itemDate < twentyFourHoursAgo) {
                console.log(`❌ SKIP: Article too old`)
                continue
              }

              // Strict no-reuse policy: Check if article already exists
              console.log(`🔍 Checking for duplicates...`)
              const { data: existingArticle, error: checkError } = await supabase
                .from('articles')
                .select('id')
                .eq('sourceUrl', item.link)
                .single()

              console.log(`📊 Duplicate check result: ${existingArticle ? 'FOUND' : 'NOT FOUND'}`)
              if (checkError) {
                console.log(`🔍 Duplicate check error: ${checkError.message}`)
              }

              if (existingArticle) {
                console.log(`❌ SKIP: Article already exists (id: ${existingArticle.id})`)
                skippedArticles++
                continue
              }

              // OpenAI-powered relevance assessment for target verticals
              console.log(`🤖 AI assessing relevance...`)
              const isRelevant = await assessSalesRelevanceWithAI(
                item.title,
                item.contentSnippet || item.content || '',
                source.vertical
              )

              console.log(`🤖 AI relevance result: ${isRelevant ? 'APPROVED' : 'REJECTED'}`)

              if (!isRelevant) {
                console.log(`❌ SKIP: AI rejected relevance`)
                skippedArticles++
                continue
              }

              console.log(`✅ PROCESSING: All checks passed, generating AI content...`)
              
              // Generate AI-powered content with enhanced intelligence
              const aiContent = await generateAIContent(
                item.title,
                item.contentSnippet || item.content || '',
                source.name,
                source.vertical
              )

              console.log(`✅ AI content generated successfully`)
              
              // AI-based content classification to ensure accurate vertical assignment
              console.log(`🔍 Classifying content vertical...`)
              const correctVertical = await classifyContentVertical(
                item.title,
                item.contentSnippet || item.content || '',
                source.vertical
              )
              
              // AI-powered relevance scoring for intelligent prioritization
              console.log(`🔢 Calculating relevance score...`)
              const relevanceScore = await calculateRelevanceScore(
                item.title,
                item.contentSnippet || item.content || '',
                aiContent.whyItMatters,
                aiContent.talkTrack,
                correctVertical,
                source.name
              )
              
              console.log(`💾 INSERTING into database...`)

              // Create article with full AI intelligence
              const articleData = {
                id: Math.floor(Math.random() * 1000000000), // Generate unique ID
                title: item.title,
                summary: item.contentSnippet || item.content || null,
                sourceUrl: item.link,
                sourceName: source.name,
                publishedAt: itemDate.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(), // Add required updatedAt field
                vertical: correctVertical, // Use AI-classified vertical instead of source vertical
                status: 'PUBLISHED',
                priority: source.priority,
                category: 'NEWS',
                whyItMatters: aiContent.whyItMatters,
                talkTrack: aiContent.talkTrack,
                importanceScore: relevanceScore, // AI-calculated relevance score
                views: 0,
                clicks: 0,
                shares: 0
              }

              console.log(`📝 Article data: ${JSON.stringify({
                title: articleData.title,
                sourceUrl: articleData.sourceUrl,
                vertical: articleData.vertical,
                status: articleData.status
              })}`)

              const { data: insertResult, error: insertError } = await supabase
                .from('articles')
                .insert(articleData)
                .select()

              if (insertError) {
                console.error('❌ DATABASE ERROR:', JSON.stringify(insertError, null, 2))
                skippedArticles++
                continue
              }

              console.log(`✅ SUCCESS: Article inserted with ID: ${insertResult?.[0]?.id}`)
              totalArticles++

              // Rate limit to avoid overwhelming OpenAI
              await new Promise(resolve => setTimeout(resolve, 2000))

            } catch (itemError) {
              console.error('❌ ITEM ERROR:', itemError)
              skippedArticles++
            }
          }
        }

      } catch (sourceError) {
        console.error(`❌ Error fetching from ${source.name}:`, sourceError)
        skippedArticles++
      }
    }

    // STEP 3: Publish fresh metric daily
    console.log('📊 Step 3: Publishing fresh daily metric...')
    
    // Target verticals (from memory requirement)
    const VERTICALS = [
      'Technology & Media',
      'Consumer & Retail', 
      'Healthcare',
      'Financial Services',
      'Insurance',
      'Automotive',
      'Travel & Hospitality',
      'Education',
      'Telecom',
      'Services',
      'Political Candidate & Advocacy',
      'Other'
    ]
    
    try {
      // Archive current published metrics
      const { data: currentMetrics } = await supabase
        .from('metrics')
        .select('id, title')
        .eq('status', 'PUBLISHED')
      
      if (currentMetrics && currentMetrics.length > 0) {
        console.log(`📦 Archiving ${currentMetrics.length} current metrics...`)
        await supabase
          .from('metrics')
          .update({ 
            status: 'ARCHIVED',
            lastViewedAt: new Date().toISOString()
          })
          .eq('status', 'PUBLISHED')
      }
      
      // Get available metrics (allow reuse after 7 days, only from target verticals)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      
      const { data: availableMetrics } = await supabase
        .from('metrics')
        .select('*')
        .gte('createdAt', ninetyDaysAgo.toISOString())
        .eq('status', 'ARCHIVED')
        .in('vertical', VERTICALS)
        .or(`lastViewedAt.is.null,lastViewedAt.lt.${sevenDaysAgo.toISOString()}`)
        .order('createdAt', { ascending: false })
      
      console.log(`📊 Found ${availableMetrics?.length || 0} available metrics`)
      
      if (availableMetrics && availableMetrics.length > 0) {
        // Select 1 metric (the newest available from target verticals)
        const selectedMetric = availableMetrics[0]
        
        // Publish the selected metric with updated publishedAt date
        const { error: publishError } = await supabase
          .from('metrics')
          .update({ 
            status: 'PUBLISHED',
            publishedAt: new Date().toISOString(),
            lastViewedAt: new Date().toISOString()
          })
          .eq('id', selectedMetric.id)
        
        if (publishError) {
          console.error('❌ Error publishing metric:', publishError)
        } else {
          console.log(`✅ Published metric: ${selectedMetric.title} (${selectedMetric.value} ${selectedMetric.unit})`)
          console.log(`📊 Vertical: ${selectedMetric.vertical}`)
        }
      } else {
        console.log('⚠️  No available metrics to publish')
      }
      
    } catch (metricError) {
      console.error('❌ Error in metric publishing:', metricError)
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