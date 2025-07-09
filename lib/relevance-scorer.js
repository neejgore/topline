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
You are an expert at evaluating business content for sales intelligence value. Rate this article's relevance and importance for enterprise sales professionals.

Article Details:
- Title: ${title}
- Summary: ${summary}
- Why It Matters: ${whyItMatters}
- Talk Track: ${talkTrack}
- Industry Vertical: ${vertical}
- Source: ${sourceName}

Evaluation Criteria (each 0-20 points, total 0-100):

1. **Business Impact Potential (0-20)**
   - How significantly could this information affect enterprise business decisions?
   - Does it involve major market changes, regulations, or industry shifts?
   - High impact: M&A, major funding, policy changes, market disruption
   - Low impact: Minor updates, routine announcements

2. **Sales Intelligence Value (0-20)**
   - How useful is this for sales professionals in conversations with prospects?
   - Does it provide competitive advantages or conversation starters?
   - Does it help identify business opportunities or timing?
   - High value: Industry trends, competitor moves, budget implications
   - Low value: Generic advice, broad concepts

3. **Timeliness & Urgency (0-20)**
   - How time-sensitive is this information?
   - Does it require immediate attention or action?
   - Is it breaking news or developing story?
   - High urgency: Breaking news, immediate market changes
   - Low urgency: Historical analysis, evergreen content

4. **Content Specificity & Quality (0-20)**
   - How specific and actionable is the information?
   - Does it include concrete data, numbers, or specific companies?
   - Is the analysis deep and insightful?
   - High quality: Specific data, named companies, clear implications
   - Low quality: Vague statements, general advice

5. **Market Significance (0-20)**
   - How important is this to the broader market or industry?
   - Does it signal larger trends or changes?
   - Will this likely influence multiple companies or decisions?
   - High significance: Industry-wide implications, trend indicators
   - Low significance: Company-specific, limited scope

Scoring Guidelines:
- 90-100: Must-read, game-changing information
- 80-89: High importance, significant value
- 70-79: Good relevance, worth reading
- 60-69: Moderate relevance, some value
- 50-59: Limited relevance, minimal value
- 0-49: Low relevance, questionable value

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
 * Calculate default relevance score based on simple heuristics
 */
function calculateDefaultScore(title, summary, vertical, sourceName) {
  let score = 50 // Base score

  // Source reputation bonus
  const premiumSources = ['TechCrunch', 'Forbes', 'Harvard Business Review', 'McKinsey']
  const highQualitySources = ['AdExchanger', 'MarTech Today', 'Digiday', 'Search Engine Land']
  
  if (premiumSources.some(source => sourceName.includes(source))) {
    score += 15
  } else if (highQualitySources.some(source => sourceName.includes(source))) {
    score += 10
  }

  // Content indicators
  const title_lower = title.toLowerCase()
  const summary_lower = (summary || '').toLowerCase()
  const fullText = title_lower + ' ' + summary_lower

  // High-value keywords
  const highValueKeywords = [
    'acquisition', 'merger', 'funding', 'ipo', 'investment', 'revenue',
    'ai', 'artificial intelligence', 'breakthrough', 'innovation',
    'regulation', 'policy', 'compliance', 'gdpr', 'privacy',
    'market share', 'competition', 'disruption', 'strategy'
  ]

  const matchedKeywords = highValueKeywords.filter(keyword => fullText.includes(keyword))
  score += Math.min(matchedKeywords.length * 5, 20)

  // Vertical importance
  const highImportanceVerticals = ['Technology & Media', 'Financial Services', 'Healthcare']
  if (highImportanceVerticals.includes(vertical)) {
    score += 5
  }

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