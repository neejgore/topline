import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('Adding sample content to database...')

    // Clear existing sample articles first
    await prisma.article.deleteMany({
      where: {
        id: {
          startsWith: 'art-'
        }
      }
    })

    console.log('Cleared existing sample articles')

    // Add new sample articles with ONLY approved verticals
    const newArticles = [
      {
        id: 'art-new-1',
        title: 'Consumer & Retail Media Networks Capture $45B as Brands Shift from Walled Gardens',
        summary: 'Retail media spending accelerates as brands seek first-party data alternatives to traditional digital advertising platforms.',
        sourceUrl: 'https://www.adexchanger.com/commerce/retail-media-networks-45-billion-brands-shift-walled-gardens/',
        sourceName: 'AdExchanger',
        whyItMatters: 'Retail media offers closed-loop attribution and purchase data that traditional platforms can no longer provide due to privacy regulations.',
        talkTrack: 'Ask: "What percentage of your media budget goes to retail media networks?" Position as essential for reaching purchase-ready audiences.',
        category: 'NEWS',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-2',
        title: 'AI-Powered Programmatic Delivers 34% Better Performance Than Manual Buying',
        summary: 'Machine learning algorithms now outperform human media buyers across key performance metrics, driving industry-wide automation adoption.',
        sourceUrl: 'https://www.adexchanger.com/programmatic/ai-powered-programmatic-delivers-34-better-performance/',
        sourceName: 'AdExchanger',
        whyItMatters: 'Manual media buying is becoming obsolete as AI demonstrates consistent performance advantages across campaigns and verticals.',
        talkTrack: 'Ask: "What percentage of your media buying is still manual?" Position AI automation as competitive necessity, not luxury.',
        category: 'NEWS',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-3',
        title: 'B2B Marketers Abandon MQLs for Pipeline Velocity Metrics',
        summary: 'Leading B2B companies shift focus from Marketing Qualified Leads to pipeline velocity and revenue attribution as primary success metrics.',
        sourceUrl: 'https://martech.org/b2b-marketers-abandon-mqls-pipeline-velocity-metrics/',
        sourceName: 'Technology & Media Today',
        whyItMatters: 'MQLs are becoming irrelevant as B2B buyers increasingly research independently. Pipeline velocity better reflects marketing\'s true revenue impact.',
        talkTrack: 'Ask: "How do you currently measure marketing\'s impact on revenue?" Position pipeline velocity tracking as evolution beyond outdated MQL systems.',
        category: 'NEWS',
        vertical: 'Technology & Media',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-4',
        title: 'E-commerce Personalization Drives 19% Revenue Lift Across Verticals',
        summary: 'Advanced personalization engines are delivering significant revenue improvements across retail categories, with AI-driven recommendations leading gains.',
        sourceUrl: 'https://www.retaildive.com/news/ecommerce-personalization-drives-19-revenue-lift-verticals/654892/',
        sourceName: 'Retail Dive',
        whyItMatters: 'Personalization is moving from nice-to-have to competitive necessity as customers expect tailored experiences across all touchpoints.',
        talkTrack: 'Ask: "What\'s your current personalization ROI?" Highlight the 19% revenue lift as the competitive benchmark.',
        category: 'NEWS',
        vertical: 'Consumer & Retail',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-5',
        title: 'Financial Services Compliance Automation Reduces Review Time by 67%',
        summary: 'Financial services companies are deploying AI-powered compliance systems to accelerate marketing approval workflows and reduce regulatory risk.',
        sourceUrl: 'https://www.americanbanker.com/news/fintech-compliance-automation-reduces-review-time-67-percent',
        sourceName: 'American Banker',
        whyItMatters: 'Regulatory compliance is becoming a competitive advantage for financial companies that can move faster while maintaining compliance.',
        talkTrack: 'Ask: "How long does your current marketing compliance review process take?" Position automation as speed and risk reduction.',
        category: 'NEWS',
        vertical: 'Financial Services',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-6',
        title: 'Healthcare Marketing Attribution Challenges Drive First-Party Data Investment',
        summary: 'Healthcare marketers face unique attribution challenges due to privacy regulations, driving increased investment in first-party data strategies.',
        sourceUrl: 'https://www.healthcaredive.com/news/healthcare-marketing-attribution-first-party-data/654893/',
        sourceName: 'Healthcare Dive', 
        whyItMatters: 'Healthcare marketing requires compliant attribution methods that protect patient privacy while demonstrating campaign effectiveness.',
        talkTrack: 'Ask: "How do you currently measure marketing ROI while maintaining HIPAA compliance?" Position first-party data as the solution.',
        category: 'NEWS',
        vertical: 'Healthcare',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      }
    ]

    for (const article of newArticles) {
      await prisma.article.create({
        data: {
          ...article,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log(`✅ Added ${newArticles.length} sample articles`)

    return NextResponse.json({
      success: true,
      message: `Added ${newArticles.length} sample articles to database`,
      articles: newArticles.length
    })

  } catch (error) {
    console.error('Error adding sample content:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 