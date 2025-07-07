#!/usr/bin/env node

async function testNewsletterAPIs() {
  console.log('🔍 Testing newsletter API calls...')
  
  const baseUrl = 'https://topline-tlwi.vercel.app'
  
  try {
    // Test metrics API
    console.log('\n📊 Testing metrics API...')
    const metricsUrl = `${baseUrl}/api/metrics?limit=1&status=PUBLISHED`
    console.log(`URL: ${metricsUrl}`)
    
    const metricsResponse = await fetch(metricsUrl)
    const metricsData = await metricsResponse.json()
    
    console.log('Status:', metricsResponse.status)
    console.log('Metrics found:', metricsData.metrics?.length || 0)
    if (metricsData.metrics?.[0]) {
      console.log('First metric:', metricsData.metrics[0].title)
    }
    
    // Test articles API
    console.log('\n📰 Testing articles API...')
    const articlesUrl = `${baseUrl}/api/content?limit=10&status=PUBLISHED`
    console.log(`URL: ${articlesUrl}`)
    
    const articlesResponse = await fetch(articlesUrl)
    const articlesData = await articlesResponse.json()
    
    console.log('Status:', articlesResponse.status)
    console.log('Articles found:', articlesData.content?.length || 0)
    if (articlesData.content?.[0]) {
      console.log('First article:', articlesData.content[0].title)
    }
    
    // Test what newsletter function would get
    console.log('\n🔄 Testing newsletter function logic...')
    
    const newsletterContent = {
      metric: metricsData.metrics?.[0] || null,
      articles: articlesData.content || articlesData.articles || [],
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      })
    }
    
    console.log('Newsletter content:')
    console.log('- Metric:', newsletterContent.metric ? newsletterContent.metric.title : 'None')
    console.log('- Articles:', newsletterContent.articles.length)
    console.log('- Date:', newsletterContent.date)
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error)
  }
}

testNewsletterAPIs() 