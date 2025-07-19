'use client'

import { useState } from 'react'
import { ExternalLink, Calendar, Building2, TrendingUp, MessageCircle, Star } from 'lucide-react'
import ProspectingEmailModal from './ProspectingEmailModal'

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
  importanceScore?: number
}

interface ArticleCardProps {
  article: Article
}

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (typeof document === 'undefined') {
    // Server-side fallback - simple entity replacements
    return text
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }
  
  const textArea = document.createElement('textarea')
  textArea.innerHTML = text
  return textArea.value
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Recently'
    const d = new Date(date)
    
    // Format: "Jul 5, 03:58 PM"
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const day = d.getDate()
    const time = d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `${month} ${day}, ${time}`
  }

  const getRelevanceStars = (importanceScore?: number) => {
    if (!importanceScore) return null;
    
    // Convert 0-100 AI relevance score to 1-3 star rating
    let starCount = 0;
    let starColor = 'text-gray-400';
    
    if (importanceScore >= 85) {
      starCount = 3;
      starColor = 'text-red-500'; // High relevance
    } else if (importanceScore >= 70) {
      starCount = 2;
      starColor = 'text-orange-500'; // Medium relevance
    } else if (importanceScore >= 50) {
      starCount = 1;
      starColor = 'text-gray-400'; // Low relevance
    }
    
    if (starCount === 0) return null;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(3)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < starCount ? starColor : 'text-gray-200'}`}
            fill="currentColor"
          />
        ))}
      </div>
    );
  }

  const getVerticalColor = (vertical?: string | null) => {
    switch (vertical) {
      case 'Technology & Media': return 'bg-blue-100 text-blue-800'
      case 'Consumer & Retail': return 'bg-purple-100 text-purple-800'
      case 'Financial Services': return 'bg-green-100 text-green-800'
      case 'Healthcare': return 'bg-pink-100 text-pink-800'
      case 'Healthcare & Life Sciences': return 'bg-pink-100 text-pink-800'
      case 'Energy & Utilities': return 'bg-yellow-100 text-yellow-800'
      case 'Insurance': return 'bg-blue-100 text-blue-800'
      case 'Telecom': return 'bg-purple-100 text-purple-800'
      case 'Political Candidate & Advocacy': return 'bg-red-100 text-red-800'
      case 'Services': return 'bg-indigo-100 text-indigo-800'
      case 'Education': return 'bg-yellow-100 text-yellow-800'
      case 'Travel & Hospitality': return 'bg-orange-100 text-orange-800'
      case 'Automotive': return 'bg-slate-100 text-slate-800'
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
            {article.importanceScore && getRelevanceStars(article.importanceScore)}
            {article.vertical && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getVerticalColor(article.vertical)}`}>
                {article.vertical}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {decodeHtmlEntities(article.title)}
        </h3>

        {article.summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {decodeHtmlEntities(article.summary)}
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
                    {decodeHtmlEntities(article.whyItMatters)}
                  </p>
                </div>
              )}

              {article.talkTrack && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Sales Starters</h4>
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    {decodeHtmlEntities(article.talkTrack)}
                  </p>
                  <div className="mt-3 pl-6">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setIsModalOpen(true)
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Create Prospecting Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Prospecting Email Modal */}
      <ProspectingEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={{
          title: article.title,
          summary: article.summary || '',
          whyItMatters: article.whyItMatters || '',
          talkTrack: article.talkTrack || '',
          source: article.sourceName || ''
        }}
        type="article"
      />
    </div>
  )
}
