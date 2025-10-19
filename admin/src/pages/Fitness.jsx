import { useState, useMemo } from 'react'
import AddFitnessModal from '../components/AddFitnessModal'

const Fitness = () => {
  // Demo data for when backend is not available
  const demoFitnessRecords = [
    {
      id: 'FIT-2024-001',
      vehicleNumber: 'CG-04-AB-1234',
      vehicleType: 'Heavy Goods Vehicle',
      ownerName: 'Rajesh Kumar',
      certificateNumber: 'FIT001234567',
      issueDate: '15/01/2024',
      validFrom: '15/01/2024',
      validTo: '14/01/2025',
      issuingAuthority: 'RTO Raipur',
      mobileNumber: '+91 9876543210',
      chassisNumber: 'MB1234567890ABCDE',
      engineNumber: 'ENG12345678',
      fees: 1500
    },
    {
      id: 'FIT-2024-002',
      vehicleNumber: 'CG-07-CD-5678',
      vehicleType: 'Bus',
      ownerName: 'Singh Transport',
      certificateNumber: 'FIT001234568',
      issueDate: '10/02/2024',
      validFrom: '10/02/2024',
      validTo: '09/02/2025',
      issuingAuthority: 'RTO Bilaspur',
      mobileNumber: '+91 9876543211',
      chassisNumber: 'MB1234567890ABCDF',
      engineNumber: 'ENG12345679',
      fees: 2000
    },
    {
      id: 'FIT-2024-003',
      vehicleNumber: 'CG-20-EF-9012',
      vehicleType: 'Truck',
      ownerName: 'Patel Logistics',
      certificateNumber: 'FIT001234569',
      issueDate: '05/03/2024',
      validFrom: '05/03/2024',
      validTo: '31/03/2024',
      issuingAuthority: 'RTO Durg',
      mobileNumber: '+91 9876543212',
      chassisNumber: 'MB1234567890ABCDG',
      engineNumber: 'ENG12345680',
      fees: 1800
    },
    {
      id: 'FIT-2024-004',
      vehicleNumber: 'CG-10-GH-3456',
      vehicleType: 'Pickup Truck',
      ownerName: 'Verma Transport',
      certificateNumber: 'FIT001234570',
      issueDate: '15/01/2023',
      validFrom: '15/01/2023',
      validTo: '14/01/2024',
      issuingAuthority: 'RTO Raigarh',
      mobileNumber: '+91 9876543213',
      chassisNumber: 'MB1234567890ABCDH',
      engineNumber: 'ENG12345681',
      fees: 1200
    },
    {
      id: 'FIT-2024-005',
      vehicleNumber: 'CG-04-IJ-7890',
      vehicleType: 'Maxi Cab',
      ownerName: 'Sharma Tours',
      certificateNumber: 'FIT001234571',
      issueDate: '20/02/2024',
      validFrom: '20/02/2024',
      validTo: '19/02/2025',
      issuingAuthority: 'RTO Korba',
      mobileNumber: '+91 9876543214',
      chassisNumber: 'MB1234567890ABCDI',
      engineNumber: 'ENG12345682',
      fees: 1500
    }
  ]

  const [fitnessRecords, setFitnessRecords] = useState(demoFitnessRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const getStatusColor = (validTo) => {
    const today = new Date()
    const validToDate = new Date(validTo.split('/').reverse().join('-'))
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'bg-red-100 text-red-700'
    if (diffDays <= 30) return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (validTo) => {
    const today = new Date()
    const validToDate = new Date(validTo.split('/').reverse().join('-'))
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Expired'
    if (diffDays <= 30) return 'Expiring Soon'
    return 'Active'
  }

  // Filter fitness records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) {
      return fitnessRecords
    }

    const searchLower = searchQuery.toLowerCase()
    return fitnessRecords.filter((record) =>
      record.vehicleNumber.toLowerCase().includes(searchLower)
    )
  }, [fitnessRecords, searchQuery])

  const handleAddFitness = (formData) => {
    const newRecord = {
      id: `FIT-${Date.now()}`,
      ...formData
    }
    setFitnessRecords([newRecord, ...fitnessRecords])
  }

  const statistics = useMemo(() => {
    const total = fitnessRecords.length
    const active = fitnessRecords.filter(rec => getStatusText(rec.validTo) === 'Active').length
    const expiring = fitnessRecords.filter(rec => getStatusText(rec.validTo) === 'Expiring Soon').length
    const expired = fitnessRecords.filter(rec => getStatusText(rec.validTo) === 'Expired').length

    return { total, active, expiring, expired }
  }, [fitnessRecords])

  return (
    <div className='p-4 md:p-6 lg:p-8 pt-20 lg:pt-20 max-w-[1800px] mx-auto'>
      <div className='mb-6 md:mb-8'>
        <h1 className='text-xl md:text-3xl font-black text-gray-800 mb-1 md:mb-2'>Fitness Management</h1>
        <p className='text-sm md:text-base text-gray-600'>Manage vehicle fitness certificates</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>✅</div>
            <div className='text-xl font-black text-gray-800'>{statistics.total}</div>
          </div>
          <div className='text-xs text-gray-600'>Total Fitness Records</div>
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

      {/* Fitness Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>Fitness Certificate Records</h2>

            {/* Search Bar */}
            <div className='flex flex-col md:flex-row gap-3 w-full md:w-auto'>
              <div className='relative flex-1 md:w-96'>
                <input
                  type='text'
                  placeholder='Search by vehicle number...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
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
                className='px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-semibold whitespace-nowrap cursor-pointer'
              >
                + Add New Fitness Certificate
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className='mt-4 text-sm text-gray-600'>
            Showing {filteredRecords.length} of {fitnessRecords.length} records
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle Number</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid To</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Fee</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-4 text-sm font-mono text-gray-800'>{record.vehicleNumber}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{record.validFrom}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{record.validTo}</td>
                    <td className='px-6 py-4 text-sm font-semibold text-gray-800'>₹{record.fee}</td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.validTo)}`}>
                        {getStatusText(record.validTo)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='5' className='px-6 py-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-12 w-12 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-lg font-semibold text-gray-600'>No fitness records found</p>
                      <p className='text-sm text-gray-500 mt-1'>Click &quot;Add New Fitness Certificate&quot; to add your first record</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fitness Modal */}
      <AddFitnessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFitness}
      />
    </div>
  )
}

export default Fitness
