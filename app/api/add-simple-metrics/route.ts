import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('📊 Adding simple metrics...')

    // Create metrics with minimal required fields
    const metrics = [
      {
        title: 'Global Digital Ad Spend Growth',
        value: '12.4%',
        unit: 'YoY Growth',
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
        source: 'Healthcare Marketing Attribution Study',
        sourceUrl: 'https://www.healthcaremarketing.org/attribution-study-2024/',
        whyItMatters: 'HIPAA-compliant attribution methods are essential for healthcare marketers to demonstrate campaign effectiveness.',
        talkTrack: 'Ask: "How do you currently measure marketing ROI while maintaining HIPAA compliance?" Position first-party data solutions.',
        vertical: 'Healthcare',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      }
    ]

    let created = 0
    for (const metricData of metrics) {
      try {
        const metric = await prisma.metric.create({
          data: {
            ...metricData,
            publishedAt: new Date()
          }
        })
        created++
        console.log(`✅ Created metric: ${metric.title}`)
      } catch (error) {
        console.error(`❌ Failed to create metric: ${metricData.title}`, error)
      }
    }

    console.log(`✅ Created ${created} metrics`)

    return NextResponse.json({
      success: true,
      message: `Created ${created} metrics`,
      metricsCreated: created,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error adding simple metrics:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 