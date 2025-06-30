import Link from 'next/link'
import { ExternalLink, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'

type Article = {
  id: string
  title: string
  summary?: string | null
  sourceUrl: string
  sourceName: string
  whyItMatters?: string | null
  talkTrack?: string | null
  publishedAt?: Date | string | null
  vertical?: string | null
}

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 leading-tight">
          {article.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 ml-4">
          <Calendar className="h-4 w-4 mr-1" />
          {article.publishedAt 
            ? format(new Date(article.publishedAt), 'MMM d')
            : 'Today'
          }
        </div>
      </div>

      {/* Summary */}
      {article.summary && (
        <p className="article-summary mb-4">
          {article.summary}
        </p>
      )}

      {/* Why It Matters */}
      {article.whyItMatters && (
        <div className="why-it-matters">
          <h4 className="font-semibold text-blue-800 mb-2">➡️ Why it matters:</h4>
          <p className="text-blue-700 text-sm leading-relaxed">
            {article.whyItMatters}
          </p>
        </div>
      )}

      {/* Talk Track */}
      {article.talkTrack && (
        <div className="talk-track">
          <h4 className="font-semibold text-green-800 mb-2">💬 Talk Track:</h4>
          <p className="text-green-700 text-sm leading-relaxed">
            {article.talkTrack}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Source: {article.sourceName}
          </span>
          
          {article.vertical && (
            <div className="flex items-center">
              <Tag className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {article.vertical.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Read More
          <ExternalLink className="h-4 w-4 ml-1" />
        </a>
      </div>
    </article>
  )
} 