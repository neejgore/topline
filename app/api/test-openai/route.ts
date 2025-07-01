import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing OpenAI article evaluation...')

    // Test article for evaluation
    const testArticle = {
      title: "Marketing Automation Platform Salesforce Acquires Slack for $27.7B",
      summary: "Salesforce announced the acquisition of Slack Technologies to enhance their Customer 360 platform with communication and collaboration capabilities, creating an integrated work ecosystem.",
      sourceName: "AdExchanger"
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        testArticle,
        recommendation: 'Add OPENAI_API_KEY to environment variables'
      })
    }

    const prompt = `
Evaluate this marketing/advertising industry article for a sales intelligence platform:

Title: ${testArticle.title}
Summary: ${testArticle.summary}
Source: ${testArticle.sourceName}

Please provide:
1. Importance Score (1-10): How important is this for sales professionals in marketing/adtech?
2. Why It Matters: 1-2 sentences explaining business impact
3. Talk Track: Sales conversation starter for this news
4. Vertical: Best fit category (Healthcare, Financial Services, Consumer & Retail, Technology & Media, Services, etc.)
5. Priority: HIGH/MEDIUM/LOW

Focus on: AI/automation, privacy/compliance, mergers/acquisitions, technology changes, market shifts, revenue impact.

Respond in JSON format:
{
  "importanceScore": 8,
  "whyItMatters": "Brief explanation of business impact...",
  "talkTrack": "Conversation starter for sales...",
  "vertical": "Technology & Media",
  "priority": "HIGH"
}
`

    console.log('🤖 Calling OpenAI API...')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in marketing technology and advertising industry trends. Evaluate articles for their importance to sales professionals selling to marketing/advertising executives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `OpenAI API error: ${response.status} - ${errorText}`,
        testArticle
      }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'No content received from OpenAI',
        apiResponse: data,
        testArticle
      })
    }

    // Parse JSON response
    const evaluation = JSON.parse(content)

    return NextResponse.json({
      success: true,
      message: '🎉 OpenAI article evaluation working!',
      testArticle,
      openaiEvaluation: evaluation,
      apiUsage: data.usage,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ OpenAI test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
} 