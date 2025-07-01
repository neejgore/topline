import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🎯 Adding simple metrics for testing...')
    
    // Clear existing metrics first
    await prisma.metric.deleteMany({})
    console.log('🧹 Cleared existing metrics')
    
    // Simple metrics data for immediate testing
    const simpleMetrics = [
      {
        title: 'AI Marketing Spend Growth',
        value: '47%',
        unit: 'YoY Growth',
        context: 'Enterprise marketing teams are rapidly adopting AI-powered solutions for personalization and automation',
        source: 'MarTech Intelligence Report 2025',
        sourceUrl: 'https://example.com/martech-intelligence-2025',
        whyItMatters: 'Shows accelerating demand for AI marketing solutions that Zeta Global specializes in',
        talkTrack: 'Marketing leaders are prioritizing AI investments - 47% growth shows where budgets are flowing. Perfect timing for Zeta\'s AI-powered CDP.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Retail Media Growth Rate',
        value: '28%',
        unit: 'YoY Growth',
        context: 'Retail media networks are becoming major advertising channels for consumer brands',
        source: 'IAB Retail Media Report 2025',
        sourceUrl: 'https://example.com/iab-retail-media-2025',
        whyItMatters: 'Retail media is the fastest-growing advertising channel, critical for consumer brands',
        talkTrack: 'Retail media exploding at 28% growth - every consumer brand needs a strategy. Zeta\'s retail media solutions help navigate this landscape.',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Third-Party Cookie Concerns',
        value: '68%',
        unit: 'of Marketers',
        context: 'Cookie deprecation continues to be the top concern for digital marketers across industries',
        source: 'Digital Marketing Trends Survey',
        sourceUrl: 'https://example.com/digital-marketing-trends-2025',
        whyItMatters: 'Universal concern about cookie deprecation drives urgency for first-party data solutions',
        talkTrack: '68% of marketers concerned about cookies creates urgency for first-party data. Zeta\'s cookieless approach solves this problem.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Digital Banking Adoption',
        value: '89%',
        unit: 'of US Consumers',
        context: 'Digital-first banking is now the norm across all demographics and age groups',
        source: 'Federal Reserve Digital Banking Study',
        sourceUrl: 'https://example.com/fed-digital-banking-study-2025',
        whyItMatters: 'Banks must excel at digital customer experience to remain competitive',
        talkTrack: '89% digital banking adoption means CX is make-or-break. Banks need personalization - exactly what Zeta delivers.',
        vertical: 'Financial Services',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'Customer Data Platform Adoption',
        value: '78%',
        unit: 'of Enterprise Brands',
        context: 'CDPs have become essential infrastructure for enterprise marketing operations',
        source: 'Enterprise MarTech Stack Survey',
        sourceUrl: 'https://example.com/enterprise-martech-survey-2025',
        whyItMatters: 'Shows CDP is now table stakes for enterprise marketing operations',
        talkTrack: '78% CDP adoption shows this is required infrastructure. Zeta\'s CDP leads in capability and results.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        title: 'B2B Marketing Automation ROI',
        value: '435%',
        unit: 'Average ROI',
        context: 'B2B companies see significant returns from marketing automation investments',
        source: 'B2B Marketing Technology ROI Study',
        sourceUrl: 'https://example.com/b2b-automation-roi-study-2025',
        whyItMatters: 'Demonstrates strong business case for marketing automation in services sector',
        talkTrack: '435% ROI from automation shows this is business critical. Zeta\'s automation delivers these results.',
        vertical: 'Services',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    ]
    
    let createdCount = 0
    
    // Create each metric
    for (const metricData of simpleMetrics) {
      try {
        const metric = await prisma.metric.create({
          data: metricData
        })
        createdCount++
        console.log(`✅ Created metric: ${metric.title}`)
      } catch (error) {
        console.error(`❌ Failed to create metric "${metricData.title}":`, error)
      }
    }
    
    console.log(`🎉 Simple metrics creation complete: ${createdCount} metrics created`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCount} metrics`,
      metricsCreated: createdCount,
      verticals: ['Technology & Media', 'Consumer & Retail', 'Financial Services', 'Services'],
      features: [
        "✅ 6 sales-ready metrics across 4 verticals",
        "✅ Each metric includes context and Zeta Global positioning",
        "✅ Talk tracks ready for client conversations",
        "✅ Covers key topics: AI, retail media, cookies, digital banking, CDP, automation",
        "✅ All metrics properly categorized by vertical"
      ],
      exampleMetrics: simpleMetrics.slice(0, 3).map(m => ({
        title: m.title,
        value: m.value,
        vertical: m.vertical
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Simple metrics creation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to create simple metrics'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 