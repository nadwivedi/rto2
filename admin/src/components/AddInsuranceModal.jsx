import { useState, useEffect } from 'react'

const AddInsuranceModal = ({ isOpen, onClose, onSubmit, initialData = null, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    policyNumber: '',
    validFrom: '',
    validTo: '',
    totalFee: '0',
    paid: '0',
    balance: '0'
  })

  // Pre-fill form when initialData is provided (for renewal)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(prev => ({
        ...prev,
        vehicleNumber: initialData.vehicleNumber || '',
        vehicleType: initialData.vehicleType || '',
        ownerName: initialData.ownerName || '',
        insuranceCompany: initialData.insuranceCompany || '',
        policyType: initialData.policyType || '',
        mobileNumber: initialData.mobileNumber || '',
        agentName: initialData.agentName || '',
        agentContact: initialData.agentContact || ''
      }))
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        vehicleNumber: '',
        policyNumber: '',
        validFrom: '',
        validTo: '',
        totalFee: '0',
        paid: '0',
        balance: '0'
      })
    }
  }, [initialData, isOpen])

  // Calculate valid to date (1 year from valid from)
  useEffect(() => {
    if (formData.validFrom) {
      // Parse DD/MM/YYYY format
      const parts = formData.validFrom.split('/')
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

            // Format date to DD/MM/YYYY
            const newDay = String(validToDate.getDate()).padStart(2, '0')
            const newMonth = String(validToDate.getMonth() + 1).padStart(2, '0')
            const newYear = validToDate.getFullYear()

            setFormData(prev => ({
              ...prev,
              validTo: `${newDay}/${newMonth}/${newYear}`
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

    // Auto-format year in validFrom field
    if (name === 'validFrom') {
      // Check if the format matches DD/MM/YY (2-digit year)
      const parts = value.split('/')
      if (parts.length === 3 && parts[2].length === 2 && /^\d{2}$/.test(parts[2])) {
        const year = parseInt(parts[2], 10)
        // Convert 2-digit year to 4-digit (00-50 -> 2000-2050, 51-99 -> 1951-1999)
        const fullYear = year <= 50 ? 2000 + year : 1900 + year
        const formattedValue = `${parts[0]}/${parts[1]}/${fullYear}`
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue
        }))
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset form
    setFormData({
      vehicleNumber: '',
      policyNumber: '',
      validFrom: '',
      validTo: '',
      totalFee: '0',
      paid: '0',
      balance: '0'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold'>{isEditMode ? 'Edit Insurance' : 'Add New Insurance'}</h2>
              <p className='text-blue-100 text-sm mt-1'>{isEditMode ? 'Update vehicle insurance record' : 'Add vehicle insurance record'}</p>
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
            {/* Insurance Details Section */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm'>1</span>
                Insurance Details
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    placeholder='MH12AB1234'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono uppercase'
                    required
                    autoFocus
                  />
                </div>

                {/* Policy Number */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>
                    Policy Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='policyNumber'
                    value={formData.policyNumber}
                    onChange={handleChange}
                    placeholder='INS001234567'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono'
                    required
                  />
                </div>

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
                    placeholder='24/01/24 or 24/01/2024'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Type 2-digit year (24) to auto-expand to 2024</p>
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
                    placeholder='Will be calculated automatically'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  />
                  <p className='text-xs text-gray-500 mt-1'>Auto-calculated (1 year - 1 day). You can edit manually if needed.</p>
                </div>

                {/* Fee Fields */}
                <div className='md:col-span-2'>
                  <h4 className='text-sm font-bold text-gray-800 mb-3 uppercase text-indigo-600'>Insurance Fees</h4>
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold bg-gray-50'
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
                className='px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center gap-2 cursor-pointer'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                {isEditMode ? 'Update Insurance' : 'Add Insurance'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddInsuranceModal
