import { useState, useEffect } from 'react'
import AddDealerBillModal from '../components/AddDealerBillModal'
import BlankBillModal from '../components/BlankBillModal'

const API_BASE_URL = 'http://localhost:5000/api'

const DealerBill = () => {
  const [dealerBills, setDealerBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBlankBillModalOpen, setIsBlankBillModalOpen] = useState(false)
  const itemsPerPage = 10

  // Fetch dealer bills
  useEffect(() => {
    fetchDealerBills()
  }, [currentPage, searchQuery])

  const fetchDealerBills = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      const response = await fetch(`${API_BASE_URL}/dealer-bills?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dealer bills')
      }

      setDealerBills(data.data || [])
      setTotalPages(data.pagination?.totalPages || 0)
      setTotalItems(data.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching dealer bills:', error)
      setDealerBills([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDownloadBill = async (billId, billNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dealer-bills/${billId}/download-bill-pdf`)

      if (!response.ok) {
        throw new Error('Failed to download bill')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
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
    if (!confirm('Are you sure you want to delete this dealer bill?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/dealer-bills/${billId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete dealer bill')
      }

      alert('Dealer bill deleted successfully')
      fetchDealerBills()
    } catch (error) {
      console.error('Error deleting dealer bill:', error)
      alert('Failed to delete dealer bill. Please try again.')
    }
  }

  const getIncludedItems = (items) => {
    const includedList = []
    if (items.permit && items.permit.isIncluded) {
      includedList.push('Permit')
    }
    if (items.fitness && items.fitness.isIncluded) {
      includedList.push('Fitness')
    }
    if (items.vehicleRegistration && items.vehicleRegistration.isIncluded) {
      includedList.push('Vehicle Registration')
    }
    if (items.temporaryRegistration && items.temporaryRegistration.isIncluded) {
      includedList.push('Temporary Registration')
    }
    return includedList
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    }
    return statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-200'
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
            <div className='flex gap-3'>
              <button
                onClick={() => setIsBlankBillModalOpen(true)}
                className='px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                Blank Bill
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center gap-2'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                Add Dealer Bill
              </button>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <AddDealerBillModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchDealerBills()
          }}
        />

        {/* Blank Bill Modal */}
        <BlankBillModal
          isOpen={isBlankBillModalOpen}
          onClose={() => setIsBlankBillModalOpen(false)}
          onSuccess={() => {
            fetchDealerBills()
          }}
        />

        {/* Dealer Bills Table */}
        <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
          <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
            <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center justify-between'>
              {/* Search Bar */}
              <div className='relative flex-1 lg:max-w-md'>
                <input
                  type='text'
                  placeholder='Search by bill number or customer name...'
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

              {/* Total Count */}
              <div className='text-sm font-bold text-gray-700'>
                Total: <span className='text-indigo-600'>{totalItems}</span> bills
              </div>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                <tr>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Bill Number</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Customer Name</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Included Items</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Fees</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Payment Status</th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Date</th>
                  <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan='7' className='px-4 py-8 text-center'>
                      <div className='text-gray-400'>
                        <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                        </svg>
                        <p className='text-sm font-semibold text-gray-600'>Loading dealer bills...</p>
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
                          ₹{bill.totalFees ? bill.totalFees.toLocaleString('en-IN') : '0'}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getPaymentStatusBadge(bill.paymentStatus)}`}>
                          {bill.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='text-sm text-gray-600'>
                          {bill.createdAt ? formatDate(bill.createdAt) : 'N/A'}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center justify-center gap-2'>
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
                    <td colSpan='7' className='px-4 py-8 text-center'>
                      <div className='text-gray-400'>
                        <svg className='mx-auto h-12 w-12 mb-3 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                        <p className='text-sm font-semibold text-gray-600'>No dealer bills found</p>
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
      </div>
    </div>
  )
}

export default DealerBill
