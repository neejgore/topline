import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Import the enhanced metrics AI generator
const { generateMetricsAIContent } = require('../../../lib/ai-content-generator')

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting metrics AI content regeneration...')
    
    // Get all metrics (both published and archived) from target verticals
    const TARGET_VERTICALS = [
      'Technology & Media',
      'Consumer & Retail', 
      'Healthcare',
      'Financial Services',
      'Insurance',
      'Automotive',
      'Travel & Hospitality',
      'Education',
      'Telecom',
      'Services',
      'Political Candidate & Advocacy',
      'Other'
    ]
    
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .in('status', ['PUBLISHED', 'ARCHIVED'])
      .in('vertical', TARGET_VERTICALS)
      .order('publishedAt', { ascending: false })

    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`)
    }

    console.log(`📊 Found ${metrics.length} metrics (published and archived)`)

    // Generic phrases that indicate metrics need regeneration
    const genericPhrases = [
      'AI and automation are transforming industry operations',
      'Digital transformation is accelerating across industries',
      'Retail and consumer behavior is shifting dramatically',
      'This metric shows how brands are adapting their customer engagement',
      'Understanding these metrics helps position solutions in the context',
      'This metric reveals how technology adoption is reshaping business operations',
      'The media and technology landscape is rapidly evolving',
      'Energy and utilities are transitioning to sustainable models',
      'Financial services are undergoing digital transformation',
      'Healthcare is embracing digital innovation',
      'This metric indicates how the sector is adapting',
      'This development signals where the market is heading',
      'How is your organization planning to capitalize on this growth trend',
      'What opportunities do you see in this expanding market',
      'How are these technology trends impacting your digital strategy',
      'Where is your organization in terms of adoption of these technologies'
    ]

    // Filter metrics that need regeneration
    const metricsNeedingRegeneration = metrics.filter(metric => {
      const content = `${metric.whyItMatters || ''} ${metric.talkTrack || ''}`.toLowerCase()
      return genericPhrases.some(phrase => content.includes(phrase.toLowerCase())) ||
             !metric.whyItMatters || !metric.talkTrack ||
             metric.whyItMatters.trim() === '' || metric.talkTrack.trim() === ''
    })

    console.log(`🔧 Found ${metricsNeedingRegeneration.length} metrics needing AI content regeneration`)

    let regeneratedCount = 0
    let failedCount = 0
    const results = []

    for (const metric of metricsNeedingRegeneration) {
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
        metricsNeedingRegeneration: metricsNeedingRegeneration.length,
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
    // Get preview of current metrics from target verticals
    const TARGET_VERTICALS = [
      'Technology & Media',
      'Consumer & Retail', 
      'Healthcare',
      'Financial Services',
      'Insurance',
      'Automotive',
      'Travel & Hospitality',
      'Education',
      'Telecom',
      'Services',
      'Political Candidate & Advocacy',
      'Other'
    ]
    
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('id, title, value, vertical, whyItMatters, talkTrack, source, status')
      .in('status', ['PUBLISHED', 'ARCHIVED'])
      .in('vertical', TARGET_VERTICALS)
      .limit(10)

    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`)
    }

    // Check for generic content
    const genericPhrases = [
      'AI and automation are transforming industry operations',
      'Digital transformation is accelerating across industries',
      'Retail and consumer behavior is shifting dramatically',
      'This metric shows how brands are adapting their customer engagement',
      'Understanding these metrics helps position solutions in the context',
      'This metric reveals how technology adoption is reshaping business operations',
      'The media and technology landscape is rapidly evolving',
      'Energy and utilities are transitioning to sustainable models',
      'Financial services are undergoing digital transformation',
      'Healthcare is embracing digital innovation'
    ]

    const metricsWithGenericContent = metrics.filter(metric => {
      const content = `${metric.whyItMatters || ''} ${metric.talkTrack || ''}`.toLowerCase()
      return genericPhrases.some(phrase => content.includes(phrase.toLowerCase())) ||
             !metric.whyItMatters || !metric.talkTrack ||
             metric.whyItMatters.trim() === '' || metric.talkTrack.trim() === ''
    })

    const preview = metrics.map(metric => ({
      id: metric.id,
      title: metric.title,
      value: metric.value,
      vertical: metric.vertical,
      status: metric.status,
      currentWhyItMatters: metric.whyItMatters?.substring(0, 200) + '...',
      currentTalkTrack: metric.talkTrack?.substring(0, 150) + '...',
      source: metric.source,
      hasGenericContent: metricsWithGenericContent.some(m => m.id === metric.id)
    }))

    return NextResponse.json({
      success: true,
      message: 'Current metrics preview',
      metrics: preview,
      stats: {
        totalMetrics: metrics.length,
        metricsWithGenericContent: metricsWithGenericContent.length,
        metricsWithSpecificContent: metrics.length - metricsWithGenericContent.length
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