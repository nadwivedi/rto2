import { useState, useMemo, useEffect } from 'react'
import IssueNewPermitModal from '../components/IssueNewPermitModal'
import EditNationalPermitModal from '../components/EditNationalPermitModal'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import MobileHeader from '../components/MobileHeader'

const API_BASE_URL = 'http://localhost:5000/api'

const NationalPermit = ({ setIsSidebarOpen }) => {
  const [permits, setPermits] = useState([
    {
      id: 'NP-2024-001',
      permitNumber: 'NP001234567',
      permitHolder: 'Rajesh Transport Services',
      vehicleNo: 'MH-12-AB-1234',
      issueDate: '2024-01-15',
      validTill: '2025-01-14',
      status: 'Active',
      partA: {
        permitNumber: 'NP001234567',
        permitType: 'National Permit',
        ownerName: 'Rajesh Transport Services',
        ownerAddress: '123, Transport Nagar, Mumbai, Maharashtra - 400001',
        ownerMobile: '+91 9876543210',
        vehicleNumber: 'MH-12-AB-1234',
        vehicleClass: 'Heavy Goods Vehicle',
        vehicleType: 'Truck',
        chassisNumber: 'MB1234567890ABCDE',
        engineNumber: 'ENG12345678',
        makerModel: 'TATA LPT 1616',
        yearOfManufacture: '2023',
        seatingCapacity: '2',
        route: 'All India',
        permitValidFrom: '2024-01-15',
        permitValidUpto: '2025-01-14',
        issuingAuthority: 'Regional Transport Office, Mumbai',
        issueDate: '2024-01-15',
        fees: '₹15,000'
      },
      partB: {
        permitNumber: 'NP001234567',
        authorization: 'Carriage of Goods',
        goodsType: 'General Goods',
        maxLoadCapacity: '16,000 kg',
        validRoutes: 'All National Highways and State Highways across India',
        restrictions: 'No carriage of hazardous materials',
        conditions: 'Valid for goods transportation only. Driver must carry valid driving license and vehicle documents.',
        endorsements: 'None',
        renewalHistory: [
          { date: '2023-01-15', amount: '₹15,000', status: 'Completed' }
        ],
        insuranceDetails: {
          policyNumber: 'INS123456789',
          company: 'National Insurance Company',
          validUpto: '2024-12-31'
        },
        taxDetails: {
          taxPaidUpto: '2024-12-31',
          taxAmount: '₹25,000'
        }
      }
    },
    {
      id: 'NP-2024-002',
      permitNumber: 'NP001234568',
      permitHolder: 'Kumar Logistics Pvt Ltd',
      vehicleNo: 'DL-1C-CD-5678',
      issueDate: '2024-02-10',
      validTill: '2025-02-09',
      status: 'Active',
      partA: {
        permitNumber: 'NP001234568',
        permitType: 'National Permit',
        ownerName: 'Kumar Logistics Pvt Ltd',
        ownerAddress: '456, Industrial Area, Delhi - 110001',
        ownerMobile: '+91 9876543211',
        vehicleNumber: 'DL-1C-CD-5678',
        vehicleClass: 'Medium Goods Vehicle',
        vehicleType: 'Truck',
        chassisNumber: 'MB1234567890ABCDF',
        engineNumber: 'ENG12345679',
        makerModel: 'ASHOK LEYLAND DOST',
        yearOfManufacture: '2023',
        seatingCapacity: '2',
        route: 'All India',
        permitValidFrom: '2024-02-10',
        permitValidUpto: '2025-02-09',
        issuingAuthority: 'Regional Transport Office, Delhi',
        issueDate: '2024-02-10',
        fees: '₹12,000'
      },
      partB: {
        permitNumber: 'NP001234568',
        authorization: 'Carriage of Goods',
        goodsType: 'Packaged Goods',
        maxLoadCapacity: '7,500 kg',
        validRoutes: 'All National Highways and State Highways across India',
        restrictions: 'No carriage of perishable items without proper refrigeration',
        conditions: 'Valid for goods transportation only. Vehicle must undergo fitness test annually.',
        endorsements: 'Express Delivery Authorized',
        renewalHistory: [
          { date: '2023-02-10', amount: '₹12,000', status: 'Completed' }
        ],
        insuranceDetails: {
          policyNumber: 'INS123456790',
          company: 'United India Insurance',
          validUpto: '2024-11-30'
        },
        taxDetails: {
          taxPaidUpto: '2024-11-30',
          taxAmount: '₹18,000'
        }
      }
    },
    {
      id: 'NP-2024-003',
      permitNumber: 'NP001234569',
      permitHolder: 'Singh Brothers Transport',
      vehicleNo: 'PB-10-EF-9012',
      issueDate: '2024-03-05',
      validTill: '2025-03-04',
      status: 'Active',
      partA: {
        permitNumber: 'NP001234569',
        permitType: 'National Permit',
        ownerName: 'Singh Brothers Transport',
        ownerAddress: '789, Transport Hub, Ludhiana, Punjab - 141001',
        ownerMobile: '+91 9876543212',
        vehicleNumber: 'PB-10-EF-9012',
        vehicleClass: 'Heavy Goods Vehicle',
        vehicleType: 'Container Truck',
        chassisNumber: 'MB1234567890ABCDG',
        engineNumber: 'ENG12345680',
        makerModel: 'TATA PRIMA 4038.S',
        yearOfManufacture: '2024',
        seatingCapacity: '2',
        route: 'All India',
        permitValidFrom: '2024-03-05',
        permitValidUpto: '2025-03-04',
        issuingAuthority: 'Regional Transport Office, Ludhiana',
        issueDate: '2024-03-05',
        fees: '₹18,000'
      },
      partB: {
        permitNumber: 'NP001234569',
        authorization: 'Carriage of Goods',
        goodsType: 'Containerized Cargo',
        maxLoadCapacity: '28,000 kg',
        validRoutes: 'All National Highways and State Highways across India',
        restrictions: 'No overloading beyond specified capacity',
        conditions: 'Valid for containerized goods only. Must maintain trip log book.',
        endorsements: 'Port Clearance Authorized',
        renewalHistory: [],
        insuranceDetails: {
          policyNumber: 'INS123456791',
          company: 'Oriental Insurance Company',
          validUpto: '2025-02-28'
        },
        taxDetails: {
          taxPaidUpto: '2025-02-28',
          taxAmount: '₹35,000'
        }
      }
    },
    {
      id: 'NP-2024-004',
      permitNumber: 'NP001234570',
      permitHolder: 'Maharashtra Freight Services',
      vehicleNo: 'MH-14-GH-3456',
      issueDate: '2024-01-20',
      validTill: '2024-12-31',
      status: 'Expiring Soon',
      partA: {
        permitNumber: 'NP001234570',
        permitType: 'National Permit',
        ownerName: 'Maharashtra Freight Services',
        ownerAddress: '321, Cargo Complex, Pune, Maharashtra - 411001',
        ownerMobile: '+91 9876543213',
        vehicleNumber: 'MH-14-GH-3456',
        vehicleClass: 'Medium Goods Vehicle',
        vehicleType: 'Truck',
        chassisNumber: 'MB1234567890ABCDH',
        engineNumber: 'ENG12345681',
        makerModel: 'EICHER PRO 3015',
        yearOfManufacture: '2022',
        seatingCapacity: '2',
        route: 'All India',
        permitValidFrom: '2024-01-20',
        permitValidUpto: '2024-12-31',
        issuingAuthority: 'Regional Transport Office, Pune',
        issueDate: '2024-01-20',
        fees: '₹14,000'
      },
      partB: {
        permitNumber: 'NP001234570',
        authorization: 'Carriage of Goods',
        goodsType: 'Industrial Materials',
        maxLoadCapacity: '9,500 kg',
        validRoutes: 'All National Highways and State Highways across India',
        restrictions: 'No carriage of flammable materials',
        conditions: 'Valid for industrial goods only. Monthly maintenance certificate required.',
        endorsements: 'None',
        renewalHistory: [
          { date: '2023-01-20', amount: '₹14,000', status: 'Completed' },
          { date: '2022-01-20', amount: '₹13,000', status: 'Completed' }
        ],
        insuranceDetails: {
          policyNumber: 'INS123456792',
          company: 'New India Assurance',
          validUpto: '2024-12-15'
        },
        taxDetails: {
          taxPaidUpto: '2024-12-15',
          taxAmount: '₹20,000'
        }
      }
    },
    {
      id: 'NP-2024-005',
      permitNumber: 'NP001234571',
      permitHolder: 'Gujarat Transport Corporation',
      vehicleNo: 'GJ-01-IJ-7890',
      issueDate: '2023-12-15',
      validTill: '2024-12-14',
      status: 'Pending Renewal',
      partA: {
        permitNumber: 'NP001234571',
        permitType: 'National Permit',
        ownerName: 'Gujarat Transport Corporation',
        ownerAddress: '654, Transport Plaza, Ahmedabad, Gujarat - 380001',
        ownerMobile: '+91 9876543214',
        vehicleNumber: 'GJ-01-IJ-7890',
        vehicleClass: 'Heavy Goods Vehicle',
        vehicleType: 'Multi-axle Truck',
        chassisNumber: 'MB1234567890ABCDI',
        engineNumber: 'ENG12345682',
        makerModel: 'BHARAT BENZ 3143',
        yearOfManufacture: '2023',
        seatingCapacity: '2',
        route: 'All India',
        permitValidFrom: '2023-12-15',
        permitValidUpto: '2024-12-14',
        issuingAuthority: 'Regional Transport Office, Ahmedabad',
        issueDate: '2023-12-15',
        fees: '₹16,500'
      },
      partB: {
        permitNumber: 'NP001234571',
        authorization: 'Carriage of Goods',
        goodsType: 'Heavy Machinery Parts',
        maxLoadCapacity: '25,000 kg',
        validRoutes: 'All National Highways and State Highways across India',
        restrictions: 'Load must be properly secured. No transportation during night on hilly routes.',
        conditions: 'Valid for heavy goods only. Requires special transportation permit for oversized loads.',
        endorsements: 'Heavy Load Authorized',
        renewalHistory: [
          { date: '2022-12-15', amount: '₹16,000', status: 'Completed' }
        ],
        insuranceDetails: {
          policyNumber: 'INS123456793',
          company: 'ICICI Lombard',
          validUpto: '2024-11-30'
        },
        taxDetails: {
          taxPaidUpto: '2024-11-30',
          taxAmount: '₹32,000'
        }
      }
    }
  ])

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

  // Fetch permits from backend on component mount and when filters or page change
  useEffect(() => {
    fetchPermits()
  }, [dateFilter, currentPage]) // Re-fetch when filters or page change

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
        issueDate: formData.validFrom,
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

      // Refresh the permits list
      await fetchPermits()
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
        issueDate: formData.issueDate || formData.validFrom,
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

      // Refresh the permits list
      await fetchPermits()

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
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 pt-20 lg:pt-6'>
        <div className='mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <h1 className='text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'>
            National Permit
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-6 mb-8 rounded-2xl shadow-lg'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-md'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <h3 className='text-red-900 font-black text-lg mb-1'>Error Loading Permits</h3>
              <p className='text-red-700 text-sm font-medium'>{error}</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Stats Cards */}
      {!loading && (
      <>
      <div className='grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 max-w-xs'>
        <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 shadow-md border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>📄</div>
            <div className='text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>{permits.length}</div>
          </div>
          <div className='text-xs font-semibold text-blue-700'>Total Permits</div>
        </div>
      </div>

      {/* Permits Table */}
      <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6'>
          <div className='flex flex-col md:flex-row gap-3 items-start md:items-center justify-between'>
            {/* Filters */}
            <div className='flex flex-wrap gap-3 items-center'>
              {/* Date Filter */}
              <div className='flex items-center gap-2'>
                <label className='text-white text-sm font-semibold whitespace-nowrap'>Validity:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className='px-3 py-2 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-white focus:border-white shadow-lg transition-all text-gray-800 font-medium cursor-pointer text-sm'
                >
                  <option value='All'>All Permits</option>
                  <option value='Expiring30Days'>Expiring in 30 Days</option>
                  <option value='Expiring60Days'>Expiring in 60 Days</option>
                  <option value='Expired'>Expired</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {dateFilter !== 'All' && (
                <button
                  onClick={() => {
                    handleFilterChange('date', 'All')
                  }}
                  className='px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all font-semibold text-sm flex items-center gap-1 cursor-pointer'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {/* Search Bar and Add Button */}
            <div className='flex gap-3 items-center w-full md:w-auto'>
              <div className='relative w-full md:w-64'>
                <input
                  type='text'
                  placeholder='Search permits...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-white focus:border-white shadow-lg transition-all text-gray-800 placeholder-gray-500 text-sm'
                />
                <svg
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>

              <button
                onClick={() => setShowIssuePermitModal(true)}
                className='px-5 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all font-bold whitespace-nowrap cursor-pointer transform hover:scale-105 flex items-center gap-2 text-sm'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                Add New Permit
              </button>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
              <tr>
                <th className='px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider'>
                  <div className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 20l4-16m2 16l4-16M6 9h14M4 15h14' />
                    </svg>
                    Permit Number
                  </div>
                </th>
                <th className='px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider'>
                  <div className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Permit Holder
                  </div>
                </th>
                <th className='px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider'>
                  <div className='flex items-center gap-2'>
                    <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' />
                    </svg>
                    Vehicle No.
                  </div>
                </th>
                <th className='px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider'>Issue Date</th>
                <th className='px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider'>Valid Till</th>
                <th className='px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y-0'>
              {filteredPermits.length > 0 ? (
                filteredPermits.map((permit, index) => (
                  <tr key={permit.id} className='group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 border-b border-gray-100 last:border-0'>
                    <td className='px-6 py-5'>
                      <span className='text-sm font-bold text-gray-900 font-mono'>{permit.permitNumber}</span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm'>
                          {permit.permitHolder.charAt(0)}
                        </div>
                        <div>
                          <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                          <div className='text-xs text-gray-500'>Permit Holder</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-md transition-all'>
                        <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
                        </svg>
                        <span className='text-sm font-bold font-mono text-gray-900'>{permit.vehicleNo}</span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='text-sm text-gray-700 font-medium'>{permit.issueDate}</div>
                      <div className='text-xs text-gray-500'>Issued</div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='text-sm text-gray-700 font-medium'>{permit.validTill}</div>
                      <div className='text-xs text-gray-500'>Expires</div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex gap-2 flex-wrap'>
                        <button
                          onClick={() => handleViewDetails(permit)}
                          className='px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg font-semibold text-xs transition-all transform hover:scale-105 cursor-pointer flex items-center gap-1'
                        >
                          <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleEditPermit(permit)}
                          className='px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg font-semibold text-xs transition-all transform hover:scale-105 cursor-pointer flex items-center gap-1'
                        >
                          <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewBill(permit)}
                          className='px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-lg font-semibold text-xs transition-all transform hover:scale-105 cursor-pointer'
                        >
                          Bill
                        </button>
                        <button
                          onClick={() => handleShare(permit)}
                          className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold text-xs transition-all transform hover:scale-105 cursor-pointer flex items-center gap-1'
                          title='Share via WhatsApp'
                        >
                          <svg className='w-3.5 h-3.5' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z' />
                          </svg>
                          Share
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-6 py-16'>
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
          <div className='p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
              {/* Pagination Info */}
              <div className='text-sm text-gray-600 font-medium'>
                Showing <span className='font-bold text-gray-800'>{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className='font-bold text-gray-800'>{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className='font-bold text-gray-800'>{totalItems}</span> permits
              </div>

              {/* Pagination Controls */}
              <div className='flex items-center gap-2'>
                {/* First Page Button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm cursor-pointer'
                  }`}
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
                  </svg>
                </button>

                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm cursor-pointer'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className='flex items-center gap-1'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                          currentPage === pageNumber
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-indigo-50 shadow-sm cursor-pointer'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm cursor-pointer'
                  }`}
                >
                  Next
                </button>

                {/* Last Page Button */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm cursor-pointer'
                  }`}
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 5l7 7-7 7M5 5l7 7-7 7' />
                  </svg>
                </button>
              </div>

              {/* Page Jump */}
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600 font-medium'>Go to page:</span>
                <input
                  type='number'
                  min='1'
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value)
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page)
                    }
                  }}
                  className='w-16 px-2 py-1 border border-gray-300 rounded-lg text-center font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
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
    </>
  )
}

export default NationalPermit
