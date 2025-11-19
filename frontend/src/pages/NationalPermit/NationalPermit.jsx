import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getDaysRemaining, parseFormattedDate } from '../../utils/dateHelpers'
import Pagination from '../../components/Pagination'
import IssueNewPermitModal from './components/IssueNewPermitModal'
import EditNationalPermitModal from './components/EditNationalPermitModal'
import RenewPartBModal from './components/RenewPartBModal'
import RenewPartAModal from './components/RenewPartAModal'
import NationalPermitDetailsModal from './components/NationalPermitDetailsModal'
import AddButton from '../../components/AddButton'
import SearchBar from '../../components/SearchBar'
import StatisticsCard from '../../components/StatisticsCard'
import MobileCardView from '../../components/MobileCardView'
import { getTheme, getVehicleNumberDesign } from '../../context/ThemeContext'
import { getVehicleNumberParts } from '../../utils/vehicleNoCheck'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const NationalPermit = () => {
  const theme = getTheme()
  const vehicleDesign = getVehicleNumberDesign()
  const [permits, setPermits] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [showRenewPartBModal, setShowRenewPartBModal] = useState(false)
  const [showRenewPartAModal, setShowRenewPartAModal] = useState(false)
  const [renewingPermit, setRenewingPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'partAExpiring', 'partBExpiring', 'pending'
  const [partAExpiringCount, setPartAExpiringCount] = useState(0)
  const [partBExpiringCount, setPartBExpiringCount] = useState(0)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })

  // Helper function to check if Part B is expiring soon or expired
  const isPartBExpiringSoon = (expiryDate, daysThreshold = 30) => {
    if (!expiryDate || expiryDate === 'N/A') return false

    const expiry = parseFormattedDate(expiryDate)
    if (!expiry) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    // Show button if expired (daysRemaining < 0) OR expiring within threshold
    return daysRemaining <= daysThreshold
  }

  // Helper function to check if Part A is expiring soon or expired
  const isPartAExpiringSoon = (expiryDate, daysThreshold = 60) => {
    if (!expiryDate || expiryDate === 'N/A') return false

    const expiry = parseFormattedDate(expiryDate)
    if (!expiry) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    // Show button if expired (daysRemaining < 0) OR expiring within threshold
    return daysRemaining <= daysThreshold
  }

  // Fetch permits from backend on component mount and when filters change
  useEffect(() => {
    fetchPermits(1)
  }, [dateFilter]) // Re-fetch when filters change

  // Fetch expiring counts on component mount
  useEffect(() => {
    fetchExpiringCounts()
  }, [])

  const fetchExpiringCounts = async () => {
    try {
      console.log('Fetching National Permit expiring counts...')

      // Fetch Part A expiring count
      const partAResponse = await axios.get(`${API_URL}/api/national-permits/part-a-expiring-soon`, {
        params: { page: 1, limit: 1 },
        withCredentials: true
      })
      console.log('Part A Response:', partAResponse.data)
      const partACount = partAResponse.data.pagination?.totalItems || 0
      console.log('Part A Count:', partACount)
      setPartAExpiringCount(partACount)

      // Fetch Part B expiring count
      const partBResponse = await axios.get(`${API_URL}/api/national-permits/part-b-expiring-soon`, {
        params: { page: 1, limit: 1 },
        withCredentials: true
      })
      console.log('Part B Response:', partBResponse.data)
      const partBCount = partBResponse.data.pagination?.totalItems || 0
      console.log('Part B Count:', partBCount)
      setPartBExpiringCount(partBCount)

      console.log('National Permit expiring counts updated - Part A:', partACount, 'Part B:', partBCount)
    } catch (error) {
      console.error('Error fetching National Permit expiring counts:', error)
      setPartAExpiringCount(0)
      setPartBExpiringCount(0)
    }
  }

  const fetchPermits = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pagination.limit.toString())

      if (dateFilter && dateFilter !== 'All') {
        params.append('dateFilter', dateFilter)
      }

      const response = await axios.get(`${API_URL}/api/national-permits`, {
        params: Object.fromEntries(params),
        withCredentials: true
      })

      // Update pagination info
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalRecords: response.data.pagination.totalItems,
          limit: pagination.limit
        })
      }

      // Transform backend data to match frontend structure
      const transformedPermits = response.data.data.map(permitObj => {
        // New structure: response contains { partA, partB, vehicleNumber, permitNumber }
        const partA = permitObj.partA
        const partB = permitObj.partB
        const billData = partA?.bill

        return {
          id: partA?._id || permitObj._id,
          permitNumber: partA?.permitNumber || permitObj.permitNumber,
          permitHolder: partA?.permitHolder,
          vehicleNo: partA?.vehicleNumber || permitObj.vehicleNumber || 'N/A',
          issueDate: partA?.createdAt,
          validTill: partA?.validTo,
          status: partA?.status,
          totalFee: partA?.totalFee || 0,
          paid: partA?.paid || 0,
          balance: partA?.balance || 0,
          partA: {
            permitNumber: partA?.permitNumber,
            billNumber: billData?.billNumber || 'N/A',
            billPdfPath: billData?.billPdfPath || null,
            permitType: 'National Permit',
            ownerName: partA?.permitHolder,
            ownerAddress: partA?.address || 'N/A',
            ownerMobile: partA?.mobileNumber || 'N/A',
            vehicleNumber: partA?.vehicleNumber || 'N/A',
            permitValidFrom: partA?.validFrom,
            permitValidUpto: partA?.validTo,
            fatherName: partA?.fatherName || '',
            email: partA?.email || '',
            issueDate: partA?.createdAt,
            fees: partA?.totalFee ? `₹${partA.totalFee}` : 'N/A',
            balance: partA?.balance || 0
          },
          partB: {
            permitNumber: partA?.permitNumber,
            authorizationNumber: partB?.partBNumber || 'N/A',
            validFrom: partB?.validFrom || 'N/A',
            validTo: partB?.validTo || 'N/A',
            authorization: partB?.partBNumber || 'N/A',
            billNumber: partB?.bill?.billNumber || 'N/A',
            billPdfPath: partB?.bill?.billPdfPath || null,
            totalFee: partB?.totalFee || 0,
            paid: partB?.paid || 0,
            balance: partB?.balance || 0
          },
          partARenewalHistory: []
        }
      })

      setPermits(transformedPermits)
    } catch (error) {
      console.error('Error fetching permits:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper to convert DD-MM-YYYY to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null

    // If it's already a valid date string (YYYY-MM-DD or ISO format)
    const standardDate = new Date(dateStr)
    if (!isNaN(standardDate.getTime())) {
      return standardDate
    }

    // Try DD-MM-YYYY format
    const parts = dateStr.split(/[/-]/)
    if (parts.length === 3) {
      const [day, month, year] = parts
      const parsedDate = new Date(year, month - 1, day)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    return null
  }

  // Filter permits based on status and search query
  const filteredPermits = useMemo(() => {
    let filtered = permits

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((permit) => {
        if (statusFilter === 'partAExpiring') {
          // Part A expiry date is in permit.validTill or permit.partA.permitValidUpto
          const partAExpiryDate = permit.validTill || permit.partA?.permitValidUpto
          if (!partAExpiryDate) return false

          const expiryDate = parseDate(partAExpiryDate)
          if (!expiryDate) return false

          const today = new Date()
          const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
          return daysRemaining >= 0 && daysRemaining <= 60
        }
        if (statusFilter === 'partBExpiring') {
          // Part B expiry date is in permit.partB.validTo
          const partBExpiryDate = permit.partB?.validTo
          if (!partBExpiryDate) return false

          const expiryDate = parseDate(partBExpiryDate)
          if (!expiryDate) return false

          const today = new Date()
          const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
          return daysRemaining >= 0 && daysRemaining <= 30
        }
        if (statusFilter === 'pending') {
          // Check if there's a balance/pending amount
          const balance = permit.balance || permit.partA?.balance || 0
          return balance > 0
        }
        return true
      })
    }

    // Apply search filter (client-side for better UX)
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((permit) =>
        permit.permitNumber.toLowerCase().includes(searchLower) ||
        permit.permitHolder.toLowerCase().includes(searchLower) ||
        permit.vehicleNo.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [permits, searchQuery, statusFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination.totalRecords

    // Use the fetched counts instead of calculating from current page
    const expiring = partAExpiringCount
    const partBExpiring = partBExpiringCount

    // Calculate pending payment statistics
    const pendingPaymentCount = permits.filter(p => {
      const balance = p.balance || p.partA?.balance || 0
      return balance > 0
    }).length
    const pendingPaymentAmount = permits.reduce((sum, permit) => {
      const balance = permit.balance || permit.partA?.balance || 0
      return sum + balance
    }, 0)

    return {
      total,
      expiring,
      partBExpiring,
      pendingPaymentCount,
      pendingPaymentAmount
    }
  }, [permits, pagination.totalRecords, partAExpiringCount, partBExpiringCount])

  const handleViewDetails = (permit) => {
    setSelectedPermit(permit)
    setShowDetailsModal(true)
  }

  const handleEditPermit = (permit) => {
    setEditingPermit(permit)
    setShowEditPermitModal(true)
  }

  const handleDeletePermit = async (id) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this national permit? This will also delete all associated bills and renewal records.')) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/national-permits/${id}`, { withCredentials: true })

      if (response.data.success) {
        toast.success('National permit deleted successfully!', { position: 'top-right', autoClose: 3000 })
        fetchPermits()
        fetchExpiringCounts()
      } else {
        toast.error(response.data.message || 'Failed to delete permit', { position: 'top-right', autoClose: 3000 })
      }
    } catch (error) {
      toast.error('Error deleting permit. Please try again.', { position: 'top-right', autoClose: 3000 })
      console.error('Error:', error)
    }
  }

  // Mark national permit as paid
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
      const response = await axios.patch(`${API_URL}/api/national-permits/${permit.id}/mark-as-paid`, {}, { withCredentials: true });
      if (!response.data.success) throw new Error(response.data.message || 'Failed to mark payment as paid');

      toast.success('Payment marked as paid successfully!', { position: 'top-right', autoClose: 3000 });
      fetchPermits();
      fetchExpiringCounts();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error(`Failed to mark payment as paid: ${error.message}`, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleRenewPartB = (permit) => {
    setRenewingPermit(permit)
    setShowRenewPartBModal(true)
  }

  const handleRenewPartA = (permit) => {
    setRenewingPermit(permit)
    setShowRenewPartAModal(true)
  }

  const handleRenewalSuccess = (data) => {
    // Refresh permits list after successful renewal
    fetchPermits()
  }

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchPermits(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'date') {
      setDateFilter(value)
    }
  }

  const handleIssuePermit = async (formData) => {
    try {
      // Prepare data to match backend controller expectations
      const permitData = {
        vehicleNumber: formData.vehicleNumber,
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        partAValidFrom: formData.validFrom,
        partAValidTo: formData.validTo,
        partBNumber: formData.authorizationNumber,
        partBValidFrom: formData.typeBValidFrom,
        partBValidTo: formData.typeBValidTo,
        totalFee: Number(formData.totalFee) || 0,
        paid: Number(formData.paid) || 0,
        balance: Number(formData.balance) || 0,
        partAImage: formData.partAImage || '',
        partBImage: formData.partBImage || '',
        notes: formData.notes || ''
      }

      // Make POST request to backend
      const response = await axios.post(`${API_URL}/api/national-permits`, permitData, { withCredentials: true })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create permit')
      }

      // Show success message
      alert('Permit added successfully!')

      // Refresh the permits list and expiring counts
      await fetchPermits()
      await fetchExpiringCounts()
    } catch (error) {
      console.error('Error creating permit:', error)
      alert(`Failed to create permit: ${error.message}`)
    }
  }

  const handleUpdatePermit = async (formData) => {
    try {
      // Prepare data to match backend controller expectations for updatePermit (Part A)
      const permitData = {
        vehicleNumber: formData.vehicleNumber,
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        validFrom: formData.validFrom,  // Part A validFrom
        validTo: formData.validTo,      // Part A validTo
        totalFee: Number(formData.totalFee) || 0,
        paid: Number(formData.paid) || 0,
        balance: Number(formData.balance) || 0,
        notes: formData.notes || ''
      }

      // Make PUT request to backend (updates Part A)
      const response = await axios.put(`${API_URL}/api/national-permits/${editingPermit.id}`, permitData, { withCredentials: true })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update permit')
      }

      // Show success message
      alert('Permit updated successfully!')

      // Refresh the permits list and expiring counts
      await fetchPermits()
      await fetchExpiringCounts()

      // Close modal
      setShowEditPermitModal(false)
      setEditingPermit(null)
    } catch (error) {
      console.error('Error updating permit:', error)
      alert(`Failed to update permit: ${error.message}`)
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>


          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              <StatisticsCard
                title='Total Permits'
                value={stats.total}
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
                title='Part A - Expiring Soon'
                value={stats.expiring}
                color='orange'
                isActive={statusFilter === 'partAExpiring'}
                onClick={() => setStatusFilter(statusFilter === 'partAExpiring' ? 'all' : 'partAExpiring')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='Part B - Expiring Soon'
                value={stats.partBExpiring}
                color='purple'
                isActive={statusFilter === 'partBExpiring'}
                onClick={() => setStatusFilter(statusFilter === 'partBExpiring' ? 'all' : 'partBExpiring')}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='Pending Payment'
                value={stats.pendingPaymentCount}
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

      {/* Loading State */}
      {loading && (
        <div className='flex flex-col justify-center items-center py-20'>
          <div className='relative'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
            <div className='absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
          </div>
          <div className='mt-6 text-center'>
            <p className='text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1'>
              Loading Permits
            </p>
            <p className='text-sm text-gray-600'>Please wait while we fetch your data...</p>
          </div>
        </div>
      )}

      {!loading && (
      <>
      {/* Permits Table */}
      <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
        {/* Search and Filters Header */}
        <div className='px-3 lg:px-6 py-3 lg:py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              placeholder='Search by permit number, holder, or vehicle...'
            />

            {/* Filters Group */}
            <div className='flex flex-wrap gap-2'>
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className='w-[calc(50%-0.25rem)] lg:w-auto px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Permits</option>
                <option value='Expiring30Days'>30 Days</option>
                <option value='Expiring60Days'>60 Days</option>
                <option value='Expired'>Expired</option>
              </select>

              {/* Clear Filters */}
              {dateFilter !== 'All' && (
                <button
                  onClick={() => handleFilterChange('date', 'All')}
                  className='w-[calc(50%-0.25rem)] lg:w-auto px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg'
                >
                  Clear
                </button>
              )}
            </div>

            {/* New Permit Button */}
            <AddButton onClick={() => setShowIssuePermitModal(true)} title='New Permit' />
          </div>
        </div>

        {/* Mobile Card View */}
        <MobileCardView
          records={filteredPermits}
          emptyMessage={{
            title: 'No permits found',
            description: 'Click "New Permit" to add your first permit',
          }}
          loadingMessage='Loading permits...'
          headerGradient='from-indigo-50 via-purple-50 to-pink-50'
          avatarGradient='from-indigo-500 to-purple-500'
          emptyIconGradient='from-indigo-100 to-purple-100'
          emptyIconColor='text-indigo-400'
          cardConfig={{
            header: {
              avatar: (record) => record.permitHolder?.charAt(0) || 'P',
              title: (record) => record.permitHolder,
              subtitle: (record) => record.vehicleNo,
              showVehicleParts: true,
            },
            body: {
              showStatus: false,
              showPayment: true,
              showValidity: true,
              customFields: [
                {
                  render: (record) => (
                    <div className='pb-2.5 border-b border-gray-100'>
                      <div className='flex items-center justify-between'>
                        <span className='text-[10px] text-gray-500 font-semibold uppercase'>Permit Number</span>
                        <span className='text-sm font-mono font-bold text-gray-900'>{record.permitNumber}</span>
                      </div>
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
              title: 'View Details',
              onClick: handleViewDetails,
              bgColor: 'bg-indigo-100',
              textColor: 'text-indigo-600',
              hoverBgColor: 'bg-indigo-200',
              icon: (
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                </svg>
              ),
            },
            {
              title: 'Edit',
              onClick: handleEditPermit,
              bgColor: 'bg-blue-100',
              textColor: 'text-blue-600',
              hoverBgColor: 'bg-blue-200',
              icon: (
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                </svg>
              ),
            },
            {
              title: (record) => `Renew Part A (${getDaysRemaining(record.validTill)} days left)`,
              condition: (record) => record.validTill && record.validTill !== 'N/A' && isPartAExpiringSoon(record.validTill, 90),
              onClick: handleRenewPartA,
              bgColor: 'bg-purple-100',
              textColor: 'text-purple-600',
              hoverBgColor: 'bg-purple-200',
              icon: (
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              ),
            },
            {
              title: (record) => `Renew Part B (${getDaysRemaining(record.partB?.validTo)} days left)`,
              condition: (record) => record.partB?.validTo && record.partB.validTo !== 'N/A' && isPartBExpiringSoon(record.partB.validTo, 30),
              onClick: handleRenewPartB,
              bgColor: 'bg-rose-100',
              textColor: 'text-rose-600',
              hoverBgColor: 'bg-rose-200',
              icon: (
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
              ),
            },
            {
              title: 'Delete',
              onClick: (record) => handleDeletePermit(record.id),
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
        <div className='hidden lg:block overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200'>
          <table className='w-full'>
            <thead className={theme.tableHeader}>
              <tr>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle/Permit No.</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Holder</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid Till</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Part B</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Fee (₹)</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid (₹)</th>
                <th className='px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance (₹)</th>
                <th className='px-5 py-4 text-right text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredPermits.length > 0 ? (
                filteredPermits.map((permit, index) => (
                  <tr key={permit.id} className='hover:bg-gradient-to-r hover:from-blue-50/70 hover:via-indigo-50/70 hover:to-purple-50/70 transition-all duration-200 group border-b border-gray-100'>
                    <td className='px-5 py-4'>
                      <div className='flex flex-col gap-1.5'>
                        <div>
                          {(() => {
                            const parts = getVehicleNumberParts(permit.vehicleNo);
                            if (!parts) {
                              return (
                                <div className='flex items-center gap-1.5'>
                                  <svg className='w-4 h-4 text-blue-600 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                                    <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                                    <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                                  </svg>
                                  <span className='text-[15px] font-semibold text-gray-900'>{permit.vehicleNo}</span>
                                </div>
                              );
                            }
                            return (
                              <div className={vehicleDesign.container}>
                                <svg
                                  className="w-4 h-6 mr-0.5   text-blue-800 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                </svg>

                                <span className={vehicleDesign.stateCode}>
                                  {parts.stateCode}
                                </span>
                                <span className={vehicleDesign.districtCode}>
                                  {parts.districtCode}
                                </span>
                                <span className={vehicleDesign.series}>
                                  {parts.series}
                                </span>
                                <span className={vehicleDesign.last4Digits}>
                                  {parts.last4Digits}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <svg className='w-3.5 h-3.5 text-indigo-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                          <span className='text-[13px] font-medium text-gray-600'>{permit.permitNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className='px-5 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                          {permit.permitHolder?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                          <div className='text-xs text-gray-500 flex items-center mt-1'>
                            <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {permit.partA?.ownerMobile || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-5 py-4'>
                      <div className='flex items-center text-sm text-gray-700 font-medium whitespace-nowrap'>
                        <svg className='w-4 h-4 mr-2 text-green-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {permit.partA?.permitValidFrom || permit.validFrom || 'N/A'}
                      </div>
                    </td>
                    <td className='px-5 py-4'>
                      <div className='flex items-center text-sm text-gray-700 font-medium whitespace-nowrap'>
                        <svg className='w-4 h-4 mr-2 text-red-500 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {permit.validTill}
                      </div>
                    </td>
                    <td className='px-5 py-4'>
                      <div>
                        <div className='font-mono font-semibold text-gray-900 mb-1 text-sm'>
                          {permit.partB?.authorizationNumber || 'N/A'}
                        </div>
                        <div className='text-green-600 font-semibold mb-0.5 text-xs'>
                          {permit.partB?.validFrom || 'N/A'}
                        </div>
                        <div className='text-red-600 font-semibold text-xs'>
                          {permit.partB?.validTo || 'N/A'}
                        </div>
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
                        {/* Mark as Paid Button */}
                        {(permit.balance || 0) > 0 && (
                          <button
                            onClick={() => handleMarkAsPaid(permit)}
                            className='p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all hover:shadow-md duration-200 flex-shrink-0 hover:scale-105'
                            title='Mark as Paid'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(permit)}

                          className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all hover:shadow-md duration-200 flex-shrink-0 hover:scale-105'
                          title='View Details'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                        </button>
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
                          onClick={() => handleDeletePermit(permit.id)}
                          className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:shadow-md duration-200 flex-shrink-0 hover:scale-105'
                          title='Delete Permit'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                        {/* Renew Part B Button - Show only when expiring within 30 days or expired */}
                        {permit.partB?.validTo && permit.partB.validTo !== 'N/A' && isPartBExpiringSoon(permit.partB.validTo, 30) && (
                          <button
                            onClick={() => handleRenewPartB(permit)}

                            className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:shadow-md duration-200 relative flex-shrink-0 hover:scale-105'
                            title={`Renew Part B (${getDaysRemaining(permit.partB.validTo)} days left)`}
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                            </svg>
                            {getDaysRemaining(permit.partB.validTo) <= 7 && (
                              <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse'></span>
                            )}
                          </button>
                        )}
                        {/* Renew Part A Button - Show only when expiring within 90 days or expired */}
                        {permit.validTill && permit.validTill !== 'N/A' && isPartAExpiringSoon(permit.validTill, 90) && (
                          <button
                            onClick={() => handleRenewPartA(permit)}

                            className='p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all hover:shadow-md duration-200 relative flex-shrink-0 hover:scale-105'
                            title={`Renew Part A (${getDaysRemaining(permit.validTill)} days left)`}
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            {getDaysRemaining(permit.validTill) <= 7 && (
                              <span className='absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse'></span>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='9' className='px-6 py-16'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg'>
                        <svg className='w-12 h-12 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                      </div>
                      <h3 className='text-xl font-black text-gray-700 mb-2'>No Permits Found</h3>
                      <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                        {searchQuery ? 'No permits match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first national permit.'}
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
      </>
      )}

      {/* Permit Details Modal - Lazy Loaded */}
      {showDetailsModal && (
                  <NationalPermitDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedPermit(null)
            }}
            permit={selectedPermit}
          />
      )}

      {/* Add New Permit Modal - Lazy Loaded */}
      {showIssuePermitModal && (
                  <IssueNewPermitModal
            isOpen={showIssuePermitModal}
            onClose={() => setShowIssuePermitModal(false)}
            onSubmit={handleIssuePermit}
          />
      )}

      {/* Edit Permit Modal - Lazy Loaded */}
      {showEditPermitModal && (
                  <EditNationalPermitModal
            isOpen={showEditPermitModal}
            onClose={() => {
              setShowEditPermitModal(false)
              setEditingPermit(null)
            }}
            onSubmit={handleUpdatePermit}
            permit={editingPermit}
          />
      )}

      {/* Renew Part B Modal - Lazy Loaded */}
      {showRenewPartBModal && renewingPermit && (
                  <RenewPartBModal
            permit={renewingPermit}
            onClose={() => {
              setShowRenewPartBModal(false)
              setRenewingPermit(null)
            }}
            onRenewalSuccess={handleRenewalSuccess}
          />
      )}

      {/* Renew Part A Modal - Lazy Loaded */}
      {showRenewPartAModal && renewingPermit && (
                  <RenewPartAModal
            permit={renewingPermit}
            onClose={() => {
              setShowRenewPartAModal(false)
              setRenewingPermit(null)
            }}
            onRenewalSuccess={handleRenewalSuccess}
          />
      )}
      </div>
      </div>
    </>
  )
}

export default NationalPermit
