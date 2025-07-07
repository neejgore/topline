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
 * Generate metrics-specific AI content with deep business intelligence
 */
async function generateMetricsAIContent(title, value, source, summary, vertical) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required - no generic fallbacks allowed')
  }

  try {
    // Extract key information from the metric
    const metricType = detectMetricType(title, value)
    const valueAnalysis = analyzeMetricValue(value, title)
    
    const prompt = `
You are a senior sales intelligence analyst helping enterprise sales professionals understand critical industry metrics for strategic conversations.

METRIC ANALYSIS:
- Title: ${title}
- Value: ${value}
- Source: ${source}
- Summary: ${summary}  
- Industry Vertical: ${vertical}
- Metric Type: ${metricType}
- Value Context: ${valueAnalysis}

Create two highly specific pieces of sales intelligence:

1. WHY IT MATTERS (3-4 sentences):
   - Start with the SPECIFIC BUSINESS IMPACT of this exact metric value
   - Explain what this number reveals about market conditions, budget allocations, or competitive landscape
   - Include strategic implications for enterprise decision-makers
   - Reference specific business scenarios where this metric becomes relevant
   - Never use generic phrases like "dramatically" or "significant shift"

2. TALK TRACK (2-3 sentences):
   - Create a compelling conversation starter that references the EXACT metric value
   - Position the salesperson as a data-driven market expert
   - Include a strategic question that uncovers the prospect's situation
   - Make it actionable for immediate use in sales conversations

REQUIREMENTS:
- Reference the exact metric value (${value}) in your response
- Be specific to the ${vertical} industry vertical
- Use concrete business language, not marketing fluff
- Focus on actionable insights, not generic trends
- Include specific numbers, percentages, or market comparisons where relevant

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
          content: `You are a sales intelligence expert with 15 years of experience in ${vertical} market analysis. Your specialty is translating complex market data into actionable sales insights. Always reference specific metric values and avoid generic language. Focus on business impact and strategic implications.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
    const result = JSON.parse(cleanContent)
    
    // Validate that the content is specific and references the metric value
    if (!isMetricContentSpecific(result, value, title, vertical)) {
      throw new Error('Generated content is too generic - retry with more specific prompt')
    }
    
    return {
      whyItMatters: result.whyItMatters,
      talkTrack: result.talkTrack
    }

  } catch (error) {
    console.error('Error generating AI metrics content:', error)
    
    // Retry with enhanced prompt if first attempt fails
    try {
      return await generateMetricsAIContentEnhanced(title, value, source, summary, vertical)
    } catch (retryError) {
      console.error('Retry also failed:', retryError)
      throw new Error(`Failed to generate specific metrics AI content: ${retryError.message}`)
    }
  }
}

/**
 * Enhanced metrics AI content generation with more specific prompting
 */
async function generateMetricsAIContentEnhanced(title, value, source, summary, vertical) {
  const businessContext = getBusinessContext(vertical)
  const metricInsights = getMetricInsights(title, value, vertical)
  
  const prompt = `
SALES INTELLIGENCE BRIEF

Metric: ${title}
Value: ${value}
Industry: ${vertical}
Context: ${businessContext}

ANALYSIS FRAMEWORK:
${metricInsights}

Generate executive-level sales intelligence:

WHY IT MATTERS:
- What does ${value} specifically mean for ${vertical} leaders?
- How does this metric impact budget planning and strategic priorities?
- What competitive advantages or risks does this reveal?
- What business decisions should this metric influence?

TALK TRACK:
- Reference the specific ${value} metric in a conversation starter
- Position yourself as having market intelligence
- Ask a strategic question that reveals the prospect's position
- Make it immediately usable in a sales call

Be specific to this exact metric and value. No generic market commentary.

JSON:
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
        content: `You are a ${vertical} industry analyst helping enterprise sales teams. Focus on specific business implications of the exact metric value provided. Use concrete numbers and avoid generic phrases.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.9,
    max_tokens: 450,
  })

  const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
  const result = JSON.parse(cleanContent)
  
  return {
    whyItMatters: result.whyItMatters,
    talkTrack: result.talkTrack
  }
}

/**
 * Detect the type of metric for better analysis
 */
function detectMetricType(title, value) {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('sales') || titleLower.includes('revenue') || titleLower.includes('spending')) {
    return 'Revenue/Sales Metric'
  } else if (titleLower.includes('growth') || titleLower.includes('increase') || titleLower.includes('up')) {
    return 'Growth Metric'
  } else if (titleLower.includes('market') || titleLower.includes('share')) {
    return 'Market Size/Share Metric'
  } else if (titleLower.includes('adoption') || titleLower.includes('usage')) {
    return 'Adoption/Usage Metric'
  } else if (titleLower.includes('cost') || titleLower.includes('price')) {
    return 'Cost/Pricing Metric'
  } else {
    return 'Performance Metric'
  }
}

