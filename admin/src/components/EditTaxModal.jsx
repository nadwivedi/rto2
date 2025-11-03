import { useState, useEffect } from 'react'

const EditTaxModal = ({ isOpen, onClose, onSubmit, tax }) => {
  const [formData, setFormData] = useState({
    receiptNo: '',
    vehicleNumber: '',
    ownerName: '',
    taxAmount: '0',
    taxFrom: '',
    taxTo: ''
  })

  // Populate form when tax prop changes
  useEffect(() => {
    if (tax) {
      setFormData({
        receiptNo: tax.receiptNo || '',
        vehicleNumber: tax.vehicleNumber || '',
        ownerName: tax.ownerName || '',
        taxAmount: tax.taxAmount?.toString() || '0',
        taxFrom: tax.taxFrom || '',
        taxTo: tax.taxTo || ''
      })
    }
  }, [tax])

  // Calculate tax to date (3 months from tax from)
  useEffect(() => {
    if (formData.taxFrom) {
      // Parse DD-MM-YYYY or DD/MM/YYYY format
      const parts = formData.taxFrom.split(/[/-]/)
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
        const year = parseInt(parts[2], 10)

        // Check if date is valid
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
          const taxFromDate = new Date(year, month, day)

          // Check if the date object is valid
          if (!isNaN(taxFromDate.getTime())) {
            const taxToDate = new Date(taxFromDate)
            taxToDate.setMonth(taxToDate.getMonth() + 3)
            // Subtract 1 day
            taxToDate.setDate(taxToDate.getDate() - 1)

            // Format date to DD-MM-YYYY
            const newDay = String(taxToDate.getDate()).padStart(2, '0')
            const newMonth = String(taxToDate.getMonth() + 1).padStart(2, '0')
            const newYear = taxToDate.getFullYear()

            setFormData(prev => ({
              ...prev,
              taxTo: `${newDay}-${newMonth}-${newYear}`
            }))
          }
        }
      }
    }
  }, [formData.taxFrom])

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

    // Remove dashes from vehicle number and receipt number to store as uppercase
    if (name === 'vehicleNumber' || name === 'receiptNo') {
      const cleanedValue = value.replace(/-/g, '').toUpperCase()
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateBlur = (e) => {
    const { name, value } = e.target

    // Only format date fields
    if (name === 'taxFrom' || name === 'taxTo') {
      const parts = value.split(/[/-]/)

      // Only format if we have a complete date with 3 parts
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const day = parts[0]
        const month = parts[1]
        let year = parts[2]

        // Auto-expand 2-digit year to 4-digit (only when exactly 2 digits)
        if (year.length === 2 && /^\d{2}$/.test(year)) {
          const yearNum = parseInt(year, 10)
          // Convert 2-digit year to 4-digit (00-50 � 2000-2050, 51-99 � 1951-1999)
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
              <h2 className='text-2xl font-bold'>Edit Tax Record</h2>
              <p className='text-green-100 text-sm mt-1'>Update vehicle tax payment record</p>
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
            {/* Tax Details Section */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>1</span>
                Tax Payment Details
              </h3>

              <div className='space-y-4'>
                {/* Receipt Number */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>
                    Receipt Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='receiptNo'
                    value={formData.receiptNo}
                    onChange={handleChange}
                    placeholder='RCP001 (will be converted to uppercase)'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono uppercase'
                    required
                    autoFocus
                  />
                </div>

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
                    placeholder='CG04AB1234 (dashes will be removed automatically)'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono uppercase'
                    required
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>
                    Owner Name
                  </label>
                  <input
                    type='text'
                    name='ownerName'
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder='Enter owner name'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                </div>

                {/* Tax Amount */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>
                    Tax Amount (�) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='taxAmount'
                    value={formData.taxAmount}
                    onChange={handleChange}
                    placeholder='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Tax From */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>
                      Tax From <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='taxFrom'
                      value={formData.taxFrom}
                      onChange={handleChange}
                      onBlur={handleDateBlur}
                      placeholder='24-01-25 or 24/01/2025'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      required
                    />
                  </div>

                  {/* Tax To (Auto-calculated) */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>
                      Tax To (Auto-calculated - 3 Months)
                    </label>
                    <input
                      type='text'
                      name='taxTo'
                      value={formData.taxTo}
                      onChange={handleChange}
                      onBlur={handleDateBlur}
                      placeholder='Will be calculated automatically'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    />
                  </div>
                </div>

                {/* Alert Info */}
                <div className='bg-orange-50 border-l-4 border-orange-500 p-3 rounded'>
                  <div className='flex items-center gap-2'>
                    <svg className='w-5 h-5 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                    </svg>
                    <p className='text-sm font-semibold text-orange-700'>
                      Alert: You will be notified 15 days before the tax expiry date
                    </p>
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
                Update Tax Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaxModal
