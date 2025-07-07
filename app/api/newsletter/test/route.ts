import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        hasBrevoKey: !!process.env.BREVO_API_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV
      },
      database: null as any,
      brevo: null as any
    }

    // Test database connection
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('count(*)', { count: 'exact', head: true })

      if (error) {
        diagnostics.database = { status: 'error', message: error.message }
      } else {
        diagnostics.database = { status: 'connected', count: data }
      }
    } catch (dbError) {
      diagnostics.database = { 
        status: 'error', 
        message: dbError instanceof Error ? dbError.message : 'Unknown database error' 
      }
    }

    // Test Brevo API (simple authentication test)
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoResponse = await fetch('https://api.brevo.com/v3/account', {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'accept': 'application/json'
          }
        })

        if (brevoResponse.ok) {
          diagnostics.brevo = { status: 'connected' }
        } else {
          diagnostics.brevo = { 
            status: 'error', 
            message: `HTTP ${brevoResponse.status}` 
          }
        }
      } catch (brevoError) {
        diagnostics.brevo = { 
          status: 'error', 
          message: brevoError instanceof Error ? brevoError.message : 'Unknown Brevo error' 
        }
      }
    } else {
      diagnostics.brevo = { status: 'no_api_key' }
    }

    return NextResponse.json(diagnostics)

  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 