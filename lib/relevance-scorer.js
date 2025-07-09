const { OpenAI } = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Calculate relevance score for an article using AI
 * @param {string} title - Article title
 * @param {string} summary - Article summary/content
 * @param {string} whyItMatters - Why it matters content
 * @param {string} talkTrack - Talk track content
 * @param {string} vertical - Article vertical
 * @param {string} sourceName - Source publication
 * @returns {Promise<number>} - Relevance score (0-100)
 */
async function calculateRelevanceScore(title, summary, whyItMatters, talkTrack, vertical, sourceName) {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ No OpenAI key - using default scoring')
    return calculateDefaultScore(title, summary, vertical, sourceName)
  }

  try {
    console.log(`🔢 Calculating relevance score for: "${title.substring(0, 50)}..."`)

    const prompt = `
You are an expert at evaluating business content for sales professionals who sell marketing technology, email solutions, media/digital advertising platforms, and CRM systems to enterprise customers.

These sales professionals help companies acquire, grow, and retain customers through:
- Marketing automation and personalization platforms
- Email marketing and deliverability solutions  
- Digital advertising channels (programmatic, social, search, CTV)
- Customer data platforms and analytics
- CRM and customer lifecycle management tools

Target Industries: Technology & Media, Consumer & Retail, Healthcare, Financial Services, Insurance, Automotive, Travel & Hospitality, Education, Telecom, Services, Political Candidate & Advocacy.

Article Details:
- Title: ${title}
- Summary: ${summary}
- Why It Matters: ${whyItMatters}
- Talk Track: ${talkTrack}
- Industry Vertical: ${vertical}
- Source: ${sourceName}

Rate this article's relevance for MarTech/AdTech/CRM sales professionals (0-100 points):

1. **Marketing Technology Relevance (0-25)**
   - Marketing automation, personalization, customer journey tools
   - Email marketing platforms, deliverability, campaign management
   - Customer data platforms, analytics, attribution
   - High relevance: Platform launches, integration updates, performance studies
   - Low relevance: Generic marketing advice, non-technical content

2. **Digital Advertising Value (0-25)**
   - Programmatic advertising, DSPs, ad exchanges
   - Social media advertising platforms and tools
   - Search marketing, SEO/SEM platforms
   - Connected TV/OTT advertising solutions
   - High relevance: Platform updates, targeting capabilities, measurement tools
   - Low relevance: Creative strategies, non-technical advertising content

3. **CRM & Customer Lifecycle Impact (0-25)**
   - Customer relationship management systems
   - Sales enablement and lead generation tools
   - Customer retention and loyalty platforms
   - Revenue operations and sales analytics
   - High relevance: CRM innovations, sales process automation, customer success tools
   - Low relevance: General sales training, non-technical CRM content

4. **Enterprise Decision Driver (0-25)**
   - Budget allocation and marketing spend trends
   - Technology adoption and digital transformation
   - Regulatory compliance (privacy, data protection)
   - Competitive intelligence and market positioning
   - High relevance: Enterprise buying behavior, technology investment trends
   - Low relevance: Small business focus, consumer-oriented content

Scoring Guidelines:
- 90-100: Game-changing MarTech/AdTech/CRM intelligence
- 80-89: Strong relevance to technology sales conversations
- 70-79: Good context for customer discussions
- 60-69: Moderate relevance, some talking points
- 50-59: Limited relevance to technology sales
- 0-49: Not relevant to MarTech/AdTech/CRM sales

Respond with ONLY a number between 0-100 representing the total relevance score.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at evaluating business content for sales intelligence value. Always respond with just a number between 0-100."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 10,
    })

    const scoreText = response.choices[0].message.content?.trim()
    const score = parseInt(scoreText)

    if (isNaN(score) || score < 0 || score > 100) {
      console.log(`⚠️ Invalid score "${scoreText}", using default scoring`)
      return calculateDefaultScore(title, summary, vertical, sourceName)
    }

    console.log(`📊 AI relevance score: ${score}/100`)
    return score

  } catch (error) {
    console.error('Error calculating relevance score:', error.message)
    return calculateDefaultScore(title, summary, vertical, sourceName)
  }
}

/**
 * Calculate default relevance score based on MarTech/AdTech/CRM focused heuristics
 */
function calculateDefaultScore(title, summary, vertical, sourceName) {
  let score = 40 // Lower base score since we're being more selective

  // Source reputation bonus - prioritize MarTech/AdTech sources
  const marTechSources = ['MarTech Today', 'AdExchanger', 'Digiday', 'Search Engine Land', 'Marketing Land']
  const techSources = ['TechCrunch', 'VentureBeat', 'The Information']
  const businessSources = ['Forbes', 'Harvard Business Review', 'McKinsey', 'Gartner']
  
  if (marTechSources.some(source => sourceName.includes(source))) {
    score += 20 // Higher bonus for MarTech sources
  } else if (techSources.some(source => sourceName.includes(source))) {
    score += 15
  } else if (businessSources.some(source => sourceName.includes(source))) {
    score += 10
  }

  // Content analysis for MarTech/AdTech/CRM relevance
  const title_lower = title.toLowerCase()
  const summary_lower = (summary || '').toLowerCase()
  const fullText = title_lower + ' ' + summary_lower

  // High-value MarTech/AdTech/CRM keywords
  const marTechKeywords = [
    'marketing automation', 'personalization', 'customer journey', 'email marketing',
    'campaign management', 'customer data platform', 'cdp', 'attribution',
    'marketing analytics', 'lead scoring', 'segmentation', 'lifecycle marketing'
  ]
  
  const adTechKeywords = [
    'programmatic', 'dsp', 'ssp', 'ad exchange', 'rtb', 'social advertising',
    'search marketing', 'sem', 'ppc', 'connected tv', 'ctv', 'ott',
    'targeting', 'audience', 'measurement', 'attribution', 'viewability'
  ]
  
  const crmKeywords = [
    'crm', 'customer relationship', 'sales enablement', 'lead generation',
    'customer retention', 'loyalty', 'revenue operations', 'sales analytics',
    'customer success', 'churn', 'lifetime value', 'sales automation'
  ]
  
  const enterpriseKeywords = [
    'enterprise', 'b2b', 'budget', 'roi', 'digital transformation',
    'privacy', 'gdpr', 'compliance', 'integration', 'api', 'platform'
  ]

  // Score for MarTech/AdTech/CRM keyword matches
  const marTechMatches = marTechKeywords.filter(keyword => fullText.includes(keyword))
  const adTechMatches = adTechKeywords.filter(keyword => fullText.includes(keyword))
  const crmMatches = crmKeywords.filter(keyword => fullText.includes(keyword))
  const enterpriseMatches = enterpriseKeywords.filter(keyword => fullText.includes(keyword))

  score += Math.min(marTechMatches.length * 8, 24) // Up to 24 points
  score += Math.min(adTechMatches.length * 8, 24) // Up to 24 points  
  score += Math.min(crmMatches.length * 8, 24) // Up to 24 points
  score += Math.min(enterpriseMatches.length * 4, 12) // Up to 12 points

  // Target vertical importance (based on your target list)
  const highPriorityVerticals = [
    'Technology & Media', 'Consumer & Retail', 'Financial Services', 'Healthcare'
  ]
  const mediumPriorityVerticals = [
    'Insurance', 'Automotive', 'Travel & Hospitality', 'Education', 'Telecom'
  ]
  const lowPriorityVerticals = [
    'Services', 'Political Candidate & Advocacy'
  ]
  
  if (highPriorityVerticals.includes(vertical)) {
    score += 10
  } else if (mediumPriorityVerticals.includes(vertical)) {
    score += 5
  } else if (lowPriorityVerticals.includes(vertical)) {
    score += 2
  }

  // Penalty for irrelevant content
  const irrelevantKeywords = [
    'recipe', 'fashion', 'sports', 'entertainment', 'celebrity', 'weather',
    'travel blog', 'lifestyle', 'fitness', 'health tips', 'DIY'
  ]
  
  const irrelevantMatches = irrelevantKeywords.filter(keyword => fullText.includes(keyword))
  score -= irrelevantMatches.length * 10

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Batch update relevance scores for multiple articles
 */
async function updateRelevanceScores(articles) {
  console.log(`🔢 Calculating relevance scores for ${articles.length} articles...`)
  
  const results = []
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    try {
      const score = await calculateRelevanceScore(
        article.title,
        article.summary || '',
        article.whyItMatters || '',
        article.talkTrack || '',
        article.vertical,
        article.sourceName
      )
      
      results.push({
        id: article.id,
        score: score,
        title: article.title.substring(0, 50)
      })
      
      console.log(`✅ ${i + 1}/${articles.length}: "${article.title.substring(0, 50)}..." = ${score}/100`)
      
      // Rate limit to avoid overwhelming OpenAI
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error(`❌ Error scoring article "${article.title.substring(0, 50)}...":`, error.message)
      results.push({
        id: article.id,
        score: 50,
        title: article.title.substring(0, 50)
      })
    }
  }
  
  return results
}

module.exports = {
  calculateRelevanceScore,
  updateRelevanceScores
} 