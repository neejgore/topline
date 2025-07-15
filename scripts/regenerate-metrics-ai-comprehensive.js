require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { generateMetricsAIContent } = require('../lib/ai-content-generator.js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Target verticals (from memory requirement)
const TARGET_VERTICALS = [
  'Technology & Media',
  'Consumer & Retail', 
  'Healthcare',
  'Financial Services',
  'Insurance',
  'Automotive',
  'Travel & Hospitality',
  'Education',
  'Telecom',
  'Services',
  'Political Candidate & Advocacy',
  'Other'
]

// Generic phrases that indicate metrics need regeneration
const GENERIC_PHRASES = [
  'AI and automation are transforming industry operations',
  'Digital transformation is accelerating across industries',
  'Retail and consumer behavior is shifting dramatically',
  'This metric shows how brands are adapting their customer engagement',
  'Understanding these metrics helps position solutions in the context',
  'This metric reveals how technology adoption is reshaping business operations',
  'The media and technology landscape is rapidly evolving',
  'Energy and utilities are transitioning to sustainable models',
  'Financial services are undergoing digital transformation',
  'Healthcare is embracing digital innovation',
  'This metric indicates how the sector is adapting',
  'This development signals where the market is heading',
  'How is your organization planning to capitalize on this growth trend',
  'What opportunities do you see in this expanding market',
  'How are these technology trends impacting your digital strategy',
  'Where is your organization in terms of adoption of these technologies'
]

async function regenerateMetricsAI() {
  console.log('🔄 Starting comprehensive metrics AI content regeneration...')
  console.log('📅 Time:', new Date().toLocaleString())
  console.log('=' .repeat(50))
  
  try {
    // Get all metrics from target verticals
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .in('status', ['PUBLISHED', 'ARCHIVED'])
      .in('vertical', TARGET_VERTICALS)
      .order('publishedAt', { ascending: false })
    
    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`)
    }
    
    console.log(`📊 Found ${metrics.length} metrics from target verticals`)

    // Filter metrics that need regeneration
    const metricsNeedingRegeneration = metrics.filter(metric => {
      const content = `${metric.whyItMatters || ''} ${metric.talkTrack || ''}`.toLowerCase()
      return GENERIC_PHRASES.some(phrase => content.includes(phrase.toLowerCase())) ||
             !metric.whyItMatters || !metric.talkTrack ||
             metric.whyItMatters.trim() === '' || metric.talkTrack.trim() === ''
    })

    console.log(`🔧 Found ${metricsNeedingRegeneration.length} metrics needing AI content regeneration`)

    if (metricsNeedingRegeneration.length === 0) {
      console.log('✅ All metrics already have good AI content!')
      return
    }

    let successCount = 0
    let failureCount = 0

    for (const metric of metricsNeedingRegeneration) {
      try {
        console.log(`\n🤖 Regenerating AI content for: ${metric.title}`)
        console.log(`📊 Vertical: ${metric.vertical}`)
        console.log(`📈 Value: ${metric.value} ${metric.unit || ''}`)
        
        // Generate enhanced AI content
        const aiContent = await generateMetricsAIContent(
          metric.title,
          metric.value,
          metric.source,
          metric.explanation || metric.whyItMatters || '',
          metric.vertical
        )

        // Update the metric with new AI content
        const { error: updateError } = await supabase
          .from('metrics')
          .update({
            whyItMatters: aiContent.whyItMatters,
            talkTrack: aiContent.talkTrack,
            updatedAt: new Date().toISOString()
          })
          .eq('id', metric.id)

        if (updateError) {
          throw new Error(`Error updating metric: ${updateError.message}`)
        }

        console.log(`✅ Successfully regenerated AI content`)
        console.log(`📝 New Why It Matters: ${aiContent.whyItMatters.substring(0, 100)}...`)
        console.log(`💬 New Talk Track: ${aiContent.talkTrack.substring(0, 100)}...`)
        
        successCount++
        
        // Rate limit to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 3000))
        
      } catch (error) {
        console.error(`❌ Failed to regenerate AI content for metric ${metric.id}:`, error.message)
        failureCount++
        
        // Continue with next metric instead of stopping
        continue
      }
    }
    
    console.log('\n🎉 Comprehensive metrics AI regeneration complete!')
    console.log('=' .repeat(50))
    console.log(`📊 Total metrics from target verticals: ${metrics.length}`)
    console.log(`🔧 Metrics needing regeneration: ${metricsNeedingRegeneration.length}`)
    console.log(`✅ Successfully regenerated: ${successCount} metrics`)
    console.log(`❌ Failed to regenerate: ${failureCount} metrics`)

    if (successCount > 0) {
      console.log('\n🔗 Check results at:')
      console.log('- Website: https://topline-tlwi.vercel.app/')
      console.log('- Newsletter: https://topline-tlwi.vercel.app/newsletter/preview')
    }
    
  } catch (error) {
    console.error('❌ Error in comprehensive metrics AI regeneration:', error)
    throw error
  }
}

// Run the regeneration
regenerateMetricsAI()
  .then(() => {
    console.log('\n✅ Comprehensive metrics AI regeneration completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Comprehensive metrics AI regeneration failed:', error)
    process.exit(1)
  })

module.exports = { regenerateMetricsAI } 