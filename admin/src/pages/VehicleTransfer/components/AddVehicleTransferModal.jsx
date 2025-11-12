import { useState, useEffect } from 'react'
import { validateVehicleNumberRealtime, enforceVehicleNumberFormat } from '../../../utils/vehicleNoCheck'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

const AddVehicleTransferModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    transferDate: '',
    currentOwnerName: '',
    currentOwnerFatherName: '',
    currentOwnerAddress: '',
    currentOwnerMobile: '',
    newOwnerName: '',
    newOwnerFatherName: '',
    newOwnerAddress: '',
    newOwnerMobile: '',
    byName: '',
    byMobile: '',
    totalFee: '',
    paid: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastAction, setLastAction] = useState({})
  const [vehicleValidation, setVehicleValidation] = useState({ isValid: false, message: '' })

  useEffect(() => {
    if (editData) {
      setFormData(editData)
      // Validate vehicle number if editing
      if (editData.vehicleNumber) {
        const validation = validateVehicleNumberRealtime(editData.vehicleNumber)
        setVehicleValidation(validation)
      }
    } else {
      setFormData({
        vehicleNumber: '',
        transferDate: '',
        currentOwnerName: '',
        currentOwnerFatherName: '',
        currentOwnerAddress: '',
        currentOwnerMobile: '',
        newOwnerName: '',
        newOwnerFatherName: '',
        newOwnerAddress: '',
        newOwnerMobile: '',
        byName: '',
        byMobile: '',
        totalFee: '',
        paid: ''
      })
      setVehicleValidation({ isValid: false, message: '' })
    }
    setError('')
  }, [editData, isOpen])

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

    // Handle vehicle number with format enforcement and validation
    if (name === 'vehicleNumber') {
      // Enforce format: only allow correct characters at each position
      const enforcedValue = enforceVehicleNumberFormat(formData.vehicleNumber, value)

      // Validate in real-time
      const validation = validateVehicleNumberRealtime(enforcedValue)
      setVehicleValidation(validation)

      setFormData(prev => ({
        ...prev,
        [name]: enforcedValue
      }))
      return
    }

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

    // Convert text fields to uppercase (except mobile numbers and numeric fields)
    const uppercaseFields = [
      'vehicleNumber',
      'currentOwnerName',
      'currentOwnerFatherName',
      'currentOwnerAddress',
      'newOwnerName',
      'newOwnerFatherName',
      'newOwnerAddress',
      'byName'
    ]

    const finalValue = uppercaseFields.includes(name) ? value.toUpperCase() : value

    // Auto-format date field with automatic dash insertion
    if (name === 'transferDate') {
      // Remove all non-digit characters
      let digitsOnly = finalValue.replace(/[^\d]/g, '')

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
      [name]: finalValue
    }))
  }

  const handleDateBlur = (e) => {
    const { name, value } = e.target
    const parts = value.split('-')

    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      let year = parts[2]
      if (year.length === 2 && /^\d{2}$/.test(year)) {
        const yearNum = parseInt(year, 10)
        year = yearNum <= 50 ? 2000 + yearNum : 1900 + yearNum
      }

      if (year.toString().length === 4) {
        const formattedValue = `${parts[0]}-${parts[1]}-${year}`
        setFormData(prev => ({ ...prev, [name]: formattedValue }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate vehicle number before submitting
    if (!vehicleValidation.isValid && formData.vehicleNumber) {
      setError('Please enter a valid vehicle number in the format: CG01AB1234 (10 characters, no spaces)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = editData
        ? `${API_URL}/api/vehicle-transfers/${editData._id}`
        : `${API_URL}/api/vehicle-transfers`

      const method = editData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.message || 'Failed to save vehicle transfer')
      }
    } catch (error) {
      setError('Error saving vehicle transfer. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-teal-600 to-cyan-600 p-2 md:p-3 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>
                {editData ? 'Edit Vehicle Transfer' : 'New Vehicle Transfer'}
              </h2>
              <p className='text-teal-100 text-xs md:text-sm mt-1'>Transfer vehicle ownership details</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-3 md:p-6'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              {error}
            </div>
          )}

          {/* Section 1: Transfer Details */}
          <div className='bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
            <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
              <span className='bg-teal-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
              Transfer Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
              {/* Vehicle Number */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Vehicle Number <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    name='vehicleNumber'
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    required
                    placeholder='CG01AB1234'
                    maxLength='10'
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono ${
                      formData.vehicleNumber && !vehicleValidation.isValid
                        ? 'border-red-500 focus:ring-red-500'
                        : formData.vehicleNumber && vehicleValidation.isValid
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-teal-500'
                    }`}
                  />
                  {vehicleValidation.isValid && formData.vehicleNumber && (
                    <div className='absolute right-3 top-2.5'>
                      <svg className='h-5 w-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                  )}
                </div>
                {vehicleValidation.message && (
                  <p className={`text-xs mt-1 ${vehicleValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {vehicleValidation.message}
                  </p>
                )}
                {!formData.vehicleNumber && (
                  <p className='text-xs mt-1 text-gray-500'>
                    Format: <span className='font-mono font-semibold text-teal-600'>CG01AB1234</span> (10 characters, no spaces)
                  </p>
                )}
              </div>

              {/* Transfer Date */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Transfer Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='transferDate'
                  value={formData.transferDate}
                  onChange={handleChange}
                  onKeyDown={handleDateKeyDown}
                  onBlur={handleDateBlur}
                  required
                  placeholder='24-01-25 or 24/01/2025'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>

          {/* Section 2: Current Owner Details */}
          <div className='bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
            <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
              <span className='bg-orange-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>2</span>
              Current Owner Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
              {/* Current Owner Name */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Owner Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='currentOwnerName'
                  value={formData.currentOwnerName}
                  onChange={handleChange}
                  required
                  placeholder='Enter current owner full name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                />
              </div>

              {/* Current Owner Father Name */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  S/W/D of <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='currentOwnerFatherName'
                  value={formData.currentOwnerFatherName}
                  onChange={handleChange}
                  required
                  placeholder='Father/Husband/Parent name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                />
              </div>

              {/* Current Owner Mobile */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Mobile Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='currentOwnerMobile'
                  value={formData.currentOwnerMobile}
                  onChange={handleChange}
                  required
                  placeholder='10-digit mobile number'
                  pattern='[0-9]{10}'
                  maxLength='10'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                />
              </div>

              {/* Current Owner Address */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Address <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='currentOwnerAddress'
                  value={formData.currentOwnerAddress}
                  onChange={handleChange}
                  required
                  rows='2'
                  placeholder='Enter complete address'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none'
                />
              </div>
            </div>
          </div>

          {/* Section 3: New Owner Details */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
            <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
              <span className='bg-blue-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
              New Owner Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
              {/* New Owner Name */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Owner Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='newOwnerName'
                  value={formData.newOwnerName}
                  onChange={handleChange}
                  required
                  placeholder='Enter new owner full name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* New Owner Father Name */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  S/W/D of <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='newOwnerFatherName'
                  value={formData.newOwnerFatherName}
                  onChange={handleChange}
                  required
                  placeholder='Father/Husband/Parent name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* New Owner Mobile */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Mobile Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='newOwnerMobile'
                  value={formData.newOwnerMobile}
                  onChange={handleChange}
                  required
                  placeholder='10-digit mobile number'
                  pattern='[0-9]{10}'
                  maxLength='10'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* New Owner Address */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Address <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='newOwnerAddress'
                  value={formData.newOwnerAddress}
                  onChange={handleChange}
                  required
                  rows='2'
                  placeholder='Enter complete address'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                />
              </div>
            </div>
          </div>

          {/* Section 4: By/Referral Details */}
          <div className='bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
            <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
              <span className='bg-amber-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>4</span>
              By/Referral Details (Optional)
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
              {/* Name */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Name
                </label>
                <input
                  type='text'
                  name='byName'
                  value={formData.byName}
                  onChange={handleChange}
                  placeholder='Enter name'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Mobile Number
                </label>
                <input
                  type='tel'
                  name='byMobile'
                  value={formData.byMobile}
                  onChange={handleChange}
                  placeholder='10-digit mobile number'
                  pattern='[0-9]{10}'
                  maxLength='10'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='mt-3 bg-amber-100 border-l-4 border-amber-500 p-2 md:p-3 rounded'>
              <p className='text-xs md:text-sm text-amber-700 flex items-center gap-1'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Referral/Agent who facilitated this vehicle transfer
              </p>
            </div>
          </div>

          {/* Section 5: Payment Information */}
          <div className='bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
            <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
              <span className='bg-purple-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>5</span>
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
                  required
                  min='0'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold'
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
                  required
                  min='0'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold'
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
                  value={formData.balance || 0}
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

          {/* Action Buttons */}
          <div className='flex-shrink-0 bg-gray-50 p-3 md:p-4 border-t border-gray-200 flex justify-end gap-2 md:gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 md:px-6 py-2 text-sm md:text-base text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 md:px-6 py-2 text-sm md:text-base bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-4 w-4 md:h-5 md:w-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  {editData ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddVehicleTransferModal
