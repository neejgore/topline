import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const metricId = searchParams.get('metricId')
    
    if (action === 'publish-metric' && metricId) {
      // Archive current published metrics
      const { error: archiveError } = await supabase
        .from('metrics')
        .update({ 
          status: 'ARCHIVED',
          lastViewedAt: new Date().toISOString()
        })
        .eq('status', 'PUBLISHED')
      
      if (archiveError) {
        console.error('Archive error:', archiveError)
      }
      
      // Publish the specified metric
      const { error: publishError } = await supabase
        .from('metrics')
        .update({ status: 'PUBLISHED' })
        .eq('id', metricId)
      
      if (publishError) {
        return NextResponse.json({ error: publishError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Metric ${metricId} published successfully` 
      })
    }
    
    return NextResponse.json({ 
      error: 'Invalid action or missing metricId' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 