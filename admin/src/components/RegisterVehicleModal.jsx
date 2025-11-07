import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const RegisterVehicleModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    dateOfRegistration: '',
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    sonWifeDaughterOf: '',
    address: '',
    mobileNumber: '',
    email: '',
    makerName: '',
    makerModel: '',
    colour: '',
    seatingCapacity: '',
    vehicleClass: '',
    vehicleType: '',
    ladenWeight: '',
    unladenWeight: '',
    manufactureYear: '',
    vehicleCategory: '',
    purchaseDeliveryDate: '',
    saleAmount: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editData) {
      // Set registrationNumber from either registrationNumber or vehicleNumber for backward compatibility
      setFormData({
        ...editData,
        registrationNumber: editData.registrationNumber || editData.vehicleNumber || ''
      })
    } else {
      setFormData({
        registrationNumber: '',
        dateOfRegistration: '',
        chassisNumber: '',
        engineNumber: '',
        ownerName: '',
        sonWifeDaughterOf: '',
        address: '',
        mobileNumber: '',
        email: '',
        makerName: '',
        makerModel: '',
        colour: '',
        seatingCapacity: '',
        vehicleClass: '',
        vehicleType: '',
        ladenWeight: '',
        unladenWeight: '',
        manufactureYear: '',
        vehicleCategory: '',
        purchaseDeliveryDate: '',
        saleAmount: ''
      })
    }
    setError('')
  }, [editData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Convert specific fields to uppercase
    const uppercaseFields = ['registrationNumber', 'chassisNumber', 'engineNumber', 'makerName', 'makerModel', 'colour', 'ownerName', 'sonWifeDaughterOf', 'address']
    const processedValue = uppercaseFields.includes(name) ? value.toUpperCase() : value

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleDateChange = (e) => {
    const { name, value: input } = e.target
    const prevValue = formData[name] || ''

    // If user is deleting (backspace), allow deletion of dashes
    if (input.length < prevValue.length) {
      setFormData(prev => ({
        ...prev,
        [name]: input
      }))
      return
    }

    // Remove all non-digits
    let value = input.replace(/\D/g, '')

    // Format: DD-MM-YYYY (10-8-2022 format)
    if (value.length >= 2) {
      value = value.slice(0, 2) + '-' + value.slice(2)
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '-' + value.slice(5)
    }
    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Set vehicleNumber same as registrationNumber for backend compatibility
      const submitData = {
        ...formData,
        vehicleNumber: formData.registrationNumber
      }

      let response
      if (editData) {
        response = await axios.put(`${API_URL}/api/vehicle-registrations/${editData._id}`, submitData)
      } else {
        response = await axios.post(`${API_URL}/api/vehicle-registrations`, submitData)
      }

      if (response.data.success) {
        toast.success(
          editData ? 'Vehicle registration updated successfully!' : 'Vehicle registered successfully!',
          { position: 'top-right', autoClose: 3000 }
        )
        onSuccess()
        onClose()
      } else {
        const errorMessage = response.data.message || 'Failed to save vehicle registration'
        setError(errorMessage)
        toast.error(errorMessage, { position: 'top-right', autoClose: 3000 })
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error saving vehicle registration. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 })
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fadeIn'>
      <div className='bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-full md:max-w-[90%] max-h-[98vh] md:max-h-[95vh] overflow-hidden animate-slideUp'>
        {/* Header with gradient and icon */}
        <div className='sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-3 py-2 md:px-6 md:py-3 z-10 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 md:gap-3'>
              <div className='bg-white/20 backdrop-blur-lg p-1.5 md:p-2 rounded-lg'>
                <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <div>
                <h2 className='text-sm md:text-lg font-bold'>
                  {editData ? 'Edit Vehicle Registration' : 'Register New Vehicle'}
                </h2>
                <p className='text-white/80 text-[10px] md:text-xs mt-0.5 hidden md:block'>
                  {editData ? 'Update vehicle information' : 'Fill in all the required details'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white/90 hover:text-white hover:bg-white/20 p-1.5 md:p-2 rounded-lg transition-all duration-200 hover:rotate-90'
            >
              <svg className='w-4 h-4 md:w-5 md:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className='overflow-y-auto max-h-[calc(98vh-100px)] md:max-h-[calc(95vh-140px)] custom-scrollbar'>
          <form id='vehicle-registration-form' onSubmit={handleSubmit} className='p-3 md:p-8'>
            {error && (
              <div className='mb-3 md:mb-6 p-2.5 md:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-2 md:gap-3 animate-shake'>
                <svg className='w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <span className='text-xs md:text-sm font-medium'>{error}</span>
              </div>
            )}

            {/* Vehicle Details Section */}
            <div className='mb-4 md:mb-8'>
              <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
                <div className='bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-lg'>
                  <svg className='w-4 h-4 md:w-6 md:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-sm md:text-xl font-bold text-gray-800'>Vehicle Details</h3>
                  <p className='text-[10px] md:text-sm text-gray-500 hidden md:block'>Enter vehicle identification information</p>
                </div>
              </div>
              <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-3 md:p-6 rounded-xl md:rounded-2xl border border-indigo-100'>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5'>
                  {/* Registration Number */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Registration Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Date of Registration */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Date of Registration
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='dateOfRegistration'
                        value={formData.dateOfRegistration}
                        onChange={handleDateChange}
                        placeholder='DD-MM-YYYY'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Chassis Number */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Chassis Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Engine/Motor Number */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Engine/Motor Number
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='engineNumber'
                        value={formData.engineNumber}
                        onChange={handleChange}
                        placeholder='Enter engine/motor number'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Maker Name */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Maker Name
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='makerName'
                        value={formData.makerName}
                        onChange={handleChange}
                        placeholder='e.g., Maruti Suzuki, Tata, Honda'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Maker Model */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Maker Model
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='makerModel'
                        value={formData.makerModel}
                        onChange={handleChange}
                        placeholder='e.g., Maruti Swift DXI'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Colour */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Colour
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z' clipRule='evenodd' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='colour'
                        value={formData.colour}
                        onChange={handleChange}
                        placeholder='e.g., White, Red, Blue'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Seating Capacity */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Seating Capacity
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                      </div>
                      <input
                        type='number'
                        name='seatingCapacity'
                        value={formData.seatingCapacity}
                        onChange={handleChange}
                        placeholder='e.g., 5, 7, 50'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Vehicle Class */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Vehicle Class
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                      </div>
                      <select
                        name='vehicleClass'
                        value={formData.vehicleClass}
                        onChange={handleChange}
                        className='w-full pl-9 md:pl-12 pr-8 md:pr-10 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 appearance-none cursor-pointer'
                      >
                        <option value=''>Select Vehicle Class</option>
                        <option value='Motor Cycle'>Motor Cycle</option>
                        <option value='Motor Car'>Motor Car</option>
                        <option value='Auto Rickshaw'>Auto Rickshaw</option>
                        <option value='Maxi Cab'>Maxi Cab</option>
                        <option value='Omni Bus'>Omni Bus</option>
                        <option value='Tractor'>Tractor</option>
                        <option value='Light Motor Vehicle'>Light Motor Vehicle</option>
                        <option value='Medium Motor Vehicle'>Medium Motor Vehicle</option>
                        <option value='Heavy Motor Vehicle'>Heavy Motor Vehicle</option>
                        <option value='Light Goods Vehicle'>Light Goods Vehicle</option>
                        <option value='Medium Goods Vehicle'>Medium Goods Vehicle</option>
                        <option value='Heavy Goods Vehicle'>Heavy Goods Vehicle</option>
                        <option value='Invalid Carriage'>Invalid Carriage</option>
                        <option value='E-Rickshaw'>E-Rickshaw</option>
                        <option value='E-Cart'>E-Cart</option>
                      </select>
                      <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Vehicle Type
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                        </svg>
                      </div>
                      <select
                        name='vehicleType'
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className='w-full pl-9 md:pl-12 pr-8 md:pr-10 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 appearance-none cursor-pointer'
                      >
                        <option value=''>Select Vehicle Type</option>
                        <option value='Two Wheeler'>Two Wheeler</option>
                        <option value='Three Wheeler'>Three Wheeler</option>
                        <option value='Four Wheeler'>Four Wheeler</option>
                        <option value='Six Wheeler'>Six Wheeler</option>
                        <option value='Multi Axle Vehicle'>Multi Axle Vehicle</option>
                        <option value='Articulated Vehicle'>Articulated Vehicle</option>
                        <option value='Transport Vehicle'>Transport Vehicle</option>
                        <option value='Non-Transport Vehicle'>Non-Transport Vehicle</option>
                        <option value='Commercial Vehicle'>Commercial Vehicle</option>
                        <option value='Private Vehicle'>Private Vehicle</option>
                        <option value='Goods Carrier'>Goods Carrier</option>
                        <option value='Passenger Carrier'>Passenger Carrier</option>
                        <option value='Agricultural Vehicle'>Agricultural Vehicle</option>
                        <option value='Construction Equipment'>Construction Equipment</option>
                      </select>
                      <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Category */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Vehicle Category
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
                        </svg>
                      </div>
                      <select
                        name='vehicleCategory'
                        value={formData.vehicleCategory}
                        onChange={handleChange}
                        className='w-full pl-9 md:pl-12 pr-8 md:pr-10 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 appearance-none cursor-pointer'
                      >
                        <option value=''>Select Category</option>
                        <option value='LMV'>LMV (Light Motor Vehicle)</option>
                        <option value='MMV'>MMV (Medium Motor Vehicle)</option>
                        <option value='HMV'>HMV (Heavy Motor Vehicle)</option>
                        <option value='HGV'>HGV (Heavy Goods Vehicle)</option>
                        <option value='MGV'>MGV (Medium Goods Vehicle)</option>
                        <option value='LGV'>LGV (Light Goods Vehicle)</option>
                        <option value='MCWG'>MCWG (Motor Cycle With Gear)</option>
                        <option value='MCWOG'>MCWOG (Motor Cycle Without Gear)</option>
                        <option value='LMV-NT'>LMV-NT (Non-Transport)</option>
                        <option value='HMV-PSV'>HMV-PSV (Heavy Motor Vehicle - Public Service Vehicle)</option>
                        <option value='MGV-PSV'>MGV-PSV (Medium Goods Vehicle - Public Service Vehicle)</option>
                        <option value='LMV-TR'>LMV-TR (Light Motor Vehicle - Transport)</option>
                        <option value='3W-NT'>3W-NT (Three Wheeler - Non-Transport)</option>
                        <option value='3W-TR'>3W-TR (Three Wheeler - Transport)</option>
                        <option value='Tractor'>Tractor</option>
                        <option value='Construction Vehicle'>Construction Vehicle</option>
                        <option value='E-Cart'>E-Cart (Electric Cart)</option>
                        <option value='E-Rickshaw'>E-Rickshaw (Electric Rickshaw)</option>
                      </select>
                      <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
                        <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Laden Weight */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Laden Weight (kg)
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' />
                        </svg>
                      </div>
                      <input
                        type='number'
                        name='ladenWeight'
                        value={formData.ladenWeight}
                        onChange={handleChange}
                        placeholder='e.g., 2500'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Unladen Weight */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Unladen Weight (kg)
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' />
                        </svg>
                      </div>
                      <input
                        type='number'
                        name='unladenWeight'
                        value={formData.unladenWeight}
                        onChange={handleChange}
                        placeholder='e.g., 1200'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Manufacture Year */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Manufacture Year
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <select
                        name='manufactureYear'
                        value={formData.manufactureYear}
                        onChange={handleChange}
                        className='w-full pl-9 md:pl-12 pr-8 md:pr-10 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 appearance-none cursor-pointer'
                      >
                        <option value=''>Select Year</option>
                        {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <div className='absolute inset-y-0 right-0 pr-2.5 md:pr-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Purchase/Delivery Date */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Purchase/Delivery Date
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='purchaseDeliveryDate'
                        value={formData.purchaseDeliveryDate}
                        onChange={handleDateChange}
                        placeholder='DD/MM/YYYY'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Sale Amount */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Sale Amount
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                      </div>
                      <input
                        type='number'
                        name='saleAmount'
                        value={formData.saleAmount}
                        onChange={handleChange}
                        placeholder='e.g., 500000'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Details Section */}
            <div className='mb-4 md:mb-8'>
              <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
                <div className='bg-gradient-to-br from-purple-500 to-pink-600 p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-lg'>
                  <svg className='w-4 h-4 md:w-6 md:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                </div>
                <div>
                  <h3 className='text-sm md:text-xl font-bold text-gray-800'>Owner Details</h3>
                  <p className='text-[10px] md:text-sm text-gray-500 hidden md:block'>Enter owner information</p>
                </div>
              </div>
              <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-3 md:p-6 rounded-xl md:rounded-2xl border border-purple-100'>
                {/* Row 1: Owner Name and Son/Wife/Daughter of */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-3 md:mb-5'>
                  {/* Owner Name */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Owner Name
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='ownerName'
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder='Enter full name of owner'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Son/Wife/Daughter of */}
                  <div className='group'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Son/Wife/Daughter of
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='sonWifeDaughterOf'
                        value={formData.sonWifeDaughterOf}
                        onChange={handleChange}
                        placeholder='Enter father/husband/parent name'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Address, Mobile Number and Email */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5'>
                  {/* Address - Takes 2 columns (50%) */}
                  <div className='group md:col-span-2'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                      </div>
                      <input
                        type='text'
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        placeholder='Enter complete address with pin code'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 uppercase font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Mobile Number - Takes 1 column (25%) */}
                  <div className='group md:col-span-1'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Mobile Number
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                        </svg>
                      </div>
                      <input
                        type='tel'
                        name='mobileNumber'
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        maxLength='10'
                        placeholder='Enter 10-digit mobile number'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>

                  {/* Email - Takes 1 column (25%) */}
                  <div className='group md:col-span-1'>
                    <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-2.5 md:pl-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 md:w-5 md:h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <input
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        placeholder='Enter email address'
                        className='w-full pl-9 md:pl-12 pr-2.5 md:pr-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-semibold text-gray-800 placeholder-gray-400'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className='sticky bottom-0 bg-white border-t border-gray-200 px-3 md:px-6 py-2 md:py-3 shadow-lg z-10'>
          <div className='flex gap-2 md:gap-3 justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='px-3 md:px-5 py-1.5 md:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-200 hover:border-gray-300 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm'
            >
              <svg className='w-3.5 h-3.5 md:w-4 md:h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
              <span className='hidden sm:inline'>Cancel</span>
            </button>
            <button
              type='submit'
              form='vehicle-registration-form'
              disabled={loading}
              className='px-3 md:px-5 py-1.5 md:py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg text-xs md:text-sm'
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-3.5 w-3.5 md:h-4 md:w-4' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className='w-3.5 h-3.5 md:w-4 md:h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='hidden sm:inline'>{editData ? 'Update Registration' : 'Register Vehicle'}</span>
                  <span className='sm:hidden'>{editData ? 'Update' : 'Register'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterVehicleModal
