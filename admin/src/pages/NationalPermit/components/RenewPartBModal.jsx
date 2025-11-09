import { useState } from 'react'
import { formatDate, getOneYearFromNow, parseFormattedDate } from '../../../utils/dateHelpers'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const RenewPartBModal = ({ permit, onClose, onRenewalSuccess }) => {
  const [formData, setFormData] = useState({
    authorizationNumber: '',
    validFrom: formatDate(new Date()),
    validTo: formatDate(getOneYearFromNow()),
    fees: '5000',
    notes: 'Annual Part B renewal'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-format date as user types (DD-MM-YYYY)
  const handleDateInput = (e) => {
    const { name, value } = e.target
    const input = e.target
    const cursorPos = input.selectionStart
    const prevValue = formData[name]

    // Handle backspace on dash - remove the dash and the digit before it
    if (value.length < prevValue.length) {
      // User is deleting
      const deletedChar = prevValue[cursorPos]
      if (deletedChar === '-') {
        // User backspaced a dash, so remove the digit before it too
        const newValue = prevValue.slice(0, cursorPos - 1) + prevValue.slice(cursorPos + 1)

        // Update state with the modified value
        if (name === 'validFrom') {
          const parsedDate = parseFormattedDate(newValue)
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            const validToDate = getOneYearFromNow(parsedDate)
            setFormData(prev => ({
              ...prev,
              [name]: newValue,
              validTo: formatDate(validToDate)
            }))
          } else {
            setFormData(prev => ({
              ...prev,
              [name]: newValue
            }))
          }
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: newValue
          }))
        }
        setError('')
        return
      }
    }

    // Remove all non-numeric characters except dashes
    let cleaned = value.replace(/[^\d-]/g, '')

    // Remove any dashes to rebuild the format
    let numbers = cleaned.replace(/-/g, '')

    // Limit to 8 digits (DDMMYYYY)
    numbers = numbers.slice(0, 8)

    // Format as DD-MM-YYYY with dash after 2 and 4 digits
    let formatted = ''
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2) // DD

      // Add dash after day if we have 2+ digits
      if (numbers.length >= 2) {
        formatted += '-'
      }

      if (numbers.length >= 3) {
        formatted += numbers.slice(2, 4) // MM
      }

      // Add dash after month if we have 4+ digits
      if (numbers.length >= 4) {
        formatted += '-'
      }

      if (numbers.length >= 5) {
        formatted += numbers.slice(4, 8) // YYYY
      }
    }

    // If Valid From changes, automatically calculate Valid To
    if (name === 'validFrom') {
      const parsedDate = parseFormattedDate(formatted)
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        const validToDate = getOneYearFromNow(parsedDate)
        setFormData(prev => ({
          ...prev,
          [name]: formatted,
          validTo: formatDate(validToDate)
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: formatted
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
    }

    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.authorizationNumber || formData.authorizationNumber.trim() === '') {
      setError('Authorization Number is required')
      return
    }

    if (!formData.validFrom || !formData.validTo) {
      setError('Valid From and Valid To dates are required')
      return
    }

    if (!formData.fees || parseFloat(formData.fees) <= 0) {
      setError('Please enter valid fees')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/national-permits/${permit.id}/renew-part-b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorizationNumber: formData.authorizationNumber.trim(),
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          fees: parseFloat(formData.fees),
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to renew Part B')
      }

      alert('Part B renewed successfully! New bill has been generated.')
      onRenewalSuccess && onRenewalSuccess(data.data)
      onClose()
    } catch (err) {
      console.error('Error renewing Part B:', err)
      setError(err.message || 'Failed to renew Part B. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-black mb-1'>Renew Part B Authorization</h2>
              <p className='text-red-100 text-sm'>Generate new authorization and bill</p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-6'>
          {/* Current Part B Info */}
          <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
            <h3 className='text-sm font-bold text-red-800 mb-2'>Current Part B Details</h3>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='text-red-600 font-semibold'>Current Auth Number:</span>
                <p className='text-gray-800 font-mono'>{permit.partB?.authorizationNumber || 'N/A'}</p>
              </div>
              <div>
                <span className='text-red-600 font-semibold'>Valid To:</span>
                <p className='text-gray-800 font-semibold'>{permit.partB?.validTo || 'N/A'}</p>
              </div>
            </div>
            <p className='text-xs text-red-600 mt-2 font-semibold'>
              ⚠️ Please enter a new authorization number below
            </p>
          </div>

          {/* Permit Reference */}
          <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='text-gray-600 font-semibold'>Permit Number:</span>
                <p className='text-gray-900 font-mono'>{permit.permitNumber}</p>
              </div>
              <div>
                <span className='text-gray-600 font-semibold'>Permit Holder:</span>
                <p className='text-gray-900'>{permit.permitHolder}</p>
              </div>
            </div>
          </div>

          {/* Renewal Form */}
          <div className='space-y-4'>
            {/* New Authorization Number */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                New Authorization Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='authorizationNumber'
                value={formData.authorizationNumber}
                onChange={handleChange}
                placeholder='e.g., AUTH-2025-0001'
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>Enter the new authorization number for this renewal</p>
            </div>

            {/* Valid From */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Valid From <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='validFrom'
                value={formData.validFrom}
                onChange={handleDateInput}
                placeholder='27-10-2025'
                maxLength='10'
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>Format: DD-MM-YYYY (4-digit year)</p>
            </div>

            {/* Valid To */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Valid To <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='validTo'
                value={formData.validTo}
                onChange={handleDateInput}
                placeholder='26-10-2026'
                maxLength='10'
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>Auto-calculated (1 year from Valid From)</p>
            </div>

            {/* Fees */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Renewal Fees (₹) <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='fees'
                value={formData.fees}
                onChange={handleChange}
                placeholder='5000'
                min='0'
                step='100'
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent'
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Notes (Optional)
              </label>
              <textarea
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                placeholder='Add any notes about this renewal...'
                rows='3'
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none'
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-sm text-red-700 font-semibold'>{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className='mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded'>
            <p className='text-xs text-blue-700 font-semibold'>
              ℹ️ Upon renewal, a new bill will be generated with the authorization number you provide.
              The old Part B will be moved to renewal history.
            </p>
          </div>
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4'>
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold'
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Renew Part B'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenewPartBModal
