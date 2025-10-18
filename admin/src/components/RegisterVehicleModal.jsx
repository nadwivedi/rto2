import { useState, useEffect } from 'react'

const RegisterVehicleModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    dateOfRegistration: '',
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    relationOf: '',
    address: '',
    makerName: '',
    modelName: '',
    colour: '',
    status: 'Active'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editData) {
      setFormData(editData)
    } else {
      setFormData({
        registrationNumber: '',
        dateOfRegistration: '',
        chassisNumber: '',
        engineNumber: '',
        ownerName: '',
        relationOf: '',
        address: '',
        makerName: '',
        modelName: '',
        colour: '',
        status: 'Active'
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
      value = value.slice(0, 2) + '/' + value.slice(2)
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5)
    }
    if (value.length > 10) {
      value = value.slice(0, 10)
    }

    // Auto-expand 2-digit year to 4-digit year
    const parts = value.split('/')
    if (parts.length === 3 && parts[2].length === 2) {
      const yearPrefix = '20'
      value = `${parts[0]}/${parts[1]}/${yearPrefix}${parts[2]}`
    }

    setFormData(prev => ({
      ...prev,
      dateOfRegistration: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editData
        ? `http://localhost:5000/api/vehicle-registrations/${editData._id}`
        : 'http://localhost:5000/api/vehicle-registrations'

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
        setError(data.message || 'Failed to save vehicle registration')
      }
    } catch (error) {
      setError('Error saving vehicle registration. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>
              {editData ? 'Edit Vehicle Registration' : 'Register New Vehicle'}
            </h2>
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
            <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
              {error}
            </div>
          )}

          {/* Vehicle Details Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <span className='text-indigo-600'>🚗</span> Vehicle Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Registration Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Registration Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='registrationNumber'
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  placeholder='CG01AB1234'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase'
                />
              </div>

              {/* Date of Registration */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date of Registration <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='dateOfRegistration'
                  value={formData.dateOfRegistration}
                  onChange={handleDateChange}
                  required
                  placeholder='DD/MM/YYYY'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Chassis Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Chassis Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='chassisNumber'
                  value={formData.chassisNumber}
                  onChange={handleChange}
                  required
                  placeholder='Enter chassis number'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase'
                />
              </div>

              {/* Engine/Motor Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Engine/Motor Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='engineNumber'
                  value={formData.engineNumber}
                  onChange={handleChange}
                  required
                  placeholder='Enter engine/motor number'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase'
                />
              </div>

              {/* Maker Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Maker Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='makerName'
                  value={formData.makerName}
                  onChange={handleChange}
                  required
                  placeholder='e.g., Maruti Suzuki, Tata, Honda'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Model Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Model Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='modelName'
                  value={formData.modelName}
                  onChange={handleChange}
                  required
                  placeholder='e.g., Swift, Nexon, City'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Colour */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Colour <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='colour'
                  value={formData.colour}
                  onChange={handleChange}
                  required
                  placeholder='e.g., White, Red, Blue'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Status */}
              {editData && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Status
                  </label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleChange}
                    className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  >
                    <option value='Active'>Active</option>
                    <option value='Transferred'>Transferred</option>
                    <option value='Cancelled'>Cancelled</option>
                    <option value='Scrapped'>Scrapped</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Owner Details Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <span className='text-indigo-600'>👤</span> Owner Details
            </h3>

            <div className='grid grid-cols-1 gap-4'>
              {/* Owner Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Owner Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='ownerName'
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  placeholder='Enter full name of owner'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Son/Wife/Daughter of */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Son/Wife/Daughter of <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='relationOf'
                  value={formData.relationOf}
                  onChange={handleChange}
                  required
                  placeholder='Enter father/husband/parent name'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='address'
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows='3'
                  placeholder='Enter complete address with pin code'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
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
                editData ? 'Update Registration' : 'Register Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterVehicleModal
