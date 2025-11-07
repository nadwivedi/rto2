import { useState, useEffect } from 'react'
import { handleDateBlur as utilHandleDateBlur } from '../utils/dateFormatter'

const AddFitnessModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    validFrom: '',
    validTo: '',
    totalFee: '',
    paid: '',
    balance: ''
  })
  const [lastAction, setLastAction] = useState({})

  // Pre-fill form when initialData is provided (for renewal)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(prev => ({
        ...prev,
        vehicleNumber: initialData.vehicleNumber || ''
      }))
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        vehicleNumber: '',
        validFrom: '',
        validTo: '',
        totalFee: '',
        paid: '',
        balance: ''
      })
    }
  }, [initialData, isOpen])

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

  const handleDateKeyDown = (e) => {
    const { name } = e.target
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setLastAction({ [name]: 'delete' })
    } else {
      setLastAction({ [name]: 'typing' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Auto-calculate balance when totalFee or paid changes
    if (name === 'totalFee' || name === 'paid') {
      setFormData(prev => {
        const totalFee = name === 'totalFee' ? parseFloat(value) || 0 : parseFloat(prev.totalFee) || 0
        const paid = name === 'paid' ? parseFloat(value) || 0 : parseFloat(prev.paid) || 0
        const balance = totalFee - paid

        return {
          ...prev,
          [name]: value,
          balance: balance.toString()
        }
      })
      return
    }

    // Remove dashes from vehicle number to store as CG04AB1234 instead of CG-04-AB-1234
    if (name === 'vehicleNumber') {
      const cleanedValue = value.replace(/-/g, '').toUpperCase()
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
      return
    }

    // Auto-format date fields with automatic dash insertion
    if (name === 'validFrom' || name === 'validTo') {
      // Remove all non-digit characters
      let digitsOnly = value.replace(/[^\d]/g, '')

      // Limit to 8 digits (DDMMYYYY)
      digitsOnly = digitsOnly.slice(0, 8)

      // Check if user was deleting
      const isDeleting = lastAction[name] === 'delete'

      // Format based on length
      let formatted = digitsOnly

      if (digitsOnly.length === 0) {
        formatted = ''
      } else if (digitsOnly.length <= 2) {
        formatted = digitsOnly
        // Only add trailing dash if user just typed the 2nd digit (not deleting)
        if (digitsOnly.length === 2 && !isDeleting) {
          formatted = digitsOnly + '-'
        }
      } else if (digitsOnly.length <= 4) {
        formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2)
        // Only add trailing dash if user just typed the 4th digit (not deleting)
        if (digitsOnly.length === 4 && !isDeleting) {
          formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2) + '-'
        }
      } else {
        formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2, 4) + '-' + digitsOnly.slice(4)
      }

      // Auto-expand 2-digit year (only when typing, not deleting)
      if (digitsOnly.length === 6 && !isDeleting) {
        const yearNum = parseInt(digitsOnly.slice(4, 6), 10)
        const fullYear = yearNum <= 50 ? 2000 + yearNum : 1900 + yearNum
        formatted = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${fullYear}`
      }

      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateBlur = (e) => {
    utilHandleDateBlur(e, setFormData)
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
      totalFee: '',
      paid: '',
      balance: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 p-2 md:p-3 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>
                {initialData ? 'Renew Fitness Certificate' : 'Add New Fitness Certificate'}
              </h2>
              <p className='text-green-100 text-xs md:text-sm mt-1'>
                {initialData ? 'Renew vehicle fitness certificate' : 'Add vehicle fitness certificate record'}
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 rounded-lg p-1.5 md:p-2 transition cursor-pointer'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-3 md:p-6'>
            {/* Section 1: Vehicle Details */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-emerald-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-emerald-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Vehicle Details
              </h3>

              <div className='grid grid-cols-1 gap-3 md:gap-4'>
                {/* Vehicle Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Vehicle Number <span className='text-red-500'>*</span>
                    <span className='text-xs text-gray-500 ml-1'>(10 digits)</span>
                    {initialData && (
                      <span className='ml-2 text-xs text-blue-600 font-normal'>(Pre-filled for renewal)</span>
                    )}
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      name='vehicleNumber'
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      placeholder='CG04AB1234'
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono uppercase ${
                        initialData ? 'bg-blue-50' : ''
                      }`}
                      readOnly={!!initialData}
                      required
                      minLength='10'
                      maxLength='10'
                      autoFocus
                    />
                    {!initialData && formData.vehicleNumber && formData.vehicleNumber.length < 10 && (
                      <div className='absolute right-3 top-2.5'>
                        <span className='text-xs font-semibold text-red-500'>
                          {formData.vehicleNumber.length}/10
                        </span>
                      </div>
                    )}
                    {!initialData && formData.vehicleNumber && formData.vehicleNumber.length === 10 && (
                      <div className='absolute right-3 top-2.5'>
                        <span className='text-xs font-semibold text-green-500'>✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Validity Period */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                Validity Period
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                {/* Valid From */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Valid From <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='validFrom'
                    value={formData.validFrom}
                    onChange={handleChange}
                    onKeyDown={handleDateKeyDown}
                    onBlur={handleDateBlur}
                    placeholder='24-01-25 or 24/01/2025'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>

                {/* Valid To (Auto-calculated) */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Valid To <span className='text-xs text-blue-500'>(Auto-calculated - 1 Year)</span>
                  </label>
                  <input
                    type='text'
                    name='validTo'
                    value={formData.validTo}
                    onChange={handleChange}
                    onKeyDown={handleDateKeyDown}
                    onBlur={handleDateBlur}
                    placeholder='Auto-calculated or enter manually'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50/50'
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Payment Information */}
            <div className='bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-purple-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
                Payment Information
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                {/* Total Fee */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Total Fee (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='totalFee'
                    value={formData.totalFee}
                    onChange={handleChange}
                    placeholder='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Paid (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='paid'
                    value={formData.paid}
                    onChange={handleChange}
                    placeholder='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>

                {/* Balance (Auto-calculated) */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Balance (₹) <span className='text-xs text-gray-500'>(Auto)</span>
                  </label>
                  <input
                    type='number'
                    name='balance'
                    value={formData.balance}
                    readOnly
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-purple-50 font-semibold text-gray-700'
                  />
                </div>
              </div>

              {/* Payment Status Indicator */}
              {parseFloat(formData.balance) > 0 && parseFloat(formData.paid) > 0 && (
                <div className='mt-3 bg-amber-50 border-l-4 border-amber-500 p-2 md:p-3 rounded'>
                  <p className='text-xs md:text-sm font-semibold text-amber-700 flex items-center gap-1'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                    </svg>
                    Partial Payment - Balance: ₹{formData.balance}
                  </p>
                </div>
              )}
              {parseFloat(formData.balance) === 0 && parseFloat(formData.totalFee) > 0 && (
                <div className='mt-3 bg-green-50 border-l-4 border-green-500 p-2 md:p-3 rounded'>
                  <p className='text-xs md:text-sm font-semibold text-green-700 flex items-center gap-1'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Fully Paid
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className='border-t border-gray-200 p-3 md:p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3 flex-shrink-0'>
            <div className='text-xs md:text-sm text-gray-600'>
              <kbd className='px-2 py-1 bg-gray-200 rounded text-xs font-mono'>Ctrl+Enter</kbd> to submit quickly
            </div>

            <div className='flex gap-2 md:gap-3 w-full md:w-auto'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 md:flex-none px-4 md:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition cursor-pointer'
              >
                Cancel
              </button>

              <button
                type='submit'
                className='flex-1 md:flex-none px-6 md:px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer'
              >
                {initialData ? (
                  <>
                    <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                    Renew Fitness
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Add Fitness
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFitnessModal
