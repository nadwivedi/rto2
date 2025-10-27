import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { drivingLicenseAPI } from '../services/api'

const LLExpiring = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch LL expiring soon applications from backend
  useEffect(() => {
    fetchApplications()
  }, [currentPage, searchQuery])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage
      }

      const response = await drivingLicenseAPI.getLLExpiringSoon(params)

      console.log('LL Expiring API Response:', response)

      // Transform backend data to match frontend format
      const transformedData = (response.data || []).map(app => {
        // Safely handle date
        let formattedDate = '-'
        try {
          if (app.createdAt) {
            const d = new Date(app.createdAt)
            const day = String(d.getDate()).padStart(2, '0')
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const year = d.getFullYear()
            formattedDate = `${day}-${month}-${year}`
          }
        } catch (err) {
          console.error('Date parsing error:', err)
        }

        // Format LL expiry date
        let formattedLLExpiryDate = '-'
        try {
          if (app.learningLicenseExpiryDate) {
            const d = new Date(app.learningLicenseExpiryDate)
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0')
              const month = String(d.getMonth() + 1).padStart(2, '0')
              const year = d.getFullYear()
              formattedLLExpiryDate = `${day}-${month}-${year}`
            }
          }
        } catch (err) {
          console.error('LL Expiry date parsing error:', err)
        }

        // Format LL issue date
        let formattedLLIssueDate = '-'
        try {
          if (app.learningLicenseIssueDate) {
            const d = new Date(app.learningLicenseIssueDate)
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0')
              const month = String(d.getMonth() + 1).padStart(2, '0')
              const year = d.getFullYear()
              formattedLLIssueDate = `${day}-${month}-${year}`
            }
          }
        } catch (err) {
          console.error('LL Issue date parsing error:', err)
        }

        // Calculate days until expiry
        let daysUntilExpiry = '-'
        try {
          if (app.learningLicenseExpiryDate) {
            const expiry = new Date(app.learningLicenseExpiryDate)
            const today = new Date()
            const diffTime = expiry - today
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            daysUntilExpiry = diffDays > 0 ? diffDays : 0
          }
        } catch (err) {
          console.error('Days calculation error:', err)
        }

        return {
          id: app._id,
          name: app.name || '-',
          type: app.licenseClass || '-',
          date: formattedDate,
          llNumber: app.learningLicenseNumber || '-',
          llIssueDate: formattedLLIssueDate,
          llExpiryDate: formattedLLExpiryDate,
          daysUntilExpiry,
          totalAmount: app.totalAmount || 0,
          paidAmount: app.paidAmount || 0,
          balanceAmount: app.balanceAmount || 0,
          mobile: app.mobileNumber || '-',
          email: app.email || '-',
          fullData: app
        }
      })

      console.log('Transformed Data:', transformedData)

      setApplications(transformedData)
      setTotalPages(response.pagination?.totalPages || 0)
      setTotalItems(response.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching LL expiring applications:', error)
      toast.error('Failed to fetch learning licenses. Please try again.', { autoClose: 700 })
      setApplications([])
      setTotalPages(0)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  // Filter applications based on search query
  const filteredApplications = applications.filter(app => {
    if (!searchQuery.trim()) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      app.name.toLowerCase().includes(searchLower) ||
      app.llNumber.toLowerCase().includes(searchLower) ||
      app.mobile.toLowerCase().includes(searchLower)
    )
  })

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (app) => {
    setSelectedApplication(app)
    setIsDetailModalOpen(true)
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Page Header */}
          <div className='mb-6'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => navigate('/driving-license')}
                className='p-2 hover:bg-white rounded-lg transition-all'
                title='Back to Driving License'
              >
                <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <div>
                <h1 className='text-2xl md:text-3xl font-black text-gray-800'>Learning Licenses Expiring Soon</h1>
                <p className='text-sm text-gray-600 mt-1'>Learning licenses expiring within the next 30 days</p>
              </div>
            </div>
          </div>

          <ApplicationDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            application={selectedApplication}
          />

          {/* Applications Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by name, LL number or mobile...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm'
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
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Applicant Details</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Class</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>LL Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>LL Issue Date</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>LL Expiry Date</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Days Left</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Amount</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid Amount</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance</th>
                    <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {loading ? (
                    <tr>
                      <td colSpan='10' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>Loading applications...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredApplications.length > 0 ? (
                    filteredApplications.map((app, index) => (
                      <tr key={app.id} className='hover:bg-gradient-to-r hover:from-yellow-50/50 hover:via-orange-50/50 hover:to-red-50/50 transition-all duration-200 group'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {app.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <div className='text-sm font-bold text-gray-900'>{app.name}</div>
                              <div className='text-xs text-gray-500 flex items-center mt-1'>
                                <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                </svg>
                                {app.mobile}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200'>
                            {app.type}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                            {app.llNumber}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-green-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {app.llIssueDate || '-'}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-red-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {app.llExpiryDate || '-'}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                            app.daysUntilExpiry <= 7
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : app.daysUntilExpiry <= 15
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {app.daysUntilExpiry} days
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-gray-800'>₹{app.totalAmount.toLocaleString('en-IN')}</span>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                            ₹{app.paidAmount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          {app.balanceAmount > 0 ? (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                              ₹{app.balanceAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                              ₹0
                            </span>
                          )}
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={() => handleViewDetails(app)}
                              className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='View Details'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='10' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>No learning licenses expiring soon</p>
                          <p className='text-xs text-gray-500 mt-1'>All learning licenses are valid for more than 30 days</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className='px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50'>
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
                          : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
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
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-110'
                                  : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
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
                          : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
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

export default LLExpiring
