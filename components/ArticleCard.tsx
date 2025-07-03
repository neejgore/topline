'use client'

import { useState } from 'react'
import { ExternalLink, Calendar, Building2, TrendingUp, MessageCircle, Star } from 'lucide-react'

interface Article {
  id: string
  title: string
  summary?: string | null
  sourceUrl?: string | null
  sourceName?: string | null
  publishedAt?: Date | null
  whyItMatters?: string | null
  talkTrack?: string | null
  vertical?: string | null
  priority?: string
  category?: string
}

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Recently'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerticalColor = (vertical?: string | null) => {
    switch (vertical) {
      case 'Technology & Media': return 'bg-blue-100 text-blue-800'
      case 'Consumer & Retail': return 'bg-purple-100 text-purple-800'
      case 'Financial Services': return 'bg-green-100 text-green-800'
      case 'Healthcare': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.publishedAt || null)}</span>
          </div>
          <div className="flex items-center gap-2">
            {article.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(article.priority)}`}>
                {article.priority}
              </span>
            )}
            {article.vertical && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerticalColor(article.vertical)}`}>
                {article.vertical}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="h-4 w-4" />
            <span>{article.sourceName || 'Unknown Source'}</span>
          </div>
          
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Read more
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {(article.whyItMatters || article.talkTrack) && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <span>Sales Intelligence</span>
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isExpanded && (
            <div className="px-6 pb-6 space-y-4 bg-gray-50">
              {article.whyItMatters && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Why It Matters</h4>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    {article.whyItMatters}
                  </p>
                </div>
              )}

              {article.talkTrack && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Talk Track</h4>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    {article.talkTrack}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 