import { useState, useMemo } from 'react'
import AddInsuranceModal from '../components/AddInsuranceModal'

const Insurance = () => {
  // Demo data for when backend is not available
  const demoInsurances = [
    {
      id: 'INS-2024-001',
      vehicleNumber: 'CG-04-AB-1234',
      vehicleType: 'Heavy Goods Vehicle',
      ownerName: 'Rajesh Kumar',
      policyNumber: 'INS123456789',
      insuranceCompany: 'National Insurance Company',
      policyType: 'Comprehensive',
      issueDate: '2024-01-15',
      validFrom: '2024-01-15',
      validTo: '2025-01-14',
      premiumAmount: 25000,
      coverageAmount: 500000,
      mobileNumber: '+91 9876543210',
      agentName: 'Suresh Sharma',
      agentContact: '+91 9988776655'
    },
    {
      id: 'INS-2024-002',
      vehicleNumber: 'CG-07-CD-5678',
      vehicleType: 'Bus',
      ownerName: 'Singh Transport',
      policyNumber: 'INS123456790',
      insuranceCompany: 'United India Insurance',
      policyType: 'Comprehensive',
      issueDate: '2024-02-10',
      validFrom: '2024-02-10',
      validTo: '2025-02-09',
      premiumAmount: 35000,
      coverageAmount: 800000,
      mobileNumber: '+91 9876543211',
      agentName: 'Ramesh Patel',
      agentContact: '+91 9988776656'
    },
    {
      id: 'INS-2024-003',
      vehicleNumber: 'CG-20-EF-9012',
      vehicleType: 'Truck',
      ownerName: 'Patel Logistics',
      policyNumber: 'INS123456791',
      insuranceCompany: 'Oriental Insurance Company',
      policyType: 'Third Party',
      issueDate: '2024-03-05',
      validFrom: '2024-03-05',
      validTo: '2024-03-31',
      premiumAmount: 8000,
      coverageAmount: 200000,
      mobileNumber: '+91 9876543212',
      agentName: 'Vijay Kumar',
      agentContact: '+91 9988776657'
    },
    {
      id: 'INS-2024-004',
      vehicleNumber: 'CG-10-GH-3456',
      vehicleType: 'Pickup Truck',
      ownerName: 'Verma Transport',
      policyNumber: 'INS123456792',
      insuranceCompany: 'New India Assurance',
      policyType: 'Comprehensive',
      issueDate: '2023-01-15',
      validFrom: '2023-01-15',
      validTo: '2024-01-14',
      premiumAmount: 15000,
      coverageAmount: 300000,
      mobileNumber: '+91 9876543213',
      agentName: 'Mohan Singh',
      agentContact: '+91 9988776658'
    },
    {
      id: 'INS-2024-005',
      vehicleNumber: 'CG-04-IJ-7890',
      vehicleType: 'Maxi Cab',
      ownerName: 'Sharma Tours',
      policyNumber: 'INS123456793',
      insuranceCompany: 'ICICI Lombard',
      policyType: 'Comprehensive',
      issueDate: '2024-02-20',
      validFrom: '2024-02-20',
      validTo: '2025-02-19',
      premiumAmount: 18000,
      coverageAmount: 400000,
      mobileNumber: '+91 9876543214',
      agentName: 'Anil Verma',
      agentContact: '+91 9988776659'
    }
  ]

  const [insurances, setInsurances] = useState(demoInsurances)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState('All')

  const getStatusColor = (validTo) => {
    const today = new Date()
    const validToDate = new Date(validTo)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'bg-red-100 text-red-700'
    if (diffDays <= 30) return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (validTo) => {
    const today = new Date()
    const validToDate = new Date(validTo)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Expired'
    if (diffDays <= 30) return 'Expiring Soon'
    return 'Active'
  }

  // Filter insurances based on search query
  const filteredInsurances = useMemo(() => {
    if (!searchQuery.trim()) {
      return insurances
    }

    const searchLower = searchQuery.toLowerCase()
    return insurances.filter((insurance) =>
      insurance.vehicleNumber.toLowerCase().includes(searchLower) ||
      insurance.policyNumber.toLowerCase().includes(searchLower) ||
      insurance.ownerName.toLowerCase().includes(searchLower)
    )
  }, [insurances, searchQuery])

  const handleAddInsurance = (formData) => {
    const newInsurance = {
      id: `INS-${Date.now()}`,
      ...formData
    }
    setInsurances([newInsurance, ...insurances])
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'date') {
      setDateFilter(value)
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = insurances.length
    const active = insurances.filter(ins => getStatusText(ins.validTo) === 'Active').length
    const expiring = insurances.filter(ins => getStatusText(ins.validTo) === 'Expiring Soon').length
    const expired = insurances.filter(ins => getStatusText(ins.validTo) === 'Expired').length
    const totalPremium = insurances.reduce((sum, ins) => sum + (ins.premiumAmount || 0), 0)

    return { total, active, expiring, expired, totalPremium }
  }, [insurances])

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {/* Total Insurance Records */}
              <div className='bg-white rounded-lg shadow-md border border-indigo-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Insurance Records</p>
                    <h3 className='text-2xl font-black text-gray-800'>{stats.total}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Insurance */}
              <div className='bg-white rounded-lg shadow-md border border-emerald-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Active Insurance</p>
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

              {/* Total Premium */}
              <div className='bg-white rounded-lg shadow-md border border-purple-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Premium</p>
                    <h3 className='text-2xl font-black text-gray-800'>₹{stats.totalPremium.toLocaleString('en-IN')}</h3>
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
              Loading Insurance Records
            </p>
            <p className='text-sm text-gray-600'>Please wait while we fetch your data...</p>
          </div>
        </div>
      )}

      {!loading && (
      <>
      {/* Insurance Table */}
      <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
        {/* Search and Filters Header */}
        <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <div className='relative flex-1 lg:max-w-md'>
              <input
                type='text'
                placeholder='Search by vehicle no, policy no, or owner...'
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
                <option value='All'>All Insurance</option>
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

            {/* New Insurance Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <span className='flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                New Insurance Record
              </span>
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Policy Number</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Owner Name</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid To</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Premium</th>
                <th className='px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredInsurances.length > 0 ? (
                filteredInsurances.map((insurance) => (
                  <tr key={insurance.id} className='hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group'>
                    <td className='px-6 py-5'>
                      <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                        {insurance.policyNumber}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                          {insurance.ownerName?.charAt(0) || 'O'}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-bold text-gray-900'>{insurance.ownerName}</div>
                          <div className='text-xs text-gray-500 flex items-center mt-1'>
                            <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {insurance.mobileNumber || 'N/A'}
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
                        {insurance.vehicleNumber}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm text-gray-700'>
                        <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {insurance.validFrom}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm text-gray-700'>
                        <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {insurance.validTo}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-md text-sm font-bold bg-purple-100 text-purple-700 border border-purple-200'>
                        ₹{insurance.premiumAmount?.toLocaleString('en-IN') || '0'}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center justify-center'>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(insurance.validTo)}`}>
                          {getStatusText(insurance.validTo)}
                        </span>
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
                      <h3 className='text-xl font-black text-gray-700 mb-2'>No Insurance Records Found</h3>
                      <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                        {searchQuery ? 'No insurance records match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first insurance record.'}
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

      {/* Add Insurance Modal */}
      <AddInsuranceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddInsurance}
      />
        </div>
      </div>
    </>
  )
}

export default Insurance
