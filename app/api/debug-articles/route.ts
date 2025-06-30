import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get sample articles with their URLs
    const articles = await prisma.article.findMany({
      where: { 
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        sourceName: true,
        vertical: true
      },
      take: 10,
      orderBy: { publishedAt: 'desc' }
    })

    // Count articles with problematic URLs  
    const urlIssues = await prisma.article.count({ 
      where: { 
        status: 'PUBLISHED', 
        sourceUrl: { contains: 'topline.platform' } 
      } 
    })

    return NextResponse.json({
      success: true,
      articles: articles,
      urlAnalysis: {
        totalArticles: articles.length,
        articlesWithUrlIssues: urlIssues,
        urlCheck: articles.map(article => ({
          title: article.title,
          url: article.sourceUrl,
          hasUrl: !!article.sourceUrl,
          isValidExternalUrl: article.sourceUrl && 
            !article.sourceUrl.includes('example.com') && 
            !article.sourceUrl.includes('topline.platform') &&
            (article.sourceUrl.startsWith('http://') || article.sourceUrl.startsWith('https://')),
          vertical: article.vertical,
          sourceName: article.sourceName,
          issue: !article.sourceUrl ? 'No URL' :
                 article.sourceUrl.includes('topline.platform') ? 'Internal URL' :
                 article.sourceUrl.includes('example.com') ? 'Example URL' :
                 (!article.sourceUrl.startsWith('http')) ? 'Invalid format' : 'OK'
        }))
      }
    })

  } catch (error) {
    console.error('❌ Debug failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 