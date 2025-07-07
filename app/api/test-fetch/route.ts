import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log('🔍 Testing fetch from serverless function...')
    
    // Test basic fetch
    const response = await fetch('https://topline-tlwi.vercel.app/api/metrics?limit=1&status=PUBLISHED')
    const data = await response.json()
    
    console.log('✅ Fetch successful:', data)
    
    return NextResponse.json({
      success: true,
      status: response.status,
      data: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Fetch failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 