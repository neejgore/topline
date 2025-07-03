const { createClient } = require('@supabase/supabase-js')
const { generateAIContent } = require('../lib/ai-content-generator.js')

// Supabase connection
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
const supabase = createClient(supabaseUrl, supabaseKey)

// Generic content patterns to identify articles that need regeneration
const GENERIC_PATTERNS = [
  'AI and automation are transforming marketing technology',
  'Privacy changes are reshaping digital marketing',
  'The retail and commerce landscape is rapidly evolving',
  'Data strategy is central to modern marketing',
  'This industry development signals important changes',
  'This article provides important industry insights',
  'Use this information to understand current market trends',
  'Leverage this Technology & Media development',
  'Use this Consumer & Retail development',
  'Reference this growth story',
  'Use this industry consolidation'
]

async function regenerateAIContent() {
  console.log('🤖 Starting AI content regeneration...')
  
  try {
    // Get all articles with generic content
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('publishedAt', { ascending: false })
      .limit(50) // Process most recent 50 articles
    
    if (error) {
      console.error('Error fetching articles:', error)
      return
    }
    
    console.log(`📊 Found ${articles.length} articles to process`)
    
    let regenerated = 0
    let skipped = 0
    
    for (const article of articles) {
      try {
        // Check if article has generic content
        const hasGenericContent = GENERIC_PATTERNS.some(pattern => 
          article.whyItMatters?.includes(pattern) || 
          article.talkTrack?.includes(pattern)
        )
        
        if (!hasGenericContent) {
          skipped++
          continue
        }
        
        console.log(`🔄 Regenerating content for: ${article.title}`)
        
        // Generate new AI content
        const aiContent = await generateAIContent(
          article.title,
          article.summary || '',
          article.sourceName,
          article.vertical
        )
        
        // Update the article with new AI content
        const { error: updateError } = await supabase
          .from('articles')
          .update({
            whyItMatters: aiContent.whyItMatters,
            talkTrack: aiContent.talkTrack,
            updatedAt: new Date().toISOString()
          })
          .eq('id', article.id)
        
        if (updateError) {
          console.error(`❌ Error updating article ${article.id}:`, updateError)
          continue
        }
        
        regenerated++
        console.log(`✅ Updated: ${article.title}`)
        
        // Small delay to avoid overwhelming the AI API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
      } catch (articleError) {
        console.error(`❌ Error processing article ${article.id}:`, articleError)
        skipped++
      }
    }
    
    console.log(`🎉 AI content regeneration complete!`)
    console.log(`📊 Regenerated: ${regenerated} articles, Skipped: ${skipped} articles`)
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the script
if (require.main === module) {
  regenerateAIContent()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { regenerateAIContent } 