import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { prisma } from '@/lib/db'

const parser = new Parser()

export async function POST() {
  try {
    console.log('🔧 Starting simple test refresh...')
    
    // Test database connection
    try {
      const testCount = await prisma.article.count()
      console.log(`📊 Current article count: ${testCount}`)
    } catch (error) {
      console.error('❌ Database connection error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown DB error'
      }, { status: 500 })
    }
    
    // Test single RSS feed
    console.log('📡 Testing single RSS feed...')
    try {
      const feed = await parser.parseURL('https://www.adexchanger.com/feed/')
      console.log(`📰 Found ${feed.items?.length || 0} items in AdExchanger feed`)
      
      if (feed.items && feed.items.length > 0) {
        const firstItem = feed.items[0]
        console.log(`🔍 First item: ${firstItem.title}`)
        
        // Try to save one article directly
        try {
          const article = await prisma.article.create({
            data: {
              title: firstItem.title || 'Test Article',
              summary: firstItem.contentSnippet?.slice(0, 200) || 'Test summary',
              sourceUrl: firstItem.link || 'https://test.com',
              sourceName: 'AdExchanger',
              publishedAt: firstItem.pubDate ? new Date(firstItem.pubDate) : new Date(),
              vertical: 'Technology & Media',
              priority: 'MEDIUM',
              status: 'PUBLISHED',
              whyItMatters: 'Test why it matters',
              talkTrack: 'Test talk track'
            }
          })
          
          console.log(`✅ Successfully created article: ${article.id}`)
          
          return NextResponse.json({
            success: true,
            message: 'Simple test refresh successful',
            results: {
              databaseWorking: true,
              rssWorking: true,
              articlesCreated: 1,
              testArticle: {
                id: article.id,
                title: article.title,
                vertical: article.vertical
              }
            },
            feedInfo: {
              totalItems: feed.items.length,
              feedTitle: feed.title,
              firstItemTitle: firstItem.title
            }
          })
          
        } catch (dbError) {
          console.error('❌ Database write error:', dbError)
          return NextResponse.json({
            success: false,
            error: 'Database write failed',
            details: dbError instanceof Error ? dbError.message : 'Unknown DB write error',
            feedWorking: true,
            databaseWorking: false
          }, { status: 500 })
        }
        
      } else {
        return NextResponse.json({
          success: false,
          error: 'No items found in RSS feed',
          feedTitle: feed.title || 'Unknown'
        }, { status: 400 })
      }
      
    } catch (rssError) {
      console.error('❌ RSS parsing error:', rssError)
      return NextResponse.json({
        success: false,
        error: 'RSS parsing failed',
        details: rssError instanceof Error ? rssError.message : 'Unknown RSS error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ General error:', error)
    return NextResponse.json({
      success: false,
      error: 'General failure',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 