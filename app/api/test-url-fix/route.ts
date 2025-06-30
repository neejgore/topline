import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔧 Testing URL fix with detailed logging...')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Check if the article exists
    const testUrl = 'https://topline.platform/ai-marketing-budgets-2025'
    const existingArticle = await prisma.article.findFirst({
      where: { sourceUrl: testUrl }
    })
    
    console.log('🔍 Existing article:', existingArticle ? 'FOUND' : 'NOT FOUND')
    
    if (existingArticle) {
      console.log('📄 Article details:', {
        id: existingArticle.id,
        title: existingArticle.title,
        sourceUrl: existingArticle.sourceUrl,
        sourceName: existingArticle.sourceName
      })

      // Try to update it
      const newUrl = 'https://www.adexchanger.com/data-driven-thinking/cmos-double-down-ai-marketing-budgets-2025/'
      const newSource = 'AdExchanger'
      
      console.log('🔄 Attempting update...')
      const updateResult = await prisma.article.updateMany({
        where: { sourceUrl: testUrl },
        data: { 
          sourceUrl: newUrl,
          sourceName: newSource
        }
      })
      
      console.log('📝 Update result:', updateResult)
      
      // Verify the update
      const updatedArticle = await prisma.article.findFirst({
        where: { sourceUrl: newUrl }
      })
      
      console.log('✅ Verification:', updatedArticle ? 'SUCCESS' : 'FAILED')
      
      return NextResponse.json({
        success: true,
        test: {
          originalExists: !!existingArticle,
          updateCount: updateResult.count,
          verificationSuccess: !!updatedArticle,
          originalUrl: testUrl,
          newUrl: newUrl
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Test article not found',
        searchedUrl: testUrl
      })
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 