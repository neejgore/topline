import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ContentIngestionService } from '@/lib/content-ingestion'
import { duplicatePreventionService } from '@/lib/duplicate-prevention'

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive content refresh...')
    
    const startTime = Date.now()
    const ingestionService = new ContentIngestionService()

    // Step 1: Clear old content (but keep some recent articles)
    console.log('🧹 Clearing old content...')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // Step 1: Clear old articles only (keep metrics to prevent duplicates)
    const deletedArticles = await prisma.article.deleteMany({
      where: {
        publishedAt: {
          lt: sevenDaysAgo
        }
      }
    })

    console.log(`🗑️ Deleted ${deletedArticles.count} old articles`)

    // Step 2: Add fresh metrics data with duplicate prevention
    console.log('📊 Adding metrics data with duplicate prevention...')
    const metrics = [
      {
        title: 'Global Digital Ad Spend Growth',
        value: '12.4%',
        unit: 'YoY Growth',
        context: 'Digital advertising spending increased 12.4% year-over-year, reaching $602 billion globally in 2024.',
        source: 'IAB Digital Ad Revenue Report 2024',
        sourceUrl: 'https://www.iab.com/insights/digital-ad-revenue-report-2024/',
        whyItMatters: 'Sustained double-digit growth indicates continued advertiser confidence in digital channels despite economic headwinds.',
        talkTrack: 'Ask: "What percentage of your media budget is digital vs traditional?" Position digital transformation as competitive necessity.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        title: 'AI Marketing Tool Adoption Rate',
        value: '73%',
        unit: 'of Enterprises',
        context: '73% of enterprise marketing teams have adopted at least one AI-powered marketing tool in the past 12 months.',
        source: 'Marketing AI Adoption Survey 2024',
        sourceUrl: 'https://www.marketingaisurvey.com/2024-report/',
        whyItMatters: 'AI adoption is accelerating rapidly, creating competitive advantages for early adopters and risks for laggards.',
        talkTrack: 'Ask: "Which AI marketing tools is your team currently using?" Position AI as table stakes, not innovation.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        title: 'Retail Media Network Revenue',
        value: '$54.8B',
        unit: 'Annual Revenue',
        context: 'Retail media networks generated $54.8 billion in revenue in 2024, representing 67% growth from 2023.',
        source: 'Retail Media Landscape Report',
        sourceUrl: 'https://www.retailmediaconsulting.com/landscape-2024/',
        whyItMatters: 'Retail media is the fastest-growing advertising category, offering first-party data and closed-loop attribution.',
        talkTrack: 'Ask: "What percentage of your budget goes to retail media vs traditional digital?" Position as essential for attribution.',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        title: 'Marketing Compliance Review Time',
        value: '8.3',
        unit: 'Days Average',
        context: 'Financial services firms average 8.3 days for marketing compliance reviews, down from 12.1 days in 2023.',
        source: 'Financial Marketing Compliance Report',
        sourceUrl: 'https://www.financialcompliance.org/marketing-review-2024/',
        whyItMatters: 'Faster compliance reviews enable financial firms to respond more quickly to market opportunities and competitive threats.',
        talkTrack: 'Ask: "How long do your marketing compliance reviews currently take?" Position automation as speed advantage.',
        vertical: 'Financial Services',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        title: 'Healthcare Marketing ROI Attribution',
        value: '34%',
        unit: 'Improvement',
        context: 'Healthcare organizations using first-party data for marketing attribution see 34% better ROI measurement accuracy.',
        source: 'Healthcare Marketing Attribution Study',
        sourceUrl: 'https://www.healthcaremarketing.org/attribution-study-2024/',
        whyItMatters: 'HIPAA-compliant attribution methods are essential for healthcare marketers to demonstrate campaign effectiveness.',
        talkTrack: 'Ask: "How do you currently measure marketing ROI while maintaining HIPAA compliance?" Position first-party data solutions.',
        vertical: 'Healthcare',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      }
    ]

    let metricsCreated = 0
    let metricsSkipped = 0
    
    for (const metricData of metrics) {
      try {
        const result = await duplicatePreventionService.createMetricSafely({
          ...metricData,
          publishedAt: new Date()
        })
        
        if (result.success) {
          metricsCreated++
          console.log(`✅ Created metric: ${metricData.title}`)
        } else {
          metricsSkipped++
          console.log(`⏭️  Skipped metric: ${metricData.title} (${result.reason})`)
        }
      } catch (error) {
        console.error(`❌ Failed to create metric: ${metricData.title}`, error)
        metricsSkipped++
      }
    }

    console.log(`📊 Metrics summary: ${metricsCreated} created, ${metricsSkipped} skipped`)

    // Step 3: Fetch content from all RSS sources with optimized settings
    console.log('🔄 Fetching from all RSS sources...')
    const rssResults = await ingestionService.ingestFromRSSFeeds()

    // Step 4: Get final stats
    const [
      totalArticles,
      totalMetrics,
      publishedArticles,
      publishedMetrics
    ] = await Promise.all([
      prisma.article.count(),
      prisma.metric.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.metric.count({ where: { status: 'PUBLISHED' } })
    ])

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`🎉 Comprehensive refresh complete in ${duration}s`)

    return NextResponse.json({
      success: true,
      message: 'Comprehensive content refresh completed successfully',
      results: {
        deletedArticles: deletedArticles.count,
        metricsCreated,
        metricsSkipped,
        rssArticlesAdded: rssResults.articles,
        rssArticlesSkipped: rssResults.skipped,
        finalStats: {
          totalArticles,
          publishedArticles,
          totalMetrics,
          publishedMetrics
        }
      },
      duration: `${duration} seconds`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Comprehensive refresh failed:', error)
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