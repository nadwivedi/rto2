import { useState, useEffect, useMemo } from 'react'

const QuickDLApplicationForm = ({ isOpen, onClose, onSubmit }) => {
  // Get current date in DD-MM-YYYY format
  const getCurrentDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${day}-${month}-${year}`
  }

  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    fatherName: '',
    motherName: '',

    // Contact Information
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',

    // License Information
    licenseClass: 'MCWG+LMV',
    licenseNumber: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',

    // Learning License Information
    learningLicenseNumber: '',
    learningLicenseIssueDate: '',
    learningLicenseExpiryDate: '',

    // Educational Information
    qualification: '',

    // Identification
    aadharNumber: '',
    panNumber: '',

    // Emergency Contact
    emergencyContact: '',
    emergencyRelation: 'Father',

    // Payment Information
    totalAmount: '4000',
    paidAmount: '2000',
    balanceAmount: 2000
  })

  const [showAllFields, setShowAllFields] = useState(false)
  const [lastAction, setLastAction] = useState({})

  // Date of Birth state
  const [dobDay, setDobDay] = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobYear, setDobYear] = useState('2000')

  // Generate options for dropdowns
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  // Calculate days based on selected month and year
  const getDaysInMonth = (month, year) => {
    if (!month) return 31 // Default to 31 if no month selected

    const monthNum = parseInt(month)

    // Months with 30 days: April (4), June (6), September (9), November (11)
    if ([4, 6, 9, 11].includes(monthNum)) {
      return 30
    }

    // February
    if (monthNum === 2) {
      // Check for leap year
      if (year) {
        const yearNum = parseInt(year)
        const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0)
        return isLeapYear ? 29 : 28
      }
      return 29 // Default to 29 if year not selected yet
    }

    // All other months have 31 days
    return 31
  }

  // Dynamically calculate days array based on selected month and year
  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(dobMonth, dobYear)
    return Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
  }, [dobMonth, dobYear])

  // Keyboard shortcuts - only for desktop
  useEffect(() => {
    const isMobile = window.innerWidth < 768

    const handleKeyDown = (e) => {
      // Ctrl+Enter to submit (desktop only)
      if (!isMobile && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        document.querySelector('form').requestSubmit()
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

  // Auto-calculate balance amount
  useEffect(() => {
    const total = parseFloat(formData.totalAmount) || 0
    const paid = parseFloat(formData.paidAmount) || 0
    const balance = total - paid

    setFormData(prev => ({
      ...prev,
      balanceAmount: balance >= 0 ? balance : 0
    }))
  }, [formData.totalAmount, formData.paidAmount])

  // Update dateOfBirth when day, month, or year changes
  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      const formattedDate = `${dobDay}-${dobMonth}-${dobYear}`
      setFormData(prev => ({
        ...prev,
        dateOfBirth: formattedDate
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: ''
      }))
    }
  }, [dobDay, dobMonth, dobYear])

  // Reset day if it's invalid for the selected month
  useEffect(() => {
    if (dobDay && dobMonth) {
      const maxDays = getDaysInMonth(dobMonth, dobYear)
      if (parseInt(dobDay) > maxDays) {
        setDobDay('')
      }
    }
  }, [dobMonth, dobYear])

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

    // Apply date formatting for license date fields
    if (name === 'licenseIssueDate' || name === 'licenseExpiryDate' || name === 'learningLicenseIssueDate' || name === 'learningLicenseExpiryDate') {
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
    } else {
      // Convert to uppercase for text fields (name, father's name, mother's name, address, city, state, license numbers)
      const uppercaseFields = ['name', 'fatherName', 'motherName', 'address', 'city', 'state', 'licenseNumber', 'learningLicenseNumber']
      const finalValue = uppercaseFields.includes(name) ? value.toUpperCase() : value

      setFormData(prev => ({
        ...prev,
        [name]: finalValue
      }))
    }
  }

  // Handle Enter key to move to next field instead of submitting
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit') {
      e.preventDefault()

      // Get all focusable elements
      const form = e.target.form
      const focusableElements = Array.from(
        form.querySelectorAll('input, select, textarea, button')
      ).filter(el => !el.disabled && el.type !== 'submit')

      const currentIndex = focusableElements.indexOf(e.target)
      const nextElement = focusableElements[currentIndex + 1]

      if (nextElement) {
        nextElement.focus()
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Show confirmation popup
    const confirmed = window.confirm('Are you sure you want to save this application?')

    if (!confirmed) {
      return // Exit if user cancels
    }

    if (onSubmit) {
      // Filter out empty optional fields to avoid backend validation errors
      const filteredData = Object.keys(formData).reduce((acc, key) => {
        const value = formData[key]
        // Only include fields that have non-empty values
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})

      onSubmit(filteredData)
    }
    // Reset form
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodGroup: '',
      fatherName: '',
      motherName: '',
      mobileNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      applicationDate: getCurrentDate(),
      licenseClass: 'MCWG+LMV',
      licenseNumber: '',
      licenseIssueDate: '',
      licenseExpiryDate: '',
      learningLicenseNumber: '',
      learningLicenseIssueDate: '',
      learningLicenseExpiryDate: '',
      qualification: '',
      aadharNumber: '',
      panNumber: '',
      emergencyContact: '',
      emergencyRelation: 'Father',
      totalAmount: '4000',
      paidAmount: '2000',
      balanceAmount: 2000
    })
    // Reset date dropdowns
    setDobDay('')
    setDobMonth('')
    setDobYear('2000')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-3 md:p-4 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>Add New Driving Licence</h2>
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
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-3 md:p-6'>
            {/* Essential Fields Section */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-indigo-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Essential Information (Required)
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                {/* Name Field */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Full Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter full name'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                    autoFocus
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Mobile <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='tel'
                    name='mobileNumber'
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder='10-digit number'
                    maxLength='10'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
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
                <div className='md:col-span-3'>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Date of Birth <span className='text-red-500'>*</span>
                  </label>
                  <div className='grid grid-cols-3 gap-2'>
                    {/* Day Dropdown */}
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Day</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>

                    {/* Month Dropdown */}
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Month</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>

                    {/* Year Dropdown */}
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      required
                    >
                      <option value=''>Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Second Row - Gender, Father's Name, and Address */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4'>
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Gender <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='gender'
                    value={formData.gender}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  >
                    <option value=''>Select</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>

                {/* Father's Name */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Father's Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='fatherName'
                    value={formData.fatherName}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>

                {/* Address Field - takes 2 columns (50% of 4-column grid) */}
                <div className='md:col-span-2'>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Address <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='address'
                    value={formData.address}
                    onChange={handleChange}
                    placeholder='Complete address'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>
              </div>
            </div>

            {/* License & Payment Section */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6'>
              {/* LEFT COLUMN - License Class & Learning License Combined */}
              <div className='bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-3 md:p-6'>
                <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                  <span className='bg-yellow-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
                  License Class & Learning License
                </h3>

                <div className='space-y-4'>
                  {/* License Class */}
                  <div>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                      License Class <span className='text-red-500'>*</span>
                    </label>
                    <select
                      name='licenseClass'
                      value={formData.licenseClass}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-semibold'
                      required
                    >
                      <option value='MCWG'>MCWG - Two Wheeler</option>
                      <option value='LMV'>LMV - Four Wheeler</option>
                      <option value='MCWG+LMV'>MCWG+LMV - Both</option>
                      <option value='HMV'>HMV - Heavy Vehicle</option>
                      <option value='Commercial'>Commercial</option>
                      <option value='Transport'>Transport</option>
                    </select>
                  </div>

                  {/* Learning License Section */}
                  <div className='border-t border-yellow-300 pt-4'>
                    <h4 className='text-xs md:text-sm font-bold text-yellow-800 mb-3'>Learning License Details</h4>

                    <div className='space-y-3'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          LL Number
                        </label>
                        <input
                          type='text'
                          name='learningLicenseNumber'
                          value={formData.learningLicenseNumber}
                          onChange={handleChange}
                          placeholder='Enter learning license number'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                            LL Issue Date
                          </label>
                          <input
                            type='text'
                            name='learningLicenseIssueDate'
                            value={formData.learningLicenseIssueDate}
                            onChange={handleChange}
                            onKeyDown={handleDateKeyDown}
                            placeholder='DD-MM-YYYY'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-green-600 font-semibold'
                          />
                        </div>

                        <div>
                          <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                            LL Expiry Date
                          </label>
                          <input
                            type='text'
                            name='learningLicenseExpiryDate'
                            value={formData.learningLicenseExpiryDate}
                            onChange={handleChange}
                            onKeyDown={handleDateKeyDown}
                            placeholder='DD-MM-YYYY'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-red-600 font-semibold'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Driving License & Payment */}
              <div className='space-y-4 md:space-y-6'>
                {/* Driving License Details */}
                <div className='bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-6'>
                  <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                    <span className='bg-purple-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
                    Driving License Details
                  </h3>

                  <div className='space-y-3'>
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                        DL Number
                      </label>
                      <input
                        type='text'
                        name='licenseNumber'
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder='Enter driving license number'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          DL Issue Date
                        </label>
                        <input
                          type='text'
                          name='licenseIssueDate'
                          value={formData.licenseIssueDate}
                          onChange={handleChange}
                          onKeyDown={handleDateKeyDown}
                          placeholder='DD-MM-YYYY'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-green-600 font-semibold'
                        />
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          DL Expiry Date
                        </label>
                        <input
                          type='text'
                          name='licenseExpiryDate'
                          value={formData.licenseExpiryDate}
                          onChange={handleChange}
                          onKeyDown={handleDateKeyDown}
                          placeholder='DD-MM-YYYY'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-red-600 font-semibold'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 md:p-6'>
                  <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                    <span className='bg-green-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>4</span>
                    Payment Details
                  </h3>

                  <div className='space-y-3'>
                    {/* Total Amount and Paid Now in one line */}
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Total Amount
                        </label>
                        <div className='relative'>
                          <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>₹</span>
                          <input
                            type='number'
                            name='totalAmount'
                            value={formData.totalAmount}
                            onChange={handleChange}
                            className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-base md:text-lg'
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                          Paid Now
                        </label>
                        <div className='relative'>
                          <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>₹</span>
                          <input
                            type='number'
                            name='paidAmount'
                            value={formData.paidAmount}
                            onChange={handleChange}
                            max={formData.totalAmount}
                            className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-base md:text-lg'
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Balance in separate line */}
                    <div className='bg-white rounded-lg p-3 border-2 border-green-300'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm font-semibold text-gray-700'>Balance</span>
                        <span className='text-xl font-black text-green-600'>
                          ₹ {formData.balanceAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Additional Fields */}
            <div className='border-2 border-gray-200 rounded-xl p-3 md:p-6'>
              <button
                type='button'
                onClick={() => setShowAllFields(!showAllFields)}
                className='flex items-center justify-between w-full text-left cursor-pointer'
              >
                <h3 className='text-base md:text-lg font-bold text-gray-800'>
                  Additional Details (Optional)
                </h3>
                <svg
                  className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${showAllFields ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {showAllFields && (
                <div className='mt-4 md:mt-6 space-y-4 md:space-y-6'>
                  {/* Grid for Mother's Name, Blood Group, Aadhar Number, and Qualification */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4'>
                    {/* Mother's Name */}
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                        Mother's Name
                      </label>
                      <input
                        type='text'
                        name='motherName'
                        value={formData.motherName}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      />
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                        Blood Group
                      </label>
                      <select
                        name='bloodGroup'
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      >
                        <option value=''>Select</option>
                        <option value='A+'>A+</option>
                        <option value='A-'>A-</option>
                        <option value='B+'>B+</option>
                        <option value='B-'>B-</option>
                        <option value='O+'>O+</option>
                        <option value='O-'>O-</option>
                        <option value='AB+'>AB+</option>
                        <option value='AB-'>AB-</option>
                      </select>
                    </div>

                    {/* Aadhar Number */}
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                        Aadhar Number
                      </label>
                      <input
                        type='text'
                        name='aadharNumber'
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        placeholder='12 digits'
                        maxLength='12'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      />
                    </div>

                    {/* Qualification */}
                    <div>
                      <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                        Qualification
                      </label>
                      <select
                        name='qualification'
                        value={formData.qualification}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                      >
                        <option value=''>Select</option>
                        <option value='Below 10th'>Below 10th</option>
                        <option value='10th Pass'>10th Pass</option>
                        <option value='12th Pass'>12th Pass</option>
                        <option value='Graduate'>Graduate</option>
                        <option value='Post Graduate'>Post Graduate</option>
                      </select>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className='border-t border-gray-200 pt-4'>
                    <h4 className='text-xs md:text-sm font-bold text-gray-800 mb-3 uppercase text-indigo-600'>Document Uploads</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                      {/* Aadhar Upload */}
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition cursor-pointer'>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2 cursor-pointer'>
                          <div className='flex items-center gap-2'>
                            <svg className='w-5 h-5 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                            </svg>
                            <span>Upload Aadhar Card</span>
                          </div>
                        </label>
                        <input
                          type='file'
                          accept='image/*,application/pdf'
                          className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer'
                        />
                        <p className='text-xs text-gray-500 mt-2'>JPG, PNG, PDF (Max 2MB)</p>
                      </div>

                      {/* Signature Upload */}
                      <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition cursor-pointer'>
                        <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2 cursor-pointer'>
                          <div className='flex items-center gap-2'>
                            <svg className='w-5 h-5 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                            </svg>
                            <span>Upload Signature</span>
                          </div>
                        </label>
                        <input
                          type='file'
                          accept='image/*'
                          className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer'
                        />
                        <p className='text-xs text-gray-500 mt-2'>JPG, PNG (Max 1MB)</p>
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
                className='flex-1 md:flex-none px-4 md:px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg font-semibold transition flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base'
              >
                <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Save Application
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickDLApplicationForm
