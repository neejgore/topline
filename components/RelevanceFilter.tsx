'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'

export const RELEVANCE_LEVELS = [
  'All',
  'High',
  'Medium', 
  'Low'
] as const

type RelevanceLevel = typeof RELEVANCE_LEVELS[number]

interface RelevanceFilterProps {
  selectedRelevance: RelevanceLevel
  onRelevanceChange: (relevance: RelevanceLevel) => void
  showCounts?: boolean
  articleCount?: number
  metricCount?: number
}

// Function to get relevance styling
const getRelevanceStyling = (relevance: RelevanceLevel) => {
  const styles: { [key: string]: { bg: string, text: string, activeBg: string, activeText: string } } = {
    'High': { bg: 'bg-red-100', text: 'text-red-800', activeBg: 'bg-red-500', activeText: 'text-white' },
    'Medium': { bg: 'bg-orange-100', text: 'text-orange-800', activeBg: 'bg-orange-500', activeText: 'text-white' },
    'Low': { bg: 'bg-gray-100', text: 'text-gray-800', activeBg: 'bg-gray-500', activeText: 'text-white' },
    'All': { bg: 'bg-blue-100', text: 'text-blue-800', activeBg: 'bg-blue-500', activeText: 'text-white' }
  }
  
  return styles[relevance] || styles['All']
}

// Function to get star count based on relevance
const getStarCount = (relevance: RelevanceLevel) => {
  switch (relevance) {
    case 'High': return 3
    case 'Medium': return 2
    case 'Low': return 1
    default: return 0
  }
}

// Function to get star color based on relevance
const getStarColor = (relevance: RelevanceLevel, isSelected: boolean) => {
  if (isSelected) return 'text-white'
  
  switch (relevance) {
    case 'High': return 'text-red-600'
    case 'Medium': return 'text-orange-600'
    case 'Low': return 'text-gray-600'
    default: return 'text-blue-600'
  }
}

export default function RelevanceFilter({ selectedRelevance, onRelevanceChange, showCounts, articleCount, metricCount }: RelevanceFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 mb-4 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Star className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by Relevance</span>
        {selectedRelevance !== 'All' && (
          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
            {selectedRelevance}
          </span>
        )}
        {showCounts && (
          <span className="text-xs text-gray-500">
            ({articleCount} articles, {metricCount} metrics)
          </span>
        )}
      </button>

      {/* Filter Pills */}
      {(isExpanded || selectedRelevance !== 'All') && (
        <div className="flex flex-wrap gap-2">
          {RELEVANCE_LEVELS.map((relevance) => {
            const style = getRelevanceStyling(relevance)
            const isSelected = selectedRelevance === relevance
            const starCount = getStarCount(relevance)
            
            return (
              <button
                key={relevance}
                onClick={() => onRelevanceChange(relevance)}
                className={`
                  inline-flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200
                  ${isSelected 
                    ? `${style.activeBg} ${style.activeText} shadow-md` 
                    : `${style.bg} ${style.text} hover:shadow-sm border border-gray-200`
                  }
                `}
              >
                <div className="flex items-center space-x-1">
                  {relevance === 'All' ? (
                    <Star className={`h-3 w-3 ${getStarColor(relevance, isSelected)}`} />
                  ) : (
                    <div className="flex space-x-0.5">
                      {[...Array(starCount)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${getStarColor(relevance, isSelected)}`} 
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  )}
                  <span>{relevance}</span>
                </div>
                {isSelected && selectedRelevance !== 'All' && (
                  <X 
                    className="h-3 w-3 ml-1 hover:bg-black/10 rounded-full p-0.5" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onRelevanceChange('All')
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