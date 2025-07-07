import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Import the enhanced metrics AI generator
const { generateMetricsAIContent } = require('../../../lib/ai-content-generator')

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting metrics AI content regeneration...')
    
    // Get all published metrics
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('publishedAt', { ascending: false })

    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`)
    }

    console.log(`📊 Found ${metrics.length} published metrics`)

    let regeneratedCount = 0
    let failedCount = 0
    const results = []

    for (const metric of metrics) {
      try {
        console.log(`🤖 Regenerating AI content for: ${metric.title}`)
        
        // Generate enhanced AI content
        const aiContent = await generateMetricsAIContent(
          metric.title,
          metric.value,
          metric.source,
          metric.explanation || metric.whyItMatters || '',
          metric.vertical
        )

        // Update the metric with new AI content
        const { error: updateError } = await supabase
          .from('metrics')
          .update({
            whyItMatters: aiContent.whyItMatters,
            talkTrack: aiContent.talkTrack,
            updatedAt: new Date().toISOString()
          })
          .eq('id', metric.id)

        if (updateError) {
          throw new Error(`Error updating metric: ${updateError.message}`)
        }

        console.log(`✅ Enhanced: ${metric.title.substring(0, 50)}...`)
        regeneratedCount++
        
        results.push({
          id: metric.id,
          title: metric.title.substring(0, 50),
          vertical: metric.vertical,
          oldWhyItMatters: metric.whyItMatters?.substring(0, 100) + '...',
          newWhyItMatters: aiContent.whyItMatters.substring(0, 100) + '...',
          status: 'regenerated'
        })

        // Rate limit to avoid overwhelming AI API
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`❌ Failed to regenerate AI content for metric ${metric.id}:`, (error as Error).message)
        failedCount++
        
        results.push({
          id: metric.id,
          title: metric.title.substring(0, 50),
          status: 'failed',
          error: (error as Error).message
        })
      }
    }

    console.log(`🎉 Metrics AI regeneration complete!`)
    console.log(`📊 Regenerated: ${regeneratedCount} metrics`)
    console.log(`📊 Failed: ${failedCount} metrics`)

    return NextResponse.json({
      success: true,
      message: 'Metrics AI content regeneration completed',
      stats: {
        totalMetrics: metrics.length,
        regeneratedCount,
        failedCount
      },
      results: results.slice(0, 5) // Return first 5 results as sample
    })

  } catch (error) {
    console.error('❌ Error in metrics AI regeneration:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get preview of current metrics
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('id, title, value, vertical, whyItMatters, talkTrack, source')
      .eq('status', 'PUBLISHED')
      .limit(5)

    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`)
    }

    const preview = metrics.map(metric => ({
      id: metric.id,
      title: metric.title,
      value: metric.value,
      vertical: metric.vertical,
      currentWhyItMatters: metric.whyItMatters?.substring(0, 200) + '...',
      currentTalkTrack: metric.talkTrack?.substring(0, 150) + '...',
      source: metric.source
    }))

    return NextResponse.json({
      success: true,
      message: 'Current metrics preview',
      metrics: preview,
      stats: {
        totalPublishedMetrics: metrics.length
      }
    })

  } catch (error) {
    console.error('❌ Error in metrics preview:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
} 