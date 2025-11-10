import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import AddInsuranceModal from './components/AddInsuranceModal'
import Pagination from '../../components/Pagination'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Insurance = () => {
  const [insurances, setInsurances] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInsurance, setSelectedInsurance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all') // Add status filter
  const [initialInsuranceData, setInitialInsuranceData] = useState(null) // For pre-filling renewal data
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    pendingPaymentCount: 0,
    pendingPaymentAmount: 0
  })

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/insurance/statistics`)
      if (response.data.success) {
        const { insurance, pendingPayments } = response.data.data
        setStats({
          total: insurance.total,
          active: insurance.active,
          expiringSoon: insurance.expiringSoon,
          expired: insurance.expired,
          pendingPaymentCount: pendingPayments.count,
          pendingPaymentAmount: pendingPayments.amount
        })
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  // Fetch insurance records from API
  const fetchInsurances = async (page = pagination.currentPage) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/insurance`, {
        params: {
          page,
          limit: pagination.limit,
          search: debouncedSearchQuery,
          status: statusFilter === 'all' ? '' : statusFilter
        }
      })

      if (response.data.success) {
        setInsurances(response.data.data)

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
      console.error('Error fetching insurance records:', error)
      toast.error('Failed to fetch insurance records. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  // Debounce search query to avoid losing focus on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load insurance records on component mount and when filters change
  useEffect(() => {
    // Only fetch if search query is empty or has at least 4 characters
    if (debouncedSearchQuery.length === 0 || debouncedSearchQuery.length >= 4) {
      fetchInsurances(1) // Reset to page 1 when filters change
      fetchStatistics()
    }
  }, [debouncedSearchQuery])

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchInsurances(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusColor = (status) => {
    if (status === 'expired') return 'bg-red-100 text-red-700'
    if (status === 'expiring_soon') return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (status) => {
    if (status === 'expired') return 'Expired'
    if (status === 'expiring_soon') return 'Expiring Soon'
    return 'Active'
  }

  // Filter insurances based on status filter
  const filteredInsurances = useMemo(() => {
    if (statusFilter === 'all') {
      return insurances
    }
    return insurances.filter(insurance => {
      if (statusFilter === 'pending') {
        return (insurance.balance || 0) > 0
      }
      return insurance.status === statusFilter
    })
  }, [insurances, statusFilter])

  const handleAddInsurance = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/insurance`, formData)

      if (response.data.success) {
        toast.success('Insurance record added successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list from the server
        await fetchInsurances()
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error adding insurance record:', error)
      toast.error('Failed to add insurance record. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRenewClick = (insurance) => {
    // Pre-fill vehicle number and other details for renewal
    setInitialInsuranceData({
      vehicleNumber: insurance.vehicleNumber,
      vehicleType: insurance.vehicleType || '',
      ownerName: insurance.ownerName || '',
      insuranceCompany: insurance.insuranceCompany || '',
      policyType: insurance.policyType || '',
      mobileNumber: insurance.mobileNumber || '',
      agentName: insurance.agentName || '',
      agentContact: insurance.agentContact || ''
    })
    setIsAddModalOpen(true)
  }

  const handleEditClick = (insurance) => {
    setSelectedInsurance(insurance)
    setIsEditModalOpen(true)
  }

  const handleEditInsurance = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.put(`${API_URL}/api/insurance/${selectedInsurance._id}`, formData)

      if (response.data.success) {
        toast.success('Insurance record updated successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list from the server
        await fetchInsurances()
        setIsEditModalOpen(false)
        setSelectedInsurance(null)
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error updating insurance record:', error)
      toast.error('Failed to update insurance record.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInsurance = async (insurance) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this insurance?\n\n` +
      `Vehicle Number: ${insurance.vehicleNumber}\n` +
      `Policy Number: ${insurance.policyNumber}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmDelete) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/insurance/${insurance._id}`)

      if (response.data.success) {
        toast.success('Insurance record deleted successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        await fetchInsurances()
      } else {
        toast.error(response.data.message || 'Failed to delete insurance record', {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      toast.error('Error deleting insurance record. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      })
      console.error('Error:', error)
    }
  }

  // Determine if renew button should be shown for an insurance
  const shouldShowRenewButton = (insurance) => {
    // Show renew button for expiring soon insurances
    if (insurance.status === 'expiring_soon') {
      return true
    }

    // Show renew button for expired insurances
    if (insurance.status === 'expired') {
      return true
    }

    return false
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'date') {
      setDateFilter(value)
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Insurance Records */}
              <div
                onClick={() => setStatusFilter('all')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300 shadow-xl' : 'border-indigo-100'
                }`}
                title={statusFilter === 'all' ? 'Currently showing all records' : 'Click to show all records'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Insurance Records</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{stats.total}</h3>
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
                onClick={() => setStatusFilter(statusFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'expiring_soon' ? 'border-orange-500 ring-2 ring-orange-300 shadow-xl' : 'border-orange-100'
                }`}
                title={statusFilter === 'expiring_soon' ? 'Click to clear filter' : 'Click to filter expiring records'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{stats.expiringSoon}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
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
                  statusFilter === 'expired' ? 'border-red-500 ring-2 ring-red-300 shadow-xl' : 'border-red-100'
                }`}
                title={statusFilter === 'expired' ? 'Click to clear filter' : 'Click to filter expired records'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expired</p>
                    <h3 className='text-lg lg:text-2xl font-black text-red-600'>{stats.expired}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-md'>
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
                  statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-300 shadow-xl' : 'border-yellow-100'
                }`}
                title={statusFilter === 'pending' ? 'Click to clear filter' : 'Click to filter pending payments'}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending Payment</p>
                    <h3 className='text-lg lg:text-2xl font-black text-yellow-600'>{stats.pendingPaymentCount}</h3>
                    {stats.pendingPaymentAmount > 0 && (
                      <p className='text-[7px] lg:text-[9px] text-gray-500 font-semibold mt-0.5'>
                        ₹{stats.pendingPaymentAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Loading State */}
      {loading && (
        <div className='flex flex-col justify-center items-center py-20'>
          <div className='relative'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
            <div className='absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
          </div>
          <div className='mt-6 text-center'>
            <p className='text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1'>
              Loading Insurance Records
            </p>
            <p className='text-sm text-gray-600'>Please wait while we fetch your data...</p>
          </div>
        </div>
      )}

      {!loading && (
      <>
      {/* Insurance Table */}
      <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
        {/* Search and Filters Header */}
        <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <div className='relative flex-1 lg:max-w-md'>
              <input
                type='text'
                placeholder='Search by vehicle no, policy no, or owner...'
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

            {/* Filters Group */}
            <div className='flex flex-wrap gap-2'>
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Insurance</option>
                <option value='Expiring30Days'>Expiring in 30 Days</option>
                <option value='Expiring60Days'>Expiring in 60 Days</option>
                <option value='Expired'>Expired</option>
              </select>

              {/* Clear Filters */}
              {dateFilter !== 'All' && (
                <button
                  onClick={() => handleFilterChange('date', 'All')}
                  className='px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg'
                >
                  Clear
                </button>
              )}
            </div>

            {/* New Insurance Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <span className='flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                New Insurance Record
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className='block lg:hidden'>
          {filteredInsurances.length > 0 ? (
            <div className='p-3 space-y-3'>
              {filteredInsurances.map((insurance) => (
                <div key={insurance.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                  {/* Card Header with Avatar and Status Badge */}
                  <div className='bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 p-3 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                        </svg>
                      </div>
                      <div>
                        <div className='text-xs font-mono font-bold text-gray-900'>{insurance.policyNumber}</div>
                        <div className='text-xs text-gray-600 mt-0.5'>{insurance.ownerName || '-'}</div>
                        <div className='text-xs text-gray-500 flex items-center mt-1'>
                          <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                          </svg>
                          {insurance.mobileNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons on top right */}
                    <div className='flex-shrink-0 flex items-center gap-1.5'>
                      {shouldShowRenewButton(insurance) && (
                        <button
                          onClick={() => handleRenewClick(insurance)}
                          className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                          title='Renew Insurance'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(insurance)}
                        className='p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-all cursor-pointer'
                        title='Edit Insurance'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteInsurance(insurance)}
                        className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                        title='Delete Insurance'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(insurance.status)} border-2 ${
                        getStatusText(insurance.status) === 'Expired' ? 'border-red-300' :
                        getStatusText(insurance.status) === 'Expiring Soon' ? 'border-orange-300' :
                        'border-green-300'
                      }`}>
                        {getStatusText(insurance.status)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className='p-3 space-y-2.5'>
                    {/* Vehicle and Insurance Company */}
                    <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                        </svg>
                        {insurance.vehicleNumber}
                      </span>
                      <span className='text-xs font-semibold text-gray-600'>{insurance.vehicleType}</span>
                    </div>

                    {/* Payment Details */}
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='bg-gray-50 rounded-lg p-2 border border-gray-200'>
                        <div className='text-xs text-gray-500 font-medium mb-0.5'>Total Fee</div>
                        <div className='text-sm font-bold text-gray-900'>₹{(insurance.totalFee || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className='bg-emerald-50 rounded-lg p-2 border border-emerald-200'>
                        <div className='text-xs text-emerald-600 font-medium mb-0.5'>Paid</div>
                        <div className='text-sm font-bold text-emerald-700'>₹{(insurance.paid || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className={`rounded-lg p-2 border ${(insurance.balance || 0) > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`text-xs font-medium mb-0.5 ${(insurance.balance || 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>Balance</div>
                        <div className={`text-sm font-bold ${(insurance.balance || 0) > 0 ? 'text-orange-700' : 'text-gray-500'}`}>₹{(insurance.balance || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className='grid grid-cols-2 gap-2 pt-1'>
                      <div className='bg-green-50 rounded-lg p-2 border border-green-200'>
                        <div className='text-xs text-green-600 font-medium mb-0.5 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          Valid From
                        </div>
                        <div className='text-sm font-bold text-green-900'>{insurance.validFrom}</div>
                      </div>
                      <div className='bg-red-50 rounded-lg p-2 border border-red-200'>
                        <div className='text-xs text-red-600 font-medium mb-0.5 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          Valid To
                        </div>
                        <div className='text-sm font-bold text-red-900'>{insurance.validTo}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-6'>
              <div className='flex flex-col items-center justify-center py-12'>
                <div className='w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
                  <svg className='w-10 h-10 text-cyan-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                </div>
                <h3 className='text-lg font-black text-gray-700 mb-2'>No Insurance Records Found</h3>
                <p className='text-sm text-gray-500 text-center max-w-xs'>
                  {searchQuery ? 'No insurance records match your search criteria.' : 'Get started by adding your first insurance record.'}
                </p>
              </div>
            </div>
          )}

          {/* Pagination for Mobile */}
          {!loading && filteredInsurances.length > 0 && (
            <div className='px-3 pb-3'>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalRecords={pagination.totalRecords}
                itemsPerPage={pagination.limit}
              />
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className='hidden lg:block overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Policy Number</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid To</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Total Fee (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Paid (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Balance (₹)</th>
                <th className='px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredInsurances.length > 0 ? (
                filteredInsurances.map((insurance) => (
                  <tr key={insurance.id} className='hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group'>
                    <td className='px-6 py-5'>
                      <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                        {insurance.policyNumber}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200'>
                        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                        </svg>
                        {insurance.vehicleNumber}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm'>
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold border border-green-200'>
                          <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {insurance.validFrom}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm'>
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold border border-red-200'>
                          <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {insurance.validTo}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm font-bold text-gray-800'>₹{(insurance.totalFee || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                        ₹{(insurance.paid || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      {(insurance.balance || 0) > 0 ? (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                          ₹{(insurance.balance || 0).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                          ₹0
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center justify-center'>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(insurance.status)}`}>
                          {getStatusText(insurance.status)}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='grid grid-cols-3 gap-2 w-[140px] mx-auto'>
                        {shouldShowRenewButton(insurance) ? (
                          <button
                            onClick={() => handleRenewClick(insurance)}
                            className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                            title='Renew Insurance'
                          >
                            <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                            </svg>
                          </button>
                        ) : (
                          <div></div>
                        )}
                        <button
                          onClick={() => handleEditClick(insurance)}
                          className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                          title='Edit Insurance'
                        >
                          <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteInsurance(insurance)}
                          className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                          title='Delete Insurance'
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
                  <td colSpan='9' className='px-6 py-16'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg'>
                        <svg className='w-12 h-12 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                      </div>
                      <h3 className='text-xl font-black text-gray-700 mb-2'>No Insurance Records Found</h3>
                      <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                        {searchQuery ? 'No insurance records match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first insurance record.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredInsurances.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalRecords={pagination.totalRecords}
            itemsPerPage={pagination.limit}
          />
        )}
      </div>
      </>
      )}

      {/* Add Insurance Modal */}
      <AddInsuranceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setInitialInsuranceData(null) // Clear initial data when closing
        }}
        onSubmit={handleAddInsurance}
        initialData={initialInsuranceData} // Pass initial data for renewal
      />

      {/* Edit Insurance Modal */}
      <AddInsuranceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedInsurance(null) // Clear selected insurance when closing
        }}
        onSubmit={handleEditInsurance}
        initialData={selectedInsurance} // Pass selected insurance data for editing
        isEditMode={true}
      />
        </div>
      </div>
    </>
  )
}

export default Insurance
