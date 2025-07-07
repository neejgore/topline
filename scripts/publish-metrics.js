const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yuwuaadbqgywebfsbjcp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
)

// Target verticals (from memory)
const VERTICALS = [
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

async function publishMetrics() {
  console.log('📊 Publishing metrics from pool...')
  
  try {
    // Archive current published metrics
    const { data: currentMetrics } = await supabase
      .from('metrics')
      .select('id')
      .eq('status', 'PUBLISHED')
    
    if (currentMetrics && currentMetrics.length > 0) {
      console.log(`📦 Archiving ${currentMetrics.length} current metrics...`)
      await supabase
        .from('metrics')
        .update({ 
          status: 'ARCHIVED',
          lastViewedAt: new Date().toISOString()
        })
        .eq('status', 'PUBLISHED')
    }
    
    // Get available metrics (allow reuse after 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    
    const { data: availableMetrics } = await supabase
      .from('metrics')
      .select('*')
      .gte('createdAt', ninetyDaysAgo.toISOString())
      .eq('status', 'ARCHIVED')
      .in('vertical', VERTICALS)
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${sevenDaysAgo.toISOString()}`)
      .order('createdAt', { ascending: false })
    
    console.log(`📊 Found ${availableMetrics?.length || 0} available metrics`)
    
    if (!availableMetrics || availableMetrics.length === 0) {
      console.log('❌ No available metrics to publish')
      return
    }
    
    // Select 1 metric (the newest available)
    const selectedMetric = availableMetrics[0]
    
    // Publish the selected metric
    const { error: publishError } = await supabase
      .from('metrics')
      .update({ status: 'PUBLISHED' })
      .eq('id', selectedMetric.id)
    
    if (publishError) {
      console.error('❌ Error publishing metric:', publishError)
      return
    }
    
    console.log(`✅ Published metric: ${selectedMetric.title} (${selectedMetric.value} ${selectedMetric.unit})`)
    console.log(`📊 Vertical: ${selectedMetric.vertical}`)
    console.log(`🎯 Priority: ${selectedMetric.priority}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

publishMetrics() 