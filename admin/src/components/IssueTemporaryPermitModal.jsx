import { useState, useEffect } from 'react'

const IssueTemporaryPermitModal = ({ isOpen, onClose, onSubmit }) => {
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
    vehicleModel: '',
    vehicleClass: '',
    chassisNumber: '',
    engineNumber: '',
    unladenWeight: '',
    grossWeight: '',
    seatingCapacity: '',

    // Permit details
    route: '',
    purpose: '',

    // Fees
    fees: '1000'
  })

  const [showOptionalFields, setShowOptionalFields] = useState(false)

  // Calculate valid to date based on vehicle type (CV=3 months, PV=4 months)
  useEffect(() => {
    if (formData.validFrom && formData.vehicleType) {
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

            // Add months based on vehicle type (CV=3, PV=4)
            const monthsToAdd = formData.vehicleType === 'CV' ? 3 : 4
            validToDate.setMonth(validToDate.getMonth() + monthsToAdd)

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
  }, [formData.validFrom, formData.vehicleType])

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
      vehicleModel: '',
      vehicleClass: '',
      chassisNumber: '',
      engineNumber: '',
      unladenWeight: '',
      grossWeight: '',
      seatingCapacity: '',
      route: '',
      purpose: '',
      fees: '1000'
    })
    setShowOptionalFields(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-orange-600 to-red-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>Add New Temporary Permit</h2>
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
            <div className='bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-orange-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Essential Information
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                {/* Vehicle Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Vehicle Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='vehicleNumber'
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder='MH-12-AB-1234'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
                    required
                    autoFocus
                  />
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
                    placeholder='TP001234567'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono'
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    required
                  />
                </div>

                {/* Father Name */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Father&apos;s Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='fatherName'
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Vehicle Type <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='vehicleType'
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold'
                    required
                  >
                    <option value=''>Select Vehicle Type</option>
                    <option value='CV'>CV - Commercial Vehicle (3 months)</option>
                    <option value='PV'>PV - Passenger Vehicle (4 months)</option>
                  </select>
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
                    placeholder='24/01/24 or 24/01/2024'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Type 2-digit year (24) to auto-expand to 2024</p>
                </div>

                {/* Valid To (Auto-calculated) */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Valid To (Auto-calculated)
                  </label>
                  <input
                    type='text'
                    name='validTo'
                    value={formData.validTo}
                    onChange={handleChange}
                    placeholder='Select vehicle type first'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  />
                  <p className='text-xs text-gray-500 mt-1'>Auto-calculated based on vehicle type. You can edit manually if needed.</p>
                </div>
              </div>
            </div>

            {/* Fees Section */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-green-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                Fees
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Permit Fees <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>₹</span>
                    <input
                      type='number'
                      name='fees'
                      value={formData.fees}
                      onChange={handleChange}
                      className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-lg'
                      required
                    />
                  </div>
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
                    <h4 className='text-xs md:text-sm font-bold text-gray-800 mb-3 uppercase text-orange-600'>Personal Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Email
                        </label>
                        <input
                          type='email'
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className='border-t border-gray-200 pt-4'>
                    <h4 className='text-sm font-bold text-gray-800 mb-3 uppercase text-purple-600'>Vehicle Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Vehicle Model
                        </label>
                        <input
                          type='text'
                          name='vehicleModel'
                          value={formData.vehicleModel}
                          onChange={handleChange}
                          placeholder='TATA LPT 1616'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Vehicle Class
                        </label>
                        <input
                          type='text'
                          name='vehicleClass'
                          value={formData.vehicleClass}
                          onChange={handleChange}
                          placeholder='Goods Vehicle'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Chassis Number
                        </label>
                        <input
                          type='text'
                          name='chassisNumber'
                          value={formData.chassisNumber}
                          onChange={handleChange}
                          placeholder='MB1234567890ABCDE'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
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
                          placeholder='ENG12345678'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
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
                          placeholder='5000'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Gross Weight (kg)
                        </label>
                        <input
                          type='number'
                          name='grossWeight'
                          value={formData.grossWeight}
                          onChange={handleChange}
                          placeholder='16000'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Seating Capacity
                        </label>
                        <input
                          type='text'
                          name='seatingCapacity'
                          value={formData.seatingCapacity}
                          onChange={handleChange}
                          placeholder='2'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permit Details */}
                  <div className='border-t border-gray-200 pt-4'>
                    <h4 className='text-sm font-bold text-gray-800 mb-3 uppercase text-blue-600'>Permit Details</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Route
                        </label>
                        <input
                          type='text'
                          name='route'
                          value={formData.route}
                          onChange={handleChange}
                          placeholder='Mumbai to Pune'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Purpose
                        </label>
                        <input
                          type='text'
                          name='purpose'
                          value={formData.purpose}
                          onChange={handleChange}
                          placeholder='Temporary Use'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Fixed at Bottom */}
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
                className='flex-1 md:flex-none px-4 md:px-8 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base'
              >
                <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Add Temporary Permit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IssueTemporaryPermitModal
