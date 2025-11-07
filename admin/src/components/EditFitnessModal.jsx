import { useState, useEffect } from 'react'
import { formatDateInput, handleDateBlur as utilHandleDateBlur } from '../utils/dateFormatter'

const EditFitnessModal = ({ isOpen, onClose, onSubmit, fitness }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    validFrom: '',
    validTo: '',
    totalFee: '0',
    paid: '0',
    balance: '0'
  })

  // Populate form when fitness record changes
  useEffect(() => {
    if (fitness) {
      setFormData({
        vehicleNumber: fitness.vehicleNumber || '',
        validFrom: fitness.validFrom || '',
        validTo: fitness.validTo || '',
        totalFee: fitness.totalFee?.toString() || '0',
        paid: fitness.paid?.toString() || '0',
        balance: fitness.balance?.toString() || '0'
      })
    }
  }, [fitness])

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
      const formatted = formatDateInput(value)
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
              <h2 className='text-2xl font-bold'>Edit Fitness Certificate</h2>
              <p className='text-green-100 text-sm mt-1'>Update vehicle fitness certificate record</p>
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
                    placeholder='CG04AB1234 (dashes will be removed automatically)'
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

                {/* Fee Fields */}
                <div className='col-span-2'>
                  <h4 className='text-sm font-bold text-gray-800 mb-3 uppercase text-green-600'>Fitness Fees</h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-1'>
                        Total Fee (₹) <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        name='totalFee'
                        value={formData.totalFee}
                        onChange={handleChange}
                        placeholder='0'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-1'>
                        Paid (₹) <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        name='paid'
                        value={formData.paid}
                        onChange={handleChange}
                        placeholder='0'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-1'>
                        Balance (₹) <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        name='balance'
                        value={formData.balance}
                        onChange={handleChange}
                        placeholder='0'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold bg-gray-50'
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              <kbd className='px-2 py-1 bg-gray-200 rounded text-xs font-mono'>Ctrl+Enter</kbd> to save quickly
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditFitnessModal
