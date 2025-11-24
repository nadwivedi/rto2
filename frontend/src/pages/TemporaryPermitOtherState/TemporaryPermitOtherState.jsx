import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../../components/Pagination'
import IssueTemporaryPermitOtherStateModal from './components/IssueTemporaryPermitOtherStateModal'
import RenewTemporaryPermitOtherStateModal from './components/RenewTemporaryPermitOtherStateModal'
import EditTemporaryPermitOtherStateModal from './components/EditTemporaryPermitOtherStateModal'
import AddButton from '../../components/AddButton'
import SearchBar from '../../components/SearchBar'
import StatisticsCard from '../../components/StatisticsCard'
import MobileCardView from '../../components/MobileCardView'
import { getTheme, getVehicleNumberDesign } from '../../context/ThemeContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

import { getStatusColor, getStatusText } from '../../utils/statusUtils';
import { getVehicleNumberParts } from '../../utils/vehicleNoCheck';

const TemporaryPermitOtherState = () => {
  const theme = getTheme()
  const vehicleDesign = getVehicleNumberDesign()
  const [permits, setPermits] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showRenewPermitModal, setShowRenewPermitModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [permitToRenew, setPermitToRenew] = useState(null)
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
      const response = await axios.get(`${API_URL}/api/temporary-permits-other-state/statistics`, { withCredentials: true });
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
    fetchPermits(1)
    fetchStatistics();
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

      const response = await axios.get(url, { params, withCredentials: true })

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
        await axios.delete(`${API_URL}/api/temporary-permits-other-state/${id}`, { withCredentials: true })
        toast.success('Permit deleted successfully')
        fetchPermits(pagination.currentPage)
        fetchStatistics()
      } catch (error) {
        console.error('Error deleting permit:', error)
        toast.error('Failed to delete permit')
      }
    }
  }

  // Mark temporary permit (other state) as paid
  const handleMarkAsPaid = async (permit) => {
    const confirmPaid = window.confirm(
      `Are you sure you want to mark this payment as PAID?\n\n` +
      `Permit Number: ${permit.permitNumber}\n` +
      `Vehicle Number: ${permit.vehicleNo}\n` +
      `Total Fee: ₹${(permit.totalFee || 0).toLocaleString('en-IN')}\n` +
      `Current Balance: ₹${(permit.balance || 0).toLocaleString('en-IN')}\n\n` +
      `This will set Paid = ₹${(permit.totalFee || 0).toLocaleString('en-IN')} and Balance = ₹0`
    );

    if (!confirmPaid) return;

    try {
      const response = await axios.patch(`${API_URL}/api/temporary-permits-other-state/${permit._id}/mark-as-paid`, {}, { withCredentials: true });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to mark payment as paid');

      toast.success('Payment marked as paid successfully!', { position: 'top-right', autoClose: 3000 });
      await fetchPermits();
      await fetchStatistics();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error(`Failed to mark payment as paid: ${error.message}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleRenewClick = (permit) => {
    setPermitToRenew(permit)
    setShowRenewPermitModal(true)
  }

  const handleRenewSubmit = async (formData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/temporary-permits-other-state/renew`, {
        oldPermitId: formData.oldPermitId,
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolder,
        vehicleNo: formData.vehicleNo,
        mobileNo: formData.mobileNo,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        totalFee: parseFloat(formData.totalFee),
        paid: parseFloat(formData.paid),
        balance: parseFloat(formData.balance),
        notes: formData.notes
      }, { withCredentials: true })

      if (response.data.success) {
        toast.success('Temporary permit (other state) renewed successfully!', {
          position: 'top-right',
          autoClose: 3000
        })
        setShowRenewPermitModal(false)
        setPermitToRenew(null)
        await fetchPermits()
        await fetchStatistics()
      } else {
        toast.error(`Error: ${response.data.message}`, {
          position: 'top-right',
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error renewing temporary permit (other state):', error)
      toast.error(
        error.response?.data?.message || 'Failed to renew temporary permit (other state).',
        {
          position: 'top-right',
          autoClose: 3000
        }
      )
    } finally {
      setLoading(false)
    }
  }

  // Determine if renew button should be shown for a permit
  const shouldShowRenewButton = (permit) => {
    // Simple logic: show renew button only if not renewed and status is expired or expiring_soon
    return !permit.isRenewed && (permit.status === 'expired' || permit.status === 'expiring_soon')
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              <StatisticsCard
                title='Total (Other State)'
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
                title='Expiring Soon'
                value={statistics.expiringSoon}
                subtext='Within 7 days'
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
                title='Expired'
                value={statistics.expired}
                subtext='expired permit'
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
                // extraValue={`₹${statistics.pendingPaymentAmount.toLocaleString('en-IN')}`}
                color='yellow'
                isActive={statusFilter === 'pending'}
                onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Permits Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            {/* Search and Filters Header */}
            <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                  placeholder='Search by vehicle number...'
                  toUpperCase={true}
                />

                {/* New Permit Button */}
                <AddButton onClick={() => setShowIssuePermitModal(true)} title='New Permit (Other State)' />
              </div>
            </div>

            {/* Mobile Card View */}
            <MobileCardView
              loading={loading}
              records={permits}
              emptyMessage={{
                title: 'No Temporary Permits (Other State) Found',
                description: 'Get started by adding your first permit.',
              }}
              loadingMessage='Loading permits...'
              headerGradient='from-indigo-50 via-purple-50 to-pink-50'
              avatarGradient='from-indigo-500 to-purple-500'
              emptyIconGradient='from-indigo-100 to-purple-100'
              emptyIconColor='text-indigo-400'
              cardConfig={{
                header: {
                  avatar: () => (
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
                    </svg>
                  ),
                  title: (record) => record.permitNumber,
                  subtitle: (record) => record.permitHolder || '-',
                  showVehicleParts: false,
                },
                body: {
                  showStatus: true,
                  showPayment: true,
                  showValidity: true,
                  customFields: [
                    {
                      render: (record, { renderVehicleBadge, getStatusColor, getStatusText }) => (
                        <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                          {renderVehicleBadge(record.vehicleNo)}
                        </div>
                      ),
                    },
                  ],
                },
              }}
              actions={[
                {
                  title: 'Mark as Paid',
                  condition: (permit) => (permit.balance || 0) > 0,
                  onClick: handleMarkAsPaid,
                  bgColor: 'bg-green-100',
                  textColor: 'text-green-600',
                  hoverBgColor: 'bg-green-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  ),
                },
                {
                  title: 'Renew Permit',
                  condition: shouldShowRenewButton,
                  onClick: handleRenewClick,
                  bgColor: 'bg-blue-100',
                  textColor: 'text-blue-600',
                  hoverBgColor: 'bg-blue-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                    </svg>
                  ),
                },
                {
                  title: 'Edit Permit',
                  onClick: handleEditPermit,
                  bgColor: 'bg-green-100',
                  textColor: 'text-green-600',
                  hoverBgColor: 'bg-green-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  ),
                },
                {
                  title: 'Delete Permit',
                  onClick: (permit) => handleDeletePermit(permit._id),
                  bgColor: 'bg-red-100',
                  textColor: 'text-red-600',
                  hoverBgColor: 'bg-red-200',
                  icon: (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                  ),
                },
              ]}
            />

            {/* Desktop Table View */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead className={theme.tableHeader}>
                  <tr>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Vehicle/Permit No.</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Permit Holder</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Valid From</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Valid Till</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Total Fee (₹)</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Paid (₹)</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Balance (₹)</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-left text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Status</th>
                    <th className='px-4 2xl:px-6 py-3 2xl:py-4 text-center text-[10px] 2xl:text-xs font-bold text-white uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {loading ? (
                    <tr>
                      <td colSpan='9' className='px-6 py-16'>
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
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <div className='flex flex-col gap-1 2xl:gap-1.5'>
                            <div>
                              {(() => {
                                const parts = getVehicleNumberParts(permit.vehicleNo)
                                if (!parts) {
                                  return (
                                    <div className='flex items-center gap-1 2xl:gap-1.5'>
                                      <svg className='w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-blue-600 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                                        <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                                        <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                                      </svg>
                                      <span className='text-[13px] 2xl:text-[15px] font-semibold text-gray-900'>{permit.vehicleNo}</span>
                                    </div>
                                  )
                                }
                                return (
                                  <div className={vehicleDesign.container}>

                                     <svg
                                        className="w-3.5 h-5 2xl:w-4 2xl:h-6 mr-0.5 text-blue-800 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                      </svg>

                                    <span className={vehicleDesign.stateCode}>{parts.stateCode}</span>
                                    <span className={vehicleDesign.districtCode}>{parts.districtCode}</span>
                                    <span className={vehicleDesign.series}>{parts.series}</span>
                                    <span className={vehicleDesign.last4Digits}>{parts.last4Digits}</span>
                                  </div>
                                )
                              })()}
                            </div>
                            <div className='flex items-center gap-1 2xl:gap-1.5'>
                              <svg className='w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-indigo-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                              </svg>
                              <span className='text-[11px] 2xl:text-[13px] font-medium text-gray-600'>{permit.permitNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <div className='flex items-center'>
                            <div className='flex-shrink-0 h-8 w-8 2xl:h-10 2xl:w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md text-xs 2xl:text-sm'>
                              {permit.permitHolder?.charAt(0) || 'P'}
                            </div>
                            <div className='ml-2 2xl:ml-4'>
                              <div className='text-[11px] 2xl:text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                              <div className='text-[10px] 2xl:text-xs text-gray-500 flex items-center mt-0.5 2xl:mt-1'>
                                <svg className='w-2.5 h-2.5 2xl:w-3 2xl:h-3 mr-0.5 2xl:mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                </svg>
                                {permit.mobileNo || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <div className='flex items-center text-[11px] 2xl:text-[13.8px]'>
                            <span className='inline-flex items-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold border border-green-200'>
                              <svg className='w-3 h-3 2xl:w-4 2xl:h-4 mr-1 2xl:mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              {permit.validFrom}
                            </span>
                          </div>
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <div className='flex items-center text-[11px] 2xl:text-[13.8px]'>
                            <span className='inline-flex items-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold border border-red-200'>
                              <svg className='w-3 h-3 2xl:w-4 2xl:h-4 mr-1 2xl:mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                              </svg>
                              {permit.validTo}
                            </span>
                          </div>
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <span className='text-[11px] 2xl:text-sm font-bold text-gray-900'>₹{(permit.totalFee || 0).toLocaleString('en-IN')}</span>
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <span className='inline-flex items-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-lg text-[10px] 2xl:text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                            ₹{(permit.paid || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          {(permit.balance || 0) > 0 ? (
                            <span className='inline-flex items-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-lg text-[10px] 2xl:text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                              ₹{(permit.balance || 0).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-lg text-[10px] 2xl:text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                              ₹0
                            </span>
                          )}
                        </td>
                        <td className='px-4 2xl:px-6 py-3 2xl:py-5'>
                          <span className={`inline-flex items-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-full text-[10px] 2xl:text-xs font-bold ${getStatusColor(permit.status)}`}>
                            {getStatusText(permit.status)}
                          </span>
                        </td>
                        <td className='px-1 2xl:px-2 py-3 2xl:py-5'>
                          <div className='flex items-center justify-center gap-1 2xl:gap-2'>

                            {/* mark as paid button */}
                            {(permit.balance || 0) > 0 && (
                              <button
                                onClick={() => handleMarkAsPaid(permit)}
                                className='p-1.5 2xl:p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                                title='Mark as Paid'
                              >
                                <svg className='w-4 h-4 2xl:w-5 2xl:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                              </button>
                            )}

                            {/* renew button */}
                            {shouldShowRenewButton(permit) && (
                              <button
                                onClick={() => handleRenewClick(permit)}
                                className='p-1.5 2xl:p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                                title='Renew Permit'
                              >
                                <svg className='w-4 h-4 2xl:w-5 2xl:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                </svg>
                              </button>
                            )}

                            {/* edit button */}
                            <button
                              onClick={() => handleEditPermit(permit)}

                              className='p-1.5 2xl:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Edit Permit'
                            >
                              <svg className='w-4 h-4 2xl:w-5 2xl:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>

                            {/* delete button */}
                            <button
                              onClick={() => handleDeletePermit(permit._id)}
                              className='p-1.5 2xl:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Delete Permit'
                            >
                              <svg className='w-4 h-4 2xl:w-5 2xl:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

      {/* Modals - Lazy Loaded */}
      {showIssuePermitModal && (
                  <IssueTemporaryPermitOtherStateModal
            onClose={() => setShowIssuePermitModal(false)}
            onPermitIssued={() => {
              setShowIssuePermitModal(false)
              fetchPermits(pagination.currentPage)
              fetchStatistics()
            }}
          />
      )}

      {/* Renew Temporary Permit (Other State) Modal - Lazy Loaded */}
      {showRenewPermitModal && (
                  <RenewTemporaryPermitOtherStateModal
            isOpen={showRenewPermitModal}
            onClose={() => {
              setShowRenewPermitModal(false)
              setPermitToRenew(null)
            }}
            onSubmit={handleRenewSubmit}
            oldPermit={permitToRenew}
          />
      )}

      {/* Edit Modal - Lazy Loaded */}
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
              fetchStatistics()
            }}
          />
      )}
    </>
  )
}

export default TemporaryPermitOtherState
