import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Import the newsletter service
const { generateNewsletterHTML, getNewsletterContent, generateSubjectLine } = require('../../../../lib/newsletter-service')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send test newsletter to a specific email address
 */
async function sendTestEmail(htmlContent: string, subject: string, email: string, name: string = '') {
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const BREVO_API_URL = 'https://api.brevo.com/v3'

  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    console.log(`📧 Sending test email to ${email}...`)
    
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'The Beacon',
          email: 'beacon@belldesk.ai'
        },
        to: [{
          email: email,
          name: name || email.split('@')[0]
        }],
        subject: `[TEST] ${subject}`,
        htmlContent: htmlContent
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Brevo email API error: ${data.message || 'Unknown error'}`)
    }

    console.log(`✅ Test email sent to ${email}`)
    return { success: true, messageId: data.messageId }

  } catch (error) {
    console.error('❌ Error sending test email:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    // Skip authorization for testing
    console.log(`🔔 Sending test newsletter to ${email}...`)
    
    // Get the base URL for API calls - always use canonical URL
    const baseUrl = 'https://topline-tlwi.vercel.app'
    
    // Get newsletter content
    const content = await getNewsletterContent(baseUrl)
    
    // Generate HTML
    const htmlContent = generateNewsletterHTML(content)
    
    // Generate AI-powered subject line
    const subject = await generateSubjectLine(content.metric, content.articles)
    
    // Send test email
    const result = await sendTestEmail(htmlContent, subject, email, name)
    
    console.log(`✅ Test newsletter sent successfully to ${email}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Test newsletter sent to ${email}`,
      messageId: result.messageId,
      content: {
        metric: content.metric ? content.metric.title : 'No metric',
        articles: content.articles.length,
        subject: subject
      }
    })

  } catch (error) {
    console.error('❌ Test newsletter send error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send test newsletter'
    }, { status: 500 })
  }
} 