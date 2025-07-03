const { createClient } = require('@supabase/supabase-js')

// Supabase connection
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateMetricsDates() {
  console.log('🔄 Updating metrics publishedAt dates to be within 48-hour window...')
  
  try {
    // Get all existing metrics
    const { data: metrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .eq('status', 'PUBLISHED')
    
    if (fetchError) {
      console.error('Error fetching metrics:', fetchError)
      return
    }
    
    console.log(`📊 Found ${metrics.length} metrics to update`)
    
    let updated = 0
    
    // Update each metric with a random time within the last 24 hours
    for (const metric of metrics) {
      try {
        // Generate a random time within the last 24 hours
        const now = new Date()
        const hoursAgo = Math.floor(Math.random() * 24) + 1 // 1-24 hours ago
        const minutesAgo = Math.floor(Math.random() * 60) // 0-59 minutes ago
        
        const publishedAt = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000))
        
        const { error: updateError } = await supabase
          .from('metrics')
          .update({
            publishedAt: publishedAt.toISOString(),
            updatedAt: new Date().toISOString()
          })
          .eq('id', metric.id)
        
        if (updateError) {
          console.error(`❌ Error updating metric ${metric.id}:`, updateError)
          continue
        }
        
        updated++
        console.log(`✅ Updated "${metric.title}" - Published ${hoursAgo}h ${minutesAgo}m ago`)
        
      } catch (metricError) {
        console.error(`❌ Error processing metric ${metric.id}:`, metricError)
      }
    }
    
    console.log(`🎉 Updated ${updated} metrics with recent publishedAt dates`)
    
    // Verify the update worked
    const { count: recentCount, error: countError } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED')
      .gte('publishedAt', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    
    if (!countError) {
      console.log(`📈 ${recentCount} metrics now visible in 48-hour window`)
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the script
if (require.main === module) {
  updateMetricsDates()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { updateMetricsDates } 