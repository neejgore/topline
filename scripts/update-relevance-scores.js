const { createClient } = require('@supabase/supabase-js')
const { updateRelevanceScores } = require('../lib/relevance-scorer')

async function updateAllRelevanceScores() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('🔢 Starting relevance score updates for all articles...')

  // Get all published articles
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, summary, whyItMatters, talkTrack, vertical, sourceName, importanceScore')
    .eq('status', 'PUBLISHED')
    .order('publishedAt', { ascending: false })

  if (fetchError) {
    console.error('❌ Error fetching articles:', fetchError)
    return
  }

  console.log(`📊 Found ${articles.length} articles to score`)

  // Show current score distribution
  const currentScores = articles.map(a => a.importanceScore || 0)
  const zeroScores = currentScores.filter(s => s === 0).length
  const nonZeroScores = currentScores.filter(s => s > 0).length
  
  console.log(`📈 Current scores: ${zeroScores} articles with score=0, ${nonZeroScores} with scores >0`)

  if (zeroScores === 0) {
    console.log('✅ All articles already have relevance scores!')
    return
  }

  // Calculate scores for all articles
  const scoreResults = await updateRelevanceScores(articles)

  // Update articles in batches
  console.log('\n💾 Updating articles in database...')
  let updatedCount = 0
  let errorCount = 0

  for (const result of scoreResults) {
    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ 
          importanceScore: result.score,
          updatedAt: new Date().toISOString()
        })
        .eq('id', result.id)

      if (updateError) {
        console.error(`❌ Error updating article ${result.id}:`, updateError)
        errorCount++
      } else {
        console.log(`✅ Updated "${result.title}..." with score ${result.score}/100`)
        updatedCount++
      }
    } catch (error) {
      console.error(`❌ Error updating article ${result.id}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n📈 Update complete!`)
  console.log(`✅ Successfully updated: ${updatedCount} articles`)
  console.log(`❌ Errors: ${errorCount} articles`)

  // Show final score distribution
  const { data: finalArticles, error: finalError } = await supabase
    .from('articles')
    .select('importanceScore')
    .eq('status', 'PUBLISHED')

  if (!finalError) {
    const finalScores = finalArticles.map(a => a.importanceScore || 0)
    const distribution = {
      '90-100': finalScores.filter(s => s >= 90).length,
      '80-89': finalScores.filter(s => s >= 80 && s < 90).length,
      '70-79': finalScores.filter(s => s >= 70 && s < 80).length,
      '60-69': finalScores.filter(s => s >= 60 && s < 70).length,
      '50-59': finalScores.filter(s => s >= 50 && s < 60).length,
      '0-49': finalScores.filter(s => s < 50).length
    }

    console.log('\n📊 Final relevance score distribution:')
    Object.entries(distribution).forEach(([range, count]) => {
      console.log(`  ${range}: ${count} articles`)
    })

    const averageScore = finalScores.reduce((a, b) => a + b, 0) / finalScores.length
    console.log(`📊 Average relevance score: ${averageScore.toFixed(1)}/100`)
  }
}

updateAllRelevanceScores().catch(console.error) 