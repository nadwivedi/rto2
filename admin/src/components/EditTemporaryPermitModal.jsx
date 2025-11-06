import { useState, useEffect } from 'react'

const EditTemporaryPermitModal = ({ isOpen, onClose, onSubmit, permitData = null }) => {
  const [formData, setFormData] = useState({
    // Required fields
    permitNumber: '',
    permitHolderName: '',
    vehicleNumber: '',
    vehicleType: '', // CV or PV
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

    // Permit details
    purpose: '',

    // Fees
    totalFee: '1000',
    paid: '0',
    balance: '1000'
  })

  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [fetchingVehicle, setFetchingVehicle] = useState(false)
  const [vehicleError, setVehicleError] = useState('')

  // Pre-fill form when permitData is provided (for editing)
  useEffect(() => {
    if (permitData && isOpen) {
      setFormData({
        permitNumber: permitData.permitNumber || '',
        permitHolderName: permitData.permitHolder || '',
        vehicleNumber: permitData.vehicleNo || '',
        vehicleType: permitData.vehicleType || '',
        validFrom: permitData.validFrom || '',
        validTo: permitData.validTill || '',
        fatherName: permitData.fatherName || '',
        address: permitData.address || '',
        mobileNumber: permitData.mobileNumber || '',
        email: permitData.email || '',
        chassisNumber: permitData.chassisNumber || '',
        engineNumber: permitData.engineNumber || '',
        ladenWeight: permitData.ladenWeight || '',
        unladenWeight: permitData.unladenWeight || '',
        purpose: permitData.purpose || '',
        totalFee: permitData.fees?.toString() || '1000',
        paid: permitData.paid?.toString() || '0',
        balance: permitData.balance?.toString() || '1000'
      })
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        permitNumber: '',
        permitHolderName: '',
        vehicleNumber: '',
        vehicleType: '',
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
        purpose: '',
        totalFee: '1000',
        paid: '0',
        balance: '1000'
      })
      setVehicleError('')
      setFetchingVehicle(false)
    }
  }, [permitData, isOpen])

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
        const response = await fetch(`http://localhost:5000/api/vehicle-registrations/number/${registrationNum}`)
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

  // Calculate valid to date based on vehicle type (CV=3 months, PV=4 months)
  useEffect(() => {
    // Only calculate if both validFrom and vehicleType are present
    if (!formData.validFrom || !formData.vehicleType) {
      return
    }

    // Parse DD/MM/YYYY format
    const parts = formData.validFrom.trim().split('/')

    // Need exactly 3 parts (day, month, year)
    if (parts.length !== 3) {
      return
    }

    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)

    // Validate the parsed values
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return
    }

    // Year should be 4 digits and reasonable
    if (year < 1900 || year > 2100) {
      return
    }

    // Month should be 1-12
    if (month < 1 || month > 12) {
      return
    }

    // Day should be 1-31 (basic check)
    if (day < 1 || day > 31) {
      return
    }

    // Create date object (month is 0-indexed in JavaScript)
    const validFromDate = new Date(year, month - 1, day)

    // Check if the date is valid (handles invalid dates like Feb 30)
    if (isNaN(validFromDate.getTime())) {
      return
    }

    // Verify the date object has the same day/month/year we set
    // (protects against dates like "31/02/2025" which JavaScript adjusts)
    if (validFromDate.getDate() !== day ||
        validFromDate.getMonth() !== month - 1 ||
        validFromDate.getFullYear() !== year) {
      return
    }

    // Determine months to add based on vehicle type
    let monthsToAdd = 0
    if (formData.vehicleType === 'CV') {
      monthsToAdd = 3
    } else if (formData.vehicleType === 'PV') {
      monthsToAdd = 4
    } else {
      return
    }

    // Calculate valid to date
    const validToDate = new Date(validFromDate)
    validToDate.setMonth(validToDate.getMonth() + monthsToAdd)

    // Format date to DD/MM/YYYY
    const newDay = String(validToDate.getDate()).padStart(2, '0')
    const newMonth = String(validToDate.getMonth() + 1).padStart(2, '0')
    const newYear = validToDate.getFullYear()
    const formattedValidTo = `${newDay}/${newMonth}/${newYear}`

    // Only update if the calculated value is different
    if (formData.validTo !== formattedValidTo) {
      setFormData(prev => ({
        ...prev,
        validTo: formattedValidTo
      }))
    }
  }, [formData.validFrom, formData.vehicleType, formData.validTo])

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

    // Auto-uppercase for permit number and vehicle number
    if (name === 'permitNumber' || name === 'vehicleNumber') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }))
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
      permitNumber: '',
      permitHolderName: '',
      vehicleNumber: '',
      vehicleType: '',
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
      purpose: '',
      totalFee: '1000',
      paid: '0',
      balance: '1000'
    })
    setShowOptionalFields(false)
    setVehicleError('')
    setFetchingVehicle(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-neutral-800 rounded-xl md:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-orange-600 to-red-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>Edit Temporary Permit</h2>
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
            <div className='bg-neutral-700/50 border-2 border-orange-600/30 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-100 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-orange-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Essential Information
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                {/* Vehicle Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Vehicle Number <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      name='vehicleNumber'
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      placeholder='MH12AB1234'
                      className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
                      required
                      autoFocus
                    />
                    {fetchingVehicle && (
                      <div className='absolute right-3 top-2.5'>
                        <svg className='animate-spin h-5 w-5 text-orange-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
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
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Permit Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='permitNumber'
                    value={formData.permitNumber}
                    onChange={handleChange}
                    placeholder='TP001234567'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono'
                    required
                  />
                </div>

                {/* Permit Holder Name */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Name of Permit Holder <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='permitHolderName'
                    value={formData.permitHolderName}
                    onChange={handleChange}
                    placeholder='Rajesh Transport Services'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    required
                  />
                </div>



                {/* Mobile Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Mobile Number
                  </label>
                  <input
                    type='tel'
                    name='mobileNumber'
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder='10-digit number'
                    maxLength='10'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Vehicle Type <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='vehicleType'
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold'
                    required
                  >
                    <option value=''>Select Vehicle Type</option>
                    <option value='CV'>CV - Commercial Vehicle (3 months)</option>
                    <option value='PV'>PV - Passenger Vehicle (4 months)</option>
                  </select>
                </div>

                {/* Valid From */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Valid From <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='validFrom'
                    value={formData.validFrom}
                    onChange={handleChange}
                    placeholder='24/01/24 or 24/01/2024'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    required
                  />
                  <p className='text-xs text-gray-400 mt-1'>Type 2-digit year (24) to auto-expand to 2024</p>
                </div>

                {/* Valid To (Auto-calculated) */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Valid To (Auto-calculated) <span className='text-green-400'>✓</span>
                  </label>
                  <input
                    type='text'
                    name='validTo'
                    value={formData.validTo}
                    onChange={handleChange}
                    placeholder='Will auto-fill after entering date & vehicle type'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    Auto-calculated: CV = +3 months, PV = +4 months from Valid From date
                  </p>
                </div>
              </div>
            </div>

            {/* Fees Section */}
            <div className='bg-neutral-700/50 border-2 border-green-600/30 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-100 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-green-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                Permit Fees
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Total Fee (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='totalFee'
                    value={formData.totalFee}
                    onChange={handleChange}
                    placeholder='1000'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Paid (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='paid'
                    value={formData.paid}
                    onChange={handleChange}
                    placeholder='0'
                    className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                    Balance (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='balance'
                    value={formData.balance}
                    onChange={handleChange}
                    placeholder='1000'
                    className='w-full px-3 py-2 bg-neutral-700 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold'
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Expandable Optional Fields */}
            <div className='border-2 border-neutral-600 rounded-xl p-3 md:p-6'>
              <button
                type='button'
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className='flex items-center justify-between w-full text-left cursor-pointer'
              >
                <h3 className='text-base md:text-lg font-bold text-gray-100'>
                  Additional Details (Optional)
                </h3>
                <svg
                  className={`w-5 h-5 md:w-6 md:h-6 transition-transform text-gray-300 ${showOptionalFields ? 'rotate-180' : ''}`}
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
                    <h4 className='text-xs md:text-sm font-bold text-orange-400 mb-3 uppercase'>Personal Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Father&apos;s Name
                        </label>
                        <input
                          type='text'
                          name='fatherName'
                          value={formData.fatherName}
                          onChange={handleChange}
                          placeholder="Enter father's name"
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Email
                        </label>
                        <input
                          type='email'
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Address
                        </label>
                        <textarea
                          name='address'
                          value={formData.address}
                          onChange={handleChange}
                          rows='2'
                          placeholder='Complete address with street, area, landmark'
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className='border-t border-neutral-600 pt-4'>
                    <h4 className='text-xs md:text-sm font-bold text-blue-400 mb-3 uppercase'>Vehicle Details</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Chassis Number
                        </label>
                        <input
                          type='text'
                          name='chassisNumber'
                          value={formData.chassisNumber}
                          onChange={handleChange}
                          placeholder='Enter chassis number'
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Engine Number
                        </label>
                        <input
                          type='text'
                          name='engineNumber'
                          value={formData.engineNumber}
                          onChange={handleChange}
                          placeholder='Enter engine number'
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Laden Weight (kg)
                        </label>
                        <input
                          type='number'
                          name='ladenWeight'
                          value={formData.ladenWeight}
                          onChange={handleChange}
                          placeholder='Enter laden weight'
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Unladen Weight (kg)
                        </label>
                        <input
                          type='number'
                          name='unladenWeight'
                          value={formData.unladenWeight}
                          onChange={handleChange}
                          placeholder='Enter unladen weight'
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permit Details */}
                  <div className='border-t border-neutral-600 pt-4'>
                    <h4 className='text-sm font-bold text-purple-400 mb-3 uppercase'>Permit Details</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-300 mb-1'>
                          Purpose
                        </label>
                        <input
                          type='text'
                          name='purpose'
                          value={formData.purpose}
                          onChange={handleChange}
                          placeholder='Temporary Use'
                          className='w-full px-3 py-2 bg-neutral-600 border border-neutral-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Fixed at Bottom */}
          <div className='border-t border-neutral-700 p-3 md:p-4 bg-neutral-900 flex justify-between items-center flex-shrink-0 sticky bottom-0 shadow-lg'>
            <div className='text-sm text-gray-300 hidden md:block'>
              <kbd className='px-2 py-1 bg-neutral-700 text-gray-200 rounded text-xs font-mono'>Ctrl+Enter</kbd> to submit quickly
            </div>

            <div className='flex gap-2 md:gap-3 w-full md:w-auto'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 md:flex-none px-4 md:px-6 py-2 bg-neutral-700 border border-neutral-600 text-gray-200 rounded-lg hover:bg-neutral-600 font-semibold transition cursor-pointer text-sm md:text-base'
              >
                Cancel
              </button>

              <button
                type='submit'
                className='flex-1 md:flex-none px-4 md:px-8 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base'
              >
                <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Update Permit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTemporaryPermitModal
