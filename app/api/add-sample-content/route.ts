import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔄 Resetting and adding expanded content using direct SQL...')

    // Using node-postgres directly to bypass Prisma prepared statement issues
    const { Pool } = require('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Clear existing content first
    console.log('🗑️ Clearing existing content...')
    await pool.query('DELETE FROM articles')
    await pool.query('DELETE FROM metrics')

    // Insert sample articles - expanded to 10 articles across verticals
    const articles = [
      {
        id: 'art1',
        title: 'CMOs Double Down on AI Marketing Budgets for 2025',
        summary: 'Marketing leaders are significantly increasing AI investments, with 73% planning to expand AI budgets by 30% or more next year. Focus areas include personalization, attribution, and customer journey optimization.',
        sourceUrl: 'https://topline.platform/ai-marketing-budgets-2025',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'AI adoption is accelerating across marketing teams. Companies that don\'t adapt risk falling behind competitors who are leveraging AI for efficiency and better customer targeting.',
        talkTrack: 'Ask: "How is your team currently using AI in your marketing operations?" Position AI solutions as competitive necessities, not experimental tools.',
        category: 'NEWS',
        vertical: 'MARTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art2', 
        title: 'Third-Party Cookie Deprecation Creates $15B Attribution Gap',
        summary: 'As Chrome phases out third-party cookies, marketing attribution becomes significantly more challenging. Brands are scrambling to implement first-party data strategies and server-side tracking.',
        sourceUrl: 'https://topline.platform/cookie-deprecation-attribution-gap',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Privacy regulations and cookie deprecation are reshaping digital marketing. Brands need first-party data strategies to maintain targeting effectiveness and measurement accuracy.',
        talkTrack: 'Lead with: "What\'s your plan for reaching customers as third-party data becomes unavailable?" Focus on first-party data collection and identity resolution solutions.',
        category: 'NEWS',
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art3',
        title: 'Revenue Operations Teams Grow 40% as Sales-Marketing Alignment Becomes Critical',
        summary: 'Companies are rapidly expanding RevOps teams to bridge sales and marketing gaps. Focus is on unified data, shared metrics, and coordinated customer journey management.',
        sourceUrl: 'https://topline.platform/revops-growth-alignment',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Revenue operations is becoming a critical function as companies demand better alignment between sales and marketing for improved conversion rates and customer experience.',
        talkTrack: 'Ask: "How aligned are your sales and marketing teams on lead definitions and handoff processes?" Position RevOps tools as essential for growth.',
        category: 'NEWS',
        vertical: 'REVENUE_OPS',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art4',
        title: 'Retail Media Networks Hit $60B as Brands Shift Budgets from Social',
        summary: 'Retailers like Amazon, Walmart, and Target are capturing massive ad spend as brands seek first-party data alternatives. Retail media now represents 18% of total digital ad spending.',
        sourceUrl: 'https://topline.platform/retail-media-networks-60b',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Retail media offers unprecedented targeting precision and closed-loop attribution that traditional social platforms can no longer provide due to privacy changes.',
        talkTrack: 'Ask: "What percentage of your media budget is allocated to retail media networks?" Position retail media as essential for reaching purchase-ready consumers.',
        category: 'NEWS',
        vertical: 'RETAIL',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art5',
        title: 'E-commerce Conversion Rates Drop 23% as Economic Pressures Mount',
        summary: 'Online retailers are seeing significant conversion rate declines as consumers become more price-sensitive. Companies are investing heavily in personalization and dynamic pricing strategies.',
        sourceUrl: 'https://topline.platform/ecommerce-conversion-decline',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Economic headwinds are forcing e-commerce brands to optimize every touchpoint. Conversion rate optimization is becoming a survival strategy, not just growth tactic.',
        talkTrack: 'Lead with: "How has your conversion rate changed over the past 6 months?" Focus on personalization and pricing optimization solutions.',
        category: 'NEWS',
        vertical: 'ECOMMERCE',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art6',
        title: 'CPG Brands Slash Traditional TV Spend by 35% for Connected TV',
        summary: 'Consumer packaged goods companies are rapidly shifting from linear TV to streaming platforms, citing better targeting and measurement capabilities.',
        sourceUrl: 'https://topline.platform/cpg-ctv-shift',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'The shift to CTV represents a fundamental change in how CPG brands reach consumers. Traditional TV measurement is becoming obsolete.',
        talkTrack: 'Ask: "What percentage of your video budget is allocated to connected TV?" Position CTV as essential for modern brand building.',
        category: 'NEWS',
        vertical: 'CPG',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art7',
        title: 'Fintech Marketing Compliance Costs Rise 180% Amid New Regulations',
        summary: 'Financial services companies are facing exponentially higher marketing compliance costs as regulators crack down on digital advertising practices and data usage.',
        sourceUrl: 'https://topline.platform/fintech-compliance-costs',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Regulatory compliance is becoming a major cost center for fintech marketing teams. Non-compliance risks are forcing complete strategy overhauls.',
        talkTrack: 'Ask: "How are new regulations affecting your marketing operations and budget allocation?" Focus on compliant marketing automation solutions.',
        category: 'NEWS',
        vertical: 'FINTECH',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art8',
        title: 'Healthcare Marketing Pivots to Patient Journey Orchestration',
        summary: 'Healthcare organizations are moving beyond demographic targeting to focus on patient journey stages, leveraging health data for more precise marketing.',
        sourceUrl: 'https://topline.platform/healthcare-patient-journey',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Patient-centric marketing is becoming a competitive advantage in healthcare. Traditional demographic targeting is insufficient for complex health decisions.',
        talkTrack: 'Ask: "How are you currently mapping and targeting different patient journey stages?" Position journey orchestration platforms as essential.',
        category: 'NEWS',
        vertical: 'HEALTHTECH',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'art9',
        title: 'B2B Marketers Abandon Lead Generation for Revenue Attribution',
        summary: 'B2B marketing teams are shifting from lead volume metrics to revenue attribution, demanding better integration between marketing and sales systems.',
        sourceUrl: 'https://topline.platform/b2b-revenue-attribution',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'The focus on revenue attribution reflects increased scrutiny on marketing ROI. Lead generation without revenue correlation is becoming obsolete.',
        talkTrack: 'Ask: "What percentage of your marketing budget can you directly attribute to closed revenue?" Focus on attribution and revenue operations platforms.',
        category: 'NEWS',
        vertical: 'MARTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'art10',
        title: 'Programmatic Advertising Fraud Hits $84B as AI Detection Scales',
        summary: 'Ad fraud is reaching unprecedented levels while AI-powered detection systems are becoming more sophisticated. The arms race between fraudsters and detection is intensifying.',
        sourceUrl: 'https://topline.platform/programmatic-fraud-84b',
        sourceName: 'Topline Intelligence',
        whyItMatters: 'Ad fraud represents a massive tax on digital advertising efficiency. Brands are demanding better fraud protection as budgets tighten.',
        talkTrack: 'Lead with: "What percentage of your programmatic spend do you estimate is lost to fraud?" Position fraud detection as essential infrastructure.',
        category: 'NEWS',
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      }
    ]

    // Insert sample metrics - expanded to 5 metrics across verticals
    const metrics = [
      {
        id: 'met1',
        title: '78% of B2B Marketers Using AI Daily',
        value: '78%',
        description: 'Daily AI usage among B2B marketing professionals has increased 45% year-over-year, with content creation and lead scoring being the top use cases.',
        source: 'Marketing AI Institute 2024',
        howToUse: 'Use this stat to demonstrate AI adoption urgency in sales conversations.',
        talkTrack: 'Frame it as: "78% of your competitors are already using AI daily for marketing. How is your team staying competitive?"',
        vertical: 'MARTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'met2',
        title: '$2.3T Global Digital Ad Spend',
        value: '$2.3T',
        description: 'Global digital advertising spend is projected to reach $2.3 trillion by 2025, with programmatic representing 88% of all digital display advertising.',
        source: 'eMarketer 2024',
        howToUse: 'Highlight the scale of digital advertising investment and automation trends.',
        talkTrack: 'Position with: "With $2.3T in digital ad spend, programmatic efficiency is critical. How are you optimizing your programmatic operations?"',
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'met3',
        title: '45% Increase in Customer Acquisition Costs',
        value: '45%',
        description: 'Customer acquisition costs have increased 45% across B2B companies due to increased competition and privacy regulations affecting targeting.',
        source: 'SaaS Benchmarks 2024',
        howToUse: 'Emphasize the need for more efficient customer acquisition and retention strategies.',
        talkTrack: 'Ask: "With CAC increasing 45% industry-wide, what strategies are you using to improve acquisition efficiency?"',
        vertical: 'REVENUE_OPS',
        priority: 'MEDIUM',
        status: 'PUBLISHED'
      },
      {
        id: 'met4',
        title: '67% of Retail Media Budgets Shift to In-Store',
        value: '67%',
        description: 'Retailers are moving beyond online advertising to in-store digital experiences, with 67% of retail media budgets now allocated to physical location activation.',
        source: 'Retail Media Report 2024',
        howToUse: 'Highlight the evolution of retail media beyond digital-only strategies.',
        talkTrack: 'Ask: "How are you leveraging in-store digital experiences to complement your online retail media strategy?"',
        vertical: 'RETAIL',
        priority: 'HIGH',
        status: 'PUBLISHED'
      },
      {
        id: 'met5',
        title: '92% of E-commerce Sites Use Dynamic Pricing',
        value: '92%',
        description: 'Dynamic pricing adoption has reached 92% among top e-commerce retailers, with AI-driven price optimization becoming standard competitive practice.',
        source: 'E-commerce Technology Survey 2024',
        howToUse: 'Demonstrate the critical importance of pricing automation in competitive e-commerce.',
        talkTrack: 'Position with: "92% of your competitors are using dynamic pricing. How are you ensuring price competitiveness while maintaining margins?"',
        vertical: 'ECOMMERCE',
        priority: 'HIGH',
        status: 'PUBLISHED'
      }
    ]

    // Set publishedAt to today to ensure content shows up
    const today = new Date()
    const publishedAt = today.toISOString()

    console.log('📝 Inserting 10 articles across verticals...')
    for (const article of articles) {
      await pool.query(`
        INSERT INTO articles (
          id, title, summary, "sourceUrl", "sourceName", "whyItMatters", "talkTrack",
          category, vertical, priority, status, "publishedAt", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $12)
        ON CONFLICT (id) DO UPDATE SET
          "publishedAt" = $12, "updatedAt" = $12
      `, [
        article.id, article.title, article.summary, article.sourceUrl, article.sourceName,
        article.whyItMatters, article.talkTrack, article.category, article.vertical,
        article.priority, article.status, publishedAt
      ])
    }

    console.log('📊 Inserting 5 metrics across verticals...')
    for (const metric of metrics) {
      await pool.query(`
        INSERT INTO metrics (
          id, title, value, description, source, "howToUse", "talkTrack",
          vertical, priority, status, "publishedAt", "createdAt", "updatedAt"  
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $11)
        ON CONFLICT (id) DO UPDATE SET
          "publishedAt" = $11, "updatedAt" = $11
      `, [
        metric.id, metric.title, metric.value, metric.description, metric.source,
        metric.howToUse, metric.talkTrack, metric.vertical, metric.priority, metric.status, publishedAt
      ])
    }

    // Get counts
    const articleCount = await pool.query('SELECT COUNT(*) FROM articles WHERE status = $1', ['PUBLISHED'])
    const metricCount = await pool.query('SELECT COUNT(*) FROM metrics WHERE status = $1', ['PUBLISHED'])

    await pool.end()

    const response = {
      success: true,
      message: 'Content reset with expanded dataset (10 articles, 5 metrics)!',
      results: {
        articlesAdded: articles.length,
        metricsAdded: metrics.length,
        totalArticles: parseInt(articleCount.rows[0].count),
        totalMetrics: parseInt(metricCount.rows[0].count)
      },
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Content insertion completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Content insertion failed:', error)
    
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