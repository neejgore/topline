const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkArchivedMetrics() {
  try {
    console.log('🔍 Checking archived metrics...')
    
    // Get all metrics
    const { data: allMetrics, error: allError } = await supabase
      .from('metrics')
      .select('*')
      .order('publishedAt', { ascending: false })
    
    if (allError) {
      console.error('Error fetching all metrics:', allError)
      return
    }
    
    console.log(`📊 Total metrics in database: ${allMetrics.length}`)
    
    // Group by status
    const byStatus = allMetrics.reduce((acc, metric) => {
      acc[metric.status] = (acc[metric.status] || 0) + 1
      return acc
    }, {})
    
    console.log('📈 Metrics by status:', byStatus)
    
    // Get archived metrics
    const archivedMetrics = allMetrics.filter(m => m.status === 'ARCHIVED')
    console.log(`📁 Archived metrics: ${archivedMetrics.length}`)
    
    if (archivedMetrics.length > 0) {
      console.log('\n🏷️  Archived metrics by vertical:')
      const byVertical = archivedMetrics.reduce((acc, metric) => {
        acc[metric.vertical] = (acc[metric.vertical] || 0) + 1
        return acc
      }, {})
      console.log(byVertical)
      
      console.log('\n📋 First few archived metrics:')
      archivedMetrics.slice(0, 3).forEach(metric => {
        console.log(`- ${metric.title} (${metric.vertical}) - ${metric.publishedAt}`)
      })
    }
    
    // Test the API call that the archive page makes
    console.log('\n🔗 Testing archive API call...')
    const testUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/metrics?vertical=All&status=ARCHIVED&page=1&limit=9`
    console.log(`URL: ${testUrl}`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkArchivedMetrics() 