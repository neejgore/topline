'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

export const VERTICALS = [
  'All',
  'Consumer & Retail',
  'Insurance', 
  'Telecom',
  'Financial Services',
  'Political Candidate & Advocacy',
  'Services',
  'Education',
  'Travel & Hospitality',
  'Technology & Media',
  'Healthcare',
  'Automotive',
  'Other'
] as const

type Vertical = typeof VERTICALS[number]

interface VerticalFilterProps {
  selectedVertical: Vertical
  onVerticalChange: (vertical: Vertical) => void
  showCounts?: boolean
  articleCount?: number
  metricCount?: number
}

// Function to get vertical tag styling
const getVerticalStyling = (vertical: Vertical) => {
  const styles: { [key: string]: { bg: string, text: string, dot: string, activeBg: string, activeText: string } } = {
    'Consumer & Retail': { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500', activeBg: 'bg-pink-500', activeText: 'text-white' },
    'Insurance': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', activeBg: 'bg-blue-500', activeText: 'text-white' },
    'Telecom': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', activeBg: 'bg-purple-500', activeText: 'text-white' },
    'Financial Services': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', activeBg: 'bg-green-500', activeText: 'text-white' },
    'Political Candidate & Advocacy': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', activeBg: 'bg-red-500', activeText: 'text-white' },
    'Services': { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500', activeBg: 'bg-indigo-500', activeText: 'text-white' },
    'Education': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', activeBg: 'bg-yellow-500', activeText: 'text-white' },
    'Travel & Hospitality': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', activeBg: 'bg-orange-500', activeText: 'text-white' },
    'Technology & Media': { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500', activeBg: 'bg-cyan-500', activeText: 'text-white' },
    'Healthcare': { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500', activeBg: 'bg-emerald-500', activeText: 'text-white' },
    'Automotive': { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500', activeBg: 'bg-slate-500', activeText: 'text-white' },
    'All': { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500', activeBg: 'bg-violet-500', activeText: 'text-white' },
    'Other': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', activeBg: 'bg-gray-500', activeText: 'text-white' }
  }
  
  return styles[vertical] || styles['Other']
}

export default function VerticalFilter({ selectedVertical, onVerticalChange, showCounts, articleCount, metricCount }: VerticalFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 mb-4 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by Industry</span>
        {selectedVertical !== 'All' && (
          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
            {selectedVertical}
          </span>
        )}
        {showCounts && (
          <span className="text-xs text-gray-500">
            ({articleCount} articles, {metricCount} metrics)
          </span>
        )}
      </button>

      {/* Filter Pills */}
      {(isExpanded || selectedVertical !== 'All') && (
        <div className="flex flex-wrap gap-2">
          {VERTICALS.map((vertical) => {
            const style = getVerticalStyling(vertical)
            const isSelected = selectedVertical === vertical
            
            return (
              <button
                key={vertical}
                onClick={() => onVerticalChange(vertical)}
                className={`
                  inline-flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200
                  ${isSelected 
                    ? `${style.activeBg} ${style.activeText} shadow-md` 
                    : `${style.bg} ${style.text} hover:shadow-sm border border-gray-200`
                  }
                `}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : style.dot}`}></div>
                <span>{vertical}</span>
                {isSelected && selectedVertical !== 'All' && (
                  <X 
                    className="h-3 w-3 ml-1 hover:bg-black/10 rounded-full p-0.5" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onVerticalChange('All')
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
} 