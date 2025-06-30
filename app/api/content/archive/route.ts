import { NextResponse } from 'next/server'
import { getArchivedContent } from '@/lib/content'

export async function GET() {
  try {
    const content = await getArchivedContent()
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching archived content:', error)
    return NextResponse.json(
      { message: 'Failed to fetch archived content' },
      { status: 500 }
    )
  }
} 