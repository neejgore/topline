import Link from 'next/link'
import { ExternalLink, Calendar, Tag } from 'lucide-react'

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

// Function to format date without external dependencies
const formatDate = (dateInput: Date | string | null): string => {
  if (!dateInput) return 'Today'
  
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return 'Today'
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return `${months[date.getMonth()]} ${date.getDate()}`
}

// Function to get vertical tag styling
const getVerticalStyling = (vertical: string | null | undefined) => {
  if (!vertical) return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  
  const styles: { [key: string]: { bg: string, text: string, dot: string } } = {
    'Consumer & Retail': { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' },
    'Insurance': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    'Telecom': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    'Financial Services': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    'Political Candidate & Advocacy': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    'Services': { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
    'Education': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    'Travel & Hospitality': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
    'Technology & Media': { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' },
    'Healthcare': { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    'Automotive': { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' },
    'All': { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500' },
    'Other': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  }
  
  return styles[vertical] || styles['Other']
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const verticalStyle = getVerticalStyling(article.vertical)
  
  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden">
      {/* Vertical Tag Header */}
      <div className={`${verticalStyle.bg} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${verticalStyle.dot}`}></div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${verticalStyle.text}`}>
            {article.vertical || 'Other'}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {article.publishedAt 
            ? formatDate(article.publishedAt)
            : 'Today'
          }
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-3">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {article.summary}
          </p>
        )}

        {/* Why It Matters */}
        {article.whyItMatters && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r">
            <h4 className="font-semibold text-blue-800 mb-1 text-sm flex items-center">
              <span className="mr-1">➡️</span> Why it matters
            </h4>
            <p className="text-blue-700 text-xs leading-relaxed">
              {article.whyItMatters}
            </p>
          </div>
        )}

        {/* Talk Track */}
        {article.talkTrack && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4 rounded-r">
            <h4 className="font-semibold text-green-800 mb-1 text-sm flex items-center">
              <span className="mr-1">💬</span> Talk Track
            </h4>
            <p className="text-green-700 text-xs leading-relaxed">
              {article.talkTrack}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 truncate">
            {article.sourceName}
          </span>

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline relative z-10 cursor-pointer"
            style={{ pointerEvents: 'all' }}
          >
            Read More
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </article>
  )
} 