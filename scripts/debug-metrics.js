const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yuwuaadbqgywebfsbjcp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRicWd5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'
)

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

async function debugMetrics() {
  console.log('🔍 Debugging metrics query...')
  
  try {
    // Step 1: Check total metrics
    const { data: allMetrics, count: totalCount } = await supabase
      .from('metrics')
      .select('*', { count: 'exact' })
    
    console.log(`📊 Total metrics in DB: ${totalCount}`)
    
    // Step 2: Check archived metrics
    const { data: archivedMetrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('status', 'ARCHIVED')
    
    console.log(`📦 Archived metrics: ${archivedMetrics?.length || 0}`)
    
    // Step 3: Check metrics by vertical
    const { data: verticalMetrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('status', 'ARCHIVED')
      .in('vertical', VERTICALS)
    
    console.log(`🎯 Metrics in target verticals: ${verticalMetrics?.length || 0}`)
    
    // Step 4: Check 90-day window
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const { data: recentMetrics } = await supabase
      .from('metrics')
      .select('*')
      .gte('createdAt', ninetyDaysAgo.toISOString())
      .eq('status', 'ARCHIVED')
      .in('vertical', VERTICALS)
    
    console.log(`📅 Recent metrics (90 days): ${recentMetrics?.length || 0}`)
    
    // Step 5: Check lastViewedAt filter
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const { data: availableMetrics } = await supabase
      .from('metrics')
      .select('*')
      .gte('createdAt', ninetyDaysAgo.toISOString())
      .eq('status', 'ARCHIVED')
      .in('vertical', VERTICALS)
      .or(`lastViewedAt.is.null,lastViewedAt.lt.${sevenDaysAgo.toISOString()}`)
    
    console.log(`✅ Available metrics (final): ${availableMetrics?.length || 0}`)
    
    if (availableMetrics && availableMetrics.length > 0) {
      console.log('\n📋 Sample available metrics:')
      availableMetrics.slice(0, 3).forEach(metric => {
        console.log(`  - ${metric.title} (${metric.vertical}) - lastViewed: ${metric.lastViewedAt || 'never'}`)
      })
    }
    
    if (recentMetrics && recentMetrics.length > 0) {
      console.log('\n📋 Sample recent metrics:')
      recentMetrics.slice(0, 3).forEach(metric => {
        console.log(`  - ${metric.title} (${metric.vertical}) - lastViewed: ${metric.lastViewedAt || 'never'}`)
        console.log(`    created: ${metric.createdAt}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugMetrics() 