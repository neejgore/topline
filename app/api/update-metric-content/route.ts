import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get current published metric
    const { data: metrics, error: fetchError } = await supabase
      .from('metrics')
      .select('*')
      .eq('status', 'PUBLISHED')
      .limit(1)
      
    if (fetchError) {
      throw fetchError
    }
    
    if (!metrics || metrics.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No published metrics found'
      }, { status: 404 })
    }
    
    const metric = metrics[0]
    
    // Update the metric with enhanced content
    const { error: updateError } = await supabase
      .from('metrics')
      .update({
        whyItMatters: body.whyItMatters,
        talkTrack: body.talkTrack,
        updatedAt: new Date().toISOString()
      })
      .eq('id', metric.id)
      
    if (updateError) {
      throw updateError
    }
    
    return NextResponse.json({
      success: true,
      message: 'Metric content updated successfully',
      metric: {
        id: metric.id,
        title: metric.title,
        value: metric.value,
        unit: metric.unit
      }
    })
    
  } catch (error) {
    console.error('Error updating metric content:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 