import { useState } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

const AddDealerBillModal = ({ isOpen, onClose, onSuccess }) => {
  // Permit Section
  const [permitData, setPermitData] = useState({
    permitType: 'National Permit',
    permitNumber: '',
    partANumber: '',
    partBNumber: ''
  })

  // Fitness Section
  const [fitnessData, setFitnessData] = useState({
    certificateNumber: ''
  })

  // Registration Section
  const [registrationData, setRegistrationData] = useState({
    registrationNumber: ''
  })

  // Total Fees
  const [totalFees, setTotalFees] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle permit data change
  const handlePermitChange = (e) => {
    const { name, value } = e.target
    setPermitData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  // Handle fitness data change
  const handleFitnessChange = (e) => {
    const { name, value } = e.target
    setFitnessData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  // Handle registration data change
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  // Check if form is valid
  const isFormValid = () => {
    if (permitData.permitType === 'National Permit') {
      if (!permitData.partANumber || !permitData.partBNumber) {
        return false
      }
    } else {
      if (!permitData.permitNumber) {
        return false
      }
    }

    if (!fitnessData.certificateNumber) {
      return false
    }

    if (!registrationData.registrationNumber) {
      return false
    }

    if (!totalFees || parseFloat(totalFees) <= 0) {
      return false
    }

    return true
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid()) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/dealer-bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permit: permitData,
          fitness: fitnessData,
          registration: registrationData,
          totalFees: parseFloat(totalFees)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create dealer bill')
      }

      alert('Dealer bill created successfully! Bill number: ' + data.data.billNumber)

      // Reset form
      setPermitData({
        permitType: 'National Permit',
        permitNumber: '',
        partANumber: '',
        partBNumber: ''
      })
      setFitnessData({
        certificateNumber: ''
      })
      setRegistrationData({
        registrationNumber: ''
      })
      setTotalFees('')

      onSuccess && onSuccess(data.data)
      onClose()
    } catch (err) {
      console.error('Error submitting dealer bill:', err)
      setError(err.message || 'Failed to create dealer bill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-black mb-1'>Add Dealer Bill</h2>
              <p className='text-blue-100 text-sm'>Create a combined bill for Permit, Fitness, and Registration</p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-6'>
            {/* Permit Section */}
            <div className='mb-6 p-4 border-2 border-blue-200 rounded-xl bg-blue-50'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-black'>1</span>
                Permit
              </h3>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>
                    Permit Type <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='permitType'
                    value={permitData.permitType}
                    onChange={handlePermitChange}
                    className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
                    required
                  >
                    <option value='National Permit'>National Permit</option>
                    <option value='CG Permit'>CG Permit</option>
                    <option value='Temporary Permit'>Temporary Permit</option>
                  </select>
                </div>

                {permitData.permitType === 'National Permit' ? (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>
                        Part A Number <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='partANumber'
                        value={permitData.partANumber}
                        onChange={handlePermitChange}
                        placeholder='e.g., PA-2025-001'
                        className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>
                        Part B Number <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='partBNumber'
                        value={permitData.partBNumber}
                        onChange={handlePermitChange}
                        placeholder='e.g., PB-2025-001'
                        className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono'
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>
                      Permit Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='permitNumber'
                      value={permitData.permitNumber}
                      onChange={handlePermitChange}
                      placeholder={permitData.permitType === 'CG Permit' ? 'e.g., CG-2025-0001' : 'e.g., TP-2025-0001'}
                      className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono'
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fitness Section */}
            <div className='mb-6 p-4 border-2 border-green-200 rounded-xl bg-green-50'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-black'>2</span>
                Fitness Certificate
              </h3>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Certificate Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='certificateNumber'
                  value={fitnessData.certificateNumber}
                  onChange={handleFitnessChange}
                  placeholder='e.g., FIT-2025-001'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono'
                  required
                />
              </div>
            </div>

            {/* Registration Section */}
            <div className='mb-6 p-4 border-2 border-orange-200 rounded-xl bg-orange-50'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-black'>3</span>
                Vehicle Registration
              </h3>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Registration Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='registrationNumber'
                  value={registrationData.registrationNumber}
                  onChange={handleRegistrationChange}
                  placeholder='e.g., REG-2025-001'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono'
                  required
                />
              </div>
            </div>

            {/* Total Fees Section */}
            <div className='mb-6 p-4 border-2 border-purple-200 rounded-xl bg-purple-50'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-black'>₹</span>
                Total Fees
              </h3>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  Total Amount (₹) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='totalFees'
                  value={totalFees}
                  onChange={(e) => {
                    setTotalFees(e.target.value)
                    setError('')
                  }}
                  placeholder='e.g., 10000'
                  min='0'
                  step='100'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-bold'
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4'>
                <p className='text-sm text-red-700 font-semibold'>{error}</p>
              </div>
            )}
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4'>
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold'
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading || !isFormValid()}
                className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Dealer Bill'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDealerBillModal
