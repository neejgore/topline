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
    // Format the value properly for consistent reference
    const formattedValue = formatValueWithUnit(value, detectUnit(value, title))
    
    console.log(`🤖 Generating SPECIFIC AI content for metric: "${title}" = ${formattedValue}`)
    
    const prompt = `
You are a senior sales intelligence analyst helping enterprise sales professionals understand critical industry metrics.

CRITICAL REQUIREMENT: Your response must SPECIFICALLY reference the exact metric value "${formattedValue}" multiple times and explain what THIS SPECIFIC NUMBER means. Do NOT write generic industry commentary.

METRIC TO ANALYZE:
- Title: ${title}
- Specific Value: ${formattedValue}
- Source: ${source}
- Summary: ${summary}
- Industry: ${vertical}

Create sales intelligence that is 100% SPECIFIC to the ${formattedValue} figure:

1. WHY IT MATTERS (3-4 sentences):
   - Start with "The ${formattedValue} figure reveals..." or "This ${formattedValue} investment means..."
   - Explain what THIS SPECIFIC NUMBER indicates about market conditions, budget priorities, or competitive landscape
   - Include specific business implications of THIS EXACT VALUE
   - Reference the ${formattedValue} amount at least twice in your response
   - Be specific about what this number means for enterprise decision-makers

2. TALK TRACK (2-3 sentences):
   - Create a conversation starter that mentions the EXACT ${formattedValue} figure
   - Example: "I just saw that [industry] is investing ${formattedValue} in [area] - how does that compare to your current budget allocation?"
   - Include a strategic question that uses the specific number
   - Make it immediately usable in a sales conversation with the exact figure

EXAMPLES OF GOOD RESPONSES:
- "The $74.8 billion investment reveals that financial services are prioritizing digital transformation at unprecedented levels. This $74.8 billion allocation represents a 23% increase from 2023, indicating..."
- "I noticed financial services invested $74.8 billion in digital transformation this year - how does your current technology budget compare to this industry trend?"

EXAMPLES OF BAD RESPONSES (DO NOT DO THIS):
- "Digital transformation is accelerating rapidly" (too generic)
- "Financial services are modernizing" (doesn't mention the $74.8 billion)
- "This trend shows market evolution" (no specific number reference)

REQUIREMENTS:
- Reference the exact ${formattedValue} figure multiple times
- Be specific to the ${vertical} industry
- No generic industry commentary
- Focus on what THIS SPECIFIC NUMBER means
- Include actionable insights for sales professionals
- Use the exact value in conversation starters

Format as JSON:
{
  "whyItMatters": "The ${formattedValue} figure reveals...",
  "talkTrack": "I just saw that... ${formattedValue}... how does that compare to your..."
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a sales intelligence expert specializing in ${vertical} market analysis. Your specialty is analyzing specific metric values and their business implications. ALWAYS reference the exact metric value multiple times in your response. Never write generic industry commentary.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
    })

    const cleanContent = extractJsonFromMarkdown(response.choices[0].message.content)
    const result = JSON.parse(cleanContent)
    
    // STRICT validation - must reference the specific value
    if (!validateMetricContentSpecificity(result, formattedValue, title)) {
      console.log(`❌ Generated content doesn't reference ${formattedValue}, retrying with enhanced prompt...`)
      return await generateMetricsAIContentWithStrictValidation(title, value, source, summary, vertical)
    }
    
    console.log(`✅ Generated SPECIFIC content referencing ${formattedValue}`)
    return {
      whyItMatters: result.whyItMatters,
      talkTrack: result.talkTrack
    }

  } catch (error) {
    console.error('Error generating AI metrics content:', error)
    throw new Error(`Failed to generate specific metrics AI content: ${error.message}`)
  }
}

/**
 * Enhanced generation with strict validation
 */
