import { useState, useEffect } from 'react'

// Helper function to format date as DD-MM-YYYY
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const AddFitnessModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    validFrom: '',
    validTo: '',
    fee: ''
  })

  // Calculate valid to date (1 year from valid from)
  useEffect(() => {
    if (formData.validFrom) {
      // Parse DD-MM-YYYY or DD/MM/YYYY format
      const parts = formData.validFrom.split(/[/-]/)  // Splits on both "/" and "-"
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
        const year = parseInt(parts[2], 10)

        // Check if date is valid
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
          const validFromDate = new Date(year, month, day)

          // Check if the date object is valid
          if (!isNaN(validFromDate.getTime())) {
            const validToDate = new Date(validFromDate)
            validToDate.setFullYear(validToDate.getFullYear() + 1)
            // Subtract 1 day
            validToDate.setDate(validToDate.getDate() - 1)

            // Format date to DD-MM-YYYY
            const newDay = String(validToDate.getDate()).padStart(2, '0')
            const newMonth = String(validToDate.getMonth() + 1).padStart(2, '0')
            const newYear = validToDate.getFullYear()

            setFormData(prev => ({
              ...prev,
              validTo: `${newDay}-${newMonth}-${newYear}`
            }))
          }
        }
      }
    }
  }, [formData.validFrom])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        document.querySelector('form')?.requestSubmit()
      }
      // Escape to close
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateBlur = (e) => {
    const { name, value } = e.target

    // Only format date fields
    if (name === 'validFrom' || name === 'validTo') {
      const parts = value.split(/[/-]/)  // Splits on both "/" and "-"

      // Only format if we have a complete date with 3 parts
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const day = parts[0]
        const month = parts[1]
        let year = parts[2]

        // Auto-expand 2-digit year to 4-digit (only when exactly 2 digits)
        if (year.length === 2 && /^\d{2}$/.test(year)) {
          const yearNum = parseInt(year, 10)
          // Convert 2-digit year to 4-digit (00-50 → 2000-2050, 51-99 → 1951-1999)
          year = yearNum <= 50 ? 2000 + yearNum : 1900 + yearNum
        }

        // Normalize to DD-MM-YYYY format (if year is 4 digits or was expanded)
        if (year.toString().length === 4) {
          const formattedValue = `${day}-${month}-${year}`
          setFormData(prev => ({
            ...prev,
            [name]: formattedValue
          }))
        }
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset form
    setFormData({
      vehicleNumber: '',
      validFrom: '',
      validTo: '',
      fee: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold'>Add New Fitness Certificate</h2>
              <p className='text-green-100 text-sm mt-1'>Add vehicle fitness certificate record</p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 rounded-lg p-2 transition cursor-pointer'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className='overflow-y-auto max-h-[calc(95vh-140px)]'>
          <div className='p-6'>
            {/* Fitness Details Section */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>1</span>
                Fitness Certificate Details
              </h3>

              <div className='space-y-4'>
                {/* Vehicle Number */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>
                    Vehicle Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='vehicleNumber'
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder='MH-12-AB-1234'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono uppercase'
                    required
                    autoFocus
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Valid From */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>
                      Valid From <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='validFrom'
                      value={formData.validFrom}
                      onChange={handleChange}
                      onBlur={handleDateBlur}
                      placeholder='24-01-25 or 24/01/2025'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      required
                    />
                  </div>

                  {/* Valid To (Auto-calculated) */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>
                      Valid To (Auto-calculated - 1 Year)
                    </label>
                    <input
                      type='text'
                      name='validTo'
                      value={formData.validTo}
                      onChange={handleChange}
                      onBlur={handleDateBlur}
                      placeholder='Will be calculated automatically'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    />
                  </div>
                </div>

                {/* Fee */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>
                    Fitness Fee <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>₹</span>
                    <input
                      type='number'
                      name='fee'
                      value={formData.fee}
                      onChange={handleChange}
                      placeholder='Enter fee amount'
                      className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-lg'
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              <kbd className='px-2 py-1 bg-gray-200 rounded text-xs font-mono'>Ctrl+Enter</kbd> to submit quickly
            </div>

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition cursor-pointer'
              >
                Cancel
              </button>

              <button
                type='submit'
                className='px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center gap-2 cursor-pointer'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Add Fitness Certificate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFitnessModal
