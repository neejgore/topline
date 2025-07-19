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
3. Create a compelling reason to engage based on industry trends and ${targetBrand}'s likely priorities
4. Keep it concise (150-200 words max)
5. Professional but conversational tone
6. Include a clear, specific call to action
7. Make it feel personalized and researched, not templated

EMAIL STRUCTURE:
- Subject line
- Opening with specific ${targetBrand} context
- Connection to the industry intelligence
- Value proposition relevant to ${targetBrand}
- Clear call to action
- Professional signature placeholder

FOCUS ON:
- How this ${type === 'metric' ? 'market data' : 'industry development'} impacts ${targetBrand} specifically
- ${targetBrand}'s likely business priorities and challenges
- Concrete value you can provide based on this intelligence
- Creating curiosity and urgency to respond

Generate the complete email now:
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert B2B sales professional who creates highly personalized prospecting emails. You have deep knowledge of enterprise technology companies and their business challenges. Your emails are researched, relevant, and create genuine curiosity. Always reference specific company context and make the industry intelligence directly relevant to their business.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 800,
  })

  const email = response.choices[0].message.content?.trim() || ''
  
  if (!email) {
    throw new Error('Failed to generate email content')
  }

  return email
} 