async function generateMetricsAIContentWithStrictValidation(title, value, source, summary, vertical) {
  const formattedValue = formatValueWithUnit(value, detectUnit(value, title))
  
  const prompt = `
URGENT: Generate sales intelligence that MUST reference "${formattedValue}" exactly.

Metric: ${title} = ${formattedValue}
Industry: ${vertical}
Source: ${source}

STRICT REQUIREMENTS:
1. WHY IT MATTERS must start with "The ${formattedValue} figure..." or "This ${formattedValue} investment..."
2. TALK TRACK must include the exact phrase "${formattedValue}" in a conversation starter
3. Both responses must reference the specific number multiple times
4. NO generic industry trends - only specific analysis of THIS NUMBER

Example format:
{
  "whyItMatters": "The ${formattedValue} figure reveals that ${vertical} companies are allocating unprecedented resources to [specific area]. This ${formattedValue} investment represents...",
  "talkTrack": "I just saw that ${vertical} organizations are investing ${formattedValue} in [area] - how does your current [relevant budget/strategy] compare to this industry benchmark?"
}

Write your response now - it MUST reference ${formattedValue} multiple times:
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You MUST reference the exact metric value "${formattedValue}" multiple times in your response. Any response that doesn't include this specific value will be rejected.`
      },
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
  
  // Final validation - if this fails, throw an error
  if (!validateMetricContentSpecificity(result, formattedValue, title)) {
    throw new Error(`AI failed to generate content referencing ${formattedValue} after multiple attempts`)
  }
  
  return {
    whyItMatters: result.whyItMatters,
    talkTrack: result.talkTrack
  }
}

/**
 * Strict validation that content references the specific metric value
 */
function validateMetricContentSpecificity(content, formattedValue, title) {
  const { whyItMatters, talkTrack } = content
  const fullContent = `${whyItMatters} ${talkTrack}`.toLowerCase()
  
  // Extract the numeric value from formattedValue for flexible matching
  const numericValue = formattedValue.replace(/[^\d.]/g, '')
  const valueWords = formattedValue.toLowerCase().split(/[\s\$,%]+/).filter(word => word.length > 0)
  
  // Check if the content references the specific value
  const hasNumericReference = fullContent.includes(numericValue)
  const hasValueReference = valueWords.some(word => fullContent.includes(word))
  const hasFormattedReference = fullContent.includes(formattedValue.toLowerCase())
  
  // Count how many times the value is referenced
  const referenceCount = (fullContent.match(new RegExp(numericValue, 'g')) || []).length
  
  console.log(`🔍 Validation check for ${formattedValue}:`)
  console.log(`  - Has numeric reference (${numericValue}): ${hasNumericReference}`)
  console.log(`  - Has value reference: ${hasValueReference}`)
  console.log(`  - Has formatted reference: ${hasFormattedReference}`)
  console.log(`  - Reference count: ${referenceCount}`)
  
  // Must reference the value at least twice and in both sections
  const whyItMattersHasValue = whyItMatters.toLowerCase().includes(numericValue)
  const talkTrackHasValue = talkTrack.toLowerCase().includes(numericValue)
  
  return (hasNumericReference || hasValueReference) && referenceCount >= 2 && whyItMattersHasValue && talkTrackHasValue
}

/**
 * Format value with proper unit detection
 */
function formatValueWithUnit(value, unit) {
  if (!value) return 'N/A'
  
  // If unit is already included in value, return as is
  if (typeof value === 'string' && (value.includes('$') || value.includes('%') || value.includes('B') || value.includes('M'))) {
    return value
  }
  
  // Detect unit from value or title
  const detectedUnit = unit || detectUnit(value, '')
  
  if (detectedUnit) {
    if (detectedUnit === 'billion USD' || detectedUnit === 'billion') {
      return `$${value}B`
    }
    if (detectedUnit === 'million USD' || detectedUnit === 'million') {
      return `$${value}M`
    }
    if (detectedUnit === 'percentage' || detectedUnit === '%') {
      return `${value}%`
    }
    if (detectedUnit === 'billion USD' || detectedUnit.includes('billion')) {
      return `$${value} billion`
    }
    return `${value} ${detectedUnit}`
  }
  
  return value.toString()
}

/**
 * Detect unit from value or title
 */
function detectUnit(value, title) {
  const titleLower = title.toLowerCase()
  const valueLower = value.toString().toLowerCase()
  
  if (titleLower.includes('spend') || titleLower.includes('investment') || titleLower.includes('revenue')) {
    if (parseFloat(value) > 1000) return 'billion USD'
    if (parseFloat(value) > 1) return 'million USD'
  }
  
  if (titleLower.includes('rate') || titleLower.includes('percentage') || valueLower.includes('%')) {
    return 'percentage'
  }
  
  if (titleLower.includes('billion') || valueLower.includes('billion')) {
    return 'billion USD'
  }
  
  if (titleLower.includes('million') || valueLower.includes('million')) {
    return 'million USD'
  }
  
  return null
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

// Removed old validation function - replaced with validateMetricContentSpecificity above

module.exports = {
  generateAIContent,
  generateMetricsAIContent
} 