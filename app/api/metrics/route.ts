import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vertical = searchParams.get('vertical') || 'ALL'
    const priority = searchParams.get('priority') || 'ALL'
    const status = searchParams.get('status') || 'PUBLISHED'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '3') // Default to 3 metrics
    const skip = (page - 1) * limit

    // Calculate 90 days ago
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Get today's date for daily limit tracking
    const today = new Date().toISOString().split('T')[0]

    // Check if lastViewedAt column exists by testing a simple query
    let hasViewTrackingColumn = false
    try {
      await supabase
        .from('metrics')
        .select('lastViewedAt')
        .limit(1)
      hasViewTrackingColumn = true
    } catch (e) {
      console.log('lastViewedAt column not found, using fallback mode')
      hasViewTrackingColumn = false
    }

    // Build the select string based on column availability
    const selectColumns = `
      id,
      title,
      value,
      source,
      sourceUrl,
      whyItMatters,
      talkTrack,
      vertical,
      category,
      priority,
      status,
      publishedAt,
      createdAt${hasViewTrackingColumn ? ', lastViewedAt' : ''}
    `

    // Build the query with 90-day filter and conditional duplicate prevention
    let query = supabase
      .from('metrics')
      .select(selectColumns)
      .eq('status', status)
      .gte('publishedAt', ninetyDaysAgo.toISOString())
      .order('publishedAt', { ascending: false })
      .range(skip, skip + limit - 1)

    // Add duplicate prevention filter only if column exists
    // ENABLED: Prevents showing metrics that have already been viewed
    if (hasViewTrackingColumn) {
      query = query.or(`lastViewedAt.is.null,lastViewedAt.lt.${today}`)
    }

    // Add vertical filter if specified
    if (vertical !== 'ALL') {
      query = query.eq('vertical', vertical)
    }

    // Add priority filter if specified
    if (priority !== 'ALL') {
      query = query.eq('priority', priority.toUpperCase())
    }

    // Get metrics and count with 90-day filter
    let countQuery = supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
      .gte('publishedAt', ninetyDaysAgo.toISOString())

    // Add duplicate prevention filter only if column exists
    // ENABLED: Prevents showing metrics that have already been viewed
    if (hasViewTrackingColumn) {
      countQuery = countQuery.or(`lastViewedAt.is.null,lastViewedAt.lt.${today}`)
    }

    if (vertical !== 'ALL') {
      countQuery = countQuery.eq('vertical', vertical)
    }

    if (priority !== 'ALL') {
      countQuery = countQuery.eq('priority', priority.toUpperCase())
    }

    const [metricsResult, countResult] = await Promise.all([
      query,
      countQuery
    ])

    if (metricsResult.error) {
      throw metricsResult.error
    }

    if (countResult.error) {
      throw countResult.error
    }

    const metrics = metricsResult.data
    const total = countResult.count || 0

    // Mark these metrics as viewed for today (only if column exists)
    // ENABLED: Mark metrics as viewed so they don't appear again
    if (hasViewTrackingColumn && metrics && metrics.length > 0) {
      const metricIds = metrics.map((m: any) => m.id)
      await supabase
        .from('metrics')
        .update({ lastViewedAt: new Date().toISOString() })
        .in('id', metricIds)
    }

    return NextResponse.json({
      success: true,
      metrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      timeWindow: '90 days',
      dailyLimit: 3,
      viewedToday: metrics.length,
      duplicatePrevention: hasViewTrackingColumn // ENABLED when column exists
    })

  } catch (error) {
    console.error('Error fetching metrics:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : null
    })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate a UUID for the id field
    const id = crypto.randomUUID()
    
    // Check if lastViewedAt column exists
    let hasViewTrackingColumn = false
    try {
      await supabase
        .from('metrics')
        .select('lastViewedAt')
        .limit(1)
      hasViewTrackingColumn = true
    } catch (e) {
      hasViewTrackingColumn = false
    }
    
    const insertData: any = {
      id: id,
      title: body.title,
      value: body.value,
      source: body.source,
      sourceUrl: body.sourceUrl,
      whyItMatters: body.whyItMatters,
      talkTrack: body.talkTrack,
      vertical: body.vertical,
      category: body.category || 'METRICS',
      priority: body.priority || 'MEDIUM',
      status: body.status || 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Only add lastViewedAt if column exists
    if (hasViewTrackingColumn) {
      insertData.lastViewedAt = null
    }
    
    const { error } = await supabase
      .from('metrics')
      .insert(insertData)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Metric created successfully'
    })

  } catch (error) {
    console.error('Error creating metric:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : null
    })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 