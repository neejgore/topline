const { OpenAI } = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Helper function to extract JSON from markdown code blocks
 */
function extractJsonFromMarkdown(content) {
  content = content.trim()
  if (content.startsWith('```json') && content.endsWith('```')) {
    return content.slice(7, -3).trim()
  } else if (content.startsWith('```') && content.endsWith('```')) {
    return content.slice(3, -3).trim()
  }
  return content
}

/**
 * Generate AI-powered Why it Matters and Talk Track content
 * @param {string} title - Article title
 * @param {string} content - Article content/summary
 * @param {string} sourceName - Source publication name
 * @param {string} vertical - Industry vertical
 * @returns {Promise<{whyItMatters: string, talkTrack: string}>}
 */
async function generateAIContent(title, content, sourceName, vertical) {
  // NO GENERIC FALLBACKS - Must generate specific content
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required - no generic fallbacks allowed')
  }

  // Try multiple approaches to ensure we get specific content
  const attempts = [
    // Attempt 1: Standard detailed prompt
    () => generateWithStandardPrompt(title, content, sourceName, vertical),
    // Attempt 2: Simplified prompt if standard fails
    () => generateWithSimplifiedPrompt(title, content, sourceName, vertical),
    // Attempt 3: Fallback to different model if needed
    () => generateWithFallbackModel(title, content, sourceName, vertical)
  ]

  for (let i = 0; i < attempts.length; i++) {
    try {
      console.log(`🤖 AI Content Generation - Attempt ${i + 1} for: ${title.substring(0, 50)}...`)
      const result = await attempts[i]()
      
      // Validate that content is specific (not generic)
      if (isContentSpecific(result, title, content)) {
        console.log(`✅ Generated specific AI content on attempt ${i + 1}`)
        return result
      } else {
        console.log(`❌ Generated generic content on attempt ${i + 1}, retrying...`)
        continue
      }
    } catch (error) {
      console.error(`❌ AI Content Generation attempt ${i + 1} failed:`, error.message)
      if (i === attempts.length - 1) {
        throw new Error(`All AI content generation attempts failed. Last error: ${error.message}`)
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

/**
 * Standard detailed prompt approach
 */
async function generateWithStandardPrompt(title, content, sourceName, vertical) {
  const prompt = `
You are a sales intelligence expert helping enterprise sales professionals in marketing technology, advertising technology, and media technology.

Article Details:
- Title: ${title}
- Content: ${content}
- Source: ${sourceName}
- Industry Vertical: ${vertical}

Generate two SPECIFIC pieces of sales intelligence based on the EXACT content of this article:

1. WHY IT MATTERS (2-3 sentences): Explain the specific business implications of this development for enterprise decision-makers. Focus on:
   - Direct impact on budgets, strategy, or operations
   - Competitive implications
   - Technology adoption trends
   - Market timing considerations

2. TALK TRACK (1-2 sentences): Provide a specific conversation starter or reference point for sales professionals to use with prospects. Should be:
   - Actionable and practical
   - Relevant to prospect pain points
   - Creates urgency or interest
   - Positions the salesperson as knowledgeable

CRITICAL: Be specific to THIS article, not generic. Reference actual details from the content. Do not use generic language about "AI adoption" or "market trends" unless specifically relevant to the article content.

Format your response as JSON:
{
  "whyItMatters": "...",
  "talkTrack": "..."
}
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a sales intelligence expert specializing in marketing and advertising technology. Always respond with valid JSON. Never use generic language - always be specific to the article content."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
  const result = JSON.parse(cleanContent)
  return {
    whyItMatters: result.whyItMatters,
    talkTrack: result.talkTrack
  }
}

/**
 * Simplified prompt approach
 */
async function generateWithSimplifiedPrompt(title, content, sourceName, vertical) {
  const prompt = `
Create sales intelligence for this article:
Title: ${title}
Content: ${content}
Source: ${sourceName}

Write specific insights about this article:
1. Why It Matters: What does this specific development mean for enterprise buyers?
2. Talk Track: How should sales professionals reference this specific news?

Be specific to this article's content, not generic.

JSON format:
{
  "whyItMatters": "...",
  "talkTrack": "..."
}
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.5,
    max_tokens: 400,
  })

  const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
  const result = JSON.parse(cleanContent)
  return {
    whyItMatters: result.whyItMatters,
    talkTrack: result.talkTrack
  }
}

/**
 * Fallback model approach
 */
async function generateWithFallbackModel(title, content, sourceName, vertical) {
  const prompt = `
Article: ${title}
Summary: ${content}
Source: ${sourceName}

Generate specific sales intelligence:
1. Why It Matters (specific to this article)
2. Talk Track (specific conversation starter)

JSON:
{
  "whyItMatters": "...",
  "talkTrack": "..."
}
`

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 300,
  })

  const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
  const result = JSON.parse(cleanContent)
  return {
    whyItMatters: result.whyItMatters,
    talkTrack: result.talkTrack
  }
}

