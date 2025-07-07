import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Import the newsletter service
const { generateAndSendNewsletter } = require('../../../../lib/newsletter-service')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow cron jobs
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔥 Starting automated newsletter campaign...')
    
    // Get the base URL for API calls
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://topline-tlwi.vercel.app'
    
    // Send the newsletter campaign
    const result = await generateAndSendNewsletter(supabase, baseUrl)
    
    if (result.success) {
      console.log('✅ Newsletter campaign sent successfully!')
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        count: result.count
      })
    } else {
      console.error('❌ Newsletter campaign failed:', result.error)
      return NextResponse.json({ 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Newsletter send error:', error)
    return NextResponse.json({ 
      error: 'Failed to send newsletter campaign' 
    }, { status: 500 })
  }
}

// For manual testing
export async function GET(request: NextRequest) {
  try {
    // Security check - only allow cron jobs
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔥 Manual newsletter test...')
    
    // Get the base URL for API calls
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://topline-tlwi.vercel.app'
    
    // Send the newsletter campaign
    const result = await generateAndSendNewsletter(supabase, baseUrl)
    
    if (result.success) {
      console.log('✅ Newsletter test sent successfully!')
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        count: result.count
      })
    } else {
      console.error('❌ Newsletter test failed:', result.error)
      return NextResponse.json({ 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Newsletter test error:', error)
    return NextResponse.json({ 
      error: 'Failed to send newsletter test' 
    }, { status: 500 })
  }
} 