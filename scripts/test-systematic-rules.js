const { createClient } = require('@supabase/supabase-js')
const { CONTENT_SOURCES, VERTICALS } = require('../lib/content-sources')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSystematicRules() {
  console.log('🧪 Testing Systematic Rules Implementation')
  console.log('=' .repeat(50))
  
  console.log('\n📅 RULE 1: Weekday-only refresh (Monday-Friday 5am EST)')
  const now = new Date()
  const dayOfWeek = now.getDay()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  console.log(`Current day: ${dayNames[dayOfWeek]} (${dayOfWeek})`)
  console.log(`Should refresh: ${dayOfWeek >= 1 && dayOfWeek <= 5 ? '✅ YES' : '❌ NO (Weekend)'}`)
  
  console.log('\n📰 RULE 2: Articles - 24-hour lookback, no reuse')
  const { data: publishedArticles } = await supabase
    .from('articles')
    .select('id, title, publishedAt, sourceUrl, status')
    .eq('status', 'PUBLISHED')
    .order('publishedAt', { ascending: false })
    .limit(10)
  
  console.log(`Published articles: ${publishedArticles?.length || 0}`)
  
  if (publishedArticles) {
    publishedArticles.forEach((article, i) => {
      const publishedDate = new Date(article.publishedAt)
      const hoursAgo = Math.floor((now - publishedDate) / (1000 * 60 * 60))
      console.log(`  ${i + 1}. ${article.title.substring(0, 50)}...`)
      console.log(`     Published: ${hoursAgo} hours ago`)
      console.log(`     Within 24h: ${hoursAgo <= 24 ? '✅' : '❌'}`)
    })
  }
  
  // Check for duplicate articles
  const { data: allArticles } = await supabase
    .from('articles')
    .select('sourceUrl')
    .not('sourceUrl', 'is', null)
  
  const urlCounts = {}
  allArticles?.forEach(article => {
    urlCounts[article.sourceUrl] = (urlCounts[article.sourceUrl] || 0) + 1
  })
  
  const duplicateUrls = Object.entries(urlCounts).filter(([url, count]) => count > 1)
  console.log(`\nDuplicate articles found: ${duplicateUrls.length}`)
  if (duplicateUrls.length > 0) {
    console.log('❌ RULE VIOLATION: Same articles reused')
    duplicateUrls.forEach(([url, count]) => {
      console.log(`  ${url}: ${count} times`)
    })
  } else {
    console.log('✅ No duplicate articles (no reuse rule enforced)')
  }
  
  console.log('\n📊 RULE 3: Metrics - 90-day lookback, no reuse')
  const { data: publishedMetrics } = await supabase
    .from('metrics')
    .select('id, title, value, unit, publishedAt, createdAt, lastViewedAt, status')
    .eq('status', 'PUBLISHED')
    .order('publishedAt', { ascending: false })
    .limit(5)
  
  console.log(`Published metrics: ${publishedMetrics?.length || 0}`)
  
  if (publishedMetrics) {
    publishedMetrics.forEach((metric, i) => {
      const publishedDate = new Date(metric.publishedAt)
      const createdDate = new Date(metric.createdAt)
      const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
      console.log(`  ${i + 1}. ${metric.title}: ${metric.value} ${metric.unit}`)
      console.log(`     Created: ${daysAgo} days ago`)
      console.log(`     Within 90d: ${daysAgo <= 90 ? '✅' : '❌'}`)
      console.log(`     Last viewed: ${metric.lastViewedAt ? new Date(metric.lastViewedAt).toLocaleString() : 'Never'}`)
    })
  }
  
  // Check for reused metrics
  const { data: viewedMetrics } = await supabase
    .from('metrics')
    .select('id, title, lastViewedAt')
    .not('lastViewedAt', 'is', null)
    .eq('status', 'PUBLISHED')
  
  if (viewedMetrics && viewedMetrics.length > 0) {
    console.log('\n❌ RULE VIOLATION: Previously viewed metrics still published')
    viewedMetrics.forEach(metric => {
      console.log(`  ${metric.title}: Last viewed ${new Date(metric.lastViewedAt).toLocaleString()}`)
    })
  } else {
    console.log('\n✅ No reused metrics (no reuse rule enforced)')
  }
  
  console.log('\n🔄 RULE 4: All sources should be used')
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('sourceName, vertical')
    .eq('status', 'PUBLISHED')
    .gte('publishedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  
  const sourceCounts = {}
  const verticalCounts = {}
  
  recentArticles?.forEach(article => {
    sourceCounts[article.sourceName] = (sourceCounts[article.sourceName] || 0) + 1
    verticalCounts[article.vertical] = (verticalCounts[article.vertical] || 0) + 1
  })
  
  console.log('\nSource usage (last 7 days):')
  CONTENT_SOURCES.forEach(source => {
    const count = sourceCounts[source.name] || 0
    console.log(`  ${source.name}: ${count} articles ${count > 0 ? '✅' : '❌'}`)
  })
  
  console.log('\nVertical distribution:')
  VERTICALS.forEach(vertical => {
    const count = verticalCounts[vertical] || 0
    console.log(`  ${vertical}: ${count} articles`)
  })
  
  console.log('\n🎯 RULE 5: Content relevance to sales/marketing/tech professionals')
  const { data: sampleArticles } = await supabase
    .from('articles')
    .select('title, summary, whyItMatters, talkTrack, vertical')
    .eq('status', 'PUBLISHED')
    .limit(3)
  
  if (sampleArticles) {
    console.log('\nSample content analysis:')
    sampleArticles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`)
      console.log(`     Vertical: ${article.vertical}`)
      console.log(`     Why it matters: ${article.whyItMatters ? '✅ Present' : '❌ Missing'}`)
      console.log(`     Talk track: ${article.talkTrack ? '✅ Present' : '❌ Missing'}`)
    })
  }
  
  console.log('\n📈 SYSTEM STATUS SUMMARY')
  console.log('=' .repeat(50))
  
  const issues = []
  
  if (duplicateUrls.length > 0) {
    issues.push('Duplicate articles found')
  }
  
  if (viewedMetrics && viewedMetrics.length > 0) {
    issues.push('Previously viewed metrics still published')
  }
  
  const unusedSources = CONTENT_SOURCES.filter(source => !sourceCounts[source.name])
  if (unusedSources.length > 0) {
    issues.push(`${unusedSources.length} sources not used recently`)
  }
  
  if (issues.length === 0) {
    console.log('✅ All systematic rules are being followed correctly')
  } else {
    console.log('❌ Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }
  
  console.log('\n🔧 MANUAL ACTIONS AVAILABLE:')
  console.log('1. Run daily refresh: node scripts/manual-refresh.js')
  console.log('2. Test cron job: curl -H "Authorization: Bearer pasdogawegmasdngasd" https://topline-tlwi.vercel.app/api/cron/refresh-content')
  console.log('3. Check newsletter: https://topline-tlwi.vercel.app/newsletter/preview')
}

testSystematicRules().catch(console.error) 