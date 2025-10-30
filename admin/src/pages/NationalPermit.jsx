import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import IssueNewPermitModal from '../components/IssueNewPermitModal'
import EditNationalPermitModal from '../components/EditNationalPermitModal'
import PermitBillModal from '../components/PermitBillModal'
import RenewPartBModal from '../components/RenewPartBModal'
import RenewPartAModal from '../components/RenewPartAModal'
import { isPartBExpiringSoon, isPartAExpiringSoon, getDaysRemaining } from '../utils/dateHelpers'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const NationalPermit = () => {
  const navigate = useNavigate()
  const [permits, setPermits] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showRenewPartBModal, setShowRenewPartBModal] = useState(false)
  const [showRenewPartAModal, setShowRenewPartAModal] = useState(false)
  const [renewingPermit, setRenewingPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [dateFilter, setDateFilter] = useState('All')
  const [whatsappLoading, setWhatsappLoading] = useState(null) // Track which permit is loading

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [partAExpiringCount, setPartAExpiringCount] = useState(0)
  const [partBExpiringCount, setPartBExpiringCount] = useState(0)

  // Fetch permits from backend on component mount and when filters or page change
  useEffect(() => {
    fetchPermits()
  }, [dateFilter, currentPage]) // Re-fetch when filters or page change

  // Fetch expiring counts on component mount
  useEffect(() => {
    fetchExpiringCounts()
  }, [])

  const fetchExpiringCounts = async () => {
    try {
      console.log('Fetching National Permit expiring counts...')

      // Fetch Part A expiring count
      const partAResponse = await axios.get(`${API_URL}/api/national-permits/part-a-expiring-soon`, {
        params: { page: 1, limit: 1 }
      })
      console.log('Part A Response:', partAResponse.data)
      const partACount = partAResponse.data.pagination?.totalItems || 0
      console.log('Part A Count:', partACount)
      setPartAExpiringCount(partACount)

      // Fetch Part B expiring count
      const partBResponse = await axios.get(`${API_URL}/api/national-permits/part-b-expiring-soon`, {
        params: { page: 1, limit: 1 }
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

  const fetchPermits = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())

      if (dateFilter && dateFilter !== 'All') {
        params.append('dateFilter', dateFilter)
      }

      const response = await axios.get(`${API_URL}/api/national-permits`, {
        params: Object.fromEntries(params)
      })

      // Update pagination info
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
      }

      // Transform backend data to match frontend structure
      const transformedPermits = response.data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validTill: permit.validTo,
        status: permit.status,
        partA: {
          permitNumber: permit.permitNumber,
          billNumber: permit.billNumber || 'BILL-2025-0001',
          billPdfPath: permit.billPdfPath || null,
          permitType: 'National Permit',
          ownerName: permit.permitHolder,
          ownerAddress: permit.address || 'N/A',
          ownerMobile: permit.mobileNumber || 'N/A',
          vehicleNumber: permit.vehicleNumber || 'N/A',
          vehicleClass: permit.vehicleClass || 'Goods Vehicle',
          vehicleType: permit.vehicleType || 'Truck',
          chassisNumber: permit.chassisNumber || 'N/A',
          engineNumber: permit.engineNumber || 'N/A',
          makerModel: permit.vehicleModel || 'N/A',
          yearOfManufacture: permit.yearOfManufacture || 'N/A',
          seatingCapacity: permit.seatingCapacity || '2',
          route: permit.route,
          permitValidFrom: permit.validFrom,
          permitValidUpto: permit.validTo,
          issuingAuthority: permit.issuingAuthority,
          issueDate: permit.issueDate,
          fees: `₹${permit.fees}`
        },
        partB: {
          permitNumber: permit.permitNumber,
          authorizationNumber: permit.typeBAuthorization?.authorizationNumber || 'N/A',
          validFrom: permit.typeBAuthorization?.validFrom || 'N/A',
          validTo: permit.typeBAuthorization?.validTo || 'N/A',
          authorization: permit.typeBAuthorization?.authorizationNumber || 'N/A',
          goodsType: permit.typeBAuthorization?.goodsType || 'General Goods',
          maxLoadCapacity: permit.typeBAuthorization?.maxLoadCapacity || 'N/A',
          validRoutes: permit.typeBAuthorization?.validRoutes || 'All National Highways and State Highways across India',
          restrictions: permit.typeBAuthorization?.restrictions || 'As per RTO regulations',
          conditions: permit.typeBAuthorization?.conditions || 'Valid for goods transportation only',
          endorsements: permit.typeBAuthorization?.endorsements || 'None',
          renewalHistory: permit.typeBAuthorization?.renewalHistory || [],
          insuranceDetails: permit.insuranceDetails || {
            policyNumber: 'N/A',
            company: 'N/A',
            validUpto: 'N/A'
          },
          taxDetails: permit.taxDetails || {
            taxPaidUpto: 'N/A',
            taxAmount: 'N/A'
          }
        },
        partARenewalHistory: permit.renewalHistory || []
      }))

      setPermits(transformedPermits)
    } catch (error) {
      console.error('Error fetching permits:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter permits based on search query only (date filtering is done on backend)
  const filteredPermits = useMemo(() => {
    let filtered = permits

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
  }, [permits, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = totalItems
    const active = permits.filter(p => p.status === 'Active').length

    // Use the fetched counts instead of calculating from current page
    const expiring = partAExpiringCount
    const partBExpiring = partBExpiringCount

    return {
      total,
      active,
      expiring,
      partBExpiring
    }
  }, [permits, totalItems, partAExpiringCount, partBExpiringCount])

  const handleViewDetails = (permit) => {
    setSelectedPermit(permit)
    setShowDetailsModal(true)
  }

  const handleViewBill = (permit) => {
    setSelectedPermit(permit)
    setShowBillModal(true)
  }

  const handleWhatsAppShare = async (permit) => {
    // Set loading state
    setWhatsappLoading(permit.id)

    try {
      // Get phone number first (validate before API call)
      const phoneNumber = (permit.partA?.ownerMobile || '').replace(/\D/g, '')

      if (!phoneNumber) {
        alert('No mobile number found for this permit holder.')
        setWhatsappLoading(null)
        return
      }

      // Check if PDF already exists
      let pdfUrl = null

      if (permit.partA?.billPdfPath) {
        // PDF already exists, use it directly (instant!)
        pdfUrl = `http://localhost:5000${permit.partA.billPdfPath}`
      } else {
        // Need to generate PDF
        const response = await axios.post(`${API_URL}/api/national-permits/${permit.id}/generate-bill-pdf`)

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to generate PDF')
        }

        pdfUrl = response.data.data.pdfUrl || `http://localhost:5000${response.data.data.pdfPath}`
      }

      // Create WhatsApp message
      const message = `Hello ${permit.partA?.ownerName || 'Sir/Madam'},

Your National Permit Bill is ready!

*Bill Number:* ${permit.partA?.billNumber || 'N/A'}
*Permit Number:* ${permit.permitNumber}
*Vehicle Number:* ${permit.partA?.vehicleNumber || 'N/A'}
*Amount:* ${permit.partA?.fees || '₹0'}

Download your bill here:
${pdfUrl}

Thank you for your business!
- Ashok Kumar (Transport Consultant)`

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message)

      // Clear loading state
      setWhatsappLoading(null)

      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`

      // Use WhatsApp Web for reliable message pre-fill (works for saved and unsaved contacts)
      const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`

      // Open in same tab named 'whatsapp_share' - reuses tab if already open
      const whatsappWindow = window.open(whatsappWebUrl, 'whatsapp_share')
      if (whatsappWindow) {
        whatsappWindow.focus()
      } else {
        // If popup blocked, show message
        alert('Please allow popups for this site to share via WhatsApp, or copy the link manually.')
      }

    } catch (error) {
      console.error('Error sharing via WhatsApp:', error)
      setWhatsappLoading(null)
      alert('Failed to prepare WhatsApp message. Please try again.')
    }
  }

  const handleEditPermit = (permit) => {
    setEditingPermit(permit)
    setShowEditPermitModal(true)
  }

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

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1) // Reset to first page when filters change
    if (filterType === 'date') {
      setDateFilter(value)
    }
  }

  const handleIssuePermit = async (formData) => {
    try {
      // Prepare data to match backend model with Type B Authorization
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleNumber: formData.vehicleNumber || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleType: formData.vehicleType || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        yearOfManufacture: new Date().getFullYear().toString(),
        seatingCapacity: '2',
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        route: formData.route || 'All India',
        // Type B Authorization (structured as sub-schema)
        typeBAuthorization: {
          authorizationNumber: formData.authorizationNumber,
          validFrom: formData.typeBValidFrom,
          validTo: formData.typeBValidTo,
          goodsType: formData.goodsType || 'General Goods',
          maxLoadCapacity: formData.grossWeight ? `${formData.grossWeight} kg` : '',
          validRoutes: 'All National Highways and State Highways across India',
          restrictions: 'As per RTO regulations',
          conditions: 'Valid for goods transportation only. Driver must carry valid driving license and vehicle documents.',
          endorsements: 'None'
        },
        fees: Number(formData.fees) || 15000,
        status: 'Active'
      }

      // Make POST request to backend
      const response = await axios.post(`${API_URL}/api/national-permits`, permitData)

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
      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleNumber: formData.vehicleNumber || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleType: formData.vehicleType || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        yearOfManufacture: formData.yearOfManufacture || new Date().getFullYear().toString(),
        seatingCapacity: formData.seatingCapacity || '2',
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        route: formData.route || 'All India',
        // Type B Authorization
        typeBAuthorization: {
          authorizationNumber: formData.authorizationNumber,
          validFrom: formData.typeBValidFrom,
          validTo: formData.typeBValidTo,
          goodsType: formData.goodsType || 'General Goods',
          maxLoadCapacity: formData.grossWeight ? `${formData.grossWeight} kg` : '',
          validRoutes: 'All National Highways and State Highways across India',
          restrictions: 'As per RTO regulations',
          conditions: 'Valid for goods transportation only. Driver must carry valid driving license and vehicle documents.',
          endorsements: 'None'
        },
        fees: Number(formData.fees) || 15000,
        status: formData.status || 'Active'
      }

      // Make PUT request to backend
      const response = await axios.put(`${API_URL}/api/national-permits/${editingPermit.id}`, permitData)

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
              {/* Total Permits */}
              <div className='bg-white rounded-lg shadow-md border border-indigo-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Permits</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{stats.total}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Permits */}
              <div className='bg-white rounded-lg shadow-md border border-emerald-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Active Permits</p>
                    <h3 className='text-lg lg:text-2xl font-black text-emerald-600'>{stats.active}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Part A - Expiring Soon */}
              <div
                onClick={() => navigate('/national-part-a-expiring')}
                className='bg-white rounded-lg shadow-md border border-orange-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Part A - Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{stats.expiring}</h3>
                    <p className='text-[7px] lg:text-[9px] text-gray-400 mt-0.5'>Within 30 days</p>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Part B - Expiring Soon */}
              <div
                onClick={() => navigate('/national-part-b-expiring')}
                className='bg-white rounded-lg shadow-md border border-purple-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Part B - Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-purple-600'>{stats.partBExpiring}</h3>
                    <p className='text-[7px] lg:text-[9px] text-gray-400 mt-0.5'>Within 30 days</p>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
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
            <div className='relative flex-1 lg:max-w-md'>
              <input
                type='text'
                placeholder='Search by permit number, holder, or vehicle...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-9 lg:pl-11 pr-3 lg:pr-4 py-2 lg:py-3 text-xs lg:text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm'
              />
              <svg
                className='absolute left-2.5 lg:left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-indigo-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>

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
            <button
              onClick={() => setShowIssuePermitModal(true)}
              className='px-3 lg:px-5 py-2 lg:py-3 text-xs lg:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <span className='flex items-center gap-1 lg:gap-2'>
                <svg className='w-4 h-4 lg:w-5 lg:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                <span className='hidden sm:inline'>New Permit</span>
                <span className='sm:hidden'>New</span>
              </span>
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
              <tr>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Number</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Holder</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle No.</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid Till</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Part B</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Permit Fee</th>
                <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredPermits.length > 0 ? (
                filteredPermits.map((permit, index) => (
                  <tr key={permit.id} className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 group'>
                    <td className='px-4 py-4'>
                      <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                        {permit.permitNumber}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
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
                    <td className='px-4 py-4'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200'>
                        <svg className='w-3 h-3 mr-1.5' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                        </svg>
                        {permit.vehicleNo}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center text-sm text-gray-700 font-medium'>
                        <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {permit.partA?.permitValidFrom || permit.validFrom || 'N/A'}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm text-gray-700'>
                        <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {permit.validTill}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
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
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-purple-100 text-purple-700 border border-purple-200'>
                        {permit.partA?.fees || '₹0'}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center justify-start gap-1.5'>
                        <button
                          onClick={() => handleViewDetails(permit)}
                          className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all group-hover:scale-110 duration-200 flex-shrink-0'
                          title='View Details'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditPermit(permit)}
                          className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200 flex-shrink-0'
                          title='Edit Permit'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleWhatsAppShare(permit)}
                          disabled={whatsappLoading === permit.id}
                          className={`p-2 rounded-lg transition-all group-hover:scale-110 duration-200 relative flex-shrink-0 ${
                            whatsappLoading === permit.id
                              ? 'text-gray-400 bg-gray-100 cursor-wait'
                              : 'text-green-600 hover:bg-green-100 cursor-pointer'
                          }`}
                          title={whatsappLoading === permit.id ? 'Loading...' : 'Share via WhatsApp'}
                        >
                          {whatsappLoading === permit.id ? (
                            <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                          ) : (
                            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleViewBill(permit)}
                          className='p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all group-hover:scale-110 duration-200 flex-shrink-0'
                          title='View Bill'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                        </button>
                        {/* Renew Part B Button - Only show if expiring within 35 days */}
                        {permit.partB?.validTo && permit.partB.validTo !== 'N/A' && isPartBExpiringSoon(permit.partB.validTo, 35) ? (
                          <button
                            onClick={() => handleRenewPartB(permit)}
                            className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all group-hover:scale-110 duration-200 relative flex-shrink-0'
                            title={`Renew Part B (${getDaysRemaining(permit.partB.validTo)} days left)`}
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                            </svg>
                            {getDaysRemaining(permit.partB.validTo) <= 7 && (
                              <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse'></span>
                            )}
                          </button>
                        ) : (
                          <div className='w-9 h-9 flex-shrink-0'></div>
                        )}
                        {/* Renew Part A Button - Only show if expiring within 35 days */}
                        {permit.validTill && permit.validTill !== 'N/A' && isPartAExpiringSoon(permit.validTill, 35) ? (
                          <button
                            onClick={() => handleRenewPartA(permit)}
                            className='p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all group-hover:scale-110 duration-200 relative flex-shrink-0'
                            title={`Renew Part A (${getDaysRemaining(permit.validTill)} days left)`}
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            {getDaysRemaining(permit.validTill) <= 7 && (
                              <span className='absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse'></span>
                            )}
                          </button>
                        ) : (
                          <div className='w-9 h-9 flex-shrink-0'></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='8' className='px-6 py-16'>
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
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='text-sm font-semibold text-gray-700'>
                Page {currentPage} of {totalPages}
              </div>

              <div className='flex items-center gap-2'>
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className='flex gap-1'>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                            currentPage === pageNumber
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-110'
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
                      return <span key={pageNumber} className='px-2 py-2 text-gray-400 font-bold'>...</span>
                    }
                    return null
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
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
      </>
      )}

      {/* Permit Details Modal */}
      {showDetailsModal && selectedPermit && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden'>
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white'>
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-2xl font-black mb-1'>National Permit Details</h2>
                  <p className='text-blue-100 text-sm'>Permit No: {selectedPermit.permitNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedPermit(null)
                  }}
                  className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='overflow-y-auto max-h-[calc(90vh-100px)] p-6'>
              {/* Main Details */}
              <div className='mb-6'>
                <h3 className='text-xl font-black text-gray-800 mb-4 flex items-center gap-2'>
                  <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                  Main Permit Details
                </h3>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-xs font-bold text-blue-700 uppercase'>Vehicle Number</label>
                      <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.vehicleNumber}</p>
                    </div>
                    <div>
                      <label className='text-xs font-bold text-blue-700 uppercase'>Permit Number</label>
                      <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.permitNumber}</p>
                    </div>
                    <div>
                      <label className='text-xs font-bold text-blue-700 uppercase'>Permit Holder Name</label>
                      <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.ownerName}</p>
                    </div>
                    <div>
                      <label className='text-xs font-bold text-blue-700 uppercase'>Mobile Number</label>
                      <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.ownerMobile}</p>
                    </div>
                    <div>
                      <label className='text-xs font-bold text-blue-700 uppercase'>Valid From</label>
                      <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.permitValidFrom}</p>
                    </div>
                    <div>
                      <label className='text-xs font-bold text-blue-700 uppercase'>Valid Upto</label>
                      <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.permitValidUpto}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type B Authorization & Fees */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200'>
                  <div className='flex justify-between items-start mb-3'>
                    <h4 className='text-sm font-black text-purple-700 flex items-center gap-2'>
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                      </svg>
                      TYPE B AUTHORIZATION - CURRENT
                    </h4>
                    {/* Active Badge */}
                    <span className='px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full'>
                      ACTIVE
                    </span>
                  </div>
                  <p className='text-sm font-semibold text-gray-800 font-mono'>{selectedPermit.partB.authorizationNumber}</p>
                  <div className='mt-3 pt-3 border-t border-purple-200'>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div>
                        <span className='text-purple-600 font-bold'>Valid From:</span>
                        <p className='text-gray-800 font-semibold'>{selectedPermit.partB.validFrom}</p>
                      </div>
                      <div>
                        <span className='text-purple-600 font-bold'>Valid To:</span>
                        <p className='text-gray-800 font-semibold'>{selectedPermit.partB.validTo}</p>
                      </div>
                    </div>
                    {/* Days Remaining */}
                    {selectedPermit.partB?.validTo && (
                      <div className='mt-2 pt-2 border-t border-purple-200'>
                        <span className='text-purple-600 font-bold text-xs'>Days Remaining:</span>
                        <p className={`text-sm font-black mt-1 ${
                          getDaysRemaining(selectedPermit.partB.validTo) <= 7
                            ? 'text-red-600'
                            : getDaysRemaining(selectedPermit.partB.validTo) <= 35
                              ? 'text-orange-600'
                              : 'text-green-600'
                        }`}>
                          {getDaysRemaining(selectedPermit.partB.validTo)} days
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Download/Share buttons for renewed Part B */}
                  {selectedPermit.partB?.renewalHistory && selectedPermit.partB.renewalHistory.length > 0 && (() => {
                    console.log('Renewal History:', selectedPermit.partB.renewalHistory)
                    // Find the latest renewal (current Part B bill)
                    const latestRenewal = selectedPermit.partB.renewalHistory
                      .filter(r => !r.isOriginal)
                      .sort((a, b) => new Date(b.renewalDate) - new Date(a.renewalDate))[0]

                    console.log('Latest Renewal:', latestRenewal)
                    console.log('Has billPdfPath?', latestRenewal?.billPdfPath)

                    return latestRenewal && latestRenewal.billPdfPath ? (
                      <div className='mt-3 pt-3 border-t border-purple-200'>
                        <div className='flex gap-2'>
                          <button
                            onClick={async () => {
                              try {
                                const downloadUrl = `${API_URL}/api/national-permits/${selectedPermit.id}/part-b-renewals/${latestRenewal._id}/download-pdf`
                                const link = document.createElement('a')
                                link.href = downloadUrl
                                link.download = `${latestRenewal.billNumber}.pdf`
                                link.target = '_blank'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              } catch (error) {
                                console.error('Error downloading Part B bill:', error)
                                alert('Failed to download bill')
                              }
                            }}
                            className='flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-semibold'
                          >
                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                            </svg>
                            Bill
                          </button>
                          <button
                            onClick={() => {
                              const pdfUrl = `http://localhost:5000${latestRenewal.billPdfPath}`
                              const message = `Hello ${selectedPermit.permitHolder},

Your Part B Renewal Bill is ready!

*Bill Number:* ${latestRenewal.billNumber}
*Authorization Number:* ${latestRenewal.authorizationNumber}
*Permit Number:* ${selectedPermit.permitNumber}
*Valid From:* ${latestRenewal.validFrom}
*Valid To:* ${latestRenewal.validTo}
*Amount:* ₹${latestRenewal.fees?.toLocaleString('en-IN')}

Download your Part B renewal bill here:
${pdfUrl}

Thank you for your business!
- Ashok Kumar (Transport Consultant)`

                              const encodedMessage = encodeURIComponent(message)
                              const phoneNumber = (selectedPermit.partA?.ownerMobile || '').replace(/\D/g, '')

                              if (!phoneNumber) {
                                alert('No mobile number found')
                                return
                              }

                              const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`
                              const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`
                              window.open(whatsappWebUrl, 'whatsapp_share')
                            }}
                            className='flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs font-semibold'
                          >
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/>
                            </svg>
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    ) : null
                  })()}

                  {/* Renewal History Link - if available */}
                  {selectedPermit.partB?.renewalHistory && selectedPermit.partB.renewalHistory.length > 0 && (
                    <div className='mt-3 pt-3 border-t border-purple-200'>
                      <button
                        className='text-xs text-purple-600 font-bold hover:text-purple-800 flex items-center gap-1'
                        onClick={(e) => {
                          e.stopPropagation()
                          alert(`Renewal History: ${selectedPermit.partB.renewalHistory.length} renewals found`)
                        }}
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        View Renewal History ({selectedPermit.partB.renewalHistory.length})
                      </button>
                    </div>
                  )}
                </div>

                <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200'>
                  <h4 className='text-sm font-black text-green-700 mb-3 flex items-center gap-2'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    PERMIT FEES
                  </h4>
                  <p className='text-2xl font-black text-green-700'>{selectedPermit.partA.fees}</p>
                </div>
              </div>

              {/* Additional Details - Expandable */}
              <div className='border-2 border-gray-200 rounded-2xl overflow-hidden'>
                <button
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                  className='w-full bg-gray-50 p-4 hover:bg-gray-100 transition-colors cursor-pointer'
                >
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-black text-gray-800 flex items-center gap-2'>
                      <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      Additional Details
                    </h3>
                    <svg
                      className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${showAdditionalDetails ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </div>
                </button>

                {showAdditionalDetails && (
                <div className='p-6 space-y-6'>
                  {/* Helper function to check if value exists and is not N/A */}
                  {(() => {
                    const hasValue = (val) => val && val !== 'N/A' && val !== ''

                    // Check for Personal Information fields
                    const hasFatherName = hasValue(selectedPermit.partA.fatherName)
                    const hasEmail = hasValue(selectedPermit.partA.email)
                    const hasAddress = hasValue(selectedPermit.partA.ownerAddress)
                    const hasPersonalInfo = hasFatherName || hasEmail || hasAddress

                    // Check for Vehicle Information fields
                    const hasVehicleModel = hasValue(selectedPermit.partA.makerModel)
                    const hasVehicleType = hasValue(selectedPermit.partA.vehicleType)
                    const hasVehicleClass = hasValue(selectedPermit.partA.vehicleClass)
                    const hasYearOfManufacture = hasValue(selectedPermit.partA.yearOfManufacture)
                    const hasChassisNumber = hasValue(selectedPermit.partA.chassisNumber)
                    const hasEngineNumber = hasValue(selectedPermit.partA.engineNumber)
                    const hasSeatingCapacity = hasValue(selectedPermit.partA.seatingCapacity)
                    const hasMaxLoadCapacity = hasValue(selectedPermit.partB.maxLoadCapacity)
                    const hasVehicleInfo = hasVehicleModel || hasVehicleType || hasVehicleClass || hasYearOfManufacture ||
                                          hasChassisNumber || hasEngineNumber || hasSeatingCapacity || hasMaxLoadCapacity

                    // Check for Insurance Details
                    const hasPolicyNumber = hasValue(selectedPermit.partB.insuranceDetails?.policyNumber)
                    const hasCompany = hasValue(selectedPermit.partB.insuranceDetails?.company)
                    const hasInsuranceValidUpto = hasValue(selectedPermit.partB.insuranceDetails?.validUpto)
                    const hasInsuranceInfo = hasPolicyNumber || hasCompany || hasInsuranceValidUpto

                    // Check for Tax Details
                    const hasTaxPaidUpto = hasValue(selectedPermit.partB.taxDetails?.taxPaidUpto)
                    const hasTaxAmount = hasValue(selectedPermit.partB.taxDetails?.taxAmount)
                    const hasTaxInfo = hasTaxPaidUpto || hasTaxAmount

                    return (
                      <>
                        {/* Personal Information */}
                        {hasPersonalInfo && (
                          <div>
                            <h4 className='text-sm font-black text-indigo-700 mb-3 uppercase'>Personal Information</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/50 rounded-xl p-4'>
                              {hasFatherName && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Father's Name</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.fatherName}</p>
                                </div>
                              )}
                              {hasEmail && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Email</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.email}</p>
                                </div>
                              )}
                              {hasAddress && (
                                <div className='md:col-span-2'>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Address</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.ownerAddress}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Vehicle Information */}
                        {hasVehicleInfo && (
                          <div>
                            <h4 className='text-sm font-black text-purple-700 mb-3 uppercase'>Vehicle Information</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 rounded-xl p-4'>
                              {hasVehicleModel && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Vehicle Model</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.makerModel}</p>
                                </div>
                              )}
                              {hasVehicleType && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Vehicle Type</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.vehicleType}</p>
                                </div>
                              )}
                              {hasVehicleClass && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Vehicle Class</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.vehicleClass}</p>
                                </div>
                              )}
                              {hasYearOfManufacture && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Year of Manufacture</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.yearOfManufacture}</p>
                                </div>
                              )}
                              {hasChassisNumber && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Chassis Number</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1 font-mono'>{selectedPermit.partA.chassisNumber}</p>
                                </div>
                              )}
                              {hasEngineNumber && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Engine Number</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1 font-mono'>{selectedPermit.partA.engineNumber}</p>
                                </div>
                              )}
                              {hasSeatingCapacity && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Seating Capacity</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.seatingCapacity}</p>
                                </div>
                              )}
                              {hasMaxLoadCapacity && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Max Load Capacity</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.maxLoadCapacity}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Insurance Details */}
                        {hasInsuranceInfo && (
                          <div>
                            <h4 className='text-sm font-black text-orange-700 mb-3 uppercase'>Insurance Details</h4>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50/50 rounded-xl p-4'>
                              {hasPolicyNumber && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Policy Number</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.insuranceDetails.policyNumber}</p>
                                </div>
                              )}
                              {hasCompany && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Company</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.insuranceDetails.company}</p>
                                </div>
                              )}
                              {hasInsuranceValidUpto && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Valid Upto</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.insuranceDetails.validUpto}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tax Details */}
                        {hasTaxInfo && (
                          <div>
                            <h4 className='text-sm font-black text-red-700 mb-3 uppercase'>Tax Details</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50/50 rounded-xl p-4'>
                              {hasTaxPaidUpto && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Tax Paid Upto</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.taxDetails.taxPaidUpto}</p>
                                </div>
                              )}
                              {hasTaxAmount && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Tax Amount</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.taxDetails.taxAmount}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Part A Renewal History */}
                        {selectedPermit.partARenewalHistory && selectedPermit.partARenewalHistory.length > 0 && (
                          <div className='mb-6'>
                            <h4 className='text-sm font-black text-indigo-700 mb-3 uppercase flex items-center gap-2'>
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                              Part A Renewal History
                            </h4>
                            <div className='bg-indigo-50/50 rounded-xl p-4'>
                              <div className='space-y-3'>
                                {selectedPermit.partARenewalHistory.map((renewal, index) => (
                                  <div key={renewal._id || index} className={`bg-white rounded-xl border-2 p-4 hover:shadow-md transition-all ${
                                    renewal.isOriginal ? 'border-blue-200' : 'border-indigo-200'
                                  }`}>
                                    <div className='flex items-start justify-between mb-3'>
                                      <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-2'>
                                          {renewal.isOriginal ? (
                                            <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded flex items-center gap-1'>
                                              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                              </svg>
                                              ORIGINAL PART A
                                            </span>
                                          ) : (
                                            <span className='px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded'>
                                              Renewal #{selectedPermit.partARenewalHistory.filter(r => !r.isOriginal).findIndex(r => r._id === renewal._id) + 1}
                                            </span>
                                          )}
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            renewal.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                          }`}>
                                            {renewal.paymentStatus}
                                          </span>
                                        </div>
                                        <div className='grid grid-cols-2 gap-2 text-xs'>
                                          <div>
                                            <span className='text-gray-600 font-semibold'>Permit Number:</span>
                                            <p className='text-gray-900 font-mono font-bold'>{renewal.permitNumber}</p>
                                          </div>
                                          {!renewal.isOriginal && (
                                            <div>
                                              <span className='text-gray-600 font-semibold'>Bill Number:</span>
                                              <p className='text-gray-900 font-mono font-bold'>{renewal.billNumber}</p>
                                            </div>
                                          )}
                                          <div>
                                            <span className='text-gray-600 font-semibold'>Valid From:</span>
                                            <p className='text-gray-900 font-semibold'>{renewal.validFrom}</p>
                                          </div>
                                          <div>
                                            <span className='text-gray-600 font-semibold'>Valid To:</span>
                                            <p className='text-gray-900 font-semibold'>{renewal.validTo}</p>
                                          </div>
                                          <div>
                                            <span className='text-gray-600 font-semibold'>{renewal.isOriginal ? 'Issue Date:' : 'Renewal Date:'}</span>
                                            <p className='text-gray-900 font-semibold'>{new Date(renewal.renewalDate).toLocaleDateString('en-IN')}</p>
                                          </div>
                                          {!renewal.isOriginal && (
                                            <div>
                                              <span className='text-gray-600 font-semibold'>Fees:</span>
                                              <p className='text-indigo-700 font-black'>₹{renewal.fees?.toLocaleString('en-IN') || '0'}</p>
                                            </div>
                                          )}
                                        </div>
                                        {renewal.notes && (
                                          <div className='mt-2 pt-2 border-t border-gray-200'>
                                            <span className='text-gray-600 text-xs font-semibold'>Notes:</span>
                                            <p className='text-gray-700 text-xs mt-1'>{renewal.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons - Only show for renewals, NOT for original Part A */}
                                    {!renewal.isOriginal && renewal.billPdfPath && (
                                      <div className='flex items-center gap-2 pt-3 border-t border-indigo-200'>
                                        <button
                                          onClick={async () => {
                                            try {
                                              const downloadUrl = `${API_URL}/api/national-permits/${selectedPermit.id}/part-a-renewals/${renewal._id}/download-pdf`
                                              const link = document.createElement('a')
                                              link.href = downloadUrl
                                              link.download = `${renewal.billNumber}.pdf`
                                              link.target = '_blank'
                                              document.body.appendChild(link)
                                              link.click()
                                              document.body.removeChild(link)
                                            } catch (error) {
                                              console.error('Error downloading Part A bill:', error)
                                              alert('Failed to download bill')
                                            }
                                          }}
                                          className='flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-semibold'
                                        >
                                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                          </svg>
                                          Download Bill
                                        </button>
                                        <button
                                          onClick={() => {
                                            const pdfUrl = `http://localhost:5000${renewal.billPdfPath}`
                                            const message = `Hello ${selectedPermit.permitHolder},

Your Part A (National Permit) Renewal Bill is ready!

*Bill Number:* ${renewal.billNumber}
*Permit Number:* ${renewal.permitNumber}
*Valid From:* ${renewal.validFrom}
*Valid To:* ${renewal.validTo}
*Validity:* 5 Years
*Amount:* ₹${renewal.fees?.toLocaleString('en-IN')}

Download your Part A renewal bill here:
${pdfUrl}

Thank you for your business!
- Ashok Kumar (Transport Consultant)`

                                            const encodedMessage = encodeURIComponent(message)
                                            const phoneNumber = (selectedPermit.partA?.ownerMobile || '').replace(/\D/g, '')

                                            if (!phoneNumber) {
                                              alert('No mobile number found')
                                              return
                                            }

                                            const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`
                                            const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`
                                            window.open(whatsappWebUrl, 'whatsapp_share')
                                          }}
                                          className='flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs font-semibold'
                                        >
                                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/>
                                          </svg>
                                          Share on WhatsApp
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className='mt-3 p-3 bg-white rounded-lg border border-blue-200'>
                                <p className='text-xs text-blue-700 font-semibold'>
                                  ℹ️ <strong>Original Part A</strong> was created with the initial permit. Its bill is available in the main "View Bill" section. Only <strong>renewed Part A</strong> records have separate bills with download options.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Part B Renewal History */}
                        {selectedPermit.partB.renewalHistory && selectedPermit.partB.renewalHistory.length > 0 && (
                          <div>
                            <h4 className='text-sm font-black text-red-700 mb-3 uppercase flex items-center gap-2'>
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                              </svg>
                              Part B Renewal History
                            </h4>
                            <div className='bg-red-50/50 rounded-xl p-4'>
                              <div className='space-y-3'>
                                {selectedPermit.partB.renewalHistory.map((renewal, index) => (
                                  <div key={renewal._id || index} className={`bg-white rounded-xl border-2 p-4 hover:shadow-md transition-all ${
                                    renewal.isOriginal ? 'border-blue-200' : 'border-red-200'
                                  }`}>
                                    <div className='flex items-start justify-between mb-3'>
                                      <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-2'>
                                          {renewal.isOriginal ? (
                                            <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded flex items-center gap-1'>
                                              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                              </svg>
                                              ORIGINAL PART B
                                            </span>
                                          ) : (
                                            <span className='px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded'>
                                              Renewal #{selectedPermit.partB.renewalHistory.filter(r => !r.isOriginal).findIndex(r => r._id === renewal._id) + 1}
                                            </span>
                                          )}
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            renewal.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                          }`}>
                                            {renewal.paymentStatus}
                                          </span>
                                        </div>
                                        <div className='grid grid-cols-2 gap-2 text-xs'>
                                          <div>
                                            <span className='text-gray-600 font-semibold'>Auth Number:</span>
                                            <p className='text-gray-900 font-mono font-bold'>{renewal.authorizationNumber}</p>
                                          </div>
                                          {!renewal.isOriginal && (
                                            <div>
                                              <span className='text-gray-600 font-semibold'>Bill Number:</span>
                                              <p className='text-gray-900 font-mono font-bold'>{renewal.billNumber}</p>
                                            </div>
                                          )}
                                          <div>
                                            <span className='text-gray-600 font-semibold'>Valid From:</span>
                                            <p className='text-gray-900 font-semibold'>{renewal.validFrom}</p>
                                          </div>
                                          <div>
                                            <span className='text-gray-600 font-semibold'>Valid To:</span>
                                            <p className='text-gray-900 font-semibold'>{renewal.validTo}</p>
                                          </div>
                                          <div>
                                            <span className='text-gray-600 font-semibold'>{renewal.isOriginal ? 'Issue Date:' : 'Renewal Date:'}</span>
                                            <p className='text-gray-900 font-semibold'>{new Date(renewal.renewalDate).toLocaleDateString('en-IN')}</p>
                                          </div>
                                          {!renewal.isOriginal && (
                                            <div>
                                              <span className='text-gray-600 font-semibold'>Fees:</span>
                                              <p className='text-red-700 font-black'>₹{renewal.fees?.toLocaleString('en-IN') || '0'}</p>
                                            </div>
                                          )}
                                        </div>
                                        {renewal.notes && (
                                          <div className='mt-2 pt-2 border-t border-gray-200'>
                                            <span className='text-gray-600 text-xs font-semibold'>Notes:</span>
                                            <p className='text-gray-700 text-xs mt-1'>{renewal.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons - Only show for renewals, NOT for original Part B */}
                                    {!renewal.isOriginal && renewal.billPdfPath && (
                                      <div className='flex items-center gap-2 pt-3 border-t border-red-200'>
                                        <button
                                          onClick={async () => {
                                            try {
                                              const downloadUrl = `${API_URL}/api/national-permits/${selectedPermit.id}/part-b-renewals/${renewal._id}/download-pdf`
                                              const link = document.createElement('a')
                                              link.href = downloadUrl
                                              link.download = `${renewal.billNumber}.pdf`
                                              link.target = '_blank'
                                              document.body.appendChild(link)
                                              link.click()
                                              document.body.removeChild(link)
                                            } catch (error) {
                                              console.error('Error downloading Part B bill:', error)
                                              alert('Failed to download bill')
                                            }
                                          }}
                                          className='flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-semibold'
                                        >
                                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                          </svg>
                                          Download Bill
                                        </button>
                                        <button
                                          onClick={() => {
                                            const pdfUrl = `http://localhost:5000${renewal.billPdfPath}`
                                            const message = `Hello ${selectedPermit.permitHolder},

Your Part B Renewal Bill is ready!

*Bill Number:* ${renewal.billNumber}
*Authorization Number:* ${renewal.authorizationNumber}
*Permit Number:* ${selectedPermit.permitNumber}
*Valid From:* ${renewal.validFrom}
*Valid To:* ${renewal.validTo}
*Amount:* ₹${renewal.fees?.toLocaleString('en-IN')}

Download your Part B renewal bill here:
${pdfUrl}

Thank you for your business!
- Ashok Kumar (Transport Consultant)`

                                            const encodedMessage = encodeURIComponent(message)
                                            const phoneNumber = (selectedPermit.partA?.ownerMobile || '').replace(/\D/g, '')

                                            if (!phoneNumber) {
                                              alert('No mobile number found')
                                              return
                                            }

                                            const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`
                                            const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`
                                            window.open(whatsappWebUrl, 'whatsapp_share')
                                          }}
                                          className='flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs font-semibold'
                                        >
                                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/>
                                          </svg>
                                          Share on WhatsApp
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className='mt-3 p-3 bg-white rounded-lg border border-blue-200'>
                                <p className='text-xs text-blue-700 font-semibold'>
                                  ℹ️ <strong>Original Part B</strong> was created with the initial permit. Its bill is available in the main "View Bill" section. Only <strong>renewed Part B</strong> records have separate bills with download options.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className='border-t border-gray-200 p-6 bg-gray-50'>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedPermit(null)
                  }}
                  className='px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold'
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleViewBill(selectedPermit)
                  }}
                  className='px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold'
                >
                  View Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Permit Modal */}
      <IssueNewPermitModal
        isOpen={showIssuePermitModal}
        onClose={() => setShowIssuePermitModal(false)}
        onSubmit={handleIssuePermit}
      />

      {/* Edit Permit Modal */}
      <EditNationalPermitModal
        isOpen={showEditPermitModal}
        onClose={() => {
          setShowEditPermitModal(false)
          setEditingPermit(null)
        }}
        onSubmit={handleUpdatePermit}
        permit={editingPermit}
      />

      {/* Bill Modal */}
      {showBillModal && selectedPermit && (
        <PermitBillModal
          permit={selectedPermit}
          onClose={() => {
            setShowBillModal(false)
            setSelectedPermit(null)
          }}
        />
      )}

      {/* Renew Part B Modal */}
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

      {/* Renew Part A Modal */}
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
