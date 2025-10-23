import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import IssueNewPermitModal from '../components/IssueNewPermitModal'
import EditNationalPermitModal from '../components/EditNationalPermitModal'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import MobileHeader from '../components/MobileHeader'

const API_BASE_URL = 'http://localhost:5000/api'

const NationalPermit = ({ setIsSidebarOpen }) => {
  const navigate = useNavigate()
  const [permits, setPermits] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [dateFilter, setDateFilter] = useState('All')

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
      const partAResponse = await fetch(`${API_BASE_URL}/national-permits/part-a-expiring-soon?page=1&limit=1`)
      const partAData = await partAResponse.json()
      console.log('Part A Response:', partAData)
      const partACount = partAData.pagination?.totalItems || 0
      console.log('Part A Count:', partACount)
      setPartAExpiringCount(partACount)

      // Fetch Part B expiring count
      const partBResponse = await fetch(`${API_BASE_URL}/national-permits/part-b-expiring-soon?page=1&limit=1`)
      const partBData = await partBResponse.json()
      console.log('Part B Response:', partBData)
      const partBCount = partBData.pagination?.totalItems || 0
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

      const url = `${API_BASE_URL}/national-permits?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch permits')
      }

      // Update pagination info
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages)
        setTotalItems(data.pagination.totalItems)
      }

      // Transform backend data to match frontend structure
      const transformedPermits = data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validTill: permit.validTo,
        status: permit.status,
        partA: {
          permitNumber: permit.permitNumber,
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
          renewalHistory: permit.renewalHistory || [],
          insuranceDetails: permit.insuranceDetails || {
            policyNumber: 'N/A',
            company: 'N/A',
            validUpto: 'N/A'
          },
          taxDetails: permit.taxDetails || {
            taxPaidUpto: 'N/A',
            taxAmount: 'N/A'
          }
        }
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

  const handleShare = (permit) => {
    setSelectedPermit(permit)
    setShowShareModal(true)
  }

  const handleEditPermit = (permit) => {
    setEditingPermit(permit)
    setShowEditPermitModal(true)
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
      const response = await fetch(`${API_BASE_URL}/national-permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create permit')
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
      const response = await fetch(`${API_BASE_URL}/national-permits/${editingPermit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update permit')
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
      <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>


          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {/* Total Permits */}
              <div className='bg-white rounded-lg shadow-md border border-indigo-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Permits</p>
                    <h3 className='text-2xl font-black text-gray-800'>{stats.total}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Permits */}
              <div className='bg-white rounded-lg shadow-md border border-emerald-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Active Permits</p>
                    <h3 className='text-2xl font-black text-emerald-600'>{stats.active}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Part A - Expiring Soon */}
              <div
                onClick={() => navigate('/national-part-a-expiring')}
                className='bg-white rounded-lg shadow-md border border-orange-100 p-3.5 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Part A - Expiring Soon</p>
                    <h3 className='text-2xl font-black text-orange-600'>{stats.expiring}</h3>
                    <p className='text-[9px] text-gray-400 mt-0.5'>Within 30 days</p>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Part B - Expiring Soon */}
              <div
                onClick={() => navigate('/national-part-b-expiring')}
                className='bg-white rounded-lg shadow-md border border-purple-100 p-3.5 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Part B - Expiring Soon</p>
                    <h3 className='text-2xl font-black text-purple-600'>{stats.partBExpiring}</h3>
                    <p className='text-[9px] text-gray-400 mt-0.5'>Within 30 days</p>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
        <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <div className='relative flex-1 lg:max-w-md'>
              <input
                type='text'
                placeholder='Search by permit number, holder, or vehicle...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* Filters Group */}
            <div className='flex flex-wrap gap-2'>
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Permits</option>
                <option value='Expiring30Days'>Expiring in 30 Days</option>
                <option value='Expiring60Days'>Expiring in 60 Days</option>
                <option value='Expired'>Expired</option>
              </select>

              {/* Clear Filters */}
              {dateFilter !== 'All' && (
                <button
                  onClick={() => handleFilterChange('date', 'All')}
                  className='px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg'
                >
                  Clear
                </button>
              )}
            </div>

            {/* New Permit Button */}
            <button
              onClick={() => setShowIssuePermitModal(true)}
              className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <span className='flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                New Permit
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
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleViewDetails(permit)}
                          className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='View Details'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditPermit(permit)}
                          className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='Edit Permit'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleViewBill(permit)}
                          className='p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='View Bill'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleShare(permit)}
                          className='p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='Share'
                        >
                          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z' />
                          </svg>
                        </button>
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
                  <h4 className='text-sm font-black text-purple-700 mb-3 flex items-center gap-2'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                    </svg>
                    TYPE B AUTHORIZATION
                  </h4>
                  <p className='text-sm font-semibold text-gray-800'>{selectedPermit.partB.authorizationNumber}</p>
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
                  </div>
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

                    // Check for Permit Details fields
                    const hasPermitType = hasValue(selectedPermit.partA.permitType)
                    const hasRoute = hasValue(selectedPermit.partA.route)
                    const hasIssuingAuthority = hasValue(selectedPermit.partA.issuingAuthority)
                    const hasIssueDate = hasValue(selectedPermit.partA.issueDate)
                    const hasGoodsType = hasValue(selectedPermit.partB.goodsType)
                    const hasValidRoutes = hasValue(selectedPermit.partB.validRoutes)
                    const hasRestrictions = hasValue(selectedPermit.partB.restrictions)
                    const hasConditions = hasValue(selectedPermit.partB.conditions)
                    const hasEndorsements = hasValue(selectedPermit.partB.endorsements)
                    const hasPermitDetails = hasPermitType || hasRoute || hasIssuingAuthority || hasIssueDate ||
                                            hasGoodsType || hasValidRoutes || hasRestrictions || hasConditions || hasEndorsements

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

                        {/* Permit Details */}
                        {hasPermitDetails && (
                          <div>
                            <h4 className='text-sm font-black text-blue-700 mb-3 uppercase'>Permit Details</h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 rounded-xl p-4'>
                              {hasPermitType && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Permit Type</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.permitType}</p>
                                </div>
                              )}
                              {hasRoute && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Route</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.route}</p>
                                </div>
                              )}
                              {hasIssuingAuthority && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Issuing Authority</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.issuingAuthority}</p>
                                </div>
                              )}
                              {hasIssueDate && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Issue Date</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partA.issueDate}</p>
                                </div>
                              )}
                              {hasGoodsType && (
                                <div>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Goods Type</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.goodsType}</p>
                                </div>
                              )}
                              {hasValidRoutes && (
                                <div className='md:col-span-2'>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Valid Routes</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.validRoutes}</p>
                                </div>
                              )}
                              {hasRestrictions && (
                                <div className='md:col-span-2'>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Restrictions</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.restrictions}</p>
                                </div>
                              )}
                              {hasConditions && (
                                <div className='md:col-span-2'>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Conditions</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.conditions}</p>
                                </div>
                              )}
                              {hasEndorsements && (
                                <div className='md:col-span-2'>
                                  <label className='text-xs font-bold text-gray-600 uppercase'>Endorsements</label>
                                  <p className='text-sm font-semibold text-gray-800 mt-1'>{selectedPermit.partB.endorsements}</p>
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

                        {/* Renewal History */}
                        {selectedPermit.partB.renewalHistory && selectedPermit.partB.renewalHistory.length > 0 && (
                          <div>
                            <h4 className='text-sm font-black text-teal-700 mb-3 uppercase'>Renewal History</h4>
                            <div className='bg-teal-50/50 rounded-xl p-4'>
                              <div className='space-y-2'>
                                {selectedPermit.partB.renewalHistory.map((renewal, index) => (
                                  <div key={index} className='flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-teal-200'>
                                    <span className='text-sm font-semibold text-gray-800'>{renewal.date}</span>
                                    <span className='text-sm font-semibold text-gray-800'>{renewal.amount}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      renewal.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {renewal.status}
                                    </span>
                                  </div>
                                ))}
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

      {/* Share Modal */}
      {showShareModal && selectedPermit && (
        <SharePermitModal
          permit={selectedPermit}
          onClose={() => {
            setShowShareModal(false)
            setSelectedPermit(null)
          }}
        />
      )}
      </div>
      </div>
    </>
  )
}

export default NationalPermit
