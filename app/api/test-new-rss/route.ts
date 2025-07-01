import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET() {
  try {
    console.log('🧪 Testing new RSS feeds directly...')
    
    // Test our newly integrated feeds
    const testFeeds = [
      { name: 'MediaPost - Online Media Daily', url: 'http://feeds.mediapost.com/online-media-daily' },
      { name: 'MediaPost - Media Daily News', url: 'http://feeds.mediapost.com/mediadailynews' },
      { name: 'MediaPost - TV News Daily', url: 'http://feeds.mediapost.com/television-news-daily' },
      { name: 'MediaPost - Social Media Marketing', url: 'http://feeds.mediapost.com/social-media-marketing-daily' },
      { name: 'Forbes CMO Network', url: 'https://www.forbes.com/sites/cmo/feed/' },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }
    ]

    const results = []

    for (const feed of testFeeds) {
      try {
        console.log(`📡 Testing: ${feed.name}`)
        
        const feedData = await parser.parseURL(feed.url)
        const items = feedData.items || []
        
        // Get first 3 articles for testing
        const sampleArticles = items.slice(0, 3).map(item => ({
          title: item.title,
          url: item.link,
          pubDate: item.pubDate,
          summary: (item.contentSnippet || '').substring(0, 150) + '...'
        }))

        results.push({
          feedName: feed.name,
          feedUrl: feed.url,
          status: 'SUCCESS',
          totalArticles: items.length,
          sampleArticles,
          latestDate: items[0]?.pubDate || 'No date'
        })

        console.log(`✅ ${feed.name}: ${items.length} articles found`)

      } catch (error) {
        console.error(`❌ Error testing ${feed.name}:`, error)
        results.push({
          feedName: feed.name,
          feedUrl: feed.url,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          totalArticles: 0,
          sampleArticles: [],
          latestDate: null
        })
      }
    }

    // Summary
    const working = results.filter(r => r.status === 'SUCCESS')
    const broken = results.filter(r => r.status === 'FAILED')

    return NextResponse.json({
      success: true,
      message: 'RSS feed test completed',
      summary: {
        totalFeeds: testFeeds.length,
        workingFeeds: working.length,
        brokenFeeds: broken.length
      },
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ RSS test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 