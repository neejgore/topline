const { createClient } = require('@supabase/supabase-js')
const { classifyContentVertical } = require('../lib/content-classifier')

async function reclassifyExistingArticles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('🔄 Starting reclassification of existing articles...')

  // Get all articles from the database
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, summary, vertical, sourceName')
    .eq('status', 'PUBLISHED')

  if (fetchError) {
    console.error('❌ Error fetching articles:', fetchError)
    return
  }

  console.log(`📊 Found ${articles.length} articles to reclassify`)

  let reclassifiedCount = 0
  let processedCount = 0

  for (const article of articles) {
    try {
      console.log(`\n🔍 Processing: ${article.title.substring(0, 50)}...`)
      console.log(`📋 Current vertical: ${article.vertical}`)
      
      // Classify the article content
      const correctVertical = await classifyContentVertical(
        article.title,
        article.summary || '',
        article.vertical
      )

      processedCount++

      // Update if classification changed
      if (correctVertical !== article.vertical) {
        console.log(`🔄 Reclassifying from "${article.vertical}" to "${correctVertical}"`)
        
        const { error: updateError } = await supabase
          .from('articles')
          .update({ 
            vertical: correctVertical,
            updatedAt: new Date().toISOString()
          })
          .eq('id', article.id)

        if (updateError) {
          console.error(`❌ Error updating article ${article.id}:`, updateError)
        } else {
          console.log(`✅ Successfully reclassified article ${article.id}`)
          reclassifiedCount++
        }
      } else {
        console.log(`✅ Classification unchanged: ${correctVertical}`)
      }

      // Rate limit to avoid overwhelming OpenAI
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Error processing article ${article.id}:`, error)
    }
  }

  console.log(`\n📈 Reclassification complete!`)
  console.log(`📊 Processed: ${processedCount} articles`)
  console.log(`🔄 Reclassified: ${reclassifiedCount} articles`)
  console.log(`✅ Unchanged: ${processedCount - reclassifiedCount} articles`)

  // Show final distribution
  const { data: finalDistribution, error: distError } = await supabase
    .from('articles')
    .select('vertical')
    .eq('status', 'PUBLISHED')

  if (!distError) {
    const distribution = finalDistribution.reduce((acc, article) => {
      acc[article.vertical] = (acc[article.vertical] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Final vertical distribution:')
    Object.entries(distribution).forEach(([vertical, count]) => {
      console.log(`  ${vertical}: ${count} articles`)
    })
  }
}

reclassifyExistingArticles().catch(console.error) 