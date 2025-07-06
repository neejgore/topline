const { generateAndSendNewsletter, getNewsletterContent } = require('../lib/newsletter-service')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testNewsletter() {
  console.log('🧪 Testing newsletter system...\n')
  
  try {
    // Test content fetching
    console.log('📊 Fetching newsletter content...')
    const baseUrl = 'https://topline-tlwi.vercel.app'
    const content = await getNewsletterContent(baseUrl)
    
    console.log('Content preview:')
    console.log('- Date:', content.date)
    console.log('- Metric:', content.metric ? `${content.metric.title} (${content.metric.value} ${content.metric.unit})` : 'None')
    console.log('- Articles:', content.articles.length)
    
    if (content.articles.length > 0) {
      content.articles.forEach((article, i) => {
        console.log(`  ${i + 1}. ${article.title} (${article.vertical})`)
      })
    }
    
    // Test subscriber fetching
    console.log('\n👥 Fetching active subscribers...')
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('isActive', true)
    
    if (error) {
      console.error('Error fetching subscribers:', error)
    } else {
      console.log(`Found ${subscribers.length} active subscribers`)
      subscribers.forEach((sub, i) => {
        console.log(`  ${i + 1}. ${sub.email} (${sub.name || 'No name'})`)
      })
    }
    
    // Ask if user wants to send test newsletter
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question('\n📧 Send test newsletter? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🚀 Sending newsletter...')
        
        const result = await generateAndSendNewsletter(supabase, baseUrl)
        
        if (result.success) {
          console.log('✅ Newsletter sent successfully!')
          console.log(`   📊 Sent to: ${result.count} subscribers`)
          console.log(`   📅 Message: ${result.message}`)
        } else {
          console.log('❌ Newsletter failed to send')
          console.log(`   Error: ${result.error}`)
        }
      } else {
        console.log('Newsletter test cancelled')
      }
      
      rl.close()
    })
    
  } catch (error) {
    console.error('❌ Newsletter test failed:', error)
  }
}

testNewsletter() 