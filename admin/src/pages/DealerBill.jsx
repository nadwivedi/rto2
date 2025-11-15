import { useState, useEffect, lazy, Suspense } from 'react'
import axios from 'axios'
import AddButton from '../components/AddButton'
import SearchBar from '../components/SearchBar'
import { getTheme } from '../context/ThemeContext'

// Lazy load modal for better performance with hover preloading
const AddDealerBillModal = lazy(() => import('../components/AddDealerBillModal'))

// Preload function - Start loading component on hover for instant feel
const preloadAddModal = () => import('../components/AddDealerBillModal')

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
console.log(API_URL);


const DealerBill = () => {
  const theme = getTheme()
  const [dealerBills, setDealerBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [previewBill, setPreviewBill] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const itemsPerPage = 10

  // Fetch dealer bills
  useEffect(() => {
    fetchDealerBills()
  }, [currentPage, searchQuery])

  const fetchDealerBills = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const response = await axios.get(`${API_URL}/api/custom-bills`, { params })

      setDealerBills(response.data.data || [])
      setTotalPages(response.data.pagination?.totalPages || 0)
      setTotalItems(response.data.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching bills:', error)
      setDealerBills([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePreviewBill = (bill) => {
    setPreviewBill(bill)
    setIsPreviewOpen(true)
  }

  const handleDownloadBill = async (billId, billNumber) => {
    try {
      const response = await axios.get(`${API_URL}/api/custom-bills/${billId}/download`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${billNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading bill:', error)
      alert('Failed to download bill. Please try again.')
    }
  }

  const handleDeleteBill = async (billId) => {
    if (!confirm('Are you sure you want to delete this bill?')) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/custom-bills/${billId}`)

      if (response.data.success) {
        alert('Bill deleted successfully')
        fetchDealerBills()
      } else {
        throw new Error(response.data.message || 'Failed to delete bill')
      }
    } catch (error) {
      console.error('Error deleting bill:', error)
      alert('Failed to delete bill. Please try again.')
    }
  }

  const getIncludedItems = (items) => {
    if (!items || !Array.isArray(items)) return []
    return items.map(item => item.description).filter(desc => desc && desc.trim() !== '')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
      <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
        {/* Page Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl md:text-3xl font-black text-gray-800'>Dealer Bills</h1>
              <p className='text-sm text-gray-600 mt-1'>Manage dealer bills for Permit, Fitness, and Registration</p>
            </div>
            <AddButton
              onClick={() => setIsAddModalOpen(true)}
              onMouseEnter={preloadAddModal}
              title='Add Dealer Bill'
            />
          </div>
        </div>

        {/* Add Modal - Lazy Loaded */}
        {isAddModalOpen && (
          <Suspense fallback={null}>
            <AddDealerBillModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSuccess={() => {
                fetchDealerBills()
              }}
            />
          </Suspense>
        )}

        {/* Dealer Bills Table */}
        <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
          <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
            <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center justify-between'>
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                placeholder='Search by bill number or customer name...'
              />

              {/* Total Count */}
              <div className='text-sm font-bold text-gray-700'>
                Total: <span className='text-indigo-600'>{totalItems}</span> bills
              </div>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className={theme.tableHeader}>
                <tr>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Bill Number</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Customer Name</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Items</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Amount</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Date</th>
                  <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan='6' className='px-4 py-8 text-center'>
                      <div className='text-gray-400'>
                        <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                        </svg>
                        <p className='text-sm font-semibold text-gray-600'>Loading bills...</p>
                      </div>
                    </td>
                  </tr>
                ) : dealerBills.length > 0 ? (
                  dealerBills.map((bill) => (
                    <tr key={bill._id} className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 group'>
                      <td className='px-4 py-4'>
                        <div className='text-sm font-mono font-bold text-gray-900 bg-indigo-100 px-3 py-1.5 rounded-lg inline-block border border-indigo-200'>
                          {bill.billNumber || 'N/A'}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='text-sm font-bold text-gray-900'>
                          {bill.customerName || 'N/A'}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex flex-wrap gap-1'>
                          {getIncludedItems(bill.items).map((item, index) => (
                            <div key={index} className='text-xs font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200'>
                              {item}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='text-lg font-bold text-indigo-600'>
                          ₹{bill.totalAmount ? bill.totalAmount.toLocaleString('en-IN') : '0'}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='text-sm text-gray-600'>
                          {bill.billDate || (bill.createdAt ? formatDate(bill.createdAt) : 'N/A')}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center justify-center gap-2'>
                          {/* Preview Button */}
                          <button
                            onClick={() => handlePreviewBill(bill)}
                            className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all'
                            title='Preview Bill'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                            </svg>
                          </button>

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownloadBill(bill._id, bill.billNumber)}
                            className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all'
                            title='Download Bill'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteBill(bill._id)}
                            className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all'
                            title='Delete Bill'
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
                    <td colSpan='6' className='px-4 py-8 text-center'>
                      <div className='text-gray-400'>
                        <svg className='mx-auto h-12 w-12 mb-3 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        <p className='text-sm font-semibold text-gray-600'>No bills found</p>
                        <p className='text-xs text-gray-500 mt-1'>Click "Add Dealer Bill" to create your first bill</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-gray-600'>
                  Page {currentPage} of {totalPages}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {isPreviewOpen && previewBill && (
          <div className='fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
              {/* Header */}
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex justify-between items-center'>
                <div>
                  <h2 className='text-xl font-bold'>Bill Preview - {previewBill.billNumber}</h2>
                  <p className='text-sm text-blue-100 mt-1'>{previewBill.customerName}</p>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>

              {/* PDF Preview */}
              <div className='p-4 bg-gray-100 overflow-auto' style={{ height: 'calc(90vh - 100px)' }}>
                {previewBill.billPdfPath ? (
                  <iframe
                    src={`${API_URL}${previewBill.billPdfPath}`}
                    className='w-full h-full rounded-lg border-2 border-gray-300'
                    title='Bill Preview'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center text-gray-500'>
                      <svg className='mx-auto h-16 w-16 mb-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                      </svg>
                      <p className='text-lg font-semibold'>PDF not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Action Buttons */}
              <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3'>
                <button
                  onClick={() => handleDownloadBill(previewBill._id, previewBill.billNumber)}
                  className='flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className='px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealerBill
