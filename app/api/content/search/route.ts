import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/lib/content'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      )
    }

    const results = await searchContent(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching content:', error)
    return NextResponse.json(
      { message: 'Failed to search content' },
      { status: 500 }
    )
  }
} 