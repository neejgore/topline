// Test script to add sample metrics to verify Supabase setup
const fetch = require('node-fetch')

const sampleMetrics = [
  {
    title: 'B2B E-commerce Growth',
    value: '47% YoY',
    source: 'Shopify Plus',
    sourceUrl: 'https://shopify.com/plus',
    whyItMatters: 'B2B buyers increasingly expect B2C-like experiences. This growth demonstrates the opportunity for platforms that can deliver enterprise-grade B2B commerce.',
    talkTrack: 'How is your team thinking about B2B commerce? Are you seeing buyers expect more consumer-like experiences?',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    status: 'PUBLISHED'
  },
  {
    title: 'Marketing Automation ROI',
    value: '324% ROI',
    source: 'HubSpot',
    sourceUrl: 'https://hubspot.com',
    whyItMatters: 'Marketing automation continues to drive significant returns. This metric shows the clear value of automated workflows for revenue generation.',
    talkTrack: 'What percentage of your marketing is automated? Are you seeing similar ROI from your marketing automation efforts?',
    vertical: 'Technology & Media',
    priority: 'HIGH',
    status: 'PUBLISHED'
  },
  {
    title: 'Customer Acquisition Cost',
    value: '$127',
    source: 'HubSpot',
    sourceUrl: 'https://hubspot.com',
    whyItMatters: 'CAC continues to rise across industries. Understanding benchmark costs helps position value propositions effectively.',
    talkTrack: 'How does your customer acquisition cost compare to industry benchmarks? What strategies are working best for you?',
    vertical: 'Consumer & Retail',
    priority: 'MEDIUM',
    status: 'PUBLISHED'
  }
]

async function testMetrics() {
  console.log('🧪 Testing metrics API...')
  
  try {
    // First, let's try to fetch existing metrics
    const fetchResponse = await fetch('http://localhost:3000/api/metrics')
    const fetchData = await fetchResponse.json()
    
    console.log('Current metrics:', fetchData)
    
    // Add sample metrics
    for (const metric of sampleMetrics) {
      console.log(`Adding metric: ${metric.title}`)
      
      const response = await fetch('http://localhost:3000/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric)
      })
      
      const result = await response.json()
      console.log(`Result: ${result.success ? 'Success' : 'Failed'} - ${result.message || result.error}`)
    }
    
    // Fetch metrics again to verify
    const finalResponse = await fetch('http://localhost:3000/api/metrics')
    const finalData = await finalResponse.json()
    
    console.log('Final metrics count:', finalData.metrics?.length || 0)
    
  } catch (error) {
    console.error('Error testing metrics:', error)
  }
}

testMetrics() 