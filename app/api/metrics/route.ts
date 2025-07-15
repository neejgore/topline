import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vertical = searchParams.get('vertical') || 'ALL'
    const priority = searchParams.get('priority') || 'ALL'
    const status = searchParams.get('status') || 'PUBLISHED'
    const beforeDate = searchParams.get('beforeDate') // For archive filtering
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1') // Default to 1 metric
    const skip = (page - 1) * limit

    // Calculate 90 days ago
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // For archived metrics, extend the date range to include future dates
    // This handles test data that might have incorrect dates
    // If beforeDate is provided (for archive page), use it as the end date
    let dateRangeStart = status === 'ARCHIVED' ? new Date('2020-01-01') : ninetyDaysAgo
    let dateRangeEnd = status === 'ARCHIVED' ? new Date('2030-12-31') : new Date()
    
    // For archive filtering, override the date range
    if (beforeDate) {
      dateRangeEnd = new Date(beforeDate)
      dateRangeStart = new Date('2020-01-01') // Allow all historical data
    }

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
      unit,
      context,
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

    // Build the query with appropriate date filter
    let query = supabase
      .from('metrics')
      .select(selectColumns)
      .eq('status', status)
      .gte('publishedAt', dateRangeStart.toISOString())
      .lt('publishedAt', dateRangeEnd.toISOString())
      .order('publishedAt', { ascending: false })
      .range(skip, skip + limit - 1)

    // REMOVED: Duplicate prevention based on lastViewedAt
    // Content should stay visible all day until daily refresh rotates it
    // The cron job handles content rotation, not view tracking

    // Add vertical filter if specified (handle both 'All' and 'ALL' as the same)
    if (vertical !== 'ALL' && vertical !== 'All') {
      query = query.eq('vertical', vertical)
    }

    // Add priority filter if specified
    if (priority !== 'ALL') {
      query = query.eq('priority', priority.toUpperCase())
    }

    // For archive requests, only show metrics that were actually shown to users
    if (beforeDate && hasViewTrackingColumn) {
      query = query.not('lastViewedAt', 'is', null)
      // Order by lastViewedAt for archive to show most recently viewed first
      query = query.order('lastViewedAt', { ascending: false })
    }

    // Get metrics and count with appropriate date filter
    let countQuery = supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
      .gte('publishedAt', dateRangeStart.toISOString())
      .lt('publishedAt', dateRangeEnd.toISOString())

    // REMOVED: Duplicate prevention based on lastViewedAt for count query
    // Content should stay visible all day until daily refresh rotates it

    if (vertical !== 'ALL' && vertical !== 'All') {
      countQuery = countQuery.eq('vertical', vertical)
    }

    if (priority !== 'ALL') {
      countQuery = countQuery.eq('priority', priority.toUpperCase())
    }

    // For archive requests, only count metrics that were actually shown to users
    if (beforeDate && hasViewTrackingColumn) {
      countQuery = countQuery.not('lastViewedAt', 'is', null)
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

    // REMOVED: Automatic view tracking on page visit
    // Content should stay visible all day until daily refresh, not disappear when viewed
    // The cron job handles the daily rotation, not user visits
    
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
      dailyLimit: 1,
      viewedToday: metrics.length,
      duplicatePrevention: hasViewTrackingColumn // Column exists but not used for immediate hiding
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