import { NextResponse } from 'next/server'
import { diverseContentIngestionService } from '@/lib/diverse-content-ingestion'

export async function POST() {
  try {
    console.log('🚀 Starting diverse content refresh across all verticals...')
    
    const startTime = Date.now()
    
    // Use the new diverse content ingestion service
    const results = await diverseContentIngestionService.ingestDiverseContent()
    
    const duration = Math.round((Date.now() - startTime) / 1000)
    
    console.log(`🎉 Diverse content refresh complete: ${results.articles} articles across ${results.verticals.length} verticals`)
    
    return NextResponse.json({
      success: true,
      message: `Diverse content refresh completed successfully`,
      results: {
        articlesIngested: results.articles,
        verticalsProcessed: results.verticals,
        verticalBreakdown: results.verticals.map(v => `✅ ${v}`)
      },
      newFeatures: [
        "✅ Up to 50 articles from diverse verticals (not just Technology & Media)",
        "✅ Balanced distribution across Consumer & Retail, Financial Services, Healthcare, Insurance, Education, Travel, Automotive, Telecom, etc.",
        "✅ Zeta Global relevance scoring for 'ALL' page - shows top 12 most relevant for Zeta sellers",
        "✅ Proper vertical filtering - each vertical shows its own top 12 articles from full corpus",
        "✅ Content analysis with concise, non-truncated talk tracks",
        "✅ Real business value for sales conversations across all verticals"
      ],
      howItWorks: {
        ingestion: "Pulls balanced content from " + results.verticals.length + " different verticals",
        allPage: "Shows top 12 articles most relevant for Zeta Global business (CDP, personalization, AI marketing, etc.)",
        verticalPages: "When you click a vertical, shows top 12 articles for that specific vertical from the full corpus",
        scoring: "Each article gets Zeta relevance score based on business focus areas and industry relevance"
      },
      duration: `${duration} seconds`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Diverse content refresh failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to refresh content with diverse vertical distribution'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 