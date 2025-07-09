const { createClient } = require('@supabase/supabase-js')
const { updateRelevanceScores } = require('../lib/relevance-scorer')

async function retuneAllRelevanceScores() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('🎯 Re-tuning relevance scores for MarTech/AdTech/CRM focus...')

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

  console.log(`📊 Found ${articles.length} articles to re-score`)

  // Show current score distribution
  const currentScores = articles.map(a => a.importanceScore || 0)
  console.log('\n📈 Current relevance score distribution:')
  const currentDistribution = {
    '90-100': currentScores.filter(s => s >= 90).length,
    '80-89': currentScores.filter(s => s >= 80 && s < 90).length,
    '70-79': currentScores.filter(s => s >= 70 && s < 80).length,
    '60-69': currentScores.filter(s => s >= 60 && s < 70).length,
    '50-59': currentScores.filter(s => s >= 50 && s < 60).length,
    '0-49': currentScores.filter(s => s < 50).length
  }
  
  Object.entries(currentDistribution).forEach(([range, count]) => {
    console.log(`  ${range}: ${count} articles`)
  })

  const currentAverage = currentScores.reduce((a, b) => a + b, 0) / currentScores.length
  console.log(`📊 Current average: ${currentAverage.toFixed(1)}/100`)

  // Re-calculate scores with new MarTech/AdTech/CRM focused scoring
  console.log('\n🔄 Re-calculating scores with MarTech/AdTech/CRM focus...')
  const scoreResults = await updateRelevanceScores(articles)

  // Update articles in batches
  console.log('\n💾 Updating articles in database...')
  let updatedCount = 0
  let errorCount = 0
  let significantChanges = []

  for (const result of scoreResults) {
    try {
      const oldScore = articles.find(a => a.id === result.id)?.importanceScore || 0
      const newScore = result.score
      const change = newScore - oldScore

      const { error: updateError } = await supabase
        .from('articles')
        .update({ 
          importanceScore: newScore,
          updatedAt: new Date().toISOString()
        })
        .eq('id', result.id)

      if (updateError) {
        console.error(`❌ Error updating article ${result.id}:`, updateError)
        errorCount++
      } else {
        console.log(`✅ Updated "${result.title}..." ${oldScore} → ${newScore} (${change > 0 ? '+' : ''}${change})`)
        updatedCount++
        
        // Track significant changes
        if (Math.abs(change) >= 10) {
          significantChanges.push({
            title: result.title,
            oldScore,
            newScore,
            change,
            direction: change > 0 ? 'UP' : 'DOWN'
          })
        }
      }
    } catch (error) {
      console.error(`❌ Error updating article ${result.id}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n📈 Re-tuning complete!`)
  console.log(`✅ Successfully updated: ${updatedCount} articles`)
  console.log(`❌ Errors: ${errorCount} articles`)

  // Show significant changes
  if (significantChanges.length > 0) {
    console.log(`\n🎯 Articles with significant score changes (±10):`)
    significantChanges
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 10)
      .forEach(change => {
        const arrow = change.direction === 'UP' ? '📈' : '📉'
        console.log(`  ${arrow} "${change.title.substring(0, 50)}..." ${change.oldScore} → ${change.newScore} (${change.change > 0 ? '+' : ''}${change.change})`)
      })
  }

  // Show final score distribution
  const { data: finalArticles, error: finalError } = await supabase
    .from('articles')
    .select('importanceScore')
    .eq('status', 'PUBLISHED')

  if (!finalError) {
    const finalScores = finalArticles.map(a => a.importanceScore || 0)
    const finalDistribution = {
      '90-100': finalScores.filter(s => s >= 90).length,
      '80-89': finalScores.filter(s => s >= 80 && s < 90).length,
      '70-79': finalScores.filter(s => s >= 70 && s < 80).length,
      '60-69': finalScores.filter(s => s >= 60 && s < 70).length,
      '50-59': finalScores.filter(s => s >= 50 && s < 60).length,
      '0-49': finalScores.filter(s => s < 50).length
    }

    console.log('\n📊 NEW MarTech/AdTech/CRM-focused score distribution:')
    Object.entries(finalDistribution).forEach(([range, count]) => {
      const oldCount = currentDistribution[range]
      const change = count - oldCount
      const changeStr = change === 0 ? '' : ` (${change > 0 ? '+' : ''}${change})`
      console.log(`  ${range}: ${count} articles${changeStr}`)
    })

    const finalAverage = finalScores.reduce((a, b) => a + b, 0) / finalScores.length
    const averageChange = finalAverage - currentAverage
    console.log(`📊 NEW average: ${finalAverage.toFixed(1)}/100 (${averageChange > 0 ? '+' : ''}${averageChange.toFixed(1)})`)
  }
}

retuneAllRelevanceScores().catch(console.error) 