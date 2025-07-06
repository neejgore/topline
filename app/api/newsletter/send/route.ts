import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Import the newsletter service
const { generateAndSendNewsletter } = require('../../../../lib/newsletter-service')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cronSecret = searchParams.get('secret')
    
    // Verify cron secret for security
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting newsletter send process...')
    
    // Get the base URL for API calls
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://topline-tlwi.vercel.app'
    
    // Generate and send newsletter
    const result = await generateAndSendNewsletter(supabase, baseUrl)
    
    console.log('Newsletter send result:', result)
    
    if (result.success) {
      return NextResponse.json({
        message: result.message,
        count: result.count,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Allow GET requests for manual testing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testMode = searchParams.get('test')
  
  if (testMode === 'true') {
    try {
      // Get the base URL for API calls
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://topline-tlwi.vercel.app'
      
      const { getNewsletterContent } = require('../../../../lib/newsletter-service')
      const content = await getNewsletterContent(baseUrl)
      
      return NextResponse.json({
        message: 'Newsletter content preview',
        content: content,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to get newsletter content',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }
  
  return NextResponse.json({
    message: 'Newsletter send endpoint',
    usage: 'POST with ?secret=CRON_SECRET to send newsletter, GET with ?test=true to preview content'
  })
} 