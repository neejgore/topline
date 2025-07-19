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
       Source: ${content.source || ''}`
    : `Article: ${content.title}
       Summary: ${content.summary || ''}
       Why It Matters: ${content.whyItMatters || ''}
       Sales Starter: ${content.talkTrack || ''}
       Source: ${content.source || ''}`

  const prompt = `
You are an expert B2B sales professional specializing in creating compelling prospecting emails for enterprise software and technology sales.

Generate a personalized prospecting email to ${targetBrand} using the following industry intelligence:

${contextInfo}

EMAIL REQUIREMENTS:
 1. RESEARCH ${targetBrand} and reference specific context about their business, recent news, challenges, or initiatives  
 2. Use the provided ${type} data as a conversation starter and value proposition
 3. Keep it VERY SHORT (50-75 words MAX) - outbound emails must be scannable
 4. Professional but conversational tone
 5. Single, clear call to action
 6. Make it feel personalized and researched, not templated
 7. Mobile-friendly with short paragraphs

 EMAIL STRUCTURE:
 - Subject line (6-8 words max)
 - Brief opening with ${targetBrand} context (1 sentence)
 - Quick connection to the industry intelligence (1 sentence)
 - Simple call to action (1 sentence)
 - Professional signature placeholder

 FOCUS ON:
 - BREVITY - every word must add value
 - How this ${type === 'metric' ? 'market data' : 'industry development'} impacts ${targetBrand} specifically
 - Creating curiosity with minimal text
 - One clear, easy call to action
 - Making it scannable in 10 seconds or less

Generate the complete email now:
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert B2B sales professional who creates highly effective short prospecting emails. You follow modern outbound best practices: keep emails under 75 words, use short paragraphs, create curiosity quickly, and include one clear CTA. Your emails get opened, read, and replied to because they're brief, personalized, and valuable. Every word counts.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 400,
  })

  const email = response.choices[0].message.content?.trim() || ''
  
  if (!email) {
    throw new Error('Failed to generate email content')
  }

  return email
} 