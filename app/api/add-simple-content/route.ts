import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔄 Adding simple content...')

    // Create articles with ONLY required fields
    const articles = [
      {
        title: 'AI Marketing Budget Allocation Shifts 40% to Programmatic in 2025',
        summary: 'Enterprise marketing departments are reallocating significant portions of their budgets from traditional channels to AI-driven programmatic advertising.',
        sourceUrl: 'https://www.adexchanger.com/ai-marketing-budgets-2025/',
        sourceName: 'AdExchanger',
        whyItMatters: 'This represents the largest budget shift in marketing history, signaling the end of traditional media buying.',
        talkTrack: 'Ask: "What percentage of your 2025 budget is allocated to AI-driven channels?" Position programmatic as competitive necessity.',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        title: 'Retail Media Networks See 67% Growth as Brands Abandon Walled Gardens',
        summary: 'Major retail media networks report unprecedented growth as brands seek alternatives to traditional digital advertising platforms.',
        sourceUrl: 'https://www.retaildive.com/retail-media-growth-2025/',
        sourceName: 'Retail Dive',
        whyItMatters: 'Retail media offers first-party data and closed-loop attribution that traditional platforms can no longer provide.',
        talkTrack: 'Ask: "How much of your media budget goes to retail media networks?" Position as essential for reaching purchase-ready audiences.',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        title: 'Financial Services Compliance Costs Drop 45% with Marketing Automation',
        summary: 'Financial institutions are deploying AI-powered compliance systems to reduce marketing review time and regulatory risk.',
        sourceUrl: 'https://www.americanbanker.com/fintech-compliance-automation-2025/',
        sourceName: 'American Banker',
        whyItMatters: 'Compliance automation is becoming a competitive advantage for financial companies that can move faster while maintaining regulatory compliance.',
        talkTrack: 'Ask: "How long does your current marketing compliance review take?" Position automation as speed and risk reduction.',
        vertical: 'Financial Services',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      }
    ]

    let created = 0
    for (const articleData of articles) {
      try {
        const article = await prisma.article.create({
          data: {
            ...articleData,
            publishedAt: new Date()
          }
        })
        created++
        console.log(`✅ Created: ${article.title}`)
      } catch (error) {
        console.error(`❌ Failed to create article: ${articleData.title}`, error)
      }
    }

    console.log(`✅ Created ${created} articles`)

    return NextResponse.json({
      success: true,
      message: `Created ${created} articles`,
      articlesCreated: created,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error adding simple content:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}

 