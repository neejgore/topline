require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { generateAIContent } = require('../lib/ai-content-generator.js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function regenerateAIContent() {
  console.log('🔄 Starting AI content regeneration...')
  console.log('📅 Time:', new Date().toLocaleString())
  console.log('=' .repeat(50))

  try {
    // Get all published articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('createdAt', { ascending: false })

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    console.log(`📰 Found ${articles.length} published articles`)

    // Generic phrases that indicate articles need regeneration
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

    // Find articles with generic content
    const articlesNeedingRegeneration = articles.filter(article => {
      const content = `${article.whyItMatters || ''} ${article.talkTrack || ''}`.toLowerCase()
      return genericPhrases.some(phrase => content.includes(phrase.toLowerCase())) ||
             !article.whyItMatters || !article.talkTrack ||
             article.whyItMatters.trim() === '' || article.talkTrack.trim() === ''
    })

    console.log(`🔧 Found ${articlesNeedingRegeneration.length} articles needing AI content regeneration`)

    let successCount = 0
    let failureCount = 0

    for (const article of articlesNeedingRegeneration) {
      try {
        console.log(`\n🤖 Regenerating AI content for: ${article.title.substring(0, 50)}...`)
        
        // Generate new AI content
        const aiContent = await generateAIContent(
          article.title,
          article.summary || '',
          article.sourceName || 'Unknown',
          article.vertical || 'Technology & Media'
        )

        // Update the article
        const { error: updateError } = await supabase
          .from('articles')
          .update({
            whyItMatters: aiContent.whyItMatters,
            talkTrack: aiContent.talkTrack,
            updatedAt: new Date().toISOString()
          })
          .eq('id', article.id)

        if (updateError) {
          throw new Error(`Error updating article: ${updateError.message}`)
        }

        console.log(`✅ Successfully regenerated AI content for: ${article.title.substring(0, 50)}...`)
        successCount++

        // Rate limit to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`❌ Failed to regenerate AI content for article ${article.id}:`, error.message)
        failureCount++
        
        // Continue with next article instead of stopping
        continue
      }
    }

    console.log('\n🎉 AI content regeneration complete!')
    console.log('=' .repeat(50))
    console.log(`✅ Successfully regenerated: ${successCount} articles`)
    console.log(`❌ Failed to regenerate: ${failureCount} articles`)
    console.log(`📊 Total articles processed: ${articlesNeedingRegeneration.length}`)

    if (successCount > 0) {
      console.log('\n🔗 Check results at:')
      console.log('- Website: https://topline-tlwi.vercel.app/')
      console.log('- Newsletter: https://topline-tlwi.vercel.app/newsletter/preview')
    }

  } catch (error) {
    console.error('❌ Error in AI content regeneration:', error)
    throw error
  }
}

// Run the regeneration
regenerateAIContent()
  .then(() => {
    console.log('\n✅ AI content regeneration completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ AI content regeneration failed:', error)
    process.exit(1)
  })

module.exports = { regenerateAIContent } 