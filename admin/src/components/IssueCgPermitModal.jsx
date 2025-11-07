import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_BACKEND_URL 

const IssueCgPermitModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    // Required fields
    permitNumber: '',
    permitHolderName: '',
    vehicleNumber: '',
    validFrom: '',
    validTo: '',

    // Optional fields
    fatherName: '',
    address: '',
    mobileNumber: '',
    email: '',

    // Vehicle details
    chassisNumber: '',
    engineNumber: '',
    ladenWeight: '',
    unladenWeight: '',

    // Fees
    totalFee: '10000',
    paid: '0',
    balance: '10000'
  })

  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [fetchingVehicle, setFetchingVehicle] = useState(false)
  const [vehicleError, setVehicleError] = useState('')
  const [lastAction, setLastAction] = useState({})

  // Pre-fill form when initialData is provided (for renewal)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(prev => ({
        ...prev,
        vehicleNumber: initialData.vehicleNumber || '',
        permitHolderName: initialData.permitHolderName || '',
        address: initialData.address || '',
        mobileNumber: initialData.mobileNumber || '',
        chassisNumber: initialData.chassisNumber || '',
        engineNumber: initialData.engineNumber || ''
      }))
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        permitNumber: '',
        permitHolderName: '',
        vehicleNumber: '',
        validFrom: '',
        validTo: '',
        fatherName: '',
        address: '',
        mobileNumber: '',
        email: '',
        chassisNumber: '',
        engineNumber: '',
        ladenWeight: '',
        unladenWeight: '',
        totalFee: '10000',
        paid: '0',
        balance: '10000'
      })
      setVehicleError('')
      setFetchingVehicle(false)
    }
  }, [initialData, isOpen])

  // Fetch vehicle details when registration number is entered
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      const registrationNum = formData.vehicleNumber.trim()

      // Only fetch if registration number has at least 10 characters (complete registration number like CG12AA4793)
      if (registrationNum.length < 10) {
        setVehicleError('')
        return
      }

      setFetchingVehicle(true)
      setVehicleError('')

      try {
        const response = await fetch(`${API_URL}/api/vehicle-registrations/number/${registrationNum}`)
        const data = await response.json()

        if (response.ok && data.success) {
          // Auto-fill the permit holder name with the owner name from vehicle registration
          setFormData(prev => ({
            ...prev,
            permitHolderName: data.data.ownerName || prev.permitHolderName,
            address: data.data.address || prev.address,
            chassisNumber: data.data.chassisNumber || prev.chassisNumber,
            engineNumber: data.data.engineNumber || prev.engineNumber,
            ladenWeight: data.data.ladenWeight || prev.ladenWeight,
            unladenWeight: data.data.unladenWeight || prev.unladenWeight,
            mobileNumber: data.data.mobileNumber || prev.mobileNumber,
            email: data.data.email || prev.email
          }))
          setVehicleError('')
        } else {
          setVehicleError('Vehicle not found in registration database')
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error)
        setVehicleError('Error fetching vehicle details')
      } finally {
        setFetchingVehicle(false)
      }
    }

    // Debounce the API call - wait 500ms after user stops typing
    const timeoutId = setTimeout(() => {
      if (formData.vehicleNumber) {
        fetchVehicleDetails()
      }
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [formData.vehicleNumber])

  // Calculate valid to date (5 years from valid from)
  useEffect(() => {
    if (formData.validFrom) {
      // Parse DD-MM-YYYY or DD/MM/YYYY format
      const parts = formData.validFrom.split(/[/-]/)
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
            validToDate.setFullYear(validToDate.getFullYear() + 5)
            // Subtract 1 day (5 years minus 1 day)
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

    // Convert specific fields to uppercase
    const uppercaseFields = ['permitNumber', 'permitHolderName', 'vehicleNumber', 'fatherName', 'address', 'chassisNumber', 'engineNumber']
    const finalValue = uppercaseFields.includes(name) ? value.toUpperCase() : value

    // For other fields, just store the value
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }))
  }

  // Handle date formatting when user leaves the field (onBlur)
  const handleDateBlur = (e) => {
    const { name, value } = e.target

    // Only format date fields
    if (name === 'validFrom' || name === 'validTo') {
      const parts = value.split(/[/-]/)

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
      permitNumber: '',
      permitHolderName: '',
      vehicleNumber: '',
      validFrom: '',
      validTo: '',
      fatherName: '',
      address: '',
      mobileNumber: '',
      email: '',
      chassisNumber: '',
      engineNumber: '',
      ladenWeight: '',
      unladenWeight: '',
      totalFee: '10000',
      paid: '0',
      balance: '10000'
    })
    setShowOptionalFields(false)
    setVehicleError('')
    setFetchingVehicle(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>Add New CG Permit</h2>
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
            {/* Essential Fields Section */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Type A
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                {/* Vehicle Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Vehicle Number <span className='text-red-500'>*</span>
                    <span className='text-xs text-gray-500 ml-1'>(10 digits)</span>
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      name='vehicleNumber'
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      placeholder='CG01AB1234'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono uppercase'
                      required
                      minLength='10'
                      maxLength='10'
                      autoFocus
                    />
                    {fetchingVehicle && (
                      <div className='absolute right-3 top-2.5'>
                        <svg className='animate-spin h-5 w-5 text-indigo-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                      </div>
                    )}
                    {!fetchingVehicle && formData.vehicleNumber && formData.vehicleNumber.length < 10 && (
                      <div className='absolute right-3 top-2.5'>
                        <span className='text-xs font-semibold text-red-500'>
                          {formData.vehicleNumber.length}/10
                        </span>
                      </div>
                    )}
                    {!fetchingVehicle && formData.vehicleNumber && formData.vehicleNumber.length === 10 && !vehicleError && (
                      <div className='absolute right-3 top-2.5'>
                        <span className='text-xs font-semibold text-green-500'>✓</span>
                      </div>
                    )}
                  </div>
                  {vehicleError && (
                    <p className='text-xs text-amber-600 mt-1'>{vehicleError}</p>
                  )}
                  {!vehicleError && !fetchingVehicle && formData.vehicleNumber && formData.permitHolderName && (
                    <p className='text-xs text-green-600 mt-1'>✓ Vehicle found - Owner details auto-filled</p>
                  )}
                </div>

                {/* Permit Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Permit Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='permitNumber'
                    value={formData.permitNumber}
                    onChange={handleChange}
                    placeholder='CG001234567'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono uppercase'
                    required
                  />
                </div>

                {/* Permit Holder Name */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Name of Permit Holder <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='permitHolderName'
                    value={formData.permitHolderName}
                    onChange={handleChange}
                    placeholder='Rajesh Transport Services'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase'
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Mobile Number
                  </label>
                  <input
                    type='tel'
                    name='mobileNumber'
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder='10-digit number'
                    maxLength='10'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  />
                </div>

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
                    placeholder='24-01-24 or 24-01-2024'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Format: DD-MM-YYYY. Type 2-digit year (24) to auto-expand to 2024</p>
                </div>

                {/* Valid To (Auto-calculated) */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Valid To (Auto-calculated - 5 Years)
                  </label>
                  <input
                    type='text'
                    name='validTo'
                    value={formData.validTo}
                    onChange={handleChange}
                    onKeyDown={handleDateKeyDown}
                    onBlur={handleDateBlur}
                    placeholder='Will be calculated automatically'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50'
                    readOnly
                  />
                  <p className='text-xs text-gray-500 mt-1'>Auto-calculated (5 years - 1 day from Valid From date)</p>
                </div>
              </div>
            </div>

            {/* Fees Section */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-green-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                Permit Fees
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Total Fee (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='totalFee'
                    value={formData.totalFee}
                    onChange={handleChange}
                    placeholder='10000'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Balance (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='balance'
                    value={formData.balance}
                    onChange={handleChange}
                    placeholder='10000'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Expandable Optional Fields */}
            <div className='border-2 border-gray-200 rounded-xl p-3 md:p-6'>
              <button
                type='button'
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className='flex items-center justify-between w-full text-left cursor-pointer'
              >
                <h3 className='text-base md:text-lg font-bold text-gray-800'>
                  Additional Details (Optional)
                </h3>
                <svg
                  className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {showOptionalFields && (
                <div className='mt-4 md:mt-6 space-y-4 md:space-y-6'>
                  {/* Personal Information */}
                  <div>
                    <h4 className='text-xs md:text-sm font-bold text-gray-800 mb-3 uppercase text-indigo-600'>Personal Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Father's Name
                        </label>
                        <input
                          type='text'
                          name='fatherName'
                          value={formData.fatherName}
                          onChange={handleChange}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Email
                        </label>
                        <input
                          type='email'
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        />
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Address
                        </label>
                        <textarea
                          name='address'
                          value={formData.address}
                          onChange={handleChange}
                          rows='2'
                          placeholder='Complete address with street, area, landmark'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className='border-t border-gray-200 pt-4'>
                    <h4 className='text-xs md:text-sm font-bold text-gray-800 mb-3 uppercase text-blue-600'>Vehicle Details</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Chassis Number
                        </label>
                        <input
                          type='text'
                          name='chassisNumber'
                          value={formData.chassisNumber}
                          onChange={handleChange}
                          placeholder='Enter chassis number'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono uppercase'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Engine Number
                        </label>
                        <input
                          type='text'
                          name='engineNumber'
                          value={formData.engineNumber}
                          onChange={handleChange}
                          placeholder='Enter engine number'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono uppercase'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Laden Weight (kg)
                        </label>
                        <input
                          type='number'
                          name='ladenWeight'
                          value={formData.ladenWeight}
                          onChange={handleChange}
                          placeholder='Enter laden weight'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Unladen Weight (kg)
                        </label>
                        <input
                          type='number'
                          name='unladenWeight'
                          value={formData.unladenWeight}
                          onChange={handleChange}
                          placeholder='Enter unladen weight'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className='border-t border-gray-200 p-3 md:p-4 bg-gray-50 flex justify-between items-center flex-shrink-0 sticky bottom-0 shadow-lg'>
            <div className='text-sm text-gray-600 hidden md:block'>
              <kbd className='px-2 py-1 bg-gray-200 rounded text-xs font-mono'>Ctrl+Enter</kbd> to submit quickly
            </div>

            <div className='flex gap-2 md:gap-3 w-full md:w-auto'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 md:flex-none px-4 md:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition cursor-pointer text-sm md:text-base'
              >
                Cancel
              </button>

              <button
                type='submit'
                className='flex-1 md:flex-none px-4 md:px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base'
              >
                <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Add CG Permit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IssueCgPermitModal
