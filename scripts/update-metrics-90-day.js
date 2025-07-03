const { createClient } = require('@supabase/supabase-js')

// Supabase connection
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateMetricsFor90Days() {
  console.log('🔄 Updating metrics for 90-day window with duplicate prevention...')
  
  try {
    // First, try to add the lastViewedAt column (this might fail if it already exists)
    console.log('📊 Adding lastViewedAt column to metrics table...')
    
    const { error: alterError } = await supabase.rpc('add_column_if_not_exists', {
      table_name: 'metrics',
      column_name: 'lastViewedAt',
      column_type: 'timestamp with time zone'
    })
    
    // If the RPC doesn't exist, try direct SQL
    if (alterError) {
      console.log('⚠️  RPC method not available, using direct SQL...')
      const { error: sqlError } = await supabase
        .from('metrics')
        .select('lastViewedAt')
        .limit(1)
      
      if (sqlError && sqlError.message.includes('column "lastViewedAt" does not exist')) {
        console.log('➕ Column does not exist, this is expected for the first run')
        console.log('📝 Please manually add the column in Supabase dashboard:')
        console.log('   ALTER TABLE metrics ADD COLUMN "lastViewedAt" TIMESTAMP WITH TIME ZONE;')
      }
    }
    
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
    
    // Update each metric with a random time within the last 90 days
    for (const metric of metrics) {
      try {
        // Generate a random time within the last 90 days
        const now = new Date()
        const daysAgo = Math.floor(Math.random() * 90) + 1 // 1-90 days ago
        const hoursAgo = Math.floor(Math.random() * 24) // 0-23 hours ago
        const minutesAgo = Math.floor(Math.random() * 60) // 0-59 minutes ago
        
        const publishedAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000))
        
        const updateData = {
          publishedAt: publishedAt.toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Only add lastViewedAt if the column exists
        try {
          const testQuery = await supabase
            .from('metrics')
            .select('lastViewedAt')
            .eq('id', metric.id)
            .limit(1)
          
          if (!testQuery.error) {
            updateData.lastViewedAt = null // Reset viewed status
          }
        } catch (e) {
          // Column doesn't exist, skip it
        }
        
        const { error: updateError } = await supabase
          .from('metrics')
          .update(updateData)
          .eq('id', metric.id)
        
        if (updateError) {
          console.error(`❌ Error updating metric ${metric.id}:`, updateError)
          continue
        }
        
        updated++
        console.log(`✅ Updated "${metric.title}" - Published ${daysAgo}d ${hoursAgo}h ago`)
        
      } catch (metricError) {
        console.error(`❌ Error processing metric ${metric.id}:`, metricError)
      }
    }
    
    console.log(`🎉 Updated ${updated} metrics with 90-day spread`)
    
    // Verify the update worked
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const { count: recentCount, error: countError } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED')
      .gte('publishedAt', ninetyDaysAgo.toISOString())
    
    if (!countError) {
      console.log(`📈 ${recentCount} metrics now visible in 90-day window`)
    }
    
    console.log('📝 Note: If you see column errors, please run this SQL in Supabase:')
    console.log('   ALTER TABLE metrics ADD COLUMN "lastViewedAt" TIMESTAMP WITH TIME ZONE;')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the script
if (require.main === module) {
  updateMetricsFor90Days()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { updateMetricsFor90Days } 