import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET() {
  try {
    console.log('🔄 Testing RSS feed ingestion...')

    // Test one RSS feed
    const testUrl = 'https://www.adexchanger.com/feed/'
    console.log(`📡 Fetching from ${testUrl}...`)
    
    const feed = await parser.parseURL(testUrl)
    console.log(`📰 Found ${feed.items?.length || 0} items`)

    if (!feed.items?.length) {
      return NextResponse.json({
        success: false,
        error: 'No items found in RSS feed',
        feedUrl: testUrl
      })
    }

    // Show first few items
    const sampleItems = feed.items.slice(0, 3).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet?.substring(0, 200) + '...'
    }))

    // Test keyword filtering
    const keywordFilters = [
      'artificial intelligence', 'machine learning', 'AI advertising', 'programmatic AI',
      'third-party cookies', 'privacy regulations', 'GDPR', 'CCPA', 'data privacy',
      'customer data platform', 'CDP', 'marketing automation', 'personalization',
      'attribution', 'marketing mix modeling', 'MMM',
      'programmatic advertising', 'demand side platform', 'DSP'
    ]

    const relevantItems = feed.items.filter(item => {
      const text = `${item.title} ${item.contentSnippet}`.toLowerCase()
      return keywordFilters.some(keyword => text.includes(keyword.toLowerCase()))
    })

    return NextResponse.json({
      success: true,
      results: {
        totalItems: feed.items.length,
        relevantItems: relevantItems.length,
        sampleItems,
        relevantTitles: relevantItems.slice(0, 5).map(item => item.title)
      }
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

export async function POST() {
  return GET()
} 