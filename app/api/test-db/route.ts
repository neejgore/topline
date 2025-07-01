import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test 1: Connection test
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test 2: Simple query
    const count = await prisma.article.count()
    console.log(`📊 Current article count: ${count}`)
    
    // Test 3: Create a test article
    const testArticle = await prisma.article.create({
      data: {
        id: 'test-' + Date.now(),
        title: 'Database Test Article',
        summary: 'Testing database operations',
        sourceUrl: 'https://example.com/test',
        sourceName: 'Test Source',
        whyItMatters: 'Testing database connectivity',
        talkTrack: 'This is a test',
        category: 'NEWS',
        vertical: 'Technology & Media',
        priority: 'LOW',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('✅ Test article created:', testArticle.id)
    
    // Test 4: Verify it was created
    const newCount = await prisma.article.count()
    console.log(`📊 New article count: ${newCount}`)
    
    // Test 5: Clean up test article
    await prisma.article.delete({
      where: { id: testArticle.id }
    })
    console.log('🧹 Test article cleaned up')
    
    const finalCount = await prisma.article.count()
    console.log(`📊 Final article count: ${finalCount}`)
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: 'OK',
        initialCount: count,
        testArticleCreated: testArticle.id,
        countAfterCreate: newCount,
        finalCount: finalCount
      },
      message: 'All database tests passed!'
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 