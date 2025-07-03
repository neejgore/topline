import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vertical = searchParams.get('vertical') || 'ALL'
    const status = searchParams.get('status') || 'PUBLISHED'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Calculate 48 hours ago
    const fortyEightHoursAgo = new Date()
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)

    // Build the query with 48-hour filter
    let query = supabase
      .from('metrics')
      .select(`
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
        createdAt
      `)
      .eq('status', status)
      .gte('publishedAt', fortyEightHoursAgo.toISOString())
      .order('publishedAt', { ascending: false })
      .range(skip, skip + limit - 1)

    // Add vertical filter if specified
    if (vertical !== 'ALL') {
      query = query.eq('vertical', vertical)
    }

    // Get metrics and count with 48-hour filter
    let countQuery = supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
      .gte('publishedAt', fortyEightHoursAgo.toISOString())

    if (vertical !== 'ALL') {
      countQuery = countQuery.eq('vertical', vertical)
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

    return NextResponse.json({
      success: true,
      metrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      timeWindow: '48 hours'
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
    
    const { error } = await supabase
      .from('metrics')
      .insert({
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
      })

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