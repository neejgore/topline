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
        vertical: 'MARTECH',
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
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),

    prisma.article.create({
      data: {
        title: 'Cookieless Future Accelerates as Chrome Timeline Moves',
        summary: 'Google pushes third-party cookie deprecation to Q1 2025, but preparedness among advertisers remains low.',
        sourceUrl: 'https://example.com/cookieless-future',
        sourceName: 'Digiday',
        whyItMatters: 'Brands are running out of time to build first-party data strategies. Those who wait will face significant competitive disadvantage.',
        talkTrack: 'Lead with: "What\'s your plan for reaching customers when third-party cookies disappear in Q1?" Position first-party data collection and identity resolution as urgent priorities.',
        category: 'NEWS',
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    })
  ])

  // Create sample metrics based on spec
  const metrics = await Promise.all([
    prisma.metric.create({
      data: {
        title: 'Marketers Using AI Daily',
        value: '88%',
        description: 'of marketers now use AI in their daily workflows, up from 23% in 2022.',
        source: 'SurveyMonkey',
        sourceUrl: 'https://example.com/ai-usage-stats',
        howToUse: 'Ask "Where are your content ops bottlenecks today?"—then offer automation insights.',
        talkTrack: 'Position AI adoption as table stakes: "88% of your competitors are already using AI daily. What\'s your team\'s AI strategy for staying ahead?"',
        vertical: 'MARTECH',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),

    prisma.metric.create({
      data: {
        title: 'Digital Spend Share',
        value: '72%',
        description: 'of total advertising budgets now go to digital channels, marking a new high.',
        source: 'Deloitte',
        sourceUrl: 'https://example.com/digital-spend-share',
        howToUse: 'Talk track: "Most orgs are already digitally loaded. The difference now is signal strategy, not media mix."',
        talkTrack: 'Frame the conversation around optimization: "With 72% of budgets already digital, the next competitive advantage is in how precisely you can target and measure."',
        vertical: 'ADTECH',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    }),

    prisma.metric.create({
      data: {
        title: 'Customer Acquisition Cost Increase',
        value: '+38%',
        description: 'Average CAC has increased 38% year-over-year as competition for digital attention intensifies.',
        source: 'ProfitWell',
        sourceUrl: 'https://example.com/cac-increase',
        howToUse: 'Position retention and LTV optimization as the answer to rising CAC.',
        talkTrack: 'Lead with urgency: "With CAC up 38%, every company needs to squeeze more value from existing customers. How are you maximizing customer lifetime value?"',
        vertical: 'REVENUE_OPS',
        priority: 'HIGH',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      }
    })
  ])

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { name: 'AI/ML', color: '#8B5CF6' }
    }),
    prisma.tag.create({
      data: { name: 'Privacy', color: '#EF4444' }
    }),
    prisma.tag.create({
      data: { name: 'M&A', color: '#10B981' }
    }),
    prisma.tag.create({
      data: { name: 'Attribution', color: '#F59E0B' }
    })
  ])

  // Create sample sources
  const sources = await Promise.all([
    prisma.source.create({
      data: {
        name: 'AdExchanger',
        url: 'https://adexchanger.com',
        rssUrl: 'https://adexchanger.com/feed/',
        isActive: true,
      }
    }),
    prisma.source.create({
      data: {
        name: 'MarTech',
        url: 'https://martech.org',
        rssUrl: 'https://martech.org/feed/',
        isActive: true,
      }
    }),
    prisma.source.create({
      data: {
        name: 'Digiday',
        url: 'https://digiday.com',
        rssUrl: 'https://digiday.com/feed/',
        isActive: true,
      }
    })
  ])

  console.log(`✅ Created ${articles.length} articles`)
  console.log(`✅ Created ${metrics.length} metrics`)
  console.log(`✅ Created ${tags.length} tags`)
  console.log(`✅ Created ${sources.length} sources`)
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 