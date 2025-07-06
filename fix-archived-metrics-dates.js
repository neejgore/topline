const { createClient } = require('@supabase/supabase-js')

// Set environment variables directly
const supabaseUrl = 'https://yuwuaadbqgywebfsbjcp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3VhYWRic2d5d2ViZnNiamNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIyOTgwMiwiZXhwIjoyMDY2ODA1ODAyfQ.tRlLoaBVZe4hpR1WNpSbyf6AwRr42NTPkFfowhuoY7c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixArchivedMetricsDates() {
  try {
    console.log('🔧 Fixing archived metrics dates...')
    
    // Get all archived metrics
    const { data: archivedMetrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('status', 'ARCHIVED')
      .order('publishedAt', { ascending: false })
    
    if (error) {
      console.error('Error fetching archived metrics:', error)
      return
    }
    
    console.log(`Found ${archivedMetrics.length} archived metrics`)
    
    // Update each metric with a past date
    for (let i = 0; i < archivedMetrics.length; i++) {
      const metric = archivedMetrics[i]
      
      // Create dates going back from 30 days ago, spaced 5 days apart
      const daysAgo = 30 + (i * 5)
      const newDate = new Date()
      newDate.setDate(newDate.getDate() - daysAgo)
      
      const newPublishedAt = newDate.toISOString()
      
      console.log(`Updating "${metric.title}" from ${metric.publishedAt} to ${newPublishedAt}`)
      
      const { error: updateError } = await supabase
        .from('metrics')
        .update({
          publishedAt: newPublishedAt,
          updatedAt: new Date().toISOString()
        })
        .eq('id', metric.id)
      
      if (updateError) {
        console.error(`Error updating metric ${metric.id}:`, updateError)
      } else {
        console.log(`✅ Updated ${metric.title}`)
      }
    }
    
    console.log('🎉 All archived metrics updated!')
    
    // Test the API call
    console.log('\n🧪 Testing API call...')
    const response = await fetch('https://topline-tlwi.vercel.app/api/metrics?vertical=All&status=ARCHIVED&page=1&limit=9')
    const data = await response.json()
    
    console.log(`API now returns ${data.metrics?.length || 0} archived metrics for "All" vertical`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixArchivedMetricsDates() 