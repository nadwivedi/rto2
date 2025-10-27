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
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-slideUp'>
        {/* Header with gradient and icon */}
        <div className='sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-7 z-10 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='bg-white/20 backdrop-blur-lg p-3 rounded-xl'>
                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <div>
                <h2 className='text-2xl font-bold'>
                  {editData ? 'Edit Vehicle Registration' : 'Register New Vehicle'}
                </h2>
                <p className='text-white/80 text-sm mt-0.5'>
                  {editData ? 'Update vehicle information' : 'Fill in all the required details'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white/90 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all duration-200 hover:rotate-90'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className='overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar'>
          <form onSubmit={handleSubmit} className='p-8'>
            {error && (
              <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3 animate-shake'>
                <svg className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <span className='font-medium'>{error}</span>
              </div>
            )}

            {/* Vehicle Details Section */}
            <div className='mb-8'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg'>
                  <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-800'>Vehicle Details</h3>
                  <p className='text-sm text-gray-500'>Enter vehicle identification information</p>
                </div>
              </div>
              <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100'>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  {/* Registration Number */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Registration Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='registrationNumber'
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        required
                        placeholder='CG01AB1234'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Date of Registration */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Date of Registration <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='dateOfRegistration'
                        value={formData.dateOfRegistration}
                        onChange={handleDateChange}
                        required
                        placeholder='DD/MM/YYYY'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Chassis Number */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Chassis Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='chassisNumber'
                        value={formData.chassisNumber}
                        onChange={handleChange}
                        required
                        placeholder='Enter chassis number'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Engine/Motor Number */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Engine/Motor Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='engineNumber'
                        value={formData.engineNumber}
                        onChange={handleChange}
                        required
                        placeholder='Enter engine/motor number'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Maker Name */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Maker Name <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='makerName'
                        value={formData.makerName}
                        onChange={handleChange}
                        required
                        placeholder='e.g., Maruti Suzuki, Tata, Honda'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Model Name */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Model Name <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='modelName'
                        value={formData.modelName}
                        onChange={handleChange}
                        required
                        placeholder='e.g., Swift, Nexon, City'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Colour */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Colour <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-indigo-400' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z' clipRule='evenodd' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='colour'
                        value={formData.colour}
                        onChange={handleChange}
                        required
                        placeholder='e.g., White, Red, Blue'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Status */}
                  {editData && (
                    <div className='group'>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Status
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <svg className='w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                        </div>
                        <select
                          name='status'
                          value={formData.status}
                          onChange={handleChange}
                          className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 appearance-none cursor-pointer'
                        >
                          <option value='Active'>Active</option>
                          <option value='Transferred'>Transferred</option>
                          <option value='Cancelled'>Cancelled</option>
                          <option value='Scrapped'>Scrapped</option>
                        </select>
                        <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                          <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Details Section */}
            <div className='mb-8'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg'>
                  <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-800'>Owner Details</h3>
                  <p className='text-sm text-gray-500'>Enter owner information</p>
                </div>
              </div>
              <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100'>
                <div className='grid grid-cols-1 gap-5'>
                  {/* Owner Name */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Owner Name <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='ownerName'
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                        placeholder='Enter full name of owner'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Son/Wife/Daughter of */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Son/Wife/Daughter of <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='relationOf'
                        value={formData.relationOf}
                        onChange={handleChange}
                        required
                        placeholder='Enter father/husband/parent name'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className='group'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Address <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute top-3 left-0 pl-4 flex items-start pointer-events-none'>
                        <svg className='w-5 h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                      </div>
                      <textarea
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows='4'
                        placeholder='Enter complete address with pin code'
                        className='w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2 mt-8'>
              <div className='flex gap-4 justify-end'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-8 py-3.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border-2 border-gray-200 hover:border-gray-300 flex items-center gap-2'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform'
                >
                  {loading ? (
                    <>
                      <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <span>{editData ? 'Update Registration' : 'Register Vehicle'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterVehicleModal
