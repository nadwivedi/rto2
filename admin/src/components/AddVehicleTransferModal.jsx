import { useState, useEffect } from 'react'

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
    transferFee: '',
    status: 'Pending',
    remarks: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editData) {
      setFormData(editData)
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
        transferFee: '',
        status: 'Pending',
        remarks: ''
      })
    }
    setError('')
  }, [editData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')

    if (value.length >= 2) {
      value = value.slice(0, 2) + '-' + value.slice(2)
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '-' + value.slice(5)
    }
    if (value.length > 10) {
      value = value.slice(0, 10)
    }

    setFormData(prev => ({
      ...prev,
      transferDate: value
    }))
  }

  const handleDateBlur = (e) => {
    const { value } = e.target
    const parts = value.split('-')

    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      let year = parts[2]
      if (year.length === 2 && /^\d{2}$/.test(year)) {
        const yearNum = parseInt(year, 10)
        year = yearNum <= 50 ? 2000 + yearNum : 1900 + yearNum
      }

      if (year.toString().length === 4) {
        const formattedValue = `${parts[0]}-${parts[1]}-${year}`
        setFormData(prev => ({ ...prev, transferDate: formattedValue }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editData
        ? `http://localhost:5000/api/vehicle-transfers/${editData._id}`
        : 'http://localhost:5000/api/vehicle-transfers'

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
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4' onKeyDown={handleKeyDown}>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-6 rounded-t-2xl z-10'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold'>
                {editData ? 'Edit Vehicle Transfer' : 'New Vehicle Transfer'}
              </h2>
              <p className='text-teal-100 text-sm mt-1'>Transfer vehicle ownership</p>
            </div>
            <button
              onClick={onClose}
              className='text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              {error}
            </div>
          )}

          {/* Basic Transfer Details */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              Transfer Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Vehicle Number */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Vehicle Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='vehicleNumber'
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  placeholder='CG01AB1234'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all uppercase font-mono'
                />
              </div>

              {/* Transfer Date */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Transfer Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='transferDate'
                  value={formData.transferDate}
                  onChange={handleDateChange}
                  onBlur={handleDateBlur}
                  required
                  placeholder='DD-MM-YYYY'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
                <p className='text-xs text-gray-500 mt-1'>Format: DD-MM-YYYY (e.g., 24-01-25 → 24-01-2025)</p>
              </div>

              {/* Transfer Fee */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Transfer Fee (₹) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='transferFee'
                  value={formData.transferFee}
                  onChange={handleChange}
                  required
                  placeholder='1500'
                  min='0'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>
            </div>
          </div>

          {/* Current Owner Details */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
              </div>
              Current Owner Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Current Owner Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Owner Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='currentOwnerName'
                  value={formData.currentOwnerName}
                  onChange={handleChange}
                  required
                  placeholder='Enter current owner full name'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>

              {/* Current Owner Father Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  S/W/D of <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='currentOwnerFatherName'
                  value={formData.currentOwnerFatherName}
                  onChange={handleChange}
                  required
                  placeholder='Father/Husband/Parent name'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>

              {/* Current Owner Mobile */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
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
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>

              {/* Current Owner Address */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Address <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='currentOwnerAddress'
                  value={formData.currentOwnerAddress}
                  onChange={handleChange}
                  required
                  rows='2'
                  placeholder='Enter complete address'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all resize-none'
                />
              </div>
            </div>
          </div>

          {/* New Owner Details */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                </svg>
              </div>
              New Owner Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* New Owner Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Owner Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='newOwnerName'
                  value={formData.newOwnerName}
                  onChange={handleChange}
                  required
                  placeholder='Enter new owner full name'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>

              {/* New Owner Father Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  S/W/D of <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='newOwnerFatherName'
                  value={formData.newOwnerFatherName}
                  onChange={handleChange}
                  required
                  placeholder='Father/Husband/Parent name'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>

              {/* New Owner Mobile */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
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
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all'
                />
              </div>

              {/* New Owner Address */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Address <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='newOwnerAddress'
                  value={formData.newOwnerAddress}
                  onChange={handleChange}
                  required
                  rows='2'
                  placeholder='Enter complete address'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all resize-none'
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2'>
              <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              Additional Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Status */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Status <span className='text-red-500'>*</span>
                </label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all font-semibold'
                >
                  <option value='Pending'>Pending</option>
                  <option value='Under Verification'>Under Verification</option>
                  <option value='Completed'>Completed</option>
                  <option value='Rejected'>Rejected</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Remarks
                </label>
                <textarea
                  name='remarks'
                  value={formData.remarks}
                  onChange={handleChange}
                  rows='2'
                  placeholder='Additional notes (optional)'
                  className='w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all resize-none'
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4 border-t-2 border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold border-2 border-gray-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl'
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  {editData ? 'Update Transfer' : 'Submit Transfer'}
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className='mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200'>
            <p className='text-xs text-gray-600 font-medium'>
              💡 Keyboard shortcuts: <span className='font-semibold'>Ctrl + Enter</span> to submit, <span className='font-semibold'>Esc</span> to close
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddVehicleTransferModal
