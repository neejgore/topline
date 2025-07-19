import { ExternalLink, TrendingUp, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProspectingEmailModal from './ProspectingEmailModal'

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

// Helper function to clean metric title for display
const cleanMetricTitle = (title: string): string => {
  // Remove date suffixes like "(2025-06-17)" or "(2025-06-17)" from title
  return title.replace(/\s*\([0-9]{4}-[0-9]{2}-[0-9]{2}\)\s*$/, '').trim()
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
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Handle metric-specific URL parameters from newsletter
  useEffect(() => {
    try {
      const shouldFocus = searchParams.get('expand') === 'sales-intelligence'
      const targetMetricId = searchParams.get('metric')
      
      console.log('MetricCard URL debug:', {
        metricId: metric.id,
        shouldFocus,
        targetMetricId,
        matches: targetMetricId === metric.id
      })
      
      if (shouldFocus && targetMetricId && targetMetricId === metric.id) {
        console.log(`Scrolling to metric ${metric.id}`)
        // Small delay to allow component rendering, then scroll into view
        setTimeout(() => {
          const element = document.querySelector(`[data-metric-id="${metric.id}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    } catch (error) {
      console.error('Error reading search params in MetricCard:', error)
      // Fallback to window.location if searchParams fails
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        const shouldFocus = url.searchParams.get('expand') === 'sales-intelligence'
        const targetMetricId = url.searchParams.get('metric')
        
        if (shouldFocus && targetMetricId && targetMetricId === metric.id) {
          setTimeout(() => {
            const element = document.querySelector(`[data-metric-id="${metric.id}"]`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 300)
        }
      }
    }
  }, [searchParams, metric.id])
  const verticalStyle = getVerticalStyling(metric.vertical)
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden w-full" data-metric-id={metric.id}>
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

      {/* 3-Column Content Layout */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Metric, Description, and Source */}
          <div className="space-y-4">
            {/* Metric Value */}
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatValueWithUnit(metric.value, metric.unit)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {decodeHtmlEntities(cleanMetricTitle(metric.title))}
              </h3>
            </div>

            {/* Description */}
            {metric.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {decodeHtmlEntities(metric.description)}
              </p>
            )}

            {/* Source */}
            <div className="pt-4 border-t border-gray-100">
              {metric.sourceUrl ? (
                <a
                  href={metric.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium hover:underline"
                >
                  {metric.source}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              ) : (
                <span className="text-sm text-gray-500">
                  {metric.source}
                </span>
              )}
            </div>
          </div>

          {/* Middle Column - How to Use This */}
          <div>
            {metric.howToUse && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r h-full">
                <h4 className="font-semibold text-blue-800 mb-3 text-base">How to Use This:</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {decodeHtmlEntities(metric.howToUse)}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sales Starters */}
          <div>
            {metric.talkTrack && (
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r h-full">
                <h4 className="font-semibold text-green-800 mb-3 text-base flex items-center">
                  <span className="mr-2">💬</span> Sales Starters
                </h4>
                <h5 className="text-sm font-semibold text-green-800 mb-2">Talk Track</h5>
                <p className="text-green-700 text-sm leading-relaxed mb-4">
                  {decodeHtmlEntities(metric.talkTrack)}
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setIsModalOpen(true)
                  }}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Create Prospecting Email
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Prospecting Email Modal */}
      <ProspectingEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={{
          title: metric.title,
          value: metric.value,
          unit: metric.unit || '',
          whyItMatters: metric.howToUse || '',
          talkTrack: metric.talkTrack || '',
          source: metric.source
        }}
        type="metric"
      />
    </div>
  )
}
