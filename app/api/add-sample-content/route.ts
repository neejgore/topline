import { NextResponse } from 'next/server'

export async function POST() {
  let pool: any = null
  
  try {
    console.log('🔄 Adding sample content to maximize articles and metrics...')
    
    const { Pool } = require('pg')
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    
    const now = new Date()
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 2) // 2 days ago to ensure it's within the week

    // Add 7 more articles to reach 10 total (we already have 3)
    const newArticles = [
      {
        id: 'art-new-1',
        title: 'Retail Media Networks Capture $45B as Brands Shift from Walled Gardens',
        summary: 'Amazon, Walmart, and Target are capturing massive ad dollars as brands seek first-party data alternatives to declining social media targeting capabilities.',
        sourceUrl: 'https://topline.platform/retail-media-45b-shift',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Retail media offers closed-loop attribution and purchase data that traditional platforms can no longer provide due to privacy regulations.',
        talkTrack: 'Ask: "What percentage of your media budget goes to retail media networks?" Position as essential for reaching purchase-ready audiences.',
        category: 'NEWS',
        vertical: 'RETAIL',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-2',
        title: 'Connected TV Ad Fraud Surges 340% as Programmatic Scales',
        summary: 'CTV advertising fraud is exploding as more budgets shift to streaming platforms, with sophisticated bot networks targeting high-value inventory.',
        sourceUrl: 'https://topline.platform/ctv-fraud-surge-340',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'CTV fraud threatens the credibility of the fastest-growing advertising channel. Brands need fraud detection as budgets scale.',
        talkTrack: 'Lead with: "How much of your CTV spend do you think is being lost to fraud?" Focus on verification and fraud prevention tools.',
        category: 'NEWS',
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-3',
        title: 'B2B Marketers Abandon MQLs for Pipeline Velocity Metrics',
        summary: 'Marketing teams are ditching traditional lead qualification metrics in favor of pipeline velocity and deal acceleration measurements.',
        sourceUrl: 'https://topline.platform/b2b-pipeline-velocity-metrics',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Pipeline velocity metrics better align marketing with revenue outcomes, showing real impact on sales cycles and deal closure.',
        talkTrack: 'Ask: "How do you currently measure marketing\'s impact on deal velocity?" Position advanced attribution platforms.',
        category: 'NEWS',
        vertical: 'MARTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-4',
        title: 'E-commerce Personalization Drives 19% Revenue Lift Across Verticals',
        summary: 'Advanced personalization engines are delivering significant revenue improvements across retail categories, with AI-driven recommendations leading gains.',
        sourceUrl: 'https://topline.platform/ecommerce-personalization-19-lift',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Personalization is moving from nice-to-have to competitive necessity as customers expect tailored experiences across all touchpoints.',
        talkTrack: 'Ask: "What\'s your current personalization ROI?" Highlight the 19% revenue lift as the competitive benchmark.',
        category: 'NEWS',
        vertical: 'ECOMMERCE',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-5',
        title: 'Fintech Compliance Automation Reduces Review Time by 67%',
        summary: 'Financial services companies are deploying AI-powered compliance systems to accelerate marketing approval workflows and reduce regulatory risk.',
        sourceUrl: 'https://topline.platform/fintech-compliance-automation-67',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Regulatory compliance is becoming a competitive advantage for fintech companies that can move faster while maintaining compliance.',
        talkTrack: 'Ask: "How long does your current marketing compliance review process take?" Position automation as speed and risk reduction.',
        category: 'NEWS',
        vertical: 'FINTECH',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-6',
        title: 'Healthcare Marketing Shifts to Patient Journey Orchestration',
        summary: 'Healthcare organizations are moving beyond demographics to focus on patient journey stages, using health data for precision marketing.',
        sourceUrl: 'https://topline.platform/healthcare-patient-journey-orchestration',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Patient journey orchestration enables healthcare marketers to deliver relevant messaging at critical decision points in care.',
        talkTrack: 'Ask: "How do you currently target patients at different stages of their health journey?" Focus on journey mapping platforms.',
        category: 'NEWS',
        vertical: 'HEALTHTECH',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art-new-7',
        title: 'Revenue Operations Teams Demand Unified Customer Data Platforms',
        summary: 'RevOps teams are consolidating customer data across sales, marketing, and success teams to enable better forecasting and attribution.',
        sourceUrl: 'https://topline.platform/revops-unified-customer-data-platforms',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Unified customer data is essential for accurate revenue attribution and forecasting as businesses demand better predictability.',
        talkTrack: 'Ask: "How fragmented is your customer data across sales and marketing systems?" Position CDP as revenue operations infrastructure.',
        category: 'NEWS',
        vertical: 'REVENUE_OPS',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      }
    ]

    // Add 2 more metrics to reach 5 total (we already have 3)
    const newMetrics = [
      {
        id: 'met-new-1',
        title: '89% of Retail Media Budgets Shift to In-Store',
        value: '89%',
        description: 'Retailers are moving beyond online advertising to in-store digital experiences, with 89% of retail media budgets now including physical location activation.',
        source: 'Retail Media Insights 2024',
        howToUse: 'Demonstrate the evolution of retail media beyond digital-only strategies.',
        talkTrack: 'Ask: "How are you leveraging in-store digital experiences to complement your online retail media strategy?"',
        vertical: 'RETAIL',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'met-new-2',
        title: '156% Increase in Marketing Compliance Costs',
        value: '156%',
        description: 'Marketing compliance costs have increased 156% as companies invest in systems and processes to meet evolving privacy and financial regulations.',
        source: 'Compliance Cost Study 2024',
        howToUse: 'Highlight the growing importance of compliance automation and efficient review processes.',
        talkTrack: 'Ask: "How have your marketing compliance costs changed over the past year?" Position automation as cost control.',
        vertical: 'FINTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      }
    ]

    console.log('📝 Adding 7 new articles...')
    for (const article of newArticles) {
      await pool.query(`
        INSERT INTO articles (
          id, title, summary, "sourceUrl", "sourceName", "whyItMatters", "talkTrack",
          category, vertical, priority, status, "publishedAt", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $12)
      `, [
        article.id, article.title, article.summary, article.sourceUrl, article.sourceName,
        article.whyItMatters, article.talkTrack, article.category, article.vertical,
        article.priority, article.status, thisWeek
      ])
    }

    console.log('📊 Adding 2 new metrics...')
    for (const metric of newMetrics) {
      await pool.query(`
        INSERT INTO metrics (
          id, title, value, description, source, "howToUse", "talkTrack",
          vertical, priority, status, "publishedAt", "createdAt", "updatedAt"  
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $11)
      `, [
        metric.id, metric.title, metric.value, metric.description, metric.source,
        metric.howToUse, metric.talkTrack, metric.vertical, metric.priority, metric.status, thisWeek
      ])
    }

    // Get final counts
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const [articleCount, metricCount] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as count FROM articles 
        WHERE status = 'PUBLISHED' AND "publishedAt" >= $1
      `, [oneWeekAgo]),
      pool.query(`
        SELECT COUNT(*) as count FROM metrics 
        WHERE status = 'PUBLISHED' AND "publishedAt" >= $1
      `, [oneWeekAgo])
    ])

    const totalArticles = parseInt(articleCount.rows[0].count)
    const totalMetrics = parseInt(metricCount.rows[0].count)

    await pool.end()

    return NextResponse.json({
      success: true,
      message: 'Sample content added successfully! Now maximized for 10 articles + 5 metrics.',
      details: {
        articlesAdded: newArticles.length,
        metricsAdded: newMetrics.length,
        totalNowVisible: {
          articles: totalArticles,
          metrics: totalMetrics
        },
        verticalDistribution: {
          RETAIL: 'Articles + Metrics',
          ADTECH: 'Articles',
          MARTECH: 'Articles + Metrics',
          ECOMMERCE: 'Articles + Metrics',
          FINTECH: 'Articles + Metrics',
          HEALTHTECH: 'Articles',
          REVENUE_OPS: 'Articles + Metrics'
        }
      }
    })

  } catch (error) {
    console.error('❌ Add content failed:', error)
    
    if (pool) {
      try { await pool.end() } catch {}
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 