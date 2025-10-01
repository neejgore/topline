import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const metricId = searchParams.get('metricId')
    
    if (!metricId) {
      // Auto-select a metric to publish
      const { data: availableMetrics } = await supabase
        .from('metrics')
        .select('*')
        .eq('status', 'ARCHIVED')
        .order('createdAt', { ascending: false })
        .limit(1)
      
      if (!availableMetrics || availableMetrics.length === 0) {
        return NextResponse.json({ error: 'No metrics available to publish' }, { status: 404 })
      }
      
      const selectedMetric = availableMetrics[0]
      
      // Archive any current published metrics
      await supabase
        .from('metrics')
        .update({ 
          status: 'ARCHIVED',
          lastViewedAt: new Date().toISOString()
        })
        .eq('status', 'PUBLISHED')
      
      // Publish the selected metric
      const { error: publishError } = await supabase
        .from('metrics')
        .update({ 
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
          lastViewedAt: new Date().toISOString()
        })
        .eq('id', selectedMetric.id)
      
      if (publishError) {
        return NextResponse.json({ error: publishError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Auto-published metric: ${selectedMetric.title}`,
        metric: {
          id: selectedMetric.id,
          title: selectedMetric.title,
          value: selectedMetric.value,
          unit: selectedMetric.unit,
          vertical: selectedMetric.vertical
        }
      })
    }
    
    // Specific metric ID provided
    // Archive current published metrics
    await supabase
      .from('metrics')
      .update({ 
        status: 'ARCHIVED',
        lastViewedAt: new Date().toISOString()
      })
      .eq('status', 'PUBLISHED')
    
    // Publish the specified metric
    const { error: publishError } = await supabase
      .from('metrics')
      .update({ 
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        lastViewedAt: new Date().toISOString()
      })
      .eq('id', metricId)
    
    if (publishError) {
      return NextResponse.json({ error: publishError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Published metric with ID: ${metricId}` 
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 