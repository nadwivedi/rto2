import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import AddTaxModal from './components/AddTaxModal'
import AddButton from '../../components/AddButton';
import EditTaxModal from './components/EditTaxModal'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import StatisticsCard from '../../components/StatisticsCard'
import TaxMobileCardView from './components/TaxMobileCardView'
import { getTheme } from '../../context/ThemeContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

import { getStatusColor, getStatusText } from '../../utils/statusUtils';

const Tax = () => {
  const theme = getTheme()
  const [taxRecords, setTaxRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTax, setSelectedTax] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'expiring', 'expired'
  const [initialTaxData, setInitialTaxData] = useState(null) // For pre-filling renewal data
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    pendingPaymentCount: 0,
    pendingPaymentAmount: 0
  })

  // Fetch tax statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tax/statistics`)
      console.log(response);
      
      if (response.data.success) {
        setStatistics({
          total: response.data.data.total,
          active: response.data.data.active,
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

  // Fetch tax records from API
  const fetchTaxRecords = async (page = 1) => {
    setLoading(true);
    let url = `${API_URL}/api/tax`;
    const params = {
      page,
      limit: pagination.limit,
      search: searchQuery,
    };

    if (statusFilter !== 'all') {
      if (statusFilter === 'expiring_soon') {
        url = `${API_URL}/api/tax/expiring-soon`;
      } else if (statusFilter === 'expired') {
        url = `${API_URL}/api/tax/expired`;
      } else if (statusFilter === 'pending') {
        url = `${API_URL}/api/tax/pending-payment`;
      }
    }

    try {
      const response = await axios.get(url, { params });

      if (response.data.success) {
        const transformedRecords = response.data.data.map(record => ({
          id: record._id,
          receiptNo: record.receiptNo,
          vehicleNumber: record.vehicleNumber,
          ownerName: record.ownerName,
          totalAmount: record.totalAmount || 0,
          paidAmount: record.paidAmount || 0,
          balanceAmount: record.balanceAmount || 0,
          taxFrom: record.taxFrom,
          taxTo: record.taxTo,
          status: record.status,
        }));
        setTaxRecords(transformedRecords);

        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalRecords: response.data.pagination.totalRecords,
            limit: pagination.limit,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching tax records:', error);
      toast.error('Failed to fetch tax records. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load tax records and statistics on component mount and when filters change
  useEffect(() => {
    fetchTaxRecords(1); // Reset to page 1 when filters change
    fetchStatistics(); // Fetch fresh statistics
  }, [searchQuery, statusFilter]);

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchTaxRecords(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const handleAddTax = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/tax`, {
        receiptNo: formData.receiptNo,
        vehicleNumber: formData.vehicleNumber,
        ownerName: formData.ownerName,
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        balanceAmount: parseFloat(formData.balance),
        taxFrom: formData.taxFrom,
        taxTo: formData.taxTo
      })

      if (response.data.success) {
        toast.success('Tax record added successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list and statistics from the server
        await fetchTaxRecords()
        await fetchStatistics()
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error adding tax record:', error)
      toast.error('Failed to add tax record. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditTax = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.put(`${API_URL}/api/tax/${selectedTax.id}`, {
        receiptNo: formData.receiptNo,
        vehicleNumber: formData.vehicleNumber,
        ownerName: formData.ownerName,
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        balanceAmount: parseFloat(formData.balance),
        taxFrom: formData.taxFrom,
        taxTo: formData.taxTo
      })

      if (response.data.success) {
        toast.success('Tax record updated successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        // Refresh the list and statistics from the server
        await fetchTaxRecords()
        await fetchStatistics()
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error updating tax record:', error)
      toast.error('Failed to update tax record.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (record) => {
    setSelectedTax(record)
    setIsEditModalOpen(true)
  }

  const handleRenewClick = (record) => {
    // Pre-fill vehicle number and owner name for renewal
    setInitialTaxData({
      vehicleNumber: record.vehicleNumber,
      ownerName: record.ownerName || ''
    })
    setIsAddModalOpen(true)
  }

  // Determine if renew button should be shown for a record
  const shouldShowRenewButton = (record) => {
    const { status } = record;

    // Always show for expiring soon
    if (status === 'expiring_soon') {
      return true
    }

    // For expired records, apply smart logic
    if (status === 'expired') {
      // Check if this vehicle has any active or expiring soon tax
      const hasActiveTax = taxRecords.some((r) => {
        if (r.vehicleNumber === record.vehicleNumber) {
          return r.status === 'active' || r.status === 'expiring_soon'
        }
        return false
      })

      // If vehicle has active tax, don't show renew button on expired records
      if (hasActiveTax) {
        return false
      }

      // Vehicle has no active tax - show renew button only on latest expired record
      const expiredRecordsForVehicle = taxRecords.filter((r) => {
        return r.vehicleNumber === record.vehicleNumber && r.status === 'expired'
      })

      // Find the latest expired record
      let latestExpired = null
      expiredRecordsForVehicle.forEach((r) => {
        if (!latestExpired) {
          latestExpired = r
        } else {
          const currentDate = parseDateString(r.taxTo)
          const latestDate = parseDateString(latestExpired.taxTo)
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

  const handleDeleteTax = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tax record?')) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/tax/${id}`)

      if (response.data.success) {
        toast.success('Tax record deleted successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        await fetchTaxRecords()
        await fetchStatistics()
      } else {
        toast.error(response.data.message || 'Failed to delete tax record', {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      toast.error('Error deleting tax record. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      })
      console.error('Error:', error)
    }
  }

  // Statistics are now fetched from backend, removed useMemo calculation

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              <StatisticsCard
                title='Total Tax Records'
                value={statistics.total}
                color='blue'
                isActive={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='Tax Expiring Soon'
                value={statistics.expiring}
                subtext='Within 15 days'
                color='orange'
                isActive={statusFilter === 'expiring_soon'}
                onClick={() => setStatusFilter(statusFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='Tax Expired'
                value={statistics.expired}
                subtext='expired tax'
                color='red'
                isActive={statusFilter === 'expired'}
                onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                }
              />
              <StatisticsCard
                title='Pending Payment'
                value={statistics.pendingPaymentCount}
                extraValue={`₹${statistics.pendingPaymentAmount.toLocaleString('en-IN')}`}
                color='yellow'
                isActive={statusFilter === 'pending'}
                onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Tax Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                  placeholder='Search by vehicle number...'
                  toUpperCase={true}
                />

                {/* Add Button */}
                <AddButton onClick={() => setIsAddModalOpen(true)} title='Add New Tax Record' />
              </div>

              {/* Results count and filter status */}
              <div className='mt-3 text-xs text-gray-600 font-semibold flex items-center gap-2'>
                {statusFilter !== 'all' && (
                  <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px]'>
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
                    </svg>
                    {statusFilter === 'expiring_soon' && 'Expiring Soon Only'}
                    {statusFilter === 'expired' && 'Expired Only'}
                    {statusFilter === 'pending' && 'Pending Payment Only'}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setStatusFilter('all')
                      }}
                      className='ml-1 hover:bg-blue-200 rounded-full p-0.5'
                    >
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className='p-8 text-center'>
                <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                <p className='mt-4 text-gray-600 font-semibold'>Loading tax records...</p>
              </div>
            )}

            {/* Mobile Card View */}
            <TaxMobileCardView
              taxRecords={taxRecords}
              shouldShowRenewButton={shouldShowRenewButton}
              handleRenewClick={handleRenewClick}
              handleEditClick={handleEditClick}
              handleDeleteTax={handleDeleteTax}
            />

            {/* Desktop Table View */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead className={theme.tableHeader}>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Receipt No</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Owner Name</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Amount (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance (₹)</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Tax From</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Tax To</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                    <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {taxRecords.length > 0 ? (
                    taxRecords.map((record) => (
                      <tr key={record.id} className='hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/50 hover:to-pink-50/50 transition-all duration-200 group'>
                        {/* Receipt No */}
                        <td className='px-4 py-4'>
                          <div className='text-sm font-mono font-bold text-gray-900'>{record.receiptNo}</div>
                        </td>

                        {/* Vehicle Number */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {record.vehicleNumber?.substring(0, 2) || 'V'}
                            </div>
                            <div className='text-[14px] font-semibold text-gray-900'>{record.vehicleNumber}</div>
                          </div>
                        </td>

                        {/* Owner Name */}
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-gray-900'>{record.ownerName || '-'}</div>
                        </td>

                        {/* Total Amount */}
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-gray-800'>₹{(record.totalAmount || 0).toLocaleString('en-IN')}</span>
                        </td>

                        {/* Paid Amount */}
                        <td className='px-4 py-4'>
                          <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                            ₹{(record.paidAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Balance Amount */}
                        <td className='px-4 py-4'>
                          {record.balanceAmount > 0 ? (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                              ₹{record.balanceAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                              ₹0
                            </span>
                          )}
                        </td>

                        {/* Tax From */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-green-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {record.taxFrom}
                          </div>
                        </td>

                        {/* Tax To */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-red-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {record.taxTo}
                          </div>
                        </td>

                        {/* Status */}
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className='px-4 py-4'>
                          <div className='flex items-center justify-end gap-0.5 pr-1'>
                            {/* Renew Button - Smart logic based on vehicle tax status */}
                            {shouldShowRenewButton(record) ? (
                              <button
                                onClick={() => handleRenewClick(record)}
                                className='p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                                title='Renew Tax'
                              >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                </svg>
                              </button>
                            ) : (
                              <div className='w-9'></div>
                            )}
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditClick(record)}
                              className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Edit Record'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteTax(record.id)}
                              className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Delete Record'
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
                      <td colSpan='10' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>No tax records found</p>
                          <p className='text-xs text-gray-500 mt-1'>Click &quot;Add New Tax Record&quot; to add your first record</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && taxRecords.length > 0 && (
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

      {/* Add Tax Modal */}
      <AddTaxModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setInitialTaxData(null) // Clear initial data when closing
        }}
        onSubmit={handleAddTax}
        initialData={initialTaxData}
      />

      {/* Edit Tax Modal */}
      <EditTaxModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditTax}
        tax={selectedTax}
      />
    </>
  )
}

export default Tax
