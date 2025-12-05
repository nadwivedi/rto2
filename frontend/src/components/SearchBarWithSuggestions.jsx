import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const SearchBarWithSuggestions = ({
  value,
  onChange,
  placeholder = 'Search...',
  toUpperCase = false,
  endpoint = '/api/cg-permits',
  onSuggestionSelect = null
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions on input change
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          params: {
            search: value,
            limit: 10,
            page: 1
          },
          withCredentials: true
        })

        if (response.data.success && response.data.data.length > 0) {
          setSuggestions(response.data.data)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchSuggestions()
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [value, endpoint])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const searchValue = suggestion.permitNumber || suggestion.vehicleNumber || suggestion.vehicleNo || ''
    onChange(searchValue)

    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }

    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Handle input change
  const handleInputChange = (e) => {
    let newValue = e.target.value
    if (toUpperCase) {
      newValue = newValue.toUpperCase()
    }
    onChange(newValue)
    setSelectedIndex(-1)
  }

  return (
    <div ref={wrapperRef} className='relative flex-1'>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className='w-full px-4 py-2.5 pl-10 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all'
        />
        <svg
          className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
        {isLoading && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            <div className='w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className='absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto'>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion._id || suggestion.id || index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-all ${
                index === selectedIndex
                  ? 'bg-indigo-50 border-l-4 border-indigo-600'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-bold text-gray-900'>
                      {suggestion.vehicleNumber || suggestion.vehicleNo || 'N/A'}
                    </span>
                    <span className='text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded'>
                      {suggestion.permitNumber || 'N/A'}
                    </span>
                  </div>
                  <div className='text-xs text-gray-600 mt-1 font-medium'>
                    {suggestion.permitHolder || 'No holder name'}
                  </div>
                  {suggestion.mobileNumber && suggestion.mobileNumber !== 'N/A' && (
                    <div className='text-xs text-gray-500 mt-0.5'>
                      {suggestion.mobileNumber}
                    </div>
                  )}
                </div>
                <div className='text-right'>
                  {suggestion.status && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      suggestion.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : suggestion.status === 'expired'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {suggestion.status.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBarWithSuggestions
