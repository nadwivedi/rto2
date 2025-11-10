import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const EditTemporaryPermitOtherStateModal = ({ permit, onClose, onPermitUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    permitNumber: '',
    permitHolder: '',
    vehicleNo: '',
    mobileNo: '',
    validFrom: '',
    validTo: '',
    totalFee: 0,
    paid: 0,
    balance: 0,
    notes: ''
  })
  const [lastAction, setLastAction] = useState({})

  useEffect(() => {
    if (permit) {
      // Convert date strings to DD-MM-YYYY format if needed
      const formatDate = (dateStr) => {
        if (!dateStr) return ''
        // If already in DD-MM-YYYY format, return as is
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr
        // If in DD/MM/YYYY format (from backend), convert to DD-MM-YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          return dateStr.replace(/\//g, '-')
        }
        // If in YYYY-MM-DD format, convert to DD-MM-YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [year, month, day] = dateStr.split('-')
          return `${day}-${month}-${year}`
        }
        return dateStr
      }

      setFormData({
        permitNumber: permit.permitNumber || '',
        permitHolder: permit.permitHolder || '',
        vehicleNo: permit.vehicleNo || '',
        mobileNo: permit.mobileNo || '',
        validFrom: formatDate(permit.validFrom) || '',
        validTo: formatDate(permit.validTo) || '',
        totalFee: permit.totalFee || 0,
        paid: permit.paid || 0,
        balance: permit.balance || 0,
        notes: permit.notes || ''
      })
    }
  }, [permit])

  useEffect(() => {
    if (formData.validFrom) {
      const parts = formData.validFrom.split('-')
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const year = parseInt(parts[2], 10)

        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
          const validFromDate = new Date(year, month, day)
          if (!isNaN(validFromDate.getTime())) {
            const validToDate = new Date(validFromDate)
            validToDate.setDate(validToDate.getDate() + 27) // 28 days including start date

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

    // Auto-uppercase for permit holder and vehicle number
    if (name === 'permitHolder' || name === 'vehicleNo') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }))
      return
    }

    if (name === 'validFrom' || name === 'validTo') {
      let digitsOnly = value.replace(/[^\d]/g, '')
      digitsOnly = digitsOnly.slice(0, 8)
      const isDeleting = lastAction[name] === 'delete'
      let formatted = digitsOnly

      if (digitsOnly.length === 0) {
        formatted = ''
      } else if (digitsOnly.length <= 2) {
        formatted = digitsOnly
        if (digitsOnly.length === 2 && !isDeleting) {
          formatted = digitsOnly + '-'
        }
      } else if (digitsOnly.length <= 4) {
        formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2)
        if (digitsOnly.length === 4 && !isDeleting) {
          formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2) + '-'
        }
      } else {
        formatted = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2, 4) + '-' + digitsOnly.slice(4)
      }

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.permitNumber || !formData.permitHolder || !formData.vehicleNo ||
        !formData.mobileNo || !formData.validFrom || !formData.validTo) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)

      // Convert dates from DD-MM-YYYY to DD/MM/YYYY format for backend
      const formatDateForBackend = (dateStr) => {
        if (!dateStr) return ''
        // If in DD-MM-YYYY format, convert to DD/MM/YYYY
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
          return dateStr.replace(/-/g, '/')
        }
        return dateStr
      }

      const dataToSend = {
        ...formData,
        validFrom: formatDateForBackend(formData.validFrom),
        validTo: formatDateForBackend(formData.validTo)
      }

      const response = await axios.put(`${API_URL}/api/temporary-permits-other-state/${permit._id}`, dataToSend)

      if (response.data.success) {
        toast.success('Temporary permit (other state) updated successfully!')
        onPermitUpdated()
      }
    } catch (error) {
      console.error('Error updating permit:', error)
      toast.error(error.response?.data?.message || 'Failed to update permit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-blue-700 p-2 md:p-3 text-white flex-shrink-0 shadow-lg'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg md:text-2xl font-bold'>Edit Temporary Permit (Other State)</h2>
              <p className='text-blue-100 text-xs md:text-sm mt-1'>Update temporary vehicle permit for vehicles from other states</p>
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
            {/* Section 1: Permit & Vehicle Details */}
            <div className='bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-orange-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>1</span>
                Permit & Vehicle Details
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
                {/* Vehicle Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Vehicle Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='vehicleNo'
                    value={formData.vehicleNo}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase'
                    placeholder='CG01AB1234'
                    required
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono'
                    placeholder='TP-OS-001'
                    required
                  />
                </div>

                {/* Permit Holder Name */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Permit Holder Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='permitHolder'
                    value={formData.permitHolder}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    placeholder='Enter holder name'
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Mobile Number <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='mobileNo'
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    placeholder='9876543210'
                    required
                  />
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    placeholder='DD-MM-YYYY (e.g., 01-01-2024)'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Type 2-digit year (24) to auto-expand to 2024</p>
                </div>

                {/* Valid To */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Valid To <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='validTo'
                    value={formData.validTo}
                    onChange={handleChange}
                    onKeyDown={handleDateKeyDown}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    placeholder='DD-MM-YYYY (e.g., 31-12-2024)'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Enter permit expiry date</p>
                </div>
              </div>
            </div>

            {/* Section 3: Fee Details */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-emerald-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-emerald-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>3</span>
                Fee Details
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold'
                    placeholder='0'
                    min='0'
                  />
                </div>

                {/* Paid */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Paid (₹) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='paid'
                    value={formData.paid}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold'
                    placeholder='0'
                    min='0'
                  />
                </div>

                {/* Balance (Auto-calculated) */}
                <div>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                    Balance (₹) <span className='text-xs text-blue-500'>(Auto-calculated)</span>
                  </label>
                  <input
                    type='number'
                    name='balance'
                    value={formData.balance}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-emerald-50/50 font-semibold'
                    readOnly
                  />
                  <p className='text-xs text-gray-500 mt-1'>Auto-calculated: Total - Paid</p>
                </div>
              </div>
            </div>

            {/* Section 4: Additional Notes */}
            <div className='bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 md:p-6'>
              <h3 className='text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2'>
                <span className='bg-purple-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm'>4</span>
                Additional Notes (Optional)
              </h3>

              <div>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1'>
                  Notes
                </label>
                <textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleChange}
                  rows='3'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
                  placeholder='Any additional notes or remarks...'
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='flex-shrink-0 px-3 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 md:gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 md:px-6 py-2 md:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm md:text-base'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base'
              disabled={loading}
            >
              {loading ? (
                <span className='flex items-center gap-2'>
                  <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Updating Permit...
                </span>
              ) : (
                'Update Permit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTemporaryPermitOtherStateModal
