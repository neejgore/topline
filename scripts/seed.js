const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample articles based on spec
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: 'CMOs Double Down on AI Budgets',
        summary: '71% of CMOs plan to invest $10M+ in AI this year (BCG @ Cannes Lions)',
        sourceUrl: 'https://example.com/cmo-ai-budgets',
        sourceName: 'BCG @ Cannes Lions',
        whyItMatters: 'AI is no longer experimental; it\'s an arms race. CMOs are looking for execution partners—this is your wedge.',
        talkTrack: 'Ask: "Where are your biggest content and campaign bottlenecks right now?" Then position AI-powered solutions as competitive necessities, not nice-to-haves.',
        category: 'NEWS',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),
    
    prisma.article.create({
      data: {
        title: 'FTC Greenlights Omnicom-IPG Merger',
        summary: 'Ad industry consolidation is back—and with it, more attention to media ROI and platform diversification.',
        sourceUrl: 'https://example.com/omnicom-ipg-merger',
        sourceName: 'AdExchanger',
        whyItMatters: 'Consolidation drives efficiency pressure. Brands will scrutinize every vendor relationship and demand proof of incremental value.',
        talkTrack: 'Talk about: Future-proofing against walled gardens. "How are you preparing for a world where media buying becomes even more consolidated?"',
        category: 'NEWS',  
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),
    
    prisma.article.create({
      data: {
        title: 'Cookie Deprecation Creates Attribution Gap for Advertisers',
        summary: 'As third-party cookies phase out, attribution models are breaking down—forcing a shift to first-party data strategies.',
        sourceUrl: 'https://example.com/cookie-deprecation-attribution',
        sourceName: 'Digiday',
        whyItMatters: 'The cookie deprecation isn\'t just a tech problem—it\'s a measurement crisis. Companies need new ways to prove campaign effectiveness.',
        talkTrack: 'Ask: "How confident are you in your current attribution model?" Position first-party data collection as the foundation for future measurement.',
        category: 'NEWS',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),
    
    prisma.article.create({
      data: {
        title: 'RevOps Teams Drive 32% Pipeline Velocity Improvement',
        summary: 'Companies with dedicated Revenue Operations teams see faster deal closure and better sales-marketing alignment.',
        sourceUrl: 'https://example.com/revops-pipeline-velocity',
        sourceName: 'SalesforceBen',
        whyItMatters: 'RevOps is becoming the connective tissue between sales and marketing—and a competitive advantage for companies that get it right.',
        talkTrack: 'Ask: "How aligned are your sales and marketing teams on pipeline definitions?" Position RevOps as the solution to revenue predictability.',
        category: 'NEWS',
        vertical: 'Services',
        priority: 'MEDIUM',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),
    
    prisma.article.create({
      data: {
        title: 'Retail Media Networks Hit $60B as Brands Shift Budgets',
        summary: 'Retail media advertising spending accelerates as brands seek first-party data and closed-loop attribution.',
        sourceUrl: 'https://example.com/retail-media-60b',
        sourceName: 'Retail Dive',
        whyItMatters: 'Retail media offers something traditional advertising can\'t: direct connection to purchase behavior and closed-loop measurement.',
        talkTrack: 'Ask: "What percentage of your media budget goes to retail media networks?" Position as essential for reaching purchase-ready audiences.',
        category: 'NEWS',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    })
  ])

  // Create sample metrics
  const metrics = await Promise.all([
    prisma.metric.create({
      data: {
        title: '71% of CMOs Increase AI Marketing Budgets',
        value: '71',
        unit: '%',
        context: 'of CMOs plan to invest $10M+ in AI marketing technology this year',
        source: 'BCG Cannes Lions Survey 2024',
        whyItMatters: 'AI spending is accelerating—companies not investing risk falling behind in personalization and efficiency.',
        talkTrack: 'Ask prospects: "What\'s your current AI marketing budget?" Use 71% as the benchmark for serious players.',
        category: 'METRICS',
        vertical: 'Technology & Media',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),
    
    prisma.metric.create({
      data: {
        title: '$60B Retail Media Ad Spend in 2024',
        value: '60',
        unit: 'B',
        context: 'in retail media network advertising spend, up 25% YoY',
        source: 'eMarketer Retail Media Report',
        whyItMatters: 'Retail media is becoming a massive channel—brands need strategies to compete for shelf space in digital marketplaces.',
        talkTrack: 'Ask: "How much of your media budget goes to retail media?" Position $60B as proof of channel importance.',
        category: 'METRICS',
        vertical: 'Consumer & Retail',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),
    
    prisma.metric.create({
      data: {
        title: '32% Pipeline Velocity Improvement',
        value: '32',
        unit: '%',
        context: 'faster deal closure for companies with dedicated RevOps teams',
        source: 'Salesforce State of Sales Report',
        whyItMatters: 'Revenue Operations isn\'t just a buzzword—it\'s delivering measurable improvements in sales efficiency.',
        talkTrack: 'Ask: "What\'s your current sales cycle length?" Use 32% improvement as the RevOps value proposition.',
        category: 'METRICS',
        vertical: 'Services',
        priority: 'MEDIUM',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    })
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { id: 'tag1', name: 'AI Marketing', color: '#8B5CF6' }
    }),
    prisma.tag.create({
      data: { id: 'tag2', name: 'Attribution', color: '#EF4444' }
    }),
    prisma.tag.create({
      data: { id: 'tag3', name: 'Technology & Media', color: '#10B981' }
    }),
    prisma.tag.create({
      data: { id: 'tag4', name: 'Consumer & Retail', color: '#F59E0B' }
    }),
    prisma.tag.create({
      data: { id: 'tag5', name: 'Revenue Operations', color: '#3B82F6' }
    }),
    prisma.tag.create({
      data: { id: 'tag6', name: 'Privacy & Compliance', color: '#6366F1' }
    })
  ])

  // Create sources
  const sources = await Promise.all([
    prisma.source.create({
      data: { id: 'src1', name: 'AdExchanger', url: 'https://adexchanger.com', rssUrl: 'https://www.adexchanger.com/feed/' }
    }),
    prisma.source.create({
      data: { id: 'src2', name: 'Technology & Media Today', url: 'https://martech.org', rssUrl: 'https://martech.org/feed/' }
    }),
    prisma.source.create({
      data: { id: 'src3', name: 'Digiday', url: 'https://digiday.com', rssUrl: 'https://digiday.com/feed/' }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${articles.length} articles, ${metrics.length} metrics, ${tags.length} tags, and ${sources.length} sources`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 