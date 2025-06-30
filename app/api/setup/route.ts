import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ContentIngestionService } from '@/lib/content-ingestion'

export async function POST() {
  // Create fresh Prisma instance to avoid prepared statement conflicts
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Starting production database setup...')

    // Step 1: Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Step 2: Apply database schema
    console.log('🏗️  Database schema should be handled by Prisma migrations')
    
    // Step 3: Create some basic tags and sources
    console.log('🏷️  Creating initial tags...')
    
    const tags = [
      { name: 'AI', color: '#3B82F6' },
      { name: 'Privacy', color: '#EF4444' },
      { name: 'MarTech', color: '#10B981' },
      { name: 'AdTech', color: '#F59E0B' },
      { name: 'M&A', color: '#8B5CF6' },
      { name: 'Sales Enablement', color: '#EC4899' }
    ]

    for (const tagData of tags) {
      await prisma.tag.upsert({
        where: { name: tagData.name },
        update: {},
        create: tagData
      })
    }

    // Step 4: Create content sources
    console.log('📰 Creating content sources...')
    
    const sources = [
      {
        name: 'AdExchanger',
        url: 'https://www.adexchanger.com',
        rssUrl: 'https://www.adexchanger.com/feed/',
        isActive: true
      },
      {
        name: 'MarTech Today',
        url: 'https://martech.org',
        rssUrl: 'https://martech.org/feed/',
        isActive: true
      },
      {
        name: 'Digiday',
        url: 'https://digiday.com',
        rssUrl: 'https://digiday.com/feed/',
        isActive: true
      }
    ]

    for (const sourceData of sources) {
      await prisma.source.upsert({
        where: { name: sourceData.name },
        update: sourceData,
        create: sourceData
      })
    }

    // Step 5: Fetch initial real content
    console.log('📡 Fetching real content from RSS feeds...')
    
    const contentService = new ContentIngestionService()
    const result = await contentService.ingestFromRSSFeeds()
    
    console.log(`✅ Added ${result.articles} real articles, skipped ${result.skipped}`)

    // Step 6: Get final stats
    const stats = await contentService.getContentStats()

    const response = {
      success: true,
      message: 'Production database setup completed successfully!',
      results: {
        tagsCreated: tags.length,
        sourcesCreated: sources.length,
        articlesAdded: result.articles,
        articlesSkipped: result.skipped
      },
      stats: {
        totalArticles: stats.totalArticles,
        publishedArticles: stats.publishedArticles,
        recentArticles: stats.recentArticles
      },
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Setup completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  // Allow GET for easy testing
  return POST()
} 