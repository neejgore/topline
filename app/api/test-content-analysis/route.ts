import { NextResponse } from 'next/server'
import { ContentAnalysisService } from '@/lib/content-analysis'

export async function GET() {
  try {
    const contentAnalysis = new ContentAnalysisService()
    
    // Test with a sample article
    const testArticle = {
      title: "Meta's Business Messaging Product Lead Says Bringing Ads To WhatsApp Is 'An Evolution,' Not A Broken Promise",
      summary: "When WhatsApp began serving ads in mid-June, there were two main reactions. One, didn't the founders always insist there would never be ads on WhatsApp? And two, what the heck took Meta so long? It was only inevitable that Meta would roll out ads in an app that now has more than 3 billion monthly users.",
      sourceName: "AdExchanger"
    }
    
    console.log('Testing content analysis with:', testArticle.title)
    
    const insights = await contentAnalysis.generateInsights(testArticle)
    
    console.log('Generated insights:', insights)
    
    return NextResponse.json({
      success: true,
      testArticle,
      insights,
      message: 'Content analysis test completed successfully'
    })
    
  } catch (error) {
    console.error('Content analysis test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
} 