const { OpenAI } = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate AI-powered Why it Matters and Talk Track content
 * @param {string} title - Article title
 * @param {string} content - Article content/summary
 * @param {string} sourceName - Source publication name
 * @param {string} vertical - Industry vertical
 * @returns {Promise<{whyItMatters: string, talkTrack: string}>}
 */
async function generateAIContent(title, content, sourceName, vertical) {
  try {
    const prompt = `
You are a sales intelligence expert helping enterprise sales professionals in marketing technology, advertising technology, and media technology.

Article Details:
- Title: ${title}
- Content: ${content}
- Source: ${sourceName}
- Industry Vertical: ${vertical}

Generate two specific pieces of sales intelligence:

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

Be specific to THIS article, not generic. Reference actual details from the content.

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
          content: "You are a sales intelligence expert specializing in marketing and advertising technology. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    const result = JSON.parse(response.choices[0].message.content)
    return {
      whyItMatters: result.whyItMatters,
      talkTrack: result.talkTrack
    }

  } catch (error) {
    console.error('Error generating AI content:', error)
    
    // Fallback to improved generic content if AI fails
    return generateFallbackContent(title, content, vertical)
  }
}

/**
 * Improved fallback content generation
 */
function generateFallbackContent(title, content, vertical) {
  const text = `${title} ${content}`.toLowerCase()
  
  // More specific fallbacks based on content analysis
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
    return {
      whyItMatters: `AI adoption in ${vertical} is accelerating rapidly, with early adopters gaining significant competitive advantages. This development signals where the market is heading and what capabilities will become table stakes.`,
      talkTrack: `Reference this AI trend to discuss how your prospects' competitors might be leveraging similar technology, and position your solution in the context of this market evolution.`
    }
  }
  
  if (text.includes('privacy') || text.includes('cookie') || text.includes('gdpr') || text.includes('data')) {
    return {
      whyItMatters: `Privacy regulations and data changes are forcing immediate strategic shifts in how brands collect, process, and activate customer data. Companies that don't adapt quickly risk losing competitive positioning.`,
      talkTrack: `Use this development to discuss the urgency of building first-party data capabilities and ask prospects how they're preparing for these privacy changes.`
    }
  }
  
  if (text.includes('acquisition') || text.includes('merger') || text.includes('funding')) {
    return {
      whyItMatters: `Market consolidation and funding activities signal investor confidence in specific technology categories and business models. This impacts competitive dynamics and technology roadmaps across the industry.`,
      talkTrack: `Reference this market activity to discuss how industry consolidation might affect your prospect's vendor selection strategy and partnership decisions.`
    }
  }
  
  if (text.includes('retail') || text.includes('commerce') || text.includes('advertising')) {
    return {
      whyItMatters: `The retail media and commerce landscape is evolving rapidly, with new advertising formats and measurement capabilities creating opportunities for brands to reach customers more effectively.`,
      talkTrack: `Use this trend to explore how your prospects are thinking about retail media strategies and whether they're capturing their fair share of this growing opportunity.`
    }
  }
  
  // Generic but improved fallback
  return {
    whyItMatters: `This ${vertical} development represents a significant shift in industry dynamics that will impact how enterprises approach marketing technology strategy and vendor partnerships in the coming quarters.`,
    talkTrack: `Reference this trend to demonstrate your understanding of market forces affecting your prospects' business and position your solution as aligned with industry direction.`
  }
}

/**
 * Generate metrics-specific AI content
 */
async function generateMetricsAIContent(title, value, source, summary, vertical) {
  try {
    const prompt = `
You are a sales intelligence expert helping enterprise sales professionals understand key industry metrics.

Metric Details:
- Title: ${title}
- Value: ${value}
- Source: ${source}
- Summary: ${summary}
- Industry Vertical: ${vertical}

Generate two specific pieces of sales intelligence:

1. WHY IT MATTERS (2-3 sentences): Explain what this metric means for enterprise decision-makers:
   - Strategic implications for budgets and planning
   - Competitive benchmarking opportunities  
   - Market timing and trend insights
   - Risk or opportunity indicators

2. TALK TRACK (1-2 sentences): How sales professionals should reference this metric with prospects:
   - Creates urgency or validates investment
   - Positions the salesperson as data-driven
   - Opens conversation about prospect's performance
   - Demonstrates market knowledge

Be specific to THIS metric and its actual value, not generic.

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
          content: "You are a sales intelligence expert specializing in marketing and advertising technology metrics. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 350,
    })

    const result = JSON.parse(response.choices[0].message.content)
    return {
      whyItMatters: result.whyItMatters,
      talkTrack: result.talkTrack
    }

  } catch (error) {
    console.error('Error generating AI metrics content:', error)
    
    // Fallback for metrics
    return {
      whyItMatters: `This ${vertical} metric of ${value} provides important context for enterprise planning and competitive benchmarking in the current market environment.`,
      talkTrack: `Reference this ${value} metric to discuss industry performance standards and help prospects evaluate their competitive positioning.`
    }
  }
}

module.exports = {
  generateAIContent,
  generateMetricsAIContent,
  generateFallbackContent
} 