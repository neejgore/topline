'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'

interface VerticalFilterProps {
  onFilterChange: (vertical: string) => void
  activeFilter: string
}

const VERTICALS = [
  { value: 'ALL', label: 'All Verticals', type: 'All' },
  // B2B Verticals
  { value: 'MARTECH', label: 'MarTech', type: 'B2B' },
  { value: 'ADTECH', label: 'AdTech', type: 'B2B' },
  { value: 'REVENUE_OPS', label: 'Revenue Ops', type: 'B2B' },
  { value: 'FINTECH', label: 'FinTech', type: 'B2B/Consumer' },
  { value: 'HEALTHTECH', label: 'HealthTech', type: 'B2B/Consumer' },
  // Consumer Verticals  
  { value: 'RETAIL', label: 'Retail', type: 'Consumer' },
  { value: 'ECOMMERCE', label: 'E-commerce', type: 'Consumer' },
  { value: 'CPG', label: 'CPG', type: 'Consumer' },
]

export default function VerticalFilter({ onFilterChange, activeFilter }: VerticalFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeVertical = VERTICALS.find(v => v.value === activeFilter) || VERTICALS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {activeVertical.label}
        </span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="py-1">
            {VERTICALS.map((vertical) => (
              <button
                key={vertical.value}
                onClick={() => {
                  onFilterChange(vertical.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  activeFilter === vertical.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <span className="font-medium">{vertical.label}</span>
                <span className="text-xs text-gray-500">{vertical.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 