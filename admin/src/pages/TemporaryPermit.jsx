import { useState, useMemo, useEffect } from 'react'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import IssueTemporaryPermitModal from '../components/IssueTemporaryPermitModal'

const API_BASE_URL = 'http://localhost:5000/api'

const TemporaryPermit = () => {
  // Demo data for when backend is not available
  const demoPermits = [
    {
      id: 'TP-2024-001',
      permitNumber: 'TP001234567',
      vehicleType: 'CV',
      vehicleTypeFull: 'Commercial Vehicle',
      validityPeriod: '30 Days',
      permitHolder: 'Rajesh Transport',
      vehicleNo: 'CG-04-TMP-1234',
      issueDate: '2024-03-01',
      validFrom: '2024-03-01',
      validTill: '2024-03-31',
      status: 'Active',
      fees: 2500,
      address: '123, Transport Nagar, Raipur, CG - 492001',
      mobileNumber: '+91 9876543210',
      route: 'Raipur to Bilaspur',
      purpose: 'Temporary Commercial Use',
      issuingAuthority: 'RTO Raipur',
      vehicleModel: 'TATA ACE',
      vehicleClass: 'Light Commercial Vehicle',
      chassisNumber: 'MB1234567890ABCDE',
      engineNumber: 'ENG12345678'
    },
    {
      id: 'TP-2024-002',
      permitNumber: 'TP001234568',
      vehicleType: 'PV',
      vehicleTypeFull: 'Passenger Vehicle',
      validityPeriod: '15 Days',
      permitHolder: 'Priya Sharma',
      vehicleNo: 'CG-07-TMP-5678',
      issueDate: '2024-03-10',
      validFrom: '2024-03-10',
      validTill: '2024-03-25',
      status: 'Expiring Soon',
      fees: 1500,
      address: '456, Civil Lines, Durg, CG - 491001',
      mobileNumber: '+91 9876543211',
      route: 'Durg to Raipur',
      purpose: 'Vehicle Transfer',
      issuingAuthority: 'RTO Durg',
      vehicleModel: 'Maruti Swift',
      vehicleClass: 'Motor Car',
      chassisNumber: 'MB1234567890ABCDF',
      engineNumber: 'ENG12345679'
    },
    {
      id: 'TP-2024-003',
      permitNumber: 'TP001234569',
      vehicleType: 'CV',
      vehicleTypeFull: 'Commercial Vehicle',
      validityPeriod: '45 Days',
      permitHolder: 'Kumar Logistics',
      vehicleNo: 'CG-20-TMP-9012',
      issueDate: '2024-02-20',
      validFrom: '2024-02-20',
      validTill: '2024-04-05',
      status: 'Active',
      fees: 3000,
      address: '789, Industrial Area, Bilaspur, CG - 495001',
      mobileNumber: '+91 9876543212',
      route: 'Bilaspur to Korba',
      purpose: 'New Vehicle Registration',
      issuingAuthority: 'RTO Bilaspur',
      vehicleModel: 'MAHINDRA Bolero Pickup',
      vehicleClass: 'Goods Vehicle',
      chassisNumber: 'MB1234567890ABCDG',
      engineNumber: 'ENG12345680'
    },
    {
      id: 'TP-2024-004',
      permitNumber: 'TP001234570',
      vehicleType: 'PV',
      vehicleTypeFull: 'Passenger Vehicle',
      validityPeriod: '7 Days',
      permitHolder: 'Amit Verma',
      vehicleNo: 'CG-10-TMP-3456',
      issueDate: '2024-03-01',
      validFrom: '2024-03-01',
      validTill: '2024-03-08',
      status: 'Expired',
      fees: 1000,
      address: '321, Station Road, Raigarh, CG - 496001',
      mobileNumber: '+91 9876543213',
      route: 'Raigarh to Raipur',
      purpose: 'Fitness Test',
      issuingAuthority: 'RTO Raigarh',
      vehicleModel: 'Honda City',
      vehicleClass: 'Motor Car',
      chassisNumber: 'MB1234567890ABCDH',
      engineNumber: 'ENG12345681'
    },
    {
      id: 'TP-2024-005',
      permitNumber: 'TP001234571',
      vehicleType: 'CV',
      vehicleTypeFull: 'Commercial Vehicle',
      validityPeriod: '30 Days',
      permitHolder: 'Singh Transport Services',
      vehicleNo: 'CG-04-TMP-7890',
      issueDate: '2024-03-05',
      validFrom: '2024-03-05',
      validTill: '2024-04-04',
      status: 'Active',
      fees: 2800,
      address: '654, Bus Stand, Korba, CG - 495677',
      mobileNumber: '+91 9876543214',
      route: 'Korba to Raipur',
      purpose: 'Route Change',
      issuingAuthority: 'RTO Korba',
      vehicleModel: 'EICHER PRO 1049',
      vehicleClass: 'Light Commercial Vehicle',
      chassisNumber: 'MB1234567890ABCDI',
      engineNumber: 'ENG12345682'
    }
  ]

  const [permits, setPermits] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('All')

  // Fetch permits from backend on component mount
  useEffect(() => {
    fetchPermits()
  }, [])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/temporary-permits`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch temporary permits')
      }

      // Transform backend data to match frontend structure
      const transformedPermits = data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        vehicleType: permit.vehicleType,
        vehicleTypeFull: permit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle',
        validityPeriod: permit.validityPeriod,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validFrom: permit.validFrom,
        validTill: permit.validTo,
        status: permit.status,
        fees: permit.fees,
        address: permit.address || 'N/A',
        mobileNumber: permit.mobileNumber || 'N/A',
        route: permit.route || 'N/A',
        purpose: permit.purpose || 'Temporary Use',
        issuingAuthority: permit.issuingAuthority,
        vehicleModel: permit.vehicleModel || 'N/A',
        vehicleClass: permit.vehicleClass || 'N/A',
        chassisNumber: permit.chassisNumber || 'N/A',
        engineNumber: permit.engineNumber || 'N/A',
        insuranceDetails: permit.insuranceDetails || {
          policyNumber: 'N/A',
          company: 'N/A',
          validUpto: 'N/A'
        }
      }))

      setPermits(transformedPermits)
    } catch (error) {
      console.error('Error fetching temporary permits:', error)
      console.log('Using demo data as fallback')
      // Use demo data when backend is not available
      setPermits(demoPermits)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Expiring Soon': return 'bg-orange-100 text-orange-700'
      case 'Expired': return 'bg-red-100 text-red-700'
      case 'Cancelled': return 'bg-gray-100 text-gray-700'
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
    const totalRevenue = permits.reduce((sum, permit) => sum + (permit.fees || 0), 0)

    return {
      total,
      active,
      expiring,
      totalRevenue
    }
  }, [permits])

  const handleViewBill = (permit) => {
    setSelectedPermit(permit)
    setShowBillModal(true)
  }

  const handleShare = (permit) => {
    setSelectedPermit(permit)
    setShowShareModal(true)
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
        vehicleType: formData.vehicleType,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        validityPeriod: formData.vehicleType === 'CV' ? 3 : 4,
        issueDate: formData.validFrom,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleClass: formData.vehicleClass || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        yearOfManufacture: new Date().getFullYear().toString(),
        seatingCapacity: formData.seatingCapacity || '',
        route: formData.route || '',
        purpose: formData.purpose || 'Temporary Use',
        fees: Number(formData.fees) || 1000,
        status: 'Active'
      }

      // Make POST request to backend
      const response = await fetch(`${API_BASE_URL}/temporary-permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create temporary permit')
      }

      // Show success message
      alert('Temporary Permit added successfully!')

      // Refresh the permits list
      await fetchPermits()
    } catch (error) {
      console.error('Error creating temporary permit:', error)
      alert(`Failed to create temporary permit: ${error.message}`)
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {/* Total Permits */}
              <div className='bg-white rounded-lg shadow-md border border-indigo-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Temporary Permits</p>
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

              {/* Expiring Soon */}
              <div className='bg-white rounded-lg shadow-md border border-orange-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Expiring Soon</p>
                    <h3 className='text-2xl font-black text-orange-600'>{stats.expiring}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className='bg-white rounded-lg shadow-md border border-purple-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Revenue</p>
                    <h3 className='text-2xl font-black text-gray-800'>₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
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
              Loading Temporary Permits
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
                New Temporary Permit
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
                      <h3 className='text-xl font-black text-gray-700 mb-2'>No Temporary Permits Found</h3>
                      <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                        {searchQuery ? 'No permits match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first temporary permit.'}
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

      {/* Add New Temporary Permit Modal */}
      <IssueTemporaryPermitModal
        isOpen={showIssuePermitModal}
        onClose={() => setShowIssuePermitModal(false)}
        onSubmit={handleIssuePermit}
      />

      {/* Bill Modal */}
      {showBillModal && selectedPermit && (
        <PermitBillModal
          permit={selectedPermit}
          onClose={() => {
            setShowBillModal(false)
            setSelectedPermit(null)
          }}
          permitType="Temporary"
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
          permitType="Temporary"
        />
      )}
        </div>
      </div>
    </>
  )
}

export default TemporaryPermit