/**
 * Check if content is specific (not generic)
 */
function isContentSpecific(content, title, articleContent) {
  const { whyItMatters, talkTrack } = content
  
  // Check for generic phrases that should never appear
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
  
  // Check if any generic phrases appear in the generated content
  const fullContent = `${whyItMatters} ${talkTrack}`.toLowerCase()
  const hasGenericPhrases = genericPhrases.some(phrase => 
    fullContent.includes(phrase.toLowerCase())
  )
  
  if (hasGenericPhrases) {
    return false
  }
  
  // Check for minimum specificity (must reference article-specific terms)
  const articleLowercase = `${title} ${articleContent}`.toLowerCase()
  const contentLowercase = fullContent
  
  // Look for specific terms from the article being referenced
  const articleWords = articleLowercase.match(/\b\w{4,}\b/g) || []
  const contentWords = contentLowercase.match(/\b\w{4,}\b/g) || []
  
  // At least 2 specific terms from the article should appear in the generated content
  const sharedWords = articleWords.filter(word => contentWords.includes(word))
  
  return sharedWords.length >= 2
}

/**
 * Generate metrics-specific AI content
 */
async function generateMetricsAIContent(title, value, source, summary, vertical) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required - no generic fallbacks allowed')
  }

  try {
    const prompt = `
You are a sales intelligence expert helping enterprise sales professionals understand key industry metrics.

Metric Details:
- Title: ${title}
- Value: ${value}
- Source: ${source}
- Summary: ${summary}
- Industry Vertical: ${vertical}

Generate two SPECIFIC pieces of sales intelligence based on this EXACT metric:

1. WHY IT MATTERS (2-3 sentences): Explain what this specific metric means for enterprise decision-makers:
   - Strategic implications for budgets and planning
   - Competitive benchmarking opportunities  
   - Market timing and trend insights
   - Risk or opportunity indicators

2. TALK TRACK (1-2 sentences): How sales professionals should reference this specific metric with prospects:
   - Creates urgency or validates investment
   - Positions the salesperson as data-driven
   - Opens conversation about prospect's performance
   - Demonstrates market knowledge

CRITICAL: Be specific to THIS metric and its actual value. Reference the exact number/percentage. Do not use generic language.

Format as JSON:
{
  "whyItMatters": "...",
  "talkTrack": "..."
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a sales intelligence expert specializing in marketing and advertising technology metrics. Always respond with valid JSON. Never use generic language - always be specific to the metric."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
    const result = JSON.parse(cleanContent)
    return {
      whyItMatters: result.whyItMatters,
      talkTrack: result.talkTrack
    }

  } catch (error) {
    console.error('Error generating AI metrics content:', error)
    throw new Error(`Failed to generate metrics AI content: ${error.message}`)
  }
}

module.exports = {
  generateAIContent,
  generateMetricsAIContent
} 