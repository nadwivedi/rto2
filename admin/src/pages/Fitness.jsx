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
      record.vehicleNumber.toLowerCase().includes(searchLower) ||
      record.ownerName.toLowerCase().includes(searchLower) ||
      record.certificateNumber.toLowerCase().includes(searchLower) ||
      record.mobileNumber.toLowerCase().includes(searchLower)
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
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {/* Total Fitness Records */}
              <div className='bg-white rounded-lg shadow-md border border-gray-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Fitness</p>
                    <h3 className='text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active */}
              <div className='bg-white rounded-lg shadow-md border border-green-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Active</p>
                    <h3 className='text-2xl font-black text-green-600'>{statistics.active}</h3>
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
                    <h3 className='text-2xl font-black text-orange-600'>{statistics.expiring}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expired */}
              <div className='bg-white rounded-lg shadow-md border border-red-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Expired</p>
                    <h3 className='text-2xl font-black text-red-600'>{statistics.expired}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by vehicle number, owner...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all bg-white shadow-sm'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className='px-4 lg:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  <span className='hidden lg:inline'>Add New Fitness Certificate</span>
                  <span className='lg:hidden'>Add New</span>
                </button>
              </div>

              {/* Results count */}
              <div className='mt-3 text-xs text-gray-600 font-semibold'>
                Showing {filteredRecords.length} of {fitnessRecords.length} records
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Details</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Owner Info</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Certificate Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid From</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Valid To</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Fees</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                      <tr key={record.id} className='hover:bg-gradient-to-r hover:from-green-50/50 hover:via-emerald-50/50 hover:to-teal-50/50 transition-all duration-200 group'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {record.vehicleNumber?.substring(0, 2) || 'V'}
                            </div>
                            <div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{record.vehicleNumber}</div>
                              <div className='text-xs text-gray-500 mt-0.5'>{record.vehicleType}</div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-bold text-gray-900'>{record.ownerName}</div>
                          <div className='text-xs text-gray-500 flex items-center mt-1'>
                            <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {record.mobileNumber}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-mono font-semibold text-gray-900'>{record.certificateNumber}</div>
                          <div className='text-xs text-gray-500 mt-0.5'>{record.issuingAuthority}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-green-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {record.validFrom}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-red-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {record.validTo}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='text-sm font-bold text-gray-800'>₹{record.fees.toLocaleString('en-IN')}</span>
                        </td>
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(record.validTo)}`}>
                            {getStatusText(record.validTo)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='7' className='px-4 py-8 text-center'>
                        <div className='text-gray-400'>
                          <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>No fitness records found</p>
                          <p className='text-xs text-gray-500 mt-1'>Click &quot;Add New Fitness Certificate&quot; to add your first record</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Fitness Modal */}
      <AddFitnessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFitness}
      />
    </>
  )
}

export default Fitness
