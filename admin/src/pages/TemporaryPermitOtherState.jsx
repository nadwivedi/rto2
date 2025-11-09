import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../components/Pagination'
import IssueTemporaryPermitOtherStateModal from '../components/IssueTemporaryPermitOtherStateModal'
import EditTemporaryPermitOtherStateModal from '../components/EditTemporaryPermitOtherStateModal'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const TemporaryPermitOtherState = () => {
  const [permits, setPermits] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })

  // Fetch permits from backend
  useEffect(() => {
    fetchPermits(1)
  }, [])

  const fetchPermits = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await axios.get(`${API_URL}/api/temporary-permits-other-state`, {
        params: Object.fromEntries(params)
      })

      if (response.data.success) {
        setPermits(response.data.data || [])
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalRecords: response.data.pagination?.totalItems || 0,
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

  const filteredPermits = useMemo(() => {
    return permits.filter(permit =>
      permit.permitNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.permitHolder?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.vehicleNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.mobileNo?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [permits, searchQuery])

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-2'>
                Temporary Permit (Other State)
              </h1>
              <p className='text-gray-600 text-lg'>Manage temporary permits for vehicles from other states</p>
            </div>
            <button
              onClick={() => setShowIssuePermitModal(true)}
              className='px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold cursor-pointer transform hover:scale-105 flex items-center gap-2 justify-center'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Issue New Permit
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className='mb-6'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search by permit number, vehicle number, holder name, or mobile...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full px-5 py-4 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-700 font-medium shadow-sm'
            />
            <svg className='w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='flex items-center justify-center py-20'>
            <div className='text-center'>
              <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-gray-600 font-medium'>Loading permits...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-6 mb-6'>
            <div className='flex items-center gap-3'>
              <svg className='w-6 h-6 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <p className='text-red-800 font-medium'>{error}</p>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && !error && (
          <div className='hidden lg:block overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200'>
            <table className='w-full'>
              <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                <tr>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Number</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Holder</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle No.</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Mobile No.</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid Till</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Fee (₹)</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid (₹)</th>
                  <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance (₹)</th>
                  <th className='px-5 py-4 text-right text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {filteredPermits.length > 0 ? (
                  filteredPermits.map((permit) => (
                    <tr key={permit._id} className='hover:bg-gradient-to-r hover:from-blue-50/70 hover:via-indigo-50/70 hover:to-purple-50/70 transition-all duration-200 group border-b border-gray-100'>
                      <td className='px-5 py-4'>
                        <div className='text-sm font-mono font-semibold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-200 shadow-sm'>
                          {permit.permitNumber}
                        </div>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                      </td>
                      <td className='px-5 py-4'>
                        <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-sm'>
                          {permit.vehicleNo}
                        </span>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='text-sm text-gray-700 font-medium'>{permit.mobileNo}</div>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex items-center text-sm text-gray-700 font-medium whitespace-nowrap'>
                          <svg className='w-4 h-4 mr-2 text-green-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {permit.validFrom}
                        </div>
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex items-center text-sm text-gray-700 font-medium whitespace-nowrap'>
                          <svg className='w-4 h-4 mr-2 text-red-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {permit.validTo}
                        </div>
                      </td>
                      <td className='px-5 py-4'>
                        <span className='text-sm font-bold text-gray-900'>₹{(permit.totalFee || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className='px-5 py-4'>
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'>
                          ₹{(permit.paid || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className='px-5 py-4'>
                        {(permit.balance || 0) > 0 ? (
                          <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 shadow-sm'>
                            ₹{(permit.balance || 0).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200'>
                            ₹0
                          </span>
                        )}
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleEditPermit(permit)}
                            className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:shadow-md duration-200 flex-shrink-0 hover:scale-105'
                            title='Edit Permit'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePermit(permit._id)}
                            className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:shadow-md duration-200 flex-shrink-0 hover:scale-105'
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
                        <div className='w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg'>
                          <svg className='w-12 h-12 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                        </div>
                        <h3 className='text-xl font-black text-gray-700 mb-2'>No Permits Found</h3>
                        <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                          {searchQuery ? 'No permits match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first temporary permit (other state).'}
                        </p>
                        {!searchQuery && (
                          <button
                            onClick={() => setShowIssuePermitModal(true)}
                            className='px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold cursor-pointer transform hover:scale-105 flex items-center gap-2'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                            </svg>
                            Add First Permit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredPermits.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalRecords={pagination.totalRecords}
            itemsPerPage={pagination.limit}
          />
        )}
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
