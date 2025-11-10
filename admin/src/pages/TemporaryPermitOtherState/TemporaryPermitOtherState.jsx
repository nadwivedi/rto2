import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../../components/Pagination'
import IssueTemporaryPermitOtherStateModal from './components/IssueTemporaryPermitOtherStateModal'
import EditTemporaryPermitOtherStateModal from './components/EditTemporaryPermitOtherStateModal'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const TemporaryPermitOtherState = () => {
  const [permits, setPermits] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    pendingPaymentCount: 0
  })

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/temporary-permits-other-state/statistics`);
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch permits from backend
  useEffect(() => {
    if (debouncedSearchQuery.length === 0 || debouncedSearchQuery.length >= 4) {
      fetchPermits(1)
      fetchStatistics();
    }
  }, [debouncedSearchQuery, statusFilter])

  const fetchPermits = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      setError(null)

      let url = `${API_URL}/api/temporary-permits-other-state`
      const params = {
        page,
        limit: pagination.limit,
        search: debouncedSearchQuery
      }

      if (statusFilter !== 'all') {
        // Convert underscore to hyphen for API endpoints
        const filterPath = statusFilter.replace('_', '-')
        url = `${API_URL}/api/temporary-permits-other-state/${filterPath}`
      }

      const response = await axios.get(url, { params })

      if (response.data.success) {
        setPermits(response.data.data || [])
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalRecords: response.data.pagination?.totalRecords || response.data.pagination?.totalItems || 0,
          limit: response.data.pagination?.itemsPerPage || 20
        })
      }
    } catch (error) {
      console.error('Error fetching permits:', error)
      setError('Failed to fetch permits')
      toast.error('Failed to fetch permits')
    } finally {
      setLoading(false)
    }
  }

  const parseDate = (dateStr) => {
    if (!dateStr) return null

    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/')
      return new Date(year, month - 1, day)
    }

    // Handle YYYY-MM-DD format
    if (dateStr.includes('-')) {
      return new Date(dateStr)
    }

    return null
  }

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-700';
      case 'expiring_soon':
        return 'bg-orange-100 text-orange-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'active':
        return 'Active';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handlePageChange = (newPage) => {
    fetchPermits(newPage)
  }

  const handleEditPermit = (permit) => {
    setEditingPermit(permit)
    setShowEditPermitModal(true)
  }

  const handleDeletePermit = async (id) => {
    if (window.confirm('Are you sure you want to delete this permit?')) {
      try {
        await axios.delete(`${API_URL}/api/temporary-permits-other-state/${id}`)
        toast.success('Permit deleted successfully')
        fetchPermits(pagination.currentPage)
      } catch (error) {
        console.error('Error deleting permit:', error)
        toast.error('Failed to delete permit')
      }
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Permits */}
              <div
                onClick={() => setStatusFilter('all')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300 shadow-xl' : 'border-indigo-100'
                }`}
                title={statusFilter === 'all' ? 'Currently showing all permits' : 'Click to show all permits'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total (Other State)</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                    <p className='text-[7px] lg:text-[9px] text-emerald-600 font-bold mt-0.5'>({statistics.active} active)</p>
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
                title={statusFilter === 'expiring_soon' ? 'Click to clear filter' : 'Click to filter expiring permits'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{statistics.expiringSoon}</h3>
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
                title={statusFilter === 'expired' ? 'Click to clear filter' : 'Click to filter expired permits'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expired</p>
                    <h3 className='text-lg lg:text-2xl font-black text-red-600'>{statistics.expired}</h3>
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
                  statusFilter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-300 shadow-xl' : 'border-yellow-100'
                }`}
                title={statusFilter === 'pending' ? 'Click to clear filter' : 'Click to filter pending payments'}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending Payment</p>
                    <h3 className='text-lg lg:text-2xl font-black text-yellow-600'>{statistics.pendingPaymentCount}</h3>
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

          {/* Permits Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            {/* Search and Filters Header */}
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

                {/* New Permit Button */}
                <button
                  onClick={() => setShowIssuePermitModal(true)}
                  className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
                >
                  <span className='flex items-center gap-2'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                    New Permit (Other State)
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className='block lg:hidden'>
              {loading ? (
                <div className='flex flex-col justify-center items-center py-12'>
                  <div className='relative'>
                    <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
                    <div className='absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
                  </div>
                  <p className='text-gray-600 mt-6'>Loading permits...</p>
                </div>
              ) : permits.length > 0 ? (
                <div className='p-3 space-y-3'>
                  {permits.map((permit) => (
                    <div key={permit._id} className='bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden'>
                      {/* Card Header */}
                      <div className='bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-3 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                            {permit.permitHolder?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className='text-xs font-mono font-bold text-gray-900'>{permit.permitNumber}</div>
                            <div className='text-xs text-gray-600 mt-0.5'>{permit.permitHolder || '-'}</div>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <button
                            onClick={() => handleEditPermit(permit)}
                            className='p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all'
                            title='Edit'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePermit(permit._id)}
                            className='p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all'
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
                        {/* Vehicle and Mobile */}
                        <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                          <div className='flex items-center gap-2'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200'>
                              🚗 {permit.vehicleNo}
                            </span>
                          </div>
                          <div className='text-xs text-gray-600 font-medium'>
                            📱 {permit.mobileNo}
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className='grid grid-cols-3 gap-2'>
                          <div className='bg-gray-50 rounded-lg p-2 border border-gray-200'>
                            <div className='text-xs text-gray-500 font-medium mb-0.5'>Total Fee</div>
                            <div className='text-sm font-bold text-gray-900'>₹{(permit.totalFee || 0).toLocaleString('en-IN')}</div>
                          </div>
                          <div className='bg-emerald-50 rounded-lg p-2 border border-emerald-200'>
                            <div className='text-xs text-emerald-600 font-medium mb-0.5'>Paid</div>
                            <div className='text-sm font-bold text-emerald-700'>₹{(permit.paid || 0).toLocaleString('en-IN')}</div>
                          </div>
                          <div className={`rounded-lg p-2 border ${(permit.balance || 0) > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className={`text-xs font-medium mb-0.5 ${(permit.balance || 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>Balance</div>
                            <div className={`text-sm font-bold ${(permit.balance || 0) > 0 ? 'text-orange-700' : 'text-gray-900'}`}>₹{(permit.balance || 0).toLocaleString('en-IN')}</div>
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
                            <div className='text-sm font-bold text-green-900'>{permit.validFrom}</div>
                          </div>
                          <div className='bg-red-50 rounded-lg p-2 border border-red-200'>
                            <div className='text-xs text-red-600 font-medium mb-0.5 flex items-center gap-1'>
                              <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              Valid Till
                            </div>
                            <div className='text-sm font-bold text-red-900'>{permit.validTo}</div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className='flex justify-end pt-1'>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(permit.status)}`}>
                            {getStatusText(permit.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-6'>
                  <div className='flex flex-col items-center justify-center py-12'>
                    <div className='w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
                      <svg className='w-10 h-10 text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                    </div>
                    <h3 className='text-lg font-black text-gray-700 mb-2'>No Permits Found</h3>
                    <p className='text-sm text-gray-500 text-center max-w-xs'>
                      {searchQuery ? 'No permits match your search criteria.' : 'Get started by adding your first permit.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Vehicle No.</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Permit Number</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Permit Holder</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid From</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid Till</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Total Fee (₹)</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Paid (₹)</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Balance (₹)</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Status</th>
                    <th className='px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {loading ? (
                    <tr>
                      <td colSpan='10' className='px-6 py-16'>
                        <div className='flex flex-col justify-center items-center'>
                          <div className='relative'>
                            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
                            <div className='absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
                          </div>
                          <p className='text-gray-600 mt-6'>Loading permits...</p>
                        </div>
                      </td>
                    </tr>
                  ) : permits.length > 0 ? (
                    permits.map((permit) => (
                      <tr key={permit._id} className='hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group'>
                        <td className='px-6 py-5'>
                          <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200'>
                            <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                              <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                              <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                            </svg>
                            {permit.vehicleNo}
                          </span>
                        </td>
                        <td className='px-6 py-5'>
                          <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                            {permit.permitNumber}
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <div className='flex items-center'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                              {permit.permitHolder?.charAt(0) || 'P'}
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                              <div className='text-xs text-gray-500 flex items-center mt-1'>
                                <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                </svg>
                                {permit.mobileNo || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <div className='flex items-center text-[13.8px]'>
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold border border-green-200'>
                              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              {permit.validFrom}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <div className='flex items-center text-[13.8px]'>
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold border border-red-200'>
                              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              {permit.validTo}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <span className='text-sm font-bold text-gray-900'>₹{(permit.totalFee || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td className='px-6 py-5'>
                          <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                            ₹{(permit.paid || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className='px-6 py-5'>
                          {(permit.balance || 0) > 0 ? (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                              ₹{(permit.balance || 0).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                              ₹0
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-5'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(permit.status)}`}>
                            {getStatusText(permit.status)}
                          </span>
                        </td>
                        <td className='px-6 py-5'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={() => handleEditPermit(permit)}
                              className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Edit Permit'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletePermit(permit._id)}
                              className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Delete Permit'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='10' className='px-6 py-16'>
                        <div className='flex flex-col items-center justify-center'>
                          <div className='w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
                            <svg className='w-10 h-10 text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                          </div>
                          <h3 className='text-lg font-black text-gray-700 mb-2'>No Temporary Permits Found</h3>
                          <p className='text-sm text-gray-500 text-center max-w-xs'>
                            {searchQuery ? 'No permits match your search criteria.' : 'Get started by adding your first temporary permit (other state).'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && permits.length > 0 && (
              <div className='px-6 py-4 border-t border-gray-200'>
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
        </div>
      </div>

      {/* Modals */}
      {showIssuePermitModal && (
        <IssueTemporaryPermitOtherStateModal
          onClose={() => setShowIssuePermitModal(false)}
          onPermitIssued={() => {
            setShowIssuePermitModal(false)
            fetchPermits(pagination.currentPage)
          }}
        />
      )}

      {showEditPermitModal && editingPermit && (
        <EditTemporaryPermitOtherStateModal
          permit={editingPermit}
          onClose={() => {
            setShowEditPermitModal(false)
            setEditingPermit(null)
          }}
          onPermitUpdated={() => {
            setShowEditPermitModal(false)
            setEditingPermit(null)
            fetchPermits(pagination.currentPage)
          }}
        />
      )}
    </>
  )
}

export default TemporaryPermitOtherState
