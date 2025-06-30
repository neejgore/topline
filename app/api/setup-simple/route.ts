import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  
  try {
    console.log('🔄 Starting simple database setup...')

    // Step 1: Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Step 2: Insert tags using raw SQL to avoid prepared statement conflicts
    console.log('🏷️  Creating initial tags...')
    
    const tags = [
      { id: 'tag1', name: 'AI', color: '#3B82F6' },
      { id: 'tag2', name: 'Privacy', color: '#EF4444' },
      { id: 'tag3', name: 'MarTech', color: '#10B981' },
      { id: 'tag4', name: 'AdTech', color: '#F59E0B' },
      { id: 'tag5', name: 'M&A', color: '#8B5CF6' },
      { id: 'tag6', name: 'Sales Enablement', color: '#EC4899' }
    ]

    for (const tag of tags) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "tags" ("id", "name", "color") 
          VALUES (${tag.id}, ${tag.name}, ${tag.color})
          ON CONFLICT ("name") DO NOTHING
        `
      } catch (error) {
        console.log(`Tag ${tag.name} might already exist, continuing...`)
      }
    }

    // Step 3: Insert sources using raw SQL
    console.log('📰 Creating content sources...')
    
    const sources = [
      { id: 'src1', name: 'AdExchanger', url: 'https://www.adexchanger.com', rssUrl: 'https://www.adexchanger.com/feed/' },
      { id: 'src2', name: 'MarTech Today', url: 'https://martech.org', rssUrl: 'https://martech.org/feed/' },
      { id: 'src3', name: 'Digiday', url: 'https://digiday.com', rssUrl: 'https://digiday.com/feed/' }
    ]

    for (const source of sources) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "sources" ("id", "name", "url", "rssUrl", "isActive", "createdAt", "updatedAt") 
          VALUES (${source.id}, ${source.name}, ${source.url}, ${source.rssUrl}, true, NOW(), NOW())
          ON CONFLICT ("name") DO NOTHING
        `
      } catch (error) {
        console.log(`Source ${source.name} might already exist, continuing...`)
      }
    }

    // Step 4: Add a sample article to test
    console.log('📝 Adding sample article...')
    
    try {
      await prisma.$executeRaw`
        INSERT INTO "articles" (
          "id", "title", "summary", "sourceUrl", "sourceName", 
          "whyItMatters", "talkTrack", "category", "vertical", 
          "priority", "status", "publishedAt", "createdAt", "updatedAt"
        ) VALUES (
          'art1', 
          'Welcome to Topline - Your Sales Intelligence Platform',
          'Topline delivers curated weekly sales intelligence for enterprise professionals in marketing, media, and technology. Get AI-powered insights and conversation starters.',
          'https://topline-platform.com/welcome',
          'Topline',
          'Sales teams need timely, relevant industry insights to start meaningful conversations with prospects. Generic news isn''t enough - you need curated intelligence with clear business implications.',
          'Use this as your conversation starter: "I saw some interesting developments in your industry this week. Are you seeing similar trends around [specific topic]?" Then pivot to how your solution addresses these market changes.',
          'NEWS',
          'SALES_ENABLEMENT',
          'HIGH',
          'PUBLISHED',
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT ("sourceUrl") DO NOTHING
      `
    } catch (error) {
      console.log('Sample article might already exist, continuing...')
    }

    // Step 5: Count what we have
    const [tagCount, sourceCount, articleCount] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "tags"`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "sources"`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "articles"`
    ])

    const response = {
      success: true,
      message: 'Database setup completed successfully!',
      results: {
        tagsTotal: Number((tagCount as any)[0].count),
        sourcesTotal: Number((sourceCount as any)[0].count),
        articlesTotal: Number((articleCount as any)[0].count)
      },
      timestamp: new Date().toISOString(),
      note: 'Visit your homepage to see the platform in action!'
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
  }
}

export async function GET() {
  return POST()
} 