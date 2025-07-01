import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ContentIngestionService } from '@/lib/content-ingestion'

const contentIngestionService = new ContentIngestionService()

export async function POST() {
  try {
    console.log('🔧 Starting metrics fix...')
    
    // Use a single transaction for all operations
    const result = await prisma.$transaction(async (tx) => {
      // Clear all existing metrics
      const deleted = await tx.metric.deleteMany()
      console.log(`🧹 Deleted ${deleted.count} existing metrics`)
      
      // Complete metrics array with real data and context
      const metrics = [
        {
          title: 'Retail Media Growth 2025',
          value: '$62B',
          source: 'eMarketer',
          sourceUrl: 'https://www.emarketer.com/content/10-billion-incremental-ad-spending-will-flow-us-retail-media-2025',
          priority: 'HIGH',
          status: 'PUBLISHED',
          description: 'Even with a revised CAGR of 17.2% (down from 24.1%), retail media is outpacing display, connected TV, and search advertising growth. 75% of advertisers plan to increase their retail media spending in 2025. Shows the massive growth potential in retail media, with over $10B in incremental ad spending expected to flow into the channel in 2025. This represents a key opportunity for brands to reach consumers at the point of purchase.',
          howToUse: 'Despite some downward revisions in growth projections, retail media remains one of the fastest-growing segments of digital advertising. The channel offers both efficient sales driving and privacy-compliant targeting through first-party data.',
          publishedAt: new Date('2025-01-31')
        },
        {
          title: 'Cookie Deprecation Impact 2025',
          value: '99%',
          source: 'Braze',
          sourceUrl: 'https://www.smallgiants.agency/insights/the-impact-of-third-party-cookie-depreciation-on-advertising',
          priority: 'HIGH',
          status: 'PUBLISHED',
          description: '99% of marketing managers report their advanced personalization plans have been impacted by privacy concerns. This comes as Google announces maintaining third-party cookies in Chrome while introducing new user choice controls. The end of third-party cookies is forcing a fundamental shift in how brands approach digital advertising and customer data.',
          howToUse: 'While Google has delayed cookie deprecation, the industry is already moving towards first-party data and privacy-first solutions. Marketers need to adapt their strategies now to maintain effective targeting and measurement.',
          publishedAt: new Date('2025-04-28')
        },
        {
          title: 'In-Store Retail Media Growth 2025',
          value: '47%',
          source: 'Blue Wheel Media',
          sourceUrl: 'https://www.bluewheelmedia.com/blog/trends-networks-shaping-retail-media-in-2025',
          priority: 'HIGH',
          status: 'PUBLISHED',
          description: 'In-store retail media spending is projected to increase by 47% in 2025, marking a significant shift towards omnichannel advertising. This growth is driven by retailers investing in digital displays and enhanced measurement capabilities. The dramatic growth in in-store retail media shows how digital advertising is expanding beyond websites and apps into physical retail environments.',
          howToUse: 'In-store retail media is emerging as a major growth area, with digital displays, interactive kiosks, and self-checkout ads providing new ways to engage shoppers. This channel is expected to surpass $1 billion by 2028.',
          publishedAt: new Date('2025-04-25')
        }
      ]

      // Create all metrics with proper vertical categorization
      const created = await Promise.all(
        metrics.map(metric => {
          // Determine vertical using the new categorization logic
          const vertical = contentIngestionService.determineMetricVertical(
            metric.title,
            metric.description || '',
            metric.source
          )
          
          return tx.metric.create({
            data: {
              ...metric,
              vertical // Use the determined vertical
            }
          })
        })
      )
      
      console.log(`✨ Created ${created.length} new metrics with proper vertical categorization`)
      console.log('📊 Vertical distribution:', 
        created.reduce((acc: Record<string, number>, metric) => {
          acc[metric.vertical || 'Uncategorized'] = (acc[metric.vertical || 'Uncategorized'] || 0) + 1
          return acc
        }, {})
      )
      
      return created
    })

    return NextResponse.json({ success: true, metrics: result })
  } catch (error: any) {
    console.error('❌ Error fixing metrics:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return POST()
} 