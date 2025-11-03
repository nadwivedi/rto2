import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import AddFitnessModal from '../components/AddFitnessModal'
import EditFitnessModal from '../components/EditFitnessModal'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Fitness = () => {
  const [fitnessRecords, setFitnessRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFitness, setSelectedFitness] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch fitness records from API
  const fetchFitnessRecords = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/fitness`)

      if (response.data.success) {
        // Transform the data to match the display format
        const transformedRecords = response.data.data.map(record => ({
          id: record._id,
          vehicleNumber: record.vehicleNumber,
          validFrom: record.validFrom,
          validTo: record.validTo,
          totalFee: record.totalFee || 0,
          paid: record.paid || 0,
          balance: record.balance || 0,
          status: record.status
        }))
        setFitnessRecords(transformedRecords)
      }
    } catch (error) {
      console.error('Error fetching fitness records:', error)
      toast.error('Failed to fetch fitness records. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  // Load fitness records on component mount
  useEffect(() => {
    fetchFitnessRecords()
  }, [])

  const getStatusColor = (validTo) => {
    if (!validTo) return 'bg-gray-100 text-gray-700'
    const today = new Date()
    // Handle both DD/MM/YYYY and DD-MM-YYYY formats
    const dateParts = validTo.split(/[/-]/)
    const validToDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'bg-red-100 text-red-700'
    if (diffDays <= 30) return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (validTo) => {
    if (!validTo) return 'Unknown'
    const today = new Date()
    // Handle both DD/MM/YYYY and DD-MM-YYYY formats
    const dateParts = validTo.split(/[/-]/)
    const validToDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Expired'
    if (diffDays <= 30) return 'Expiring Soon'
    return 'Active'
  }

  // Filter fitness records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) {
      return fitnessRecords
    }

    const searchLower = searchQuery.toLowerCase()
    return fitnessRecords.filter((record) =>
      record.vehicleNumber.toLowerCase().includes(searchLower)
    )
  }, [fitnessRecords, searchQuery])

  const handleAddFitness = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/fitness`, {
        vehicleNumber: formData.vehicleNumber,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        totalFee: parseFloat(formData.totalFee),
        paid: parseFloat(formData.paid),
        balance: parseFloat(formData.balance)
      })

      if (response.data.success) {
        toast.success('Fitness certificate added successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list from the server
        await fetchFitnessRecords()
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error adding fitness record:', error)
      toast.error('Failed to add fitness certificate. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditFitness = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.put(`${API_URL}/api/fitness/${selectedFitness.id}`, {
        vehicleNumber: formData.vehicleNumber,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        totalFee: parseFloat(formData.totalFee),
        paid: parseFloat(formData.paid),
        balance: parseFloat(formData.balance)
      })

      if (response.data.success) {
        toast.success('Fitness certificate updated successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list from the server
        await fetchFitnessRecords()
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error updating fitness record:', error)
      toast.error('Failed to update fitness certificate.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewFitness = (record) => {
    // For now, just show an alert with the details
    // You can create a ViewFitnessModal later if needed
    alert(`Vehicle Number: ${record.vehicleNumber}\nValid From: ${record.validFrom}\nValid To: ${record.validTo}\n\nTotal Fee: ₹${(record.totalFee || 0).toLocaleString('en-IN')}\nPaid: ₹${(record.paid || 0).toLocaleString('en-IN')}\nBalance: ₹${(record.balance || 0).toLocaleString('en-IN')}\n\nStatus: ${getStatusText(record.validTo)}`)
  }

  const handleEditClick = (record) => {
    setSelectedFitness(record)
    setIsEditModalOpen(true)
  }

  const statistics = useMemo(() => {
    const total = fitnessRecords.length
    const active = fitnessRecords.filter(rec => getStatusText(rec.validTo) === 'Active').length
    const expiring = fitnessRecords.filter(rec => getStatusText(rec.validTo) === 'Expiring Soon').length
    const expired = fitnessRecords.filter(rec => getStatusText(rec.validTo) === 'Expired').length

    return { total, active, expiring, expired }
  }, [fitnessRecords])

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Fitness Records */}
              <div className='bg-white rounded-lg shadow-md border border-gray-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Fitness</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active */}
              <div className='bg-white rounded-lg shadow-md border border-green-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Active</p>
                    <h3 className='text-lg lg:text-2xl font-black text-green-600'>{statistics.active}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expiring Soon */}
              <div className='bg-white rounded-lg shadow-md border border-orange-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{statistics.expiring}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expired */}
              <div className='bg-white rounded-lg shadow-md border border-red-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expired</p>
                    <h3 className='text-lg lg:text-2xl font-black text-red-600'>{statistics.expired}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by vehicle number...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all bg-white shadow-sm'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className='px-4 lg:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  <span className='hidden lg:inline'>Add New Fitness Certificate</span>
                  <span className='lg:hidden'>Add New</span>
                </button>
              </div>

              {/* Results count */}
              <div className='mt-3 text-xs text-gray-600 font-semibold'>
                Showing {filteredRecords.length} of {fitnessRecords.length} records
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className='p-8 text-center'>
                <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
                <p className='mt-4 text-gray-600 font-semibold'>Loading fitness records...</p>
              </div>
            )}

            {/* Mobile Card View */}
            <div className='block lg:hidden'>
              {filteredRecords.length > 0 ? (
                <div className='p-3 space-y-3'>
                  {filteredRecords.map((record) => (
                    <div key={record.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                      {/* Card Header with Avatar and Actions */}
                      <div className='bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-3 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                            {record.vehicleNumber?.substring(0, 2) || 'V'}
                          </div>
                          <div>
                            <div className='text-sm font-mono font-bold text-gray-900'>{record.vehicleNumber}</div>
                            <div className='text-xs text-gray-600'>Fitness Certificate</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-1.5'>
                          <button
                            onClick={() => {
                              setSelectedFitness(record)
                              setIsEditModalOpen(true)
                            }}
                            className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                            title='Edit'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteFitness(record.id)}
                            className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                            title='Delete'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className='p-3 space-y-2.5'>
                        {/* Status Badge */}
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-500 font-semibold uppercase'>Status</span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(record.validTo)}`}>
                            {getStatusText(record.validTo)}
                          </span>
                        </div>

                        {/* Payment Details */}
                        <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-100'>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase'>Total Fee</p>
                            <p className='text-sm font-bold text-gray-800'>₹{(record.totalFee || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase'>Paid</p>
                            <p className='text-sm font-bold text-emerald-600'>₹{(record.paid || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase'>Balance</p>
                            <p className={`text-sm font-bold ${record.balance > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                              ₹{(record.balance || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Validity Period */}
                        <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                              <svg className='w-3 h-3 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              Valid From
                            </p>
                            <p className='text-xs font-semibold text-gray-700'>{record.validFrom}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                              <svg className='w-3 h-3 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              Valid To
                            </p>
                            <p className='text-xs font-semibold text-gray-700'>{record.validTo}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-8 text-center'>
                  <div className='text-gray-400'>
                    <svg className='mx-auto h-12 w-12 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <p className='text-sm font-semibold text-gray-600'>No fitness records found</p>
                    <p className='text-xs text-gray-500 mt-1'>Click "Add New" to add your first record</p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid To</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Fee (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                    <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                      <tr key={record.id} className='hover:bg-gradient-to-r hover:from-green-50/50 hover:via-emerald-50/50 hover:to-teal-50/50 transition-all duration-200 group'>
                        {/* Vehicle Number */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {record.vehicleNumber?.substring(0, 2) || 'V'}
                            </div>
                            <div className='text-sm font-mono font-bold text-gray-900'>{record.vehicleNumber}</div>
                          </div>
                        </td>

                        {/* Valid From */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-green-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {record.validFrom}
                          </div>
                        </td>

                        {/* Valid To */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-red-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {record.validTo}
                          </div>
                        </td>

                        {/* Total Fee */}
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-gray-800'>₹{(record.totalFee || 0).toLocaleString('en-IN')}</span>
                        </td>

                        {/* Paid */}
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-green-600'>₹{(record.paid || 0).toLocaleString('en-IN')}</span>
                        </td>

                        {/* Balance */}
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-orange-600'>₹{(record.balance || 0).toLocaleString('en-IN')}</span>
                        </td>

                        {/* Status */}
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(record.validTo)}`}>
                            {getStatusText(record.validTo)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center justify-center gap-2'>
                            {/* View Button */}
                            <button
                              onClick={() => handleViewFitness(record)}
                              className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                              title='View Details'
                            >
                              <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            </button>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditClick(record)}
                              className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                              title='Edit Record'
                            >
                              <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='8' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>No fitness records found</p>
                          <p className='text-xs text-gray-500 mt-1'>Click &quot;Add New Fitness Certificate&quot; to add your first record</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Fitness Modal */}
      <AddFitnessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFitness}
      />

      {/* Edit Fitness Modal */}
      <EditFitnessModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditFitness}
        fitness={selectedFitness}
      />
    </>
  )
}

export default Fitness
