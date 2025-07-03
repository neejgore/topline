import { ExternalLink, TrendingUp, Tag, Star } from 'lucide-react'

type Metric = {
  id: string
  title: string
  value: string
  description?: string | null
  source: string
  sourceUrl?: string | null
  howToUse?: string | null
  talkTrack?: string | null
  vertical?: string | null
  priority?: string | null
}

interface MetricCardProps {
  metric: Metric
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

// Function to get priority styling
const getPriorityColor = (priority?: string | null) => {
  switch (priority) {
    case 'HIGH': return 'bg-red-100 text-red-800'
    case 'MEDIUM': return 'bg-orange-100 text-orange-800'
    case 'LOW': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStarCount = (priority?: string | null) => {
  switch (priority) {
    case 'HIGH': return 3
    case 'MEDIUM': return 2
    case 'LOW': return 1
    default: return 0
  }
}

const getStarColor = (priority?: string | null) => {
  switch (priority) {
    case 'HIGH': return 'text-red-600'
    case 'MEDIUM': return 'text-orange-600'
    case 'LOW': return 'text-gray-600'
    default: return 'text-gray-400'
  }
}

export default function MetricCard({ metric }: MetricCardProps) {
  const verticalStyle = getVerticalStyling(metric.vertical)
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden h-fit">
      {/* Vertical Tag Header */}
      <div className={`${verticalStyle.bg} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${verticalStyle.dot}`}></div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${verticalStyle.text}`}>
            {metric.vertical || 'Other'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {metric.priority && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(metric.priority)} flex items-center gap-1`}>
              <div className="flex items-center space-x-0.5">
                {[...Array(getStarCount(metric.priority))].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${getStarColor(metric.priority)}`} 
                    fill="currentColor"
                  />
                ))}
              </div>
              <span>{metric.priority}</span>
            </div>
          )}
          <TrendingUp className="h-3 w-3 text-gray-500" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Metric Value - Featured prominently */}
        <div className="text-center mb-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {metric.value}
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            {metric.title}
          </h3>
        </div>

        {/* Description */}
        {metric.description && (
          <p className="text-gray-600 text-xs mb-3 leading-relaxed">
            {metric.description}
          </p>
        )}

        {/* How to Use */}
        {metric.howToUse && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r">
            <h4 className="font-semibold text-blue-800 mb-1 text-sm">How to Use This:</h4>
            <p className="text-blue-700 text-xs leading-relaxed">
              {metric.howToUse}
            </p>
          </div>
        )}

        {/* Talk Track */}
        {metric.talkTrack && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4 rounded-r">
            <h4 className="font-semibold text-green-800 mb-1 text-sm flex items-center">
              <span className="mr-1">💬</span> Talk Track
            </h4>
            <p className="text-green-700 text-xs leading-relaxed">
              {metric.talkTrack}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 truncate">
            {metric.source}
          </span>

          {metric.sourceUrl && (
            <a
              href={metric.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline relative z-10 cursor-pointer"
              style={{ pointerEvents: 'all' }}
            >
              View Source
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
} 