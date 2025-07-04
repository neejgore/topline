const { createClient } = require('@supabase/supabase-js')

// Supabase connection
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
const supabase = createClient(supabaseUrl, supabaseKey)

async function ensureMetricsSchema() {
  console.log('🔄 Ensuring metrics table has proper schema...')
  
  try {
    // Check if lastViewedAt column exists
    console.log('📊 Checking if lastViewedAt column exists...')
    
    const { data: testData, error: testError } = await supabase
      .from('metrics')
      .select('lastViewedAt')
      .limit(1)
    
    if (testError && testError.message.includes('column "lastViewedAt" does not exist')) {
      console.log('➕ lastViewedAt column does not exist, attempting to add it...')
      
      // Note: Supabase doesn't allow direct DDL through the client
      // This script will detect the missing column and provide instructions
      console.log('📝 The lastViewedAt column needs to be added manually in Supabase Dashboard:')
      console.log('   1. Go to Database → Tables → metrics')
      console.log('   2. Click "Add Column"')
      console.log('   3. Column name: lastViewedAt')
      console.log('   4. Data type: timestamp with time zone')
      console.log('   5. Default value: (leave empty)')
      console.log('   6. Allow nullable: Yes')
      console.log('')
      console.log('   OR run this SQL in the SQL Editor:')
      console.log('   ALTER TABLE metrics ADD COLUMN "lastViewedAt" TIMESTAMP WITH TIME ZONE;')
      console.log('')
      
      return {
        success: false,
        columnExists: false,
        message: 'lastViewedAt column needs to be added manually'
      }
    } else if (testError) {
      console.error('❌ Error checking column:', testError)
      return {
        success: false,
        columnExists: false,
        error: testError.message
      }
    }
    
    console.log('✅ lastViewedAt column exists')
    
    // Check metrics table structure
    const { data: metrics, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .limit(1)
    
    if (metricsError) {
      console.error('❌ Error checking metrics table:', metricsError)
      return {
        success: false,
        error: metricsError.message
      }
    }
    
    console.log('📊 Metrics table structure looks good')
    
    // Get metrics count
    const { count: totalCount, error: countError } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
    
    if (!countError) {
      console.log(`📈 Total metrics in database: ${totalCount}`)
    }
    
    // Check for metrics with lastViewedAt
    const { count: viewedCount, error: viewedError } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .not('lastViewedAt', 'is', null)
    
    if (!viewedError) {
      console.log(`👀 Metrics with view tracking: ${viewedCount}`)
    }
    
    // Check for published metrics
    const { count: publishedCount, error: publishedError } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED')
    
    if (!publishedError) {
      console.log(`📊 Published metrics: ${publishedCount}`)
    }
    
    console.log('✅ Metrics schema check completed successfully')
    
    return {
      success: true,
      columnExists: true,
      totalMetrics: totalCount,
      viewedMetrics: viewedCount,
      publishedMetrics: publishedCount
    }
    
  } catch (error) {
    console.error('❌ Error ensuring metrics schema:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the script
if (require.main === module) {
  ensureMetricsSchema()
    .then(result => {
      if (result.success) {
        console.log('✅ Metrics schema check completed successfully')
        process.exit(0)
      } else {
        console.log('⚠️  Schema check completed with issues')
        process.exit(0) // Don't fail the process, just inform
      }
    })
    .catch(error => {
      console.error('❌ Schema check failed:', error)
      process.exit(1)
    })
}

module.exports = { ensureMetricsSchema } 