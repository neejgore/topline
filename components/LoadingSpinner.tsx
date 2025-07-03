export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>
      <span className="ml-3 text-gray-600">Loading fresh insights...</span>
    </div>
  )
} 