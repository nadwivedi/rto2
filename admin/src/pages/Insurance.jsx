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
      insurance.policyNumber.toLowerCase().includes(searchLower)
    )
  }, [insurances, searchQuery])

  const handleAddInsurance = (formData) => {
    const newInsurance = {
      id: `INS-${Date.now()}`,
      ...formData
    }
    setInsurances([newInsurance, ...insurances])
  }

  const statistics = useMemo(() => {
    const total = insurances.length
    const active = insurances.filter(ins => getStatusText(ins.validTo) === 'Active').length
    const expiring = insurances.filter(ins => getStatusText(ins.validTo) === 'Expiring Soon').length
    const expired = insurances.filter(ins => getStatusText(ins.validTo) === 'Expired').length

    return { total, active, expiring, expired }
  }, [insurances])

  return (
    <div className='p-4 md:p-6 lg:p-8 pt-20 lg:pt-20 max-w-[1800px] mx-auto'>
      <div className='mb-6 md:mb-8'>
        <h1 className='text-xl md:text-3xl font-black text-gray-800 mb-1 md:mb-2'>Insurance Management</h1>
        <p className='text-sm md:text-base text-gray-600'>Manage vehicle insurance records</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>🛡️</div>
            <div className='text-xl font-black text-gray-800'>{statistics.total}</div>
          </div>
          <div className='text-xs text-gray-600'>Total Insurance Records</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>✅</div>
            <div className='text-xl font-black text-green-600'>{statistics.active}</div>
          </div>
          <div className='text-xs text-gray-600'>Active</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>⏰</div>
            <div className='text-xl font-black text-orange-600'>{statistics.expiring}</div>
          </div>
          <div className='text-xs text-gray-600'>Expiring Soon</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>❌</div>
            <div className='text-xl font-black text-red-600'>{statistics.expired}</div>
          </div>
          <div className='text-xs text-gray-600'>Expired</div>
        </div>
      </div>

      {/* Insurance Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>Insurance Records</h2>

            {/* Search Bar */}
            <div className='flex flex-col md:flex-row gap-3 w-full md:w-auto'>
              <div className='relative flex-1 md:w-96'>
                <input
                  type='text'
                  placeholder='Search by vehicle number or policy number...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <svg
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className='px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold whitespace-nowrap cursor-pointer'
              >
                + Add New Insurance
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className='mt-4 text-sm text-gray-600'>
            Showing {filteredInsurances.length} of {insurances.length} records
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle Number</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Policy Number</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid To</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Fee</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredInsurances.length > 0 ? (
                filteredInsurances.map((insurance) => (
                  <tr key={insurance.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-4 text-sm font-mono text-gray-800'>{insurance.vehicleNumber}</td>
                    <td className='px-6 py-4 text-sm font-mono text-gray-800'>{insurance.policyNumber}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{insurance.validFrom}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{insurance.validTo}</td>
                    <td className='px-6 py-4 text-sm font-semibold text-gray-800'>₹{insurance.fee}</td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(insurance.validTo)}`}>
                        {getStatusText(insurance.validTo)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-12 w-12 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-lg font-semibold text-gray-600'>No insurance records found</p>
                      <p className='text-sm text-gray-500 mt-1'>Click &quot;Add New Insurance&quot; to add your first record</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Insurance Modal */}
      <AddInsuranceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddInsurance}
      />
    </div>
  )
}

export default Insurance
