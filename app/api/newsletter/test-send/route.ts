import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getNewsletterContent, generateNewsletterHTML, generateSubjectLine } from '../../../../lib/newsletter-service'

const BREVO_API_URL = 'https://api.brevo.com/v3'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Send newsletter to specific email via Brevo SMTP API
 */
async function sendTestNewsletter(email: string, htmlContent: string, subject: string) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  try {
    console.log(`📧 Sending test newsletter to: ${email}`)
    
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'The Beacon',
          email: 'beacon@belldesk.ai'
        },
        to: [{
          email: email,
          name: email.split('@')[0]
        }],
        subject: `[TEST] ${subject}`,
        htmlContent: htmlContent
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Brevo SMTP API error: ${response.status} - ${JSON.stringify(data)}`)
    }

    console.log(`✅ Test newsletter sent to ${email}`)
    return { success: true, messageId: data.messageId }
  } catch (error) {
    console.error('❌ Error sending test newsletter:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log(`🔔 Sending test newsletter to: ${email}`)
    
    // Get the base URL for API calls
    const baseUrl = 'https://topline-tlwi.vercel.app'
    
    // Get newsletter content
    const content = await getNewsletterContent(baseUrl)
    
    // Generate HTML
    const htmlContent = generateNewsletterHTML(content)
    
    // Generate subject line
    const subject = await generateSubjectLine(content.metric, content.articles)
    
    // Send test newsletter
    const result = await sendTestNewsletter(email, htmlContent, subject)
    
    return NextResponse.json({ 
      success: true, 
      message: `Test newsletter sent to ${email}`,
      content: {
        metric: content.metric ? content.metric.title : 'None',
        articles: content.articles.length,
        subject: subject
      }
    })

  } catch (error) {
    console.error('❌ Test newsletter send error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    console.log(`🔔 Sending test newsletter to: ${email}`)
    
    // Get the base URL for API calls
    const baseUrl = 'https://topline-tlwi.vercel.app'
    
    // Get newsletter content
    const content = await getNewsletterContent(baseUrl)
    
    // Generate HTML
    const htmlContent = generateNewsletterHTML(content)
    
    // Generate subject line
    const subject = await generateSubjectLine(content.metric, content.articles)
    
    // Send test newsletter
    const result = await sendTestNewsletter(email, htmlContent, subject)
    
    return NextResponse.json({ 
      success: true, 
      message: `Test newsletter sent to ${email}`,
      content: {
        metric: content.metric ? content.metric.title : 'None',
        articles: content.articles.length,
        subject: subject
      }
    })

  } catch (error) {
    console.error('❌ Test newsletter send error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 