/**
 * Analyze the metric value for business context
 */
function analyzeMetricValue(value, title) {
  const valueStr = value.toString()
  
  if (valueStr.includes('$') && valueStr.includes('B')) {
    return 'Large market size in billions - indicates major industry opportunity'
  } else if (valueStr.includes('$') && valueStr.includes('M')) {
    return 'Medium market size in millions - indicates growing segment'
  } else if (valueStr.includes('%') && parseInt(valueStr) > 50) {
    return 'High percentage - indicates strong market adoption or growth'
  } else if (valueStr.includes('%') && parseInt(valueStr) > 20) {
    return 'Moderate percentage - indicates significant market movement'
  } else if (valueStr.includes('%') && parseInt(valueStr) > 0) {
    return 'Growth percentage - indicates positive market trend'
  } else {
    return 'Quantitative metric - indicates measurable business impact'
  }
}

/**
 * Get business context for the vertical
 */
function getBusinessContext(vertical) {
  const contexts = {
    'Consumer & Retail': 'Focus on customer acquisition costs, digital transformation, omnichannel strategies, and competitive differentiation',
    'Technology & Media': 'Focus on digital advertising efficiency, programmatic capabilities, attribution modeling, and marketing technology ROI',
    'Financial Services': 'Focus on customer acquisition costs, digital transformation, regulatory compliance, and competitive positioning',
    'Healthcare': 'Focus on patient acquisition, digital health adoption, regulatory compliance, and care delivery efficiency',
    'Automotive': 'Focus on digital marketing effectiveness, customer journey optimization, and brand differentiation',
    'Travel & Hospitality': 'Focus on booking optimization, customer experience, and revenue management',
    'Education': 'Focus on student acquisition, digital learning effectiveness, and institutional competitiveness',
    'Insurance': 'Focus on risk assessment, customer acquisition, and digital transformation',
    'Telecom': 'Focus on customer retention, 5G adoption, and service differentiation',
    'Services': 'Focus on client acquisition, service delivery efficiency, and market positioning'
  }
  
  return contexts[vertical] || 'Focus on operational efficiency, competitive positioning, and strategic investment priorities'
}

/**
 * Get specific insights framework for the metric
 */
function getMetricInsights(title, value, vertical) {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('social commerce') || titleLower.includes('social media sales')) {
    return `
- Social commerce represents direct sales through social platforms
- ${value} indicates the scale of social-driven revenue
- Key for ${vertical} companies evaluating social media ROI
- Relevant for marketing budget allocation and channel strategy`
  } else if (titleLower.includes('ad spend') || titleLower.includes('advertising')) {
    return `
- Advertising spend indicates market investment levels
- ${value} shows competitive intensity in the market
- Critical for ${vertical} companies planning media budgets
- Benchmark for competitive spending analysis`
  } else if (titleLower.includes('market size') || titleLower.includes('market value')) {
    return `
- Market size indicates total addressable market
- ${value} represents the revenue opportunity
- Essential for ${vertical} companies evaluating market entry
- Key metric for strategic planning and investment decisions`
  } else {
    return `
- This metric indicates important market dynamics
- ${value} provides a key benchmark for the industry
- Relevant for ${vertical} companies making strategic decisions
- Important for competitive positioning and planning`
  }
}

/**
 * Validate that metrics content is specific and references the metric value
 */
function isMetricContentSpecific(content, value, title, vertical) {
  const { whyItMatters, talkTrack } = content
  const fullContent = `${whyItMatters} ${talkTrack}`.toLowerCase()
  
  // Must reference the specific metric value
  const valueStr = value.toString().replace(/[^\w\d]/g, '')
  const hasValueReference = fullContent.includes(valueStr.toLowerCase()) || 
                           fullContent.includes(value.toString().toLowerCase())
  
  // Must reference the vertical
  const hasVerticalReference = fullContent.includes(vertical.toLowerCase()) ||
                              fullContent.includes(vertical.split(' ')[0].toLowerCase())
  
  // Must not contain generic phrases
  const genericPhrases = [
    'dramatically',
    'significant shift',
    'market is evolving',
    'trends are changing',
    'digital transformation',
    'customer behavior is shifting'
  ]
  
  const hasGenericPhrases = genericPhrases.some(phrase => 
    fullContent.includes(phrase.toLowerCase())
  )
  
  return hasValueReference && hasVerticalReference && !hasGenericPhrases
}

module.exports = {
  generateAIContent,
  generateMetricsAIContent
} 