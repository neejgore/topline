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

    // Build the query
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        summary,
        sourceUrl,
        sourceName,
        publishedAt,
        whyItMatters,
        talkTrack,
        vertical,
        category,
        priority,
        status,
        views,
        clicks,
        shares
      `)
      .eq('status', status)
      .order('publishedAt', { ascending: false })
      .range(skip, skip + limit - 1)

    // Add vertical filter if specified
    if (vertical !== 'ALL') {
      query = query.eq('vertical', vertical)
    }

    // Get content and count
    let countQuery = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (vertical !== 'ALL') {
      countQuery = countQuery.eq('vertical', vertical)
    }

    const [contentResult, countResult] = await Promise.all([
      query,
      countQuery
    ])

    if (contentResult.error) {
      throw contentResult.error
    }

    if (countResult.error) {
      throw countResult.error
    }

    const content = contentResult.data
    const total = countResult.count || 0

    return NextResponse.json({
      success: true,
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 