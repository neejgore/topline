import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Import the FIXED metrics AI generator
const { generateMetricsAIContent } = require('../../../lib/ai-content-generator')

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting COMPREHENSIVE metrics AI content regeneration...')
    console.log('🎯 Target: ALL metrics with generic content that lacks specific value references')
    
    // Get ALL metrics from the database (both published and archived)
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`)
    }

    console.log(`📊 Found ${metrics.length} total metrics to analyze`)
    
    // Identify metrics with generic content that needs fixing
    const metricsNeedingFix = metrics.filter(metric => {
      return hasGenericContent(metric) || !referencesSpecificValue(metric)
    })
    
    console.log(`🔧 Found ${metricsNeedingFix.length} metrics with generic content that needs fixing`)
    
    if (metricsNeedingFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No metrics need fixing - all content is specific',
        totalMetrics: metrics.length,
        fixedMetrics: 0
      })
    }
    
    // Log the metrics that need fixing
    console.log('\n📋 Metrics requiring specific content generation:')
    metricsNeedingFix.forEach((metric, index) => {
      console.log(`${index + 1}. "${metric.title}" (${metric.value}${metric.unit ? ` ${metric.unit}` : ''})`)
      console.log(`   Current whyItMatters: ${metric.whyItMatters?.substring(0, 100)}...`)
      console.log(`   Status: ${metric.status}`)
      console.log('')
    })

    let fixedCount = 0
    let failedCount = 0
    const results = []

    // Process each metric that needs fixing
    for (const metric of metricsNeedingFix) {
      try {
        const formattedValue = formatValueDisplay(metric.value, metric.unit)
        console.log(`\n🤖 FIXING: "${metric.title}" = ${formattedValue}`)
        console.log(`📊 Status: ${metric.status} | Vertical: ${metric.vertical}`)
        
        // Generate NEW specific AI content that references the exact value
        const aiContent = await generateMetricsAIContent(
          metric.title,
          metric.value,
          metric.source || 'Industry Report',
          metric.context || metric.whyItMatters || '',
          metric.vertical
        )

        console.log(`✅ Generated SPECIFIC content for ${formattedValue}:`)
        console.log(`📝 New whyItMatters: ${aiContent.whyItMatters.substring(0, 120)}...`)
        console.log(`💬 New talkTrack: ${aiContent.talkTrack.substring(0, 120)}...`)

        // Update the metric in the database
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

        fixedCount++
        results.push({
          id: metric.id,
          title: metric.title,
          value: formattedValue,
          vertical: metric.vertical,
          status: metric.status,
          oldWhyItMatters: metric.whyItMatters?.substring(0, 100),
          newWhyItMatters: aiContent.whyItMatters.substring(0, 100),
          result: 'FIXED'
        })

        console.log(`✅ FIXED: "${metric.title}" now references ${formattedValue}`)
        
        // Rate limit to avoid overwhelming AI API
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`❌ FAILED to fix metric "${metric.title}":`, (error as Error).message)
        failedCount++
        
        results.push({
          id: metric.id,
          title: metric.title,
          value: formatValueDisplay(metric.value, metric.unit),
          vertical: metric.vertical,
          status: metric.status,
          result: 'FAILED',
          error: (error as Error).message
        })
      }
    }

    console.log('\n🎉 COMPREHENSIVE metrics AI regeneration completed!')
    console.log('=' .repeat(60))
    console.log(`📊 Total metrics analyzed: ${metrics.length}`)
    console.log(`🔧 Metrics needing fixes: ${metricsNeedingFix.length}`)
    console.log(`✅ Successfully fixed: ${fixedCount}`)
    console.log(`❌ Failed to fix: ${failedCount}`)
    console.log(`🎯 Success rate: ${Math.round((fixedCount / metricsNeedingFix.length) * 100)}%`)

    return NextResponse.json({
      success: true,
      message: `Comprehensive metrics AI regeneration completed: ${fixedCount} metrics fixed`,
      totalMetrics: metrics.length,
      metricsNeedingFix: metricsNeedingFix.length,
      fixedMetrics: fixedCount,
      failedMetrics: failedCount,
      successRate: Math.round((fixedCount / metricsNeedingFix.length) * 100),
      results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Comprehensive metrics AI regeneration failed:', (error as Error).message)
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Check if a metric has generic content that needs fixing
 */
function hasGenericContent(metric: any): boolean {
  const { whyItMatters, talkTrack } = metric
  
  if (!whyItMatters || !talkTrack) return true
  
  // Check for generic phrases that indicate bad content
  const genericPhrases = [
    'is accelerating rapidly',
    'early adopters gaining significant competitive advantages',
    'This development signals where the market is heading',
    'Reference this AI trend to discuss',
    'position your solution in the context of this market evolution',
    'Privacy regulations and data changes are forcing immediate strategic shifts',
    'Market consolidation and funding activities signal investor confidence',
    'The retail media and commerce landscape is evolving rapidly',
    'This [vertical] development represents a significant shift',
    'is growing rapidly as organizations prioritize',
    'remains critical as digital becomes the primary',
    'are forcing brands to invest heavily in',
    'Use this to discuss',
    'Reference this to discuss',
    'digital transformation is accelerating',
    'are modernizing',
    'market is evolving',
    'trends are changing',
    'optimization remains critical',
    'the importance of',
    'digitalizing'
  ]
  
  const content = `${whyItMatters} ${talkTrack}`.toLowerCase()
  return genericPhrases.some(phrase => content.includes(phrase.toLowerCase()))
}

/**
 * Check if the metric content references its specific value
 */
function referencesSpecificValue(metric: any): boolean {
  const { whyItMatters, talkTrack, value } = metric
  
  if (!whyItMatters || !talkTrack || !value) return false
  
  const content = `${whyItMatters} ${talkTrack}`.toLowerCase()
  const numericValue = value.toString().replace(/[^\d.]/g, '')
  
  // Must reference the specific numeric value
  return content.includes(numericValue)
}

/**
 * Format value for display
 */
function formatValueDisplay(value: any, unit?: string): string {
  if (!value) return 'N/A'
  
  if (unit) {
    if (unit.includes('billion') || unit.includes('USD')) {
      return `$${value}B`
    }
    if (unit.includes('million')) {
      return `$${value}M`
    }
    if (unit.includes('percentage') || unit.includes('%')) {
      return `${value}%`
    }
    return `${value} ${unit}`
  }
  
  return value.toString()
} 