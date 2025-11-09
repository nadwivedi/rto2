import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const IssueTemporaryPermitOtherStateModal = ({ onClose, onPermitIssued }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Auto-calculate balance when totalFee or paid changes
      if (name === 'totalFee' || name === 'paid') {
        const totalFee = parseFloat(name === 'totalFee' ? value : prev.totalFee) || 0
        const paid = parseFloat(name === 'paid' ? value : prev.paid) || 0
        updated.balance = totalFee - paid
      }

      return updated
    })
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
      const response = await axios.post(`${API_URL}/api/temporary-permits-other-state`, formData)

      if (response.data.success) {
        toast.success('Temporary permit (other state) issued successfully!')
        onPermitIssued()
      }
    } catch (error) {
      console.error('Error issuing permit:', error)
      toast.error(error.response?.data?.message || 'Failed to issue permit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Issue New Temporary Permit (Other State)</h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Permit Number */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Permit Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='permitNumber'
                value={formData.permitNumber}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                placeholder='Enter permit number'
                required
              />
            </div>

            {/* Permit Holder */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Permit Holder Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='permitHolder'
                value={formData.permitHolder}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                placeholder='Enter holder name'
                required
              />
            </div>

            {/* Vehicle No */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Vehicle Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='vehicleNo'
                value={formData.vehicleNo}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none uppercase'
                placeholder='MH-01-AB-1234'
                required
              />
            </div>

            {/* Mobile No */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Mobile Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='mobileNo'
                value={formData.mobileNo}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                placeholder='9876543210'
                required
              />
            </div>

            {/* Valid From */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Valid From <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='validFrom'
                value={formData.validFrom}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                required
              />
            </div>

            {/* Valid To */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Valid To <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='validTo'
                value={formData.validTo}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                required
              />
            </div>

            {/* Total Fee */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Total Fee (₹)
              </label>
              <input
                type='number'
                name='totalFee'
                value={formData.totalFee}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                placeholder='0'
                min='0'
              />
            </div>

            {/* Paid */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Paid (₹)
              </label>
              <input
                type='number'
                name='paid'
                value={formData.paid}
                onChange={handleChange}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none'
                placeholder='0'
                min='0'
              />
            </div>

            {/* Balance (Auto-calculated) */}
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Balance (₹)
              </label>
              <input
                type='number'
                name='balance'
                value={formData.balance}
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed'
                placeholder='0'
                readOnly
              />
            </div>

            {/* Notes */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-bold text-gray-700 mb-2'>
                Notes
              </label>
              <textarea
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                rows='3'
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none'
                placeholder='Any additional notes...'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Issuing...
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Issue Permit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IssueTemporaryPermitOtherStateModal
