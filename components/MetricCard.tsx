import { ExternalLink, TrendingUp, Star } from 'lucide-react'

type Metric = {
  id: string
  title: string
  value: string
  unit?: string | null
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

const getPriorityStars = (priority?: string | null) => {
  const starCount = priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : priority === 'LOW' ? 1 : 0;
  const starColor = priority === 'HIGH' ? 'text-red-500' : priority === 'MEDIUM' ? 'text-orange-500' : 'text-gray-400';
  
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

// Helper function to format value with unit
const formatValueWithUnit = (value: string, unit?: string | null) => {
  if (!unit) return value;
  
  // Handle common currency and percentage formats
  if (unit.toLowerCase().includes('usd') || unit.toLowerCase().includes('dollar')) {
    if (unit.toLowerCase().includes('billion')) {
      return `$${value}B`;
    } else if (unit.toLowerCase().includes('million')) {
      return `$${value}M`;
    } else if (unit.toLowerCase().includes('trillion')) {
      return `$${value}T`;
    } else {
      return `$${value}`;
    }
  } else if (unit.toLowerCase().includes('percentage') || unit === '%') {
    return `${value}%`;
  } else if (unit.toLowerCase().includes('gwh')) {
    return `${value} GWh`;
  } else if (unit.toLowerCase().includes('million units')) {
    return `${value}M units`;
  } else {
    // For any other unit, just append it
    return `${value} ${unit}`;
  }
}

export default function MetricCard({ metric }: MetricCardProps) {
  const verticalStyle = getVerticalStyling(metric.vertical)
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden w-full">
      {/* Vertical Tag Header */}
      <div className={`${verticalStyle.bg} px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${verticalStyle.dot}`}></div>
          <span className={`text-sm font-semibold uppercase tracking-wide ${verticalStyle.text}`}>
            {metric.vertical || 'Other'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {metric.priority && getPriorityStars(metric.priority)}
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Horizontal Content Layout */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
          
          {/* Left Side - Metric Value (Featured) */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="text-center lg:text-left bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-6">
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                {formatValueWithUnit(metric.value, metric.unit)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {metric.title}
              </h3>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:w-2/3 space-y-4">
            
            {/* Description */}
            {metric.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {metric.description}
              </p>
            )}

            {/* How to Use */}
            {metric.howToUse && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">How to Use This:</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {metric.howToUse}
                </p>
              </div>
            )}

            {/* Talk Track */}
            {metric.talkTrack && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                <h4 className="font-semibold text-green-800 mb-2 text-sm flex items-center">
                  <span className="mr-2">💬</span> Talk Track
                </h4>
                <p className="text-green-700 text-sm leading-relaxed">
                  {metric.talkTrack}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 truncate">
                {metric.source}
              </span>

              {metric.sourceUrl && (
                <a
                  href={metric.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline relative z-10 cursor-pointer"
                  style={{ pointerEvents: 'all' }}
                >
                  View Source
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
