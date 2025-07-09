import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const Parser = require('rss-parser')
const parser = new Parser()

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔄 Starting SIMPLE content refresh...')
    
    // Test with just one RSS feed
    const testUrl = 'https://martech.org/feed/'
    console.log(`📡 Testing with single RSS feed: ${testUrl}`)
    
    const feed = await parser.parseURL(testUrl)
    console.log(`📰 Found ${feed.items.length} RSS items`)
    
    let insertedCount = 0
    
    // Process just the first 3 items
    for (let i = 0; i < Math.min(3, feed.items.length); i++) {
      const item = feed.items[i]
      
      if (!item.title || !item.link) {
        console.log(`⚠️  Skipping item ${i}: missing title or link`)
        continue
      }
      
      console.log(`🔍 Processing item ${i}: ${item.title}`)
      
      const testArticle = {
        title: item.title,
        summary: item.contentSnippet || item.content || 'No summary available',
        sourceUrl: item.link,
        sourceName: 'MarTech',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        vertical: 'Technology & Media',
        status: 'PUBLISHED',
        priority: 'MEDIUM',
        category: 'NEWS',
        whyItMatters: 'This development represents a significant shift in the marketing technology landscape.',
        talkTrack: 'I saw this MarTech news and thought of our conversation about industry trends.',
        importanceScore: 0,
        views: 0,
        clicks: 0,
        shares: 0
      }
      
      console.log(`💾 Inserting article: ${item.title}`)
      
      const { data, error } = await supabase
        .from('articles')
        .insert(testArticle)
        .select()
      
      if (error) {
        console.error(`❌ Error inserting article ${i}:`, error)
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          details: error 
        }, { status: 500 })
      }
      
      console.log(`✅ Successfully inserted article ${i}:`, data)
      insertedCount++
    }
    
    console.log(`🎉 Successfully inserted ${insertedCount} articles`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Simple content refresh completed - inserted ${insertedCount} articles`,
      totalArticles: insertedCount
    })

  } catch (error) {
    console.error('❌ Simple content refresh failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 