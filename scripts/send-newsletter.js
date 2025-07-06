const { generateAndSendNewsletter } = require('../lib/newsletter-service')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function sendDailyNewsletter() {
  console.log('📧 Starting daily newsletter send...')
  console.log('🕐 Time:', new Date().toLocaleString())
  
  try {
    const baseUrl = 'https://topline-tlwi.vercel.app'
    const result = await generateAndSendNewsletter(supabase, baseUrl)
    
    if (result.success) {
      console.log('✅ Newsletter sent successfully!')
      console.log(`   📊 Sent to: ${result.count} subscribers`)
      console.log(`   📅 Message: ${result.message}`)
      
      // Log to file for tracking
      const fs = require('fs')
      const logEntry = `${new Date().toISOString()} - SUCCESS: ${result.message} (${result.count} subscribers)\n`
      fs.appendFileSync('newsletter-log.txt', logEntry)
      
    } else {
      console.log('❌ Newsletter failed to send')
      console.log(`   Error: ${result.error}`)
      
      // Log error to file
      const fs = require('fs')
      const logEntry = `${new Date().toISOString()} - ERROR: ${result.error}\n`
      fs.appendFileSync('newsletter-log.txt', logEntry)
    }
    
  } catch (error) {
    console.error('❌ Newsletter send failed:', error)
    
    // Log error to file
    const fs = require('fs')
    const logEntry = `${new Date().toISOString()} - EXCEPTION: ${error.message}\n`
    fs.appendFileSync('newsletter-log.txt', logEntry)
  }
}

// Run the newsletter send
sendDailyNewsletter().then(() => {
  console.log('📧 Newsletter send process completed')
  process.exit(0)
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
}) 