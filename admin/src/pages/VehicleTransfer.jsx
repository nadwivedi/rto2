import { useState, useMemo, useEffect } from 'react'
import AddVehicleTransferModal from '../components/AddVehicleTransferModal'
import Pagination from '../components/Pagination'

const VehicleTransfer = () => {
  const [transfers, setTransfers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  })
  const [statistics, setStatistics] = useState({
    total: 0,
    pendingPayments: 0,
    pendingPaymentAmount: 0
  })

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

  // Fetch transfers from API
  useEffect(() => {
    fetchTransfers(1)
    fetchStatistics()
  }, [searchTerm])

  const fetchTransfers = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/vehicle-transfers?page=${page}&limit=${pagination.limit}&search=${searchTerm}`)
      const data = await response.json()

      if (data.success) {
        setTransfers(data.data)
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.page,
            totalPages: data.pagination.pages,
            total: data.pagination.total,
            limit: pagination.limit
          })
        }
      }
    } catch (error) {
      console.error('Error fetching transfers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vehicle-transfers/statistics`)
      const data = await response.json()

      if (data.success) {
        // Calculate pending payment amount
        const transfersResponse = await fetch(`${API_URL}/api/vehicle-transfers`)
        const transfersData = await transfersResponse.json()

        let pendingAmount = 0
        if (transfersData.success) {
          pendingAmount = transfersData.data
            .filter(t => t.balance > 0)
            .reduce((sum, t) => sum + t.balance, 0)
        }

        setStatistics({
          ...data.data,
          pendingPaymentAmount: pendingAmount
        })
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handlePageChange = (newPage) => {
    fetchTransfers(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredTransfers = useMemo(() => {
    return transfers
  }, [transfers])

  const handleAddNew = () => {
    setEditData(null)
    setShowModal(true)
  }

  const handleEdit = (transfer) => {
    setEditData(transfer)
    setShowModal(true)
  }

  const handleSuccess = () => {
    // Refresh transfers list and statistics
    fetchTransfers()
    fetchStatistics()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transfer?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/vehicle-transfers/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchTransfers()
        fetchStatistics()
        alert('Transfer deleted successfully')
      } else {
        alert(data.message || 'Failed to delete transfer')
      }
    } catch (error) {
      console.error('Error deleting transfer:', error)
      alert('Error deleting transfer')
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Transfers */}
              <div className='bg-white rounded-lg shadow-md border border-gray-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Transfers</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Payments */}
              <div className='bg-white rounded-lg shadow-md border border-orange-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending Payments</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{statistics.pendingPayments}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfers Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by vehicle no, owner...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-white shadow-sm uppercase'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-400'
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
                    className='px-4 py-3 text-sm border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-white shadow-sm font-semibold text-gray-700 cursor-pointer hover:border-teal-300'
                  >
                    <option value='table'>Table View</option>
                    <option value='card'>Card View</option>
                  </select>
                </div>

                {/* New Transfer Button */}
                <button
                  onClick={handleAddNew}
                  className='px-4 lg:px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  <span className='hidden lg:inline'>New Transfer</span>
                  <span className='lg:hidden'>New</span>
                </button>
              </div>

              {/* Results count */}
              <div className='mt-3 text-xs text-gray-600 font-semibold'>
                Showing {filteredTransfers.length} of {pagination.total} transfers
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className='p-8 text-center'>
                <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600'></div>
                <p className='mt-4 text-gray-600 font-semibold'>Loading vehicle transfers...</p>
              </div>
            )}

            {/* Mobile Card View */}
            <div className='block lg:hidden'>
              {!loading && filteredTransfers.length > 0 ? (
                <div className='p-3 space-y-3'>
                  {filteredTransfers.map((transfer) => (
                    <div key={transfer._id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                      {/* Card Header */}
                      <div className='bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 p-3 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                            </svg>
                          </div>
                          <div>
                            <div className='text-sm font-mono font-bold text-gray-900'>{transfer.vehicleNumber}</div>
                            <div className='text-xs text-gray-600'>Vehicle Transfer</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-1.5'>
                          <button
                            onClick={() => handleEdit(transfer)}
                            className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                            title='Edit'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(transfer._id)}
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
                        {/* Transfer Date */}
                        <div className='flex items-center justify-between pb-2 border-b border-gray-100'>
                          <span className='text-xs text-gray-500 font-semibold uppercase'>Transfer Date</span>
                          <span className='text-xs font-semibold text-gray-700'>{transfer.transferDate}</span>
                        </div>

                        {/* Ownership Transfer */}
                        <div className='bg-gray-50 rounded-lg p-2'>
                          <p className='text-[10px] text-gray-500 font-semibold uppercase mb-1'>Ownership Transfer</p>
                          <div className='flex items-center gap-2'>
                            <div className='flex-1'>
                              <p className='text-xs font-semibold text-gray-900'>{transfer.currentOwnerName}</p>
                              <p className='text-[10px] text-gray-500'>Current Owner</p>
                            </div>
                            <svg className='w-4 h-4 text-teal-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                            </svg>
                            <div className='flex-1'>
                              <p className='text-xs font-semibold text-teal-700'>{transfer.newOwnerName}</p>
                              <p className='text-[10px] text-teal-600'>New Owner</p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-100'>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase'>Total Fee</p>
                            <p className='text-sm font-bold text-gray-800'>₹{(transfer.totalFee || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase'>Paid</p>
                            <p className='text-sm font-bold text-emerald-600'>₹{(transfer.paid || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase'>Balance</p>
                            <p className={`text-sm font-bold ${transfer.balance > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                              ₹{(transfer.balance || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Payment Status Badge */}
                        {transfer.balance > 0 ? (
                          <div className='flex items-center justify-center'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                              Pending Payment
                            </span>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                              </svg>
                              Fully Paid
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loading && (
                <div className='p-8 text-center'>
                  <div className='text-gray-400'>
                    <svg className='mx-auto h-12 w-12 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <p className='text-sm font-semibold text-gray-600'>No vehicle transfers found</p>
                    <p className='text-xs text-gray-500 mt-1'>Click "New" to add your first transfer</p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            {viewMode === 'table' && (
              <div className='hidden lg:block overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600'>
                    <tr>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle No</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Old Owner</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>New Owner</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Transfer Date</th>
                      <th className='px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wide bg-white/10'>Total Fee</th>
                      <th className='px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wide bg-white/10'>Paid</th>
                      <th className='px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wide bg-white/10'>Balance</th>
                      <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Payment Status</th>
                      <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {!loading && filteredTransfers.length > 0 ? (
                      filteredTransfers.map((transfer) => (
                        <tr key={transfer._id} className='hover:bg-gradient-to-r hover:from-teal-50/50 hover:via-cyan-50/50 hover:to-blue-50/50 transition-all duration-200 group'>
                          {/* Vehicle Number */}
                          <td className='px-4 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md text-xs'>
                                {transfer.vehicleNumber?.substring(0, 2) || 'V'}
                              </div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{transfer.vehicleNumber}</div>
                            </div>
                          </td>

                          {/* Old Owner */}
                          <td className='px-4 py-4'>
                            <div>
                              <div className='text-sm font-semibold text-gray-900'>{transfer.currentOwnerName}</div>
                              <div className='text-xs text-gray-500 mt-0.5'>Previous Owner</div>
                            </div>
                          </td>

                          {/* New Owner */}
                          <td className='px-4 py-4'>
                            <div>
                              <div className='text-sm font-semibold text-teal-700'>{transfer.newOwnerName}</div>
                              <div className='text-xs text-teal-600 mt-0.5 flex items-center gap-1'>
                                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                </svg>
                                Current Owner
                              </div>
                            </div>
                          </td>

                          {/* Transfer Date */}
                          <td className='px-4 py-4'>
                            <div className='flex items-center text-sm text-gray-700 font-semibold'>
                              <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              {transfer.transferDate}
                            </div>
                          </td>

                          {/* Total Fee */}
                          <td className='px-4 py-4 bg-gray-50/50 group-hover:bg-purple-50/30'>
                            <div className='text-right'>
                              <div className='text-sm font-bold text-gray-900'>₹{(transfer.totalFee || 0).toLocaleString('en-IN')}</div>
                              <div className='text-xs text-gray-500 mt-0.5'>Total Amount</div>
                            </div>
                          </td>

                          {/* Paid */}
                          <td className='px-4 py-4 bg-gray-50/50 group-hover:bg-emerald-50/30'>
                            <div className='text-right'>
                              <div className='text-sm font-bold text-emerald-600'>₹{(transfer.paid || 0).toLocaleString('en-IN')}</div>
                              <div className='text-xs text-emerald-600 mt-0.5'>Paid Amount</div>
                            </div>
                          </td>

                          {/* Balance */}
                          <td className={`px-4 py-4 bg-gray-50/50 ${transfer.balance > 0 ? 'group-hover:bg-amber-50/30' : 'group-hover:bg-gray-50'}`}>
                            <div className='text-right'>
                              <div className={`text-sm font-bold ${transfer.balance > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                                ₹{(transfer.balance || 0).toLocaleString('en-IN')}
                              </div>
                              <div className={`text-xs mt-0.5 ${transfer.balance > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                                {transfer.balance > 0 ? 'Pending' : 'Cleared'}
                              </div>
                            </div>
                          </td>

                          {/* Payment Status Badge */}
                          <td className='px-4 py-4 text-center'>
                            {transfer.balance > 0 ? (
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

                          {/* Actions */}
                          <td className='px-4 py-4'>
                            <div className='flex items-center justify-center gap-2'>
                              <button
                                onClick={() => handleEdit(transfer)}
                                className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                                title='Edit Transfer'
                              >
                                <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(transfer._id)}
                                className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-200 cursor-pointer group'
                                title='Delete Transfer'
                              >
                                <svg className='w-5 h-5 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : !loading && (
                      <tr>
                        <td colSpan='9' className='px-4 py-8 text-center'>
                          <div className='text-gray-400'>
                            <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            <p className='text-sm font-semibold text-gray-600'>No vehicle transfers found</p>
                            <p className='text-xs text-gray-500 mt-1'>Click &quot;New Transfer&quot; to add your first record</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Desktop Card View - Similar to Mobile but in Grid */}
            {viewMode === 'card' && (
              <div className='hidden lg:block'>
                {!loading && filteredTransfers.length > 0 ? (
                  <div className='p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {filteredTransfers.map((transfer) => (
                      <div key={transfer._id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                        {/* Card content similar to mobile view */}
                        <div className='bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 p-3 flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                              </svg>
                            </div>
                            <div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{transfer.vehicleNumber}</div>
                              <div className='text-xs text-gray-600'>Vehicle Transfer</div>
                            </div>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <button
                              onClick={() => handleEdit(transfer)}
                              className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                              title='Edit'
                            >
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(transfer._id)}
                              className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                              title='Delete'
                            >
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className='p-3 space-y-2.5'>
                          <div className='flex items-center justify-between pb-2 border-b border-gray-100'>
                            <span className='text-xs text-gray-500 font-semibold uppercase'>Transfer Date</span>
                            <span className='text-xs font-semibold text-gray-700'>{transfer.transferDate}</span>
                          </div>
                          <div className='bg-gray-50 rounded-lg p-2'>
                            <p className='text-[10px] text-gray-500 font-semibold uppercase mb-1'>Ownership Transfer</p>
                            <div className='flex items-center gap-2'>
                              <div className='flex-1'>
                                <p className='text-xs font-semibold text-gray-900'>{transfer.currentOwnerName}</p>
                                <p className='text-[10px] text-gray-500'>Current Owner</p>
                              </div>
                              <svg className='w-4 h-4 text-teal-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                              </svg>
                              <div className='flex-1'>
                                <p className='text-xs font-semibold text-teal-700'>{transfer.newOwnerName}</p>
                                <p className='text-[10px] text-teal-600'>New Owner</p>
                              </div>
                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-100'>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Total Fee</p>
                              <p className='text-sm font-bold text-gray-800'>₹{(transfer.totalFee || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Paid</p>
                              <p className='text-sm font-bold text-emerald-600'>₹{(transfer.paid || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Balance</p>
                              <p className={`text-sm font-bold ${transfer.balance > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                                ₹{(transfer.balance || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          {transfer.balance > 0 ? (
                            <div className='flex items-center justify-center'>
                              <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200'>
                                <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                                Pending Payment
                              </span>
                            </div>
                          ) : (
                            <div className='flex items-center justify-center'>
                              <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                                <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                </svg>
                                Fully Paid
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loading && (
                  <div className='p-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-sm font-semibold text-gray-600'>No vehicle transfers found</p>
                      <p className='text-xs text-gray-500 mt-1'>Click &quot;New Transfer&quot; to add your first record</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredTransfers.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalRecords={pagination.total}
                itemsPerPage={pagination.limit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddVehicleTransferModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditData(null)
        }}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </>
  )
}

export default VehicleTransfer
