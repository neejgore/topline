import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Protect with CRON_SECRET; production-only use
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Delete obvious test articles
    const conditions = [
      "sourceName.eq.Test Source",
      "title.ilike.Test%Article%",
      "sourceUrl.ilike.https://example.com/test-%"
    ]

    let totalDeleted = 0
    for (const cond of conditions) {
      const { count, error } = await supabase
        .from('articles')
        .delete({ count: 'estimated' })
        .or(cond)

      if (error) {
        console.error('Purge error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      totalDeleted += count || 0
    }

    return NextResponse.json({ success: true, deleted: totalDeleted })

  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}


