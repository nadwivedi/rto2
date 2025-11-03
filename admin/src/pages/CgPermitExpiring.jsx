import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const CgPermitExpiring = () => {
  const navigate = useNavigate()
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch expiring soon permits from backend
  useEffect(() => {
    fetchPermits()
  }, [currentPage, searchQuery])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        days: 30
      }

      const response = await axios.get(`${API_URL}/api/cg-permits/expiring`, { params })

      console.log('CG Expiring API Response:', response.data)

      // Transform backend data to match frontend format
      const transformedData = (response.data.data || []).map(permit => {
        // Calculate days until expiry
        let daysUntilExpiry = '-'
        try {
          if (permit.validTo) {
            const parts = permit.validTo.split(/[-/]/)
            if (parts.length === 3) {
              const expiryDate = new Date(parts[2], parts[1] - 1, parts[0])
              const today = new Date()
              const diffTime = expiryDate - today
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              daysUntilExpiry = diffDays > 0 ? diffDays : 0
            }
          }
        } catch (err) {
          console.error('Days calculation error:', err)
        }

        return {
          id: permit._id,
          permitNumber: permit.permitNumber || '-',
          permitHolder: permit.permitHolder || '-',
          vehicleNumber: permit.vehicleNumber || '-',
          validFrom: permit.validFrom || '-',
          validTo: permit.validTo || '-',
          daysUntilExpiry,
          fees: permit.fees || 0,
          mobile: permit.mobileNumber || '-',
          email: permit.email || '-',
          vehicleType: permit.vehicleType || '-',
          status: permit.status || '-',
          fullData: permit
        }
      })

      console.log('Transformed Data:', transformedData)

      setPermits(transformedData)
      setTotalPages(response.data.pagination?.totalPages || 0)
      setTotalItems(response.data.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching CG expiring permits:', error)
      toast.error('Failed to fetch permits. Please try again.', { autoClose: 700 })
      setPermits([])
      setTotalPages(0)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  // Filter permits based on search query
  const filteredPermits = permits.filter(permit => {
    if (!searchQuery.trim()) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      permit.permitHolder.toLowerCase().includes(searchLower) ||
      permit.permitNumber.toLowerCase().includes(searchLower) ||
      permit.vehicleNumber.toLowerCase().includes(searchLower) ||
      permit.mobile.toLowerCase().includes(searchLower)
    )
  })

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Page Header */}
          <div className='mb-6'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => navigate('/cg-permit')}
                className='p-2 hover:bg-white rounded-lg transition-all'
                title='Back to CG Permit'
              >
                <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <div>
                <h1 className='text-2xl md:text-3xl font-black text-gray-800'>CG Permits - Expiring Soon</h1>
                <p className='text-sm text-gray-600 mt-1'>CG Permits expiring within the next 30 days</p>
              </div>
            </div>
          </div>

          {/* Permits Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by permit holder, number, vehicle or mobile...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all bg-white shadow-sm'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className='block lg:hidden'>
              {loading ? (
                <div className='p-6 text-center'>
                  <div className='text-gray-400'>
                    <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    <p className='text-sm font-semibold text-gray-600'>Loading permits...</p>
                  </div>
                </div>
              ) : filteredPermits.length > 0 ? (
                <div className='p-3 space-y-3'>
                  {filteredPermits.map((permit) => (
                    <div key={permit.id} className='bg-white rounded-xl shadow-md border-2 border-orange-200 overflow-hidden hover:shadow-lg transition-shadow'>
                      {/* Card Header with Avatar and Days Left Badge */}
                      <div className='bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-3 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                            {permit.permitHolder?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className='text-xs font-mono font-bold text-gray-900'>{permit.permitNumber}</div>
                            <div className='text-xs text-gray-600 mt-0.5'>{permit.permitHolder}</div>
                            <div className='text-xs text-gray-500 flex items-center mt-1'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                              </svg>
                              {permit.mobile}
                            </div>
                          </div>
                        </div>
                        {/* Days Left Badge */}
                        <div className='flex-shrink-0'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                            permit.daysUntilExpiry <= 7
                              ? 'bg-red-100 text-red-700 border-2 border-red-300'
                              : permit.daysUntilExpiry <= 15
                              ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                              : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                          }`}>
                            {permit.daysUntilExpiry} days
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className='p-3 space-y-2.5'>
                        {/* Vehicle Info */}
                        <div className='bg-blue-50 rounded-lg p-2 border border-blue-200'>
                          <div className='text-xs text-blue-600 font-medium mb-0.5'>Vehicle Details</div>
                          <div className='flex items-center justify-between'>
                            <div className='text-sm font-mono font-bold text-gray-900'>{permit.vehicleNumber}</div>
                            <div className='text-xs font-semibold text-gray-600'>{permit.vehicleType}</div>
                          </div>
                        </div>

                        {/* Validity Period */}
                        <div className='grid grid-cols-2 gap-2'>
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
                              Valid To
                            </div>
                            <div className='text-sm font-bold text-red-900'>{permit.validTo}</div>
                          </div>
                        </div>

                        {/* Fees and Status */}
                        <div className='flex items-center justify-between pt-1 border-t border-gray-100'>
                          <div className='flex items-center gap-2'>
                            <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            <span className='text-sm font-bold text-gray-800'>₹{permit.fees.toLocaleString('en-IN')}</span>
                          </div>
                          <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                            {permit.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-6 text-center'>
                  <div className='flex flex-col items-center justify-center py-12'>
                    <div className='w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
                      <svg className='w-10 h-10 text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <h3 className='text-lg font-black text-gray-700 mb-2'>No CG permits expiring soon</h3>
                    <p className='text-sm text-gray-500 text-center max-w-xs'>
                      All permits are valid for more than 30 days
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Details</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Info</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid To</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Days Left</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Fees</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {loading ? (
                    <tr>
                      <td colSpan='7' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>Loading permits...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPermits.length > 0 ? (
                    filteredPermits.map((permit, index) => (
                      <tr key={permit.id} className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 group'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {permit.permitHolder?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                              <div className='text-xs text-gray-500 font-mono mt-0.5'>{permit.permitNumber}</div>
                              <div className='text-xs text-gray-500 flex items-center mt-1'>
                                <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                </svg>
                                {permit.mobile}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-mono font-semibold text-gray-900'>{permit.vehicleNumber}</div>
                          <div className='text-xs text-gray-500 mt-0.5'>{permit.vehicleType}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-green-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {permit.validFrom}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-red-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {permit.validTo}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                            permit.daysUntilExpiry <= 7
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : permit.daysUntilExpiry <= 15
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {permit.daysUntilExpiry} days
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-gray-800'>₹{permit.fees.toLocaleString('en-IN')}</span>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                            {permit.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='7' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>No CG permits expiring soon</p>
                          <p className='text-xs text-gray-500 mt-1'>All permits are valid for more than 30 days</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className='px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                  <div className='text-sm font-bold text-gray-700'>
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className='flex gap-1.5'>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                currentPage === pageNumber
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110'
                                  : 'bg-white border-2 border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className='px-2 py-2 text-gray-400 font-bold text-sm'>...</span>
                        }
                        return null
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CgPermitExpiring
