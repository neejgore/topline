import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { targetBrand, content, type } = await request.json()

    if (!targetBrand || !content) {
      return NextResponse.json({
        success: false,
        error: 'Target brand and content are required'
      }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    console.log(`🤖 Generating prospecting email for ${targetBrand} using ${type}: ${content.title}`)

    // Generate the personalized prospecting email
    const email = await generateProspectingEmail(targetBrand, content, type)

    console.log(`✅ Generated prospecting email for ${targetBrand}`)

    return NextResponse.json({
      success: true,
      email
    })

  } catch (error) {
    console.error('❌ Error generating prospecting email:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate email'
    }, { status: 500 })
  }
}

async function generateProspectingEmail(
  targetBrand: string, 
  content: any, 
  type: 'article' | 'metric'
): Promise<string> {
  
  // Create context-specific prompt based on article or metric
  const contextInfo = type === 'metric' 
    ? `Key Metric: ${content.title} - ${content.value}${content.unit || ''}
       Why It Matters: ${content.whyItMatters || ''}
       Sales Starter: ${content.talkTrack || ''}
       Source: ${content.source || ''}
       Source URL: ${content.sourceUrl || ''}`
    : `Article: ${content.title}
       Summary: ${content.summary || ''}
       Why It Matters: ${content.whyItMatters || ''}
       Sales Starter: ${content.talkTrack || ''}
       Source: ${content.source || ''}
       Source URL: ${content.sourceUrl || ''}`

  const prompt = `
You are an expert B2B sales professional specializing in creating compelling prospecting emails for enterprise software and technology sales.

Generate a personalized prospecting email to ${targetBrand} using the following industry intelligence:

${contextInfo}

EMAIL REQUIREMENTS:
 1. NEVER make up personal details, names, or specific strategies about individuals
 2. Focus ONLY on publicly verifiable company information (industry, recent news, business model)
 3. Lead with the SPECIFIC data/insight from the source material, not personal assumptions
 4. ALWAYS include the source link for credibility 
 5. Provide substantial value (120-180 words) while remaining scannable with short paragraphs
 6. Professional but conversational tone
 7. Single, clear call to action

 EMAIL STRUCTURE:
 - Subject line (6-8 words max)  
 - Lead with the specific data/insight and source link (2-3 sentences)
 - Deeper analysis of what this means for ${targetBrand}'s industry/market (2-3 sentences)
 - Specific implications or opportunities this creates (1-2 sentences)
 - Call to action offering to share more insights (1 sentence)
 - Professional signature placeholder

 FOCUS ON:
 - DEMONSTRATING INDUSTRY EXPERTISE through specific data and analysis
 - SPECIFIC data/insights from the source material with deeper interpretation
 - SUBSTANTIAL VALUE that shows you understand the market dynamics
 - How this ${type === 'metric' ? 'market data' : 'industry development'} creates specific opportunities or challenges
 - Including the source URL for credibility and further reading
 - THOUGHT LEADERSHIP positioning through insightful analysis
 - One clear call to action offering additional expertise
 - Scannable format with short paragraphs despite more content

Generate the complete email now:
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert B2B sales professional who creates highly effective prospecting emails that demonstrate industry expertise. Your emails provide substantial value through deep market insights, specific data analysis, and thought leadership. They get opened, read, and replied to because they show genuine industry knowledge and provide actionable intelligence. You never fabricate personal details but focus on demonstrating expertise through quality analysis of real market data and trends.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 700,
  })

  const email = response.choices[0].message.content?.trim() || ''
  
  if (!email) {
    throw new Error('Failed to generate email content')
  }

  return email
} 