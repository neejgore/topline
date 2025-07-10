#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { generateNewsletterHTML, getNewsletterContent, generateSubjectLine } = require('../lib/newsletter-service')
const { sendCampaignToList } = require('../lib/brevo-service')

// Node.js v22 has native fetch support

async function sendTestNewsletter() {
  const testEmail = 'neej.gore@gmail.com'
  const testName = 'Neej Gore'
  
  console.log(`📧 Generating test newsletter for ${testEmail}...`)
  
  try {
    // Get the base URL for content APIs
    const baseUrl = 'https://topline-tlwi.vercel.app'
    
    console.log('📰 Fetching newsletter content...')
    // Get newsletter content
    const content = await getNewsletterContent(baseUrl)
    
    console.log('🎨 Generating HTML newsletter...')
    // Generate HTML
    const htmlContent = generateNewsletterHTML(content)
    
    console.log('📝 Generating AI subject line...')
    // Generate subject line
    const subject = await generateSubjectLine(content.metric, content.articles)
    
    console.log(`📧 Sending test newsletter with subject: "${subject}"`)
    console.log(`📧 NOTE: This will send to all subscribers in List ID 3 (not just test email)`)
    
    // Send to List ID 3 using Campaign API (keeps emails private)
    const result = await sendCampaignToList(subject, htmlContent, 3)
    
    if (result.success) {
      console.log('✅ Test newsletter campaign created successfully!')
      console.log(`📬 Campaign ID: ${result.campaignId}`)
      console.log(`📊 Content included:`)
      console.log(`   Metric: ${content.metric ? content.metric.title : 'None'}`)
      console.log(`   Articles: ${content.articles.length}`)
      console.log(`📧 Campaign will send to all subscribers in List ID 3`)
    } else {
      console.log('❌ Failed to create test newsletter campaign')
      console.log('Result:', result)
    }
    
  } catch (error) {
    console.error('❌ Error sending test newsletter:', error.message)
    console.error('Full error:', error)
  }
}

sendTestNewsletter() 