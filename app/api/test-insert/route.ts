import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🧪 Testing manual article insert...')

    const testArticle = {
      title: 'Test Article ' + Date.now(),
      summary: 'This is a test article to check database functionality',
      sourceUrl: 'https://example.com/test-' + Date.now(),
      sourceName: 'Test Source',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      vertical: 'Technology & Media',
      status: 'PUBLISHED',
      priority: 'MEDIUM',
      category: 'NEWS',
      whyItMatters: 'This is a test why it matters',
      talkTrack: 'This is a test talk track',
      importanceScore: 0,
      views: 0,
      clicks: 0,
      shares: 0
    }

    console.log('📝 Inserting test article:', JSON.stringify(testArticle, null, 2))

    const { data, error } = await supabase
      .from('articles')
      .insert(testArticle)
      .select()

    if (error) {
      console.error('❌ Error inserting test article:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 })
    }

    console.log('✅ Successfully inserted test article:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Test article inserted successfully',
      data: data 
    })

  } catch (error) {
    console.error('❌ Test insert failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 