import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import IssueCgPermitModal from '../components/IssueCgPermitModal'
import EditCgPermitModal from '../components/EditCgPermitModal'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const CgPermit = () => {
  // Demo data for when backend is not available
  const demoPermits = [
    {
      id: 'CG-2024-001',
      permitNumber: 'CG001234567',
      permitType: 'State Goods Permit',
      permitHolder: 'Kumar Transport Services',
      vehicleNo: 'CG-04-AB-1234',
      issueDate: '2024-01-15',
      validFrom: '2024-01-15',
      validTill: '2025-01-14',
      validityPeriod: '1 Year',
      status: 'Active',
      fees: 8000,
      address: '123, Transport Nagar, Raipur, CG - 492001',
      mobileNumber: '+91 9876543210',
      route: 'Within Chhattisgarh State',
      goodsType: 'General Goods',
      issuingAuthority: 'RTO Raipur',
      vehicleModel: 'TATA LPT 1212',
      vehicleType: 'Truck',
      chassisNumber: 'MB1234567890ABCDE',
      engineNumber: 'ENG12345678'
    },
    {
      id: 'CG-2024-002',
      permitNumber: 'CG001234568',
      permitType: 'State Passenger Permit',
      permitHolder: 'Singh Bus Services',
      vehicleNo: 'CG-07-CD-5678',
      issueDate: '2024-02-10',
      validFrom: '2024-02-10',
      validTill: '2025-02-09',
      validityPeriod: '1 Year',
      status: 'Active',
      fees: 10000,
      address: '456, Bus Stand Road, Bilaspur, CG - 495001',
      mobileNumber: '+91 9876543211',
      route: 'Raipur to Bilaspur',
      goodsType: 'N/A',
      issuingAuthority: 'RTO Bilaspur',
      vehicleModel: 'ASHOK LEYLAND Viking',
      vehicleType: 'Bus',
      chassisNumber: 'MB1234567890ABCDF',
      engineNumber: 'ENG12345679'
    },
    {
      id: 'CG-2024-003',
      permitNumber: 'CG001234569',
      permitType: 'State Goods Permit',
      permitHolder: 'Patel Logistics',
      vehicleNo: 'CG-20-EF-9012',
      issueDate: '2024-03-05',
      validFrom: '2024-03-05',
      validTill: '2024-12-31',
      validityPeriod: '9 Months',
      status: 'Expiring Soon',
      fees: 7500,
      address: '789, Industrial Area, Durg, CG - 491001',
      mobileNumber: '+91 9876543212',
      route: 'Within Chhattisgarh State',
      goodsType: 'Industrial Materials',
      issuingAuthority: 'RTO Durg',
      vehicleModel: 'EICHER PRO 3015',
      vehicleType: 'Truck',
      chassisNumber: 'MB1234567890ABCDG',
      engineNumber: 'ENG12345680'
    },
    {
      id: 'CG-2024-004',
      permitNumber: 'CG001234570',
      permitType: 'State Goods Permit',
      permitHolder: 'Verma Freight Services',
      vehicleNo: 'CG-10-GH-3456',
      issueDate: '2023-12-15',
      validFrom: '2023-12-15',
      validTill: '2024-12-14',
      validityPeriod: '1 Year',
      status: 'Pending Renewal',
      fees: 8500,
      address: '321, Cargo Complex, Raigarh, CG - 496001',
      mobileNumber: '+91 9876543213',
      route: 'Within Chhattisgarh State',
      goodsType: 'Agricultural Products',
      issuingAuthority: 'RTO Raigarh',
      vehicleModel: 'MAHINDRA Bolero Pickup',
      vehicleType: 'Pickup Truck',
      chassisNumber: 'MB1234567890ABCDH',
      engineNumber: 'ENG12345681'
    },
    {
      id: 'CG-2024-005',
      permitNumber: 'CG001234571',
      permitType: 'State Passenger Permit',
      permitHolder: 'Sharma Tours & Travels',
      vehicleNo: 'CG-04-IJ-7890',
      issueDate: '2024-01-20',
      validFrom: '2024-01-20',
      validTill: '2025-01-19',
      validityPeriod: '1 Year',
      status: 'Active',
      fees: 9500,
      address: '654, Station Road, Korba, CG - 495677',
      mobileNumber: '+91 9876543214',
      route: 'Raipur to Korba',
      goodsType: 'N/A',
      issuingAuthority: 'RTO Korba',
      vehicleModel: 'TATA Winger',
      vehicleType: 'Maxi Cab',
      chassisNumber: 'MB1234567890ABCDI',
      engineNumber: 'ENG12345682'
    }
  ]

  const navigate = useNavigate()
  const [permits, setPermits] = useState([])
  const [expiringCount, setExpiringCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('All')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Fetch permits from backend on component mount
  useEffect(() => {
    fetchPermits()
    fetchExpiringCount()
  }, [])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/api/cg-permits`)

      // Transform backend data to match frontend structure
      const transformedPermits = response.data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        permitType: permit.permitType,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validFrom: permit.validFrom,
        validTill: permit.validTo,
        validityPeriod: permit.validityPeriod,
        status: permit.status,
        fees: permit.totalFee || permit.fees || 0,
        balance: permit.balance || 0,
        paid: permit.paid || 0,
        address: permit.address || 'N/A',
        mobileNumber: permit.mobileNumber || 'N/A',
        route: permit.route,
        goodsType: permit.goodsType || 'General Goods',
        issuingAuthority: permit.issuingAuthority,
        vehicleModel: permit.vehicleModel || 'N/A',
        vehicleType: permit.vehicleType || 'N/A',
        chassisNumber: permit.chassisNumber || 'N/A',
        engineNumber: permit.engineNumber || 'N/A',
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
      }))

      setPermits(transformedPermits)
    } catch (error) {
      console.error('Error fetching CG permits:', error)
      console.log('Using demo data as fallback')
      // Use demo data when backend is not available
      setPermits(demoPermits)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpiringCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cg-permits/expiring`, {
        params: { days: 30 }
      })

      if (response.data.pagination) {
        setExpiringCount(response.data.pagination.totalItems || 0)
      }
    } catch (error) {
      console.error('Error fetching expiring count:', error)
      // Fallback to calculating from permits
      setExpiringCount(0)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Pending Renewal': return 'bg-yellow-100 text-yellow-700'
      case 'Expiring Soon': return 'bg-orange-100 text-orange-700'
      case 'Expired': return 'bg-red-100 text-red-700'
      case 'Suspended': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Filter permits based on search query
  const filteredPermits = useMemo(() => {
    if (!searchQuery.trim()) {
      return permits
    }

    const searchLower = searchQuery.toLowerCase()
    return permits.filter((permit) =>
      permit.permitNumber.toLowerCase().includes(searchLower) ||
      permit.permitHolder.toLowerCase().includes(searchLower) ||
      permit.vehicleNo.toLowerCase().includes(searchLower)
    )
  }, [permits, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = permits.length
    const active = permits.filter(p => p.status === 'Active').length
    const expiring = permits.filter(p => p.status === 'Expiring Soon').length
    const pendingPaymentCount = permits.filter(p => (p.balance || 0) > 0).length
    const pendingPaymentAmount = permits.reduce((sum, permit) => sum + (permit.balance || 0), 0)

    return {
      total,
      active,
      expiring,
      pendingPaymentCount,
      pendingPaymentAmount
    }
  }, [permits])

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

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'date') {
      setDateFilter(value)
    }
  }

  const handleIssuePermit = async (formData) => {
    try {
      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        vehicleNumber: formData.vehicleNumber,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        issueDate: formData.validFrom,
        permitType: 'Type A',
        validityPeriod: 5,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleType: formData.vehicleType || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        yearOfManufacture: new Date().getFullYear().toString(),
        seatingCapacity: '2',
        goodsType: formData.goodsType || 'General Goods',
        route: 'Chhattisgarh State',
        maxLoadCapacity: formData.grossWeight ? `${formData.grossWeight} kg` : '',
        fees: Number(formData.fees) || 10000,
        status: 'Active'
      }

      // Make POST request to backend
      const response = await axios.post(`${API_URL}/api/cg-permits`, permitData)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create CG permit')
      }

      // Show success message
      toast.success('CG Permit added successfully!', { position: 'top-right', autoClose: 3000 })

      // Refresh the permits list
      await fetchPermits()
    } catch (error) {
      console.error('Error creating CG permit:', error)
      toast.error(`Failed to create CG permit: ${error.message}`, { position: 'top-right', autoClose: 3000 })
    }
  }

  const handleUpdatePermit = async (formData) => {
    try {
      if (!editingPermit || !editingPermit.id) {
        throw new Error('No permit selected for editing')
      }

      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolder,
        vehicleNumber: formData.vehicleNumber,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        status: formData.status,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleType: formData.vehicleType || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        goodsType: formData.goodsType || 'General Goods',
        fees: Number(formData.fees) || 10000
      }

      // Make PUT request to backend
      const response = await axios.put(`${API_URL}/api/cg-permits/${editingPermit.id}`, permitData)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update CG permit')
      }

      // Show success message
      toast.success('CG Permit updated successfully!', { position: 'top-right', autoClose: 3000 })

      // Refresh the permits list
      await fetchPermits()
      await fetchExpiringCount()

      // Close the modal
      setShowEditPermitModal(false)
      setEditingPermit(null)
    } catch (error) {
      console.error('Error updating CG permit:', error)
      toast.error(`Failed to update CG permit: ${error.message}`, { position: 'top-right', autoClose: 3000 })
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
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total CG Permits</p>
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

              {/* Expiring Soon */}
              <div
                onClick={() => navigate('/cg-permit-expiring')}
                className='bg-white rounded-lg shadow-md border border-orange-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:scale-105 transform transition-transform'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{expiringCount}</h3>
                    <p className='text-[7px] lg:text-[9px] text-gray-400 mt-0.5'>Within 30 days</p>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Payment */}
              <div className='bg-white rounded-lg shadow-md border border-yellow-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending Payment</p>
                    <h3 className='text-lg lg:text-2xl font-black text-yellow-600'>{stats.pendingPaymentCount}</h3>
                    {stats.pendingPaymentAmount > 0 && (
                      <p className='text-[7px] lg:text-[9px] text-gray-500 font-semibold mt-0.5'>
                        ₹{stats.pendingPaymentAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md'>
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
              Loading CG Permits
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
                New CG Permit
              </span>
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Permit Number</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Permit Holder</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid Till</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Permit Fee</th>
                <th className='px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredPermits.length > 0 ? (
                filteredPermits.map((permit) => (
                  <tr key={permit.id} className='hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group'>
                    <td className='px-6 py-5'>
                      <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                        {permit.permitNumber}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                          {permit.permitHolder?.charAt(0) || 'P'}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                          <div className='text-xs text-gray-500 flex items-center mt-1'>
                            <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {permit.mobileNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200'>
                        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                        </svg>
                        {permit.vehicleNo}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm text-gray-700'>
                        <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {permit.validFrom}
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
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-purple-100 text-purple-700 border border-purple-200'>
                        ₹{permit.fees?.toLocaleString('en-IN') || '0'}
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
                  <td colSpan='7' className='px-6 py-16'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg'>
                        <svg className='w-12 h-12 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                      </div>
                      <h3 className='text-xl font-black text-gray-700 mb-2'>No CG Permits Found</h3>
                      <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                        {searchQuery ? 'No permits match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first CG permit.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Add New CG Permit Modal */}
      <IssueCgPermitModal
        isOpen={showIssuePermitModal}
        onClose={() => setShowIssuePermitModal(false)}
        onSubmit={handleIssuePermit}
      />

      {/* Edit CG Permit Modal */}
      <EditCgPermitModal
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
          permitType="CG"
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
          permitType="CG"
        />
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPermit && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
          <div className='bg-white rounded-3xl shadow-2xl w-[90%] max-h-[95vh] overflow-hidden animate-slideUp'>
            {/* Header */}
            <div className='sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-5 z-10 shadow-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='bg-white/20 backdrop-blur-lg p-2 rounded-xl'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                  <div>
                    <h2 className='text-xl font-bold'>CG Permit Details</h2>
                    <p className='text-white/80 text-sm mt-0.5'>{selectedPermit.permitNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className='text-white/90 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all duration-200 hover:rotate-90'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='overflow-y-auto max-h-[calc(95vh-130px)] p-5'>
              <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
                {/* Column 1: Permit Details */}
                <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200'>
                  <h3 className='text-base font-bold text-indigo-900 mb-3 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                    Permit Information
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    {selectedPermit.permitNumber && (
                      <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                        <div className='text-xs font-semibold text-gray-600'>Permit Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitNumber}</div>
                      </div>
                    )}
                    {selectedPermit.permitType && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Permit Type</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitType}</div>
                      </div>
                    )}
                    {selectedPermit.status && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Status</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                            selectedPermit.status === 'Active' ? 'bg-green-100 text-green-700' :
                            selectedPermit.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {selectedPermit.status}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedPermit.issueDate && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Issue Date</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.issueDate}</div>
                      </div>
                    )}
                    {selectedPermit.validFrom && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Valid From</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validFrom}</div>
                      </div>
                    )}
                    {selectedPermit.validTill && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Valid Till</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validTill}</div>
                      </div>
                    )}
                    {selectedPermit.validityPeriod && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Validity Period</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validityPeriod} months</div>
                      </div>
                    )}
                    {selectedPermit.issuingAuthority && (
                      <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                        <div className='text-xs font-semibold text-gray-600'>Issuing Authority</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.issuingAuthority}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Holder & Vehicle Details */}
                <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200'>
                  <h3 className='text-base font-bold text-purple-900 mb-3 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Holder & Vehicle
                  </h3>
                  <div className='space-y-2'>
                    {selectedPermit.permitHolder && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Permit Holder</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitHolder}</div>
                      </div>
                    )}
                    {selectedPermit.address && selectedPermit.address !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Address</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{selectedPermit.address}</div>
                      </div>
                    )}
                    {selectedPermit.mobileNumber && selectedPermit.mobileNumber !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Mobile Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.mobileNumber}</div>
                      </div>
                    )}
                    {selectedPermit.vehicleNo && selectedPermit.vehicleNo !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Vehicle Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleNo}</div>
                      </div>
                    )}
                    {selectedPermit.vehicleType && selectedPermit.vehicleType !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Vehicle Type</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleType}</div>
                      </div>
                    )}
                    {selectedPermit.vehicleModel && selectedPermit.vehicleModel !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Vehicle Model</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleModel}</div>
                      </div>
                    )}
                    {selectedPermit.chassisNumber && selectedPermit.chassisNumber !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Chassis Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.chassisNumber}</div>
                      </div>
                    )}
                    {selectedPermit.engineNumber && selectedPermit.engineNumber !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Engine Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.engineNumber}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3 & 4: Route & Additional Details */}
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 lg:col-span-2'>
                  <h3 className='text-base font-bold text-blue-900 mb-3 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Route & Additional Details
                  </h3>
                  <div className='grid grid-cols-3 gap-2'>
                    {selectedPermit.route && (
                      <div className='bg-white/80 p-2 rounded-lg col-span-3'>
                        <div className='text-xs font-semibold text-gray-600'>Route</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.route}</div>
                      </div>
                    )}
                    {selectedPermit.goodsType && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Goods Type</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.goodsType}</div>
                      </div>
                    )}
                    {selectedPermit.fees !== undefined && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Total Fee</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>₹{selectedPermit.fees.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    {selectedPermit.paid !== undefined && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Paid Amount</div>
                        <div className='text-sm font-bold text-green-700 mt-0.5'>₹{selectedPermit.paid.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    {selectedPermit.balance !== undefined && selectedPermit.balance > 0 && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Balance</div>
                        <div className='text-sm font-bold text-orange-600 mt-0.5'>₹{selectedPermit.balance.toLocaleString('en-IN')}</div>
                      </div>
                    )}

                    {selectedPermit.insuranceDetails && selectedPermit.insuranceDetails.policyNumber !== 'N/A' && (
                      <>
                        <div className='bg-white/80 p-2 rounded-lg col-span-3 mt-2'>
                          <div className='text-xs font-semibold text-indigo-600'>Insurance Details</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-xs font-semibold text-gray-600'>Policy Number</div>
                          <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.policyNumber}</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-xs font-semibold text-gray-600'>Company</div>
                          <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.company}</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-xs font-semibold text-gray-600'>Valid Upto</div>
                          <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.validUpto}</div>
                        </div>
                      </>
                    )}

                    {selectedPermit.taxDetails && selectedPermit.taxDetails.taxPaidUpto !== 'N/A' && (
                      <>
                        <div className='bg-white/80 p-2 rounded-lg col-span-3 mt-2'>
                          <div className='text-xs font-semibold text-indigo-600'>Tax Details</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-xs font-semibold text-gray-600'>Tax Paid Upto</div>
                          <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.taxDetails.taxPaidUpto}</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-xs font-semibold text-gray-600'>Tax Amount</div>
                          <div className='text-sm font-bold text-gray-900 mt-0.5'>₹{selectedPermit.taxDetails.taxAmount}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='sticky bottom-0 bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end'>
              <button
                onClick={() => setShowDetailsModal(false)}
                className='px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  )
}

export default CgPermit
