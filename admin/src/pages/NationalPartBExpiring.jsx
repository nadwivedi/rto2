import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import MobileHeader from '../components/MobileHeader'
import { nationalPermitAPI } from '../services/api'

const NationalPartBExpiring = ({ setIsSidebarOpen }) => {
  const navigate = useNavigate()
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch Part B expiring soon permits from backend
  useEffect(() => {
    fetchPermits()
  }, [currentPage, searchQuery])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage
      }

      const response = await nationalPermitAPI.getPartBExpiringSoon(params)

      console.log('Part B Expiring API Response:', response)

      // Transform backend data to match frontend format
      const transformedData = (response.data || []).map(permit => {
        // Calculate days until Part B expiry
        let daysUntilExpiry = '-'
        try {
          if (permit.typeBAuthorization?.validTo) {
            const parts = permit.typeBAuthorization.validTo.split('-')
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
          authNumber: permit.typeBAuthorization?.authorizationNumber || '-',
          validFrom: permit.typeBAuthorization?.validFrom || '-',
          validTo: permit.typeBAuthorization?.validTo || '-',
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
      setTotalPages(response.pagination?.totalPages || 0)
      setTotalItems(response.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching Part B expiring permits:', error)
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
      permit.authNumber.toLowerCase().includes(searchLower) ||
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
      <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Page Header */}
          <div className='mb-6'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => navigate('/national-permit')}
                className='p-2 hover:bg-white rounded-lg transition-all'
                title='Back to National Permit'
              >
                <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <div>
                <h1 className='text-2xl md:text-3xl font-black text-gray-800'>Part B - Expiring Soon</h1>
                <p className='text-sm text-gray-600 mt-1'>Type B Authorizations expiring within the next 30 days</p>
              </div>
            </div>
          </div>

          {/* Permits Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by permit holder, auth number, vehicle or mobile...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all bg-white shadow-sm'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-purple-600 via-pink-600 to-red-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Details</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Info</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Part B Auth Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid To</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Days Left</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {loading ? (
                    <tr>
                      <td colSpan='7' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>Loading permits...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPermits.length > 0 ? (
                    filteredPermits.map((permit, index) => (
                      <tr key={permit.id} className='hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-pink-50/50 hover:to-red-50/50 transition-all duration-200 group'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
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
                          <div className='text-sm font-mono font-semibold text-gray-900 bg-purple-100 px-3 py-1.5 rounded-lg inline-block border border-purple-200'>
                            {permit.authNumber}
                          </div>
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
                          <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200'>
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
                          <p className='text-sm font-semibold text-gray-600'>No Part B authorizations expiring soon</p>
                          <p className='text-xs text-gray-500 mt-1'>All authorizations are valid for more than 30 days</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className='px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-red-50'>
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
                          : 'bg-white border-2 border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm'
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
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-110'
                                  : 'bg-white border-2 border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm'
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
                          : 'bg-white border-2 border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm'
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

export default NationalPartBExpiring
