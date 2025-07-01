import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check for various possible OpenAI environment variable names
    const possibleKeys = [
      'OPENAI_API_KEY',
      'OPEN_AI_KEY', 
      'OPENAI_KEY',
      'OPENAI',
      'API_KEY_OPENAI'
    ]
    
    const envCheck: { [key: string]: boolean } = {}
    
    for (const key of possibleKeys) {
      envCheck[key] = !!process.env[key]
    }
    
    // Get all environment variable names (but not values for security)
    const allEnvKeys = Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('open') || key.toLowerCase().includes('ai')
    )
    
    return NextResponse.json({
      success: true,
      possibleOpenAIKeys: envCheck,
      allAIRelatedEnvKeys: allEnvKeys,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
} 