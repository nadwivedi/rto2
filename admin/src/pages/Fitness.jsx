import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import AddFitnessModal from '../components/AddFitnessModal'
import EditFitnessModal from '../components/EditFitnessModal'
import Pagination from '../components/Pagination'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Fitness = () => {
  const [fitnessRecords, setFitnessRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFitness, setSelectedFitness] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'expiring', 'expired', 'pending'
  const [initialFitnessData, setInitialFitnessData] = useState(null) // For pre-filling renewal data
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card' - for desktop view toggle
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [statistics, setStatistics] = useState({
    total: 0,
    expiring: 0,
    expired: 0,
    pendingPaymentCount: 0,
    pendingPaymentAmount: 0
  })

  // Fetch fitness statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fitness/statistics`)
      if (response.data.success) {
        setStatistics({
          total: response.data.data.total,
          expiring: response.data.data.expiringSoon,
          expired: response.data.data.expired,
          pendingPaymentCount: response.data.data.pendingPaymentCount,
          pendingPaymentAmount: response.data.data.pendingPaymentAmount
        })
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  // Fetch fitness records from API
  const fetchFitnessRecords = async (page = pagination.currentPage) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/fitness`, {
        params: {
          page,
          limit: pagination.limit,
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      })

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

        // Update pagination state
        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalRecords: response.data.pagination.totalRecords,
            limit: pagination.limit
          })
        }
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

  // Load fitness records and statistics on component mount and when filters change
  useEffect(() => {
    fetchFitnessRecords(1) // Reset to page 1 when filters change
    fetchStatistics() // Fetch fresh statistics
  }, [searchQuery, statusFilter])

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchFitnessRecords(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  // Helper function to parse date string (DD-MM-YYYY or DD/MM/YYYY)
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date(0)
    const parts = dateStr.split(/[/-]/)
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return new Date(0)
  }

  // Use fitnessRecords directly since filtering is done on backend
  const filteredRecords = fitnessRecords

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
        // Refresh the list and statistics from the server
        await fetchFitnessRecords()
        await fetchStatistics()
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
        // Refresh the list and statistics from the server
        await fetchFitnessRecords()
        await fetchStatistics()
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

  const handleEditClick = (record) => {
    setSelectedFitness(record)
    setIsEditModalOpen(true)
  }

  const handleRenewClick = (record) => {
    // Pre-fill vehicle number for renewal
    setInitialFitnessData({
      vehicleNumber: record.vehicleNumber
    })
    setIsAddModalOpen(true)
  }

  const handleDeleteFitness = async (record) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this fitness certificate?\n\n` +
      `Vehicle Number: ${record.vehicleNumber}\n` +
      `Valid From: ${record.validFrom}\n` +
      `Valid To: ${record.validTo}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmDelete) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.delete(`${API_URL}/api/fitness/${record.id}`)

      if (response.data.success) {
        toast.success('Fitness certificate deleted successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list and statistics
        await fetchFitnessRecords()
        await fetchStatistics()
      } else {
        throw new Error(response.data.message || 'Failed to delete fitness certificate')
      }
    } catch (error) {
      console.error('Error deleting fitness certificate:', error)
      toast.error(`Failed to delete fitness certificate: ${error.message}`, {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  // Determine if renew button should be shown for a record
  const shouldShowRenewButton = (record) => {
    if (!record.validTo) return false

    // Calculate days remaining
    const today = new Date()
    const dateParts = record.validTo.split(/[/-]/)
    const validToDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const status = getStatusText(record.validTo)

    // Show for expiring soon BUT only if within 15 days
    if (status === 'Expiring Soon' && diffDays <= 15) {
      return true
    }

    // For expired records, apply smart logic
    if (status === 'Expired') {
      // Check if this vehicle has any active or expiring soon fitness
      const hasActiveFitness = fitnessRecords.some((r) => {
        if (r.vehicleNumber === record.vehicleNumber) {
          const rStatus = getStatusText(r.validTo)
          return rStatus === 'Active' || rStatus === 'Expiring Soon'
        }
        return false
      })

      // If vehicle has active fitness, don't show renew button on expired records
      if (hasActiveFitness) {
        return false
      }

      // Vehicle has no active fitness - show renew button only on latest expired record
      const expiredRecordsForVehicle = fitnessRecords.filter((r) => {
        return r.vehicleNumber === record.vehicleNumber && getStatusText(r.validTo) === 'Expired'
      })

      // Find the latest expired record
      let latestExpired = null
      expiredRecordsForVehicle.forEach((r) => {
        if (!latestExpired) {
          latestExpired = r
        } else {
          const currentDate = parseDateString(r.validTo)
          const latestDate = parseDateString(latestExpired.validTo)
          if (currentDate > latestDate) {
            latestExpired = r
          }
        }
      })

      // Show button only if this is the latest expired record
      return latestExpired && latestExpired.id === record.id
    }

    return false
  }

  // Statistics are now fetched from backend, removed useMemo calculation

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Fitness Records */}
              <div
                onClick={() => setStatusFilter('all')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300 shadow-xl' : 'border-indigo-100'
                }`}
                title={statusFilter === 'all' ? 'Currently showing all records' : 'Click to show all records'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Fitness</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expiring Soon */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'expiring' ? 'border-yellow-500 ring-2 ring-yellow-300 shadow-xl' : 'border-yellow-100'
                }`}
                title={statusFilter === 'expiring' ? 'Click to clear filter' : 'Click to filter expiring records'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.expiring}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expired */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'expired' ? 'border-red-500 ring-2 ring-red-300 shadow-xl' : 'border-orange-100'
                }`}
                title={statusFilter === 'expired' ? 'Click to clear filter' : 'Click to filter expired records'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expired</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{statistics.expired}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Payment */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-300 shadow-xl' : 'border-amber-100'
                }`}
                title={statusFilter === 'pending' ? 'Click to clear filter' : 'Click to filter pending payments'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending Payment</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.pendingPaymentCount}</h3>
                    <p className='text-[8px] lg:text-xs text-amber-600 font-bold mt-0.5'>₹{statistics.pendingPaymentAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by vehicle number...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm uppercase'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>

                {/* View Mode Dropdown - Desktop Only */}
                <div className='hidden lg:block'>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm font-semibold text-gray-700 cursor-pointer hover:border-indigo-300'
                  >
                    <option value='table'>Table View</option>
                    <option value='card'>Card View</option>
                  </select>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className='px-4 lg:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
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
                <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
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
                      <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                            {record.vehicleNumber?.substring(0, 2) || 'V'}
                          </div>
                          <div>
                            <div className='text-sm font-mono font-bold text-gray-900'>{record.vehicleNumber}</div>
                            <div className='text-xs text-gray-600'>Fitness Certificate</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-1.5'>
                          {/* Renew Button - Smart logic based on vehicle fitness status */}
                          {shouldShowRenewButton(record) && (
                            <button
                              onClick={() => handleRenewClick(record)}
                              className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                              title='Renew Fitness'
                            >
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                              </svg>
                            </button>
                          )}
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
                            onClick={() => handleDeleteFitness(record)}
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

            {/* Desktop Card View */}
            {viewMode === 'card' && (
              <div className='hidden lg:block'>
                {filteredRecords.length > 0 ? (
                  <div className='p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4'>
                    {filteredRecords.map((record) => (
                      <div key={record.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                        {/* Card Header with Avatar and Actions */}
                        <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                              {record.vehicleNumber?.substring(0, 2) || 'V'}
                            </div>
                            <div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{record.vehicleNumber}</div>
                              <div className='text-xs text-gray-600'>Fitness Certificate</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex items-center gap-1.5'>
                            {/* Renew Button - Smart logic based on vehicle fitness status */}
                            {shouldShowRenewButton(record) && (
                              <button
                                onClick={() => handleRenewClick(record)}
                                className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                                title='Renew Fitness'
                              >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                </svg>
                              </button>
                            )}
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
                              onClick={() => handleDeleteFitness(record)}
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
                      <p className='text-xs text-gray-500 mt-1'>Click "Add New Fitness Certificate" to add your first record</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Table View */}
            {viewMode === 'table' && (
              <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid To</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Fee (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Payment Status</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                    <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                      <tr key={record.id} className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 group'>
                        {/* Vehicle Number */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
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

                        {/* Payment Status */}
                        <td className='px-4 py-4'>
                          {(record.balance || 0) > 0 ? (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                              Pending
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                              </svg>
                              Paid
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(record.validTo)}`}>
                            {getStatusText(record.validTo)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className='px-4 py-4'>
                          <div className='grid grid-cols-3 gap-2 w-[140px] mx-auto'>
                            {/* Renew Button - Smart logic based on vehicle fitness status */}
                            {shouldShowRenewButton(record) ? (
                              <button
                                onClick={() => handleRenewClick(record)}
                                className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                                title='Renew Fitness'
                              >
                                <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                </svg>
                              </button>
                            ) : (
                              <div></div>
                            )}
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
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteFitness(record)}
                              className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                              title='Delete Record'
                            >
                              <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='9' className='px-4 py-8 text-center'>
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
            )}

            {/* Pagination */}
            {!loading && filteredRecords.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalRecords={pagination.totalRecords}
                itemsPerPage={pagination.limit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Fitness Modal */}
      <AddFitnessModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setInitialFitnessData(null) // Reset initial data when closing
        }}
        onSubmit={handleAddFitness}
        initialData={initialFitnessData}
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
