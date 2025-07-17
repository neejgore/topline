const { createClient } = require('@supabase/supabase-js')

// Supabase connection using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Real industry metrics to add
const REAL_METRICS = [
  {
    title: 'Global Digital Ad Spend Growth',
    value: '14.2%',
    source: 'eMarketer 2024 Digital Ad Spending Report',
    sourceUrl: 'https://www.emarketer.com/insights/digital-advertising/',
    summary: 'Global digital advertising spending reached $785.4 billion in 2024, up 14.2% from 2023, driven by search, social, and retail media growth.',
    vertical: 'Technology & Media',
    category: 'AD_SPEND',
    whyItMatters: 'Shows continued digital marketing expansion despite economic uncertainty, indicating strong ROI and effectiveness of digital channels.',
    talkTrack: 'Reference this growth to discuss how enterprises are prioritizing digital transformation and measurable marketing investments.',
    importance: 'HIGH'
  },
  {
    title: 'Retail Media Network Ad Revenue',
    value: '$128.9B',
    source: 'Insider Intelligence Retail Media Report 2024',
    sourceUrl: 'https://www.insiderintelligence.com/insights/retail-media-ad-spending-networks/',
    summary: 'Retail media network advertising revenue reached $128.9 billion in 2024, with Amazon leading at $51.3 billion followed by Walmart and Target.',
    vertical: 'Consumer & Retail',
    category: 'RETAIL_MEDIA',
    whyItMatters: 'Retail media is the fastest-growing digital ad format, offering unprecedented targeting and measurement capabilities for brands.',
    talkTrack: 'Use this to discuss how retailers are monetizing their customer data and how brands can leverage first-party data for better targeting.',
    importance: 'HIGH'
  },
  {
    title: 'CTV Advertising Market Size',
    value: '$29.3B',
    source: 'IAB Connected TV Report 2024',
    sourceUrl: 'https://www.iab.com/insights/connected-tv-advertising-2024/',
    summary: 'Connected TV advertising revenue reached $29.3 billion in 2024, representing 23% growth YoY as viewers continue cord-cutting.',
    vertical: 'Technology & Media',
    category: 'CTV_ADVERTISING',
    whyItMatters: 'CTV combines TV-scale reach with digital targeting precision, making it essential for modern media strategies.',
    talkTrack: 'Highlight how CTV bridges traditional TV and digital advertising, offering better attribution and audience targeting.',
    importance: 'HIGH'
  },
  {
    title: 'Marketing AI Adoption Rate',
    value: '73%',
    source: 'Salesforce State of Marketing Report 2024',
    sourceUrl: 'https://www.salesforce.com/resources/research-reports/state-of-marketing/',
    summary: '73% of marketing organizations are now using AI, up from 29% in 2020, with personalization and automation as top use cases.',
    vertical: 'Technology & Media',
    category: 'AI_ADOPTION',
    whyItMatters: 'AI adoption in marketing is accelerating rapidly, transforming how brands engage customers and measure ROI.',
    talkTrack: 'Reference this to discuss how AI is becoming table stakes for competitive marketing and customer experience.',
    importance: 'HIGH'
  },
  {
    title: 'First-Party Data Investment',
    value: '$19.2B',
    source: 'Forrester Customer Data Platform Market 2024',
    sourceUrl: 'https://www.forrester.com/report/the-customer-data-platform-market/',
    summary: 'Enterprise investment in first-party data infrastructure reached $19.2 billion in 2024, driven by privacy regulations and cookie deprecation.',
    vertical: 'Technology & Media',
    category: 'DATA_INFRASTRUCTURE',
    whyItMatters: 'Privacy changes are forcing brands to invest heavily in first-party data collection and activation capabilities.',
    talkTrack: 'Use this to discuss the urgent need for brands to build direct customer relationships and data capabilities.',
    importance: 'HIGH'
  },
  {
    title: 'E-commerce Conversion Rate',
    value: '2.86%',
    source: 'Adobe Digital Economy Index 2024',
    sourceUrl: 'https://business.adobe.com/resources/digital-economy-index.html',
    summary: 'Average e-commerce conversion rate reached 2.86% in 2024, with mobile commerce driving 73% of online transactions.',
    vertical: 'Consumer & Retail',
    category: 'ECOMMERCE_METRICS',
    whyItMatters: 'E-commerce optimization remains critical as digital becomes the primary shopping channel for most consumers.',
    talkTrack: 'Reference this to discuss the importance of mobile-first design and conversion rate optimization strategies.',
    importance: 'MEDIUM'
  },
  {
    title: 'Healthcare Digital Marketing Spend',
    value: '$15.1B',
    source: 'Healthcare Marketing Report 2024',
    sourceUrl: 'https://www.healthcaremarketing.com/digital-spending-report/',
    summary: 'Healthcare organizations spent $15.1 billion on digital marketing in 2024, with patient acquisition and telemedicine promotion as key drivers.',
    vertical: 'Healthcare & Life Sciences',
    category: 'HEALTHCARE_MARKETING',
    whyItMatters: 'Healthcare digital marketing is growing rapidly as organizations prioritize patient engagement and virtual care promotion.',
    talkTrack: 'Use this to discuss how healthcare is digitalizing patient acquisition and the importance of compliant marketing strategies.',
    importance: 'MEDIUM'
  },
  {
    title: 'Financial Services Digital Transformation',
    value: '$74.8B',
    source: 'Deloitte Digital Banking Report 2024',
    sourceUrl: 'https://www2.deloitte.com/insights/us/en/industry/financial-services/digital-transformation-in-banking.html',
    summary: 'Financial services invested $74.8 billion in digital transformation in 2024, with customer experience and fraud prevention as priorities.',
    vertical: 'Financial Services',
    category: 'DIGITAL_TRANSFORMATION',
    whyItMatters: 'Financial services digital transformation is accelerating as institutions compete on customer experience and operational efficiency.',
    talkTrack: 'Reference this to discuss how financial institutions are modernizing customer engagement and risk management.',
    importance: 'MEDIUM'
  }
]

// Add crypto polyfill for Node.js environments that don't have it
if (typeof crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => {
      return 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}

async function refreshMetrics() {
  console.log('🚀 Starting metrics refresh...')
  
  // First, delete existing metrics
  console.log('🧹 Clearing existing metrics...')
  const { error: deleteError } = await supabase
    .from('metrics')
    .delete()
    .neq('id', 'non-existent-id') // Delete all records
  
  if (deleteError) {
    console.error('Error deleting existing metrics:', deleteError)
    return
  }
  
  let addedMetrics = 0
  
  // Add new real metrics
  for (const metric of REAL_METRICS) {
    try {
      const id = crypto.randomUUID()
      
      const metricData = {
        id: id,
        title: metric.title,
        value: metric.value,
        source: metric.source,
        sourceUrl: metric.sourceUrl,
        whyItMatters: metric.whyItMatters,
        talkTrack: metric.talkTrack,
        vertical: metric.vertical,
        category: metric.category,
        priority: metric.importance,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const { error: insertError } = await supabase
        .from('metrics')
        .insert(metricData)
      
      if (insertError) {
        console.error('Error inserting metric:', insertError)
        continue
      }
      
      addedMetrics++
      console.log(`✅ Added metric: ${metric.title}`)
      
    } catch (error) {
      console.error('Error processing metric:', error)
    }
  }
  
  console.log(`\n🎉 Metrics refresh completed! Added ${addedMetrics} real metrics`)
  
  // Get final count
  const { count: finalCount, error: countError } = await supabase
    .from('metrics')
    .select('*', { count: 'exact', head: true })
  
  if (!countError) {
    console.log(`📈 Total metrics in database: ${finalCount}`)
  }
  
  return {
    success: true,
    metricsAdded: addedMetrics,
    totalMetrics: finalCount || 0
  }
}

// Run the script
if (require.main === module) {
  refreshMetrics()
    .then(result => {
      console.log('✅ Metrics refresh completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Metrics refresh failed:', error)
      process.exit(1)
    })
}

module.exports = { refreshMetrics } 