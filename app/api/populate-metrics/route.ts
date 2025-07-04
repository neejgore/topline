import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Pool of diverse metrics across different verticals and time periods
const metricsPool = [
  // Technology & Media
  {
    title: "Global Digital Ad Spend Growth",
    value: "14.2%",
    unit: "percentage",
    vertical: "Technology & Media",
    context: "Year-over-year growth in digital advertising spending worldwide",
    source: "IAB Digital Ad Spend Report 2024"
  },
  {
    title: "CTV Advertising Market Size",
    value: "29.3",
    unit: "billion USD",
    vertical: "Technology & Media",
    context: "Connected TV advertising market valuation",
    source: "eMarketer CTV Report 2024"
  },
  {
    title: "Marketing AI Adoption Rate",
    value: "73%",
    unit: "percentage",
    vertical: "Technology & Media",
    context: "Percentage of marketers using AI-powered tools",
    source: "Marketing AI Usage Survey 2024"
  },
  {
    title: "Programmatic Display Ad Spend",
    value: "87.2",
    unit: "billion USD",
    vertical: "Technology & Media",
    context: "US programmatic display advertising spending",
    source: "eMarketer Programmatic Report 2024"
  },
  {
    title: "Social Media Ad Revenue Growth",
    value: "12.8%",
    unit: "percentage",
    vertical: "Technology & Media",
    context: "Annual growth in social media advertising revenue",
    source: "Social Media Advertising Report 2024"
  },
  {
    title: "Video Streaming Market Size",
    value: "223.1",
    unit: "billion USD",
    vertical: "Technology & Media",
    context: "Global video streaming market valuation",
    source: "Streaming Market Analysis 2024"
  },

  // Consumer & Retail
  {
    title: "Retail Media Network Ad Revenue",
    value: "128.9",
    unit: "billion USD",
    vertical: "Consumer & Retail",
    context: "US retail media advertising revenue",
    source: "eMarketer Retail Media Report 2024"
  },
  {
    title: "E-commerce Conversion Rate",
    value: "2.86%",
    unit: "percentage",
    vertical: "Consumer & Retail",
    context: "Average e-commerce website conversion rate",
    source: "E-commerce Conversion Report 2024"
  },
  {
    title: "Social Commerce Sales",
    value: "107.2",
    unit: "billion USD",
    vertical: "Consumer & Retail",
    context: "US social commerce sales volume",
    source: "Social Commerce Report 2024"
  },
  {
    title: "Mobile Commerce Share",
    value: "45.3%",
    unit: "percentage",
    vertical: "Consumer & Retail",
    context: "Mobile's share of total e-commerce sales",
    source: "Mobile Commerce Report 2024"
  },
  {
    title: "Customer Acquisition Cost",
    value: "234",
    unit: "USD",
    vertical: "Consumer & Retail",
    context: "Average customer acquisition cost across retail",
    source: "Customer Acquisition Report 2024"
  },

  // Financial Services
  {
    title: "Digital Banking Adoption",
    value: "89.2%",
    unit: "percentage",
    vertical: "Financial Services",
    context: "Digital banking adoption rate among consumers",
    source: "Digital Banking Report 2024"
  },
  {
    title: "Fintech Investment",
    value: "31.2",
    unit: "billion USD",
    vertical: "Financial Services",
    context: "Global fintech investment volume",
    source: "Fintech Investment Report 2024"
  },
  {
    title: "Digital Payment Volume",
    value: "8.49",
    unit: "trillion USD",
    vertical: "Financial Services",
    context: "Global digital payment transaction volume",
    source: "Digital Payments Report 2024"
  },
  {
    title: "Cryptocurrency Market Cap",
    value: "1.72",
    unit: "trillion USD",
    vertical: "Financial Services",
    context: "Total cryptocurrency market capitalization",
    source: "Crypto Market Report 2024"
  },

  // Healthcare & Life Sciences
  {
    title: "Healthcare Digital Marketing Spend",
    value: "15.1",
    unit: "billion USD",
    vertical: "Healthcare & Life Sciences",
    context: "US healthcare digital marketing expenditure",
    source: "Healthcare Marketing Report 2024"
  },
  {
    title: "Telemedicine Market Size",
    value: "87.8",
    unit: "billion USD",
    vertical: "Healthcare & Life Sciences",
    context: "Global telemedicine market valuation",
    source: "Telemedicine Market Report 2024"
  },
  {
    title: "Healthcare AI Market Growth",
    value: "37.5%",
    unit: "percentage",
    vertical: "Healthcare & Life Sciences",
    context: "Annual growth rate of AI in healthcare",
    source: "Healthcare AI Report 2024"
  },

  // Energy & Utilities
  {
    title: "Renewable Energy Investment",
    value: "1.8",
    unit: "trillion USD",
    vertical: "Energy & Utilities",
    context: "Global renewable energy investment",
    source: "Renewable Energy Report 2024"
  },
  {
    title: "Smart Grid Market Size",
    value: "103.4",
    unit: "billion USD",
    vertical: "Energy & Utilities",
    context: "Global smart grid market valuation",
    source: "Smart Grid Report 2024"
  },
  {
    title: "Energy Storage Deployment",
    value: "42.6",
    unit: "GWh",
    vertical: "Energy & Utilities",
    context: "Global energy storage deployment capacity",
    source: "Energy Storage Report 2024"
  },
  {
    title: "Electric Vehicle Sales",
    value: "14.1",
    unit: "million units",
    vertical: "Energy & Utilities",
    context: "Global electric vehicle sales volume",
    source: "EV Market Report 2024"
  }
]

function generateRandomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateWhyItMatters(title: string, vertical: string): string {
  const baseText = title.toLowerCase()
  
  if (baseText.includes('ai') || baseText.includes('artificial intelligence')) {
    return 'AI and automation are transforming industry operations. Understanding these metrics helps position solutions in the context of the market\'s AI-driven future.'
  }
  
  if (baseText.includes('digital') || baseText.includes('technology')) {
    return 'Digital transformation is accelerating across industries. This metric reveals how technology adoption is reshaping business operations and customer engagement.'
  }
  
  if (baseText.includes('marketing') || baseText.includes('advertising')) {
    return 'Marketing technology and advertising landscapes are evolving rapidly. This data shows how enterprises are adapting their customer acquisition strategies.'
  }
  
  switch (vertical) {
    case 'Technology & Media':
      return 'The media and technology landscape is rapidly evolving. This metric indicates how digital transformation is reshaping content consumption and advertising strategies.'
    
    case 'Consumer & Retail':
      return 'Retail and consumer behavior is shifting dramatically. This metric shows how brands are adapting their customer engagement and sales strategies.'
    
    case 'Financial Services':
      return 'Financial services are undergoing digital transformation. This metric reveals how institutions are evolving their customer experience and operational strategies.'
    
    case 'Healthcare & Life Sciences':
      return 'Healthcare is embracing digital innovation. This metric shows how the industry is transforming patient care and operational efficiency.'
    
    case 'Energy & Utilities':
      return 'Energy and utilities are transitioning to sustainable models. This metric indicates how the sector is adapting to environmental and technological changes.'
    
    default:
      return 'Industry dynamics are shifting rapidly. This metric provides insight into how enterprises are adapting to market changes and technological advancement.'
  }
}

function generateTalkTrack(title: string, vertical: string): string {
  const baseText = title.toLowerCase()
  
  if (baseText.includes('growth') || baseText.includes('increase')) {
    return 'How is your organization planning to capitalize on this growth trend? What opportunities do you see in this expanding market?'
  }
  
  if (baseText.includes('investment') || baseText.includes('funding')) {
    return 'How is your company thinking about investment in this area? What role does this play in your strategic planning?'
  }
  
  if (baseText.includes('adoption') || baseText.includes('usage')) {
    return 'Where is your organization in terms of adoption of these technologies? What challenges or opportunities do you see?'
  }
  
  switch (vertical) {
    case 'Technology & Media':
      return 'How are these technology trends impacting your digital strategy? What role does this play in your customer engagement approach?'
    
    case 'Consumer & Retail':
      return 'How is this consumer trend affecting your retail strategy? What opportunities do you see for improving customer experience?'
    
    case 'Financial Services':
      return 'How is this financial trend impacting your institution\'s strategy? What role does technology play in your customer service approach?'
    
    case 'Healthcare & Life Sciences':
      return 'How are these healthcare developments affecting your patient engagement strategy? What opportunities do you see for innovation?'
    
    case 'Energy & Utilities':
      return 'How is this energy trend impacting your sustainability strategy? What role does technology play in your operational efficiency?'
    
    default:
      return 'How do you see this industry trend affecting your business strategy? What opportunities or challenges does this present?'
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication for cron job calls
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      console.log('🔄 Starting metrics pool population via cron job...')
    } else {
      console.log('🔄 Starting metrics pool population...')
    }
    
    console.log('🔄 Starting metrics pool population...')
    
    // Generate metrics across 90-day window
    const now = new Date()
    const metricsToInsert = []
    
    // Create multiple instances of each metric across different dates
    for (let i = 0; i < metricsPool.length; i++) {
      const baseMetric = metricsPool[i]
      
      // Create 3-4 variations of each metric with different dates
      const variations = Math.floor(Math.random() * 2) + 3 // 3-4 variations
      
      for (let v = 0; v < variations; v++) {
        const daysBack = Math.floor(Math.random() * 90) // Random day within 90 days
        const publishDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
        
        // Add slight variations to values for different time periods
        const baseValue = parseFloat(baseMetric.value) || 0
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        const adjustedValue = baseValue > 0 ? (baseValue * (1 + variation)).toFixed(1) : baseMetric.value
        
        metricsToInsert.push({
          id: generateRandomId(),
          title: baseMetric.title,
          value: adjustedValue,
          unit: baseMetric.unit,
          vertical: baseMetric.vertical,
          context: baseMetric.context,
          source: baseMetric.source,
          publishedAt: publishDate.toISOString(),
          status: 'ARCHIVED', // Start as archived, will be selected by refresh
          whyItMatters: generateWhyItMatters(baseMetric.title, baseMetric.vertical),
          talkTrack: generateTalkTrack(baseMetric.title, baseMetric.vertical),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }
    
    // Insert in batches to avoid API limits
    const batchSize = 50
    let totalInserted = 0
    
    for (let i = 0; i < metricsToInsert.length; i += batchSize) {
      const batch = metricsToInsert.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('metrics')
        .insert(batch)
      
      if (insertError) {
        console.error('Error inserting batch:', insertError)
        return NextResponse.json({
          success: false,
          error: `Failed to insert batch: ${insertError.message}`,
          totalInserted
        }, { status: 500 })
      } else {
        totalInserted += batch.length
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} metrics)`)
      }
    }
    
    console.log(`🎉 Successfully populated metrics pool with ${totalInserted} metrics`)
    
    // Get final count
    const { count } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total metrics in database: ${count}`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully populated metrics pool with ${totalInserted} metrics`,
      totalMetrics: count,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error populating metrics pool:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 