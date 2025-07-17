// Load environment variables
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const { getNewsletterContent, generateNewsletterHTML, generateSubjectLine } = require('../lib/newsletter-service')
const { sendTestNewsletter } = require('../lib/brevo-service')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendTestNewsletterToEmail(email) {
  try {
    console.log(`🔔 Sending test newsletter to: ${email}`)
    
    // Get the base URL for API calls
    const baseUrl = 'https://topline-tlwi.vercel.app'
    
    // Get newsletter content
    console.log('📋 Getting newsletter content...')
    const content = await getNewsletterContent(baseUrl)
    
    console.log('📊 Content summary:')
    console.log('- Metric:', content.metric ? content.metric.title : 'None')
    console.log('- Articles:', content.articles.length)
    console.log('- Date:', content.date)
    
    if (content.metric) {
      console.log(`- Metric value: ${content.metric.value} ${content.metric.unit}`)
    }
    
    if (content.articles.length > 0) {
      console.log('- Top articles:')
      content.articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title}`)
      })
    }
    
    // Generate HTML
    console.log('📝 Generating HTML content...')
    const htmlContent = generateNewsletterHTML(content)
    
    // Generate subject line
    console.log('📧 Generating subject line...')
    const subject = await generateSubjectLine(content.metric, content.articles)
    console.log('Subject:', subject)
    
    // Send test newsletter
    console.log('📤 Sending test newsletter...')
    const result = await sendTestNewsletter(email, htmlContent, subject)
    
    console.log('✅ Test newsletter sent successfully!')
    console.log('Message ID:', result.messageId)
    
    return {
      success: true,
      message: `Test newsletter sent to ${email}`,
      content: {
        metric: content.metric ? content.metric.title : 'None',
        articles: content.articles.length,
        subject: subject
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending test newsletter:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get email from command line args
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: node scripts/send-test-newsletter.js email@example.com')
  process.exit(1)
}

// Send test newsletter
sendTestNewsletterToEmail(email)
  .then(result => {
    console.log('\n📋 Result:', JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Script error:', error)
    process.exit(1)
  }) 