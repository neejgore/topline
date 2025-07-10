import { NextRequest, NextResponse } from 'next/server'

// Import the newsletter service
const { getNewsletterContent } = require('../../../../lib/newsletter-service')

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Starting newsletter content debug...')
    
    const baseUrl = 'https://topline-tlwi.vercel.app'
    
    // Test direct API calls first
    console.log('🔍 DEBUG: Testing direct API calls...')
    
    const metricsResponse = await fetch(`${baseUrl}/api/metrics?limit=1&status=PUBLISHED`)
    const metricsData = await metricsResponse.json()
    
    const contentResponse = await fetch(`${baseUrl}/api/content?limit=10&status=PUBLISHED`)
    const contentData = await contentResponse.json()
    
    console.log('🔍 DEBUG: Direct API results:')
    console.log('Metrics response status:', metricsResponse.status)
    console.log('Metrics data:', JSON.stringify(metricsData, null, 2))
    console.log('Content response status:', contentResponse.status)
    console.log('Content count:', contentData.content?.length || 0)
    
    // Test newsletter service
    console.log('🔍 DEBUG: Testing newsletter service...')
    const newsletterContent = await getNewsletterContent(baseUrl)
    
    console.log('🔍 DEBUG: Newsletter service result:')
    console.log('Newsletter content:', JSON.stringify(newsletterContent, null, 2))
    
    return NextResponse.json({
      success: true,
      debug: {
        directAPIs: {
          metrics: {
            status: metricsResponse.status,
            count: metricsData.metrics?.length || 0,
            firstMetric: metricsData.metrics?.[0]?.title || 'None'
          },
          content: {
            status: contentResponse.status,
            count: contentData.content?.length || 0,
            firstArticle: contentData.content?.[0]?.title || 'None'
          }
        },
        newsletterService: {
          metric: newsletterContent.metric ? newsletterContent.metric.title : 'None',
          articles: newsletterContent.articles.length,
          totalArticles: newsletterContent.totalArticles,
          date: newsletterContent.date
        }
      }
    })

  } catch (error) {
    console.error('❌ DEBUG: Newsletter debug error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Debug failed',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
} 