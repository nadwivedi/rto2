import { useState, useMemo } from 'react'
import AddVehicleTransferModal from '../components/AddVehicleTransferModal'

const VehicleTransfer = () => {
  const [transfers] = useState([
    { id: 'VT-2024-056', vehicleNo: 'MH-12-AB-1234', currentOwner: 'Amit Patel', newOwner: 'Rohit Sharma', transferDate: '08-10-2024', status: 'Completed', fee: 1500 },
    { id: 'VT-2024-057', vehicleNo: 'KA-05-CD-5678', currentOwner: 'Sneha Reddy', newOwner: 'Priya Singh', transferDate: '09-10-2024', status: 'Pending', fee: 1200 },
    { id: 'VT-2024-058', vehicleNo: 'DL-8C-EF-9012', currentOwner: 'Ravi Kumar', newOwner: 'Vikram Gupta', transferDate: '07-10-2024', status: 'Under Verification', fee: 1800 },
    { id: 'VT-2024-059', vehicleNo: 'UP-16-GH-3456', currentOwner: 'Pooja Singh', newOwner: 'Anjali Verma', transferDate: '10-10-2024', status: 'Completed', fee: 1500 },
    { id: 'VT-2024-060', vehicleNo: 'RJ-14-IJ-7890', currentOwner: 'Arjun Sharma', newOwner: 'Karan Mehta', transferDate: '06-10-2024', status: 'Pending', fee: 2000 },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const statistics = {
    total: 456,
    completed: 345,
    underVerification: 67,
    pending: 44
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border border-green-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      case 'Under Verification': return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const matchesSearch =
        transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.currentOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.newOwner.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !filterStatus || transfer.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [transfers, searchTerm, filterStatus])

  const handleAddNew = () => {
    setEditData(null)
    setShowModal(true)
  }

  const handleEdit = (transfer) => {
    setEditData(transfer)
    setShowModal(true)
  }

  const handleSuccess = () => {
    // Refresh transfers list
    console.log('Transfer saved successfully')
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Transfers */}
              <div className='bg-white rounded-lg shadow-md border border-gray-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Transfers</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className='bg-white rounded-lg shadow-md border border-green-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Completed</p>
                    <h3 className='text-lg lg:text-2xl font-black text-green-600'>{statistics.completed}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Under Verification */}
              <div className='bg-white rounded-lg shadow-md border border-blue-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Under Verification</p>
                    <h3 className='text-lg lg:text-2xl font-black text-blue-600'>{statistics.underVerification}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className='bg-white rounded-lg shadow-md border border-yellow-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending</p>
                    <h3 className='text-lg lg:text-2xl font-black text-yellow-600'>{statistics.pending}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfers Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-3 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by ID, vehicle no, owner...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-white shadow-sm'
                  />
                  <svg
                    className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className='px-4 py-3 text-sm border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-400 font-semibold bg-white hover:border-teal-300 transition-all shadow-sm'
                >
                  <option value=''>All Status</option>
                  <option value='Pending'>Pending</option>
                  <option value='Under Verification'>Under Verification</option>
                  <option value='Completed'>Completed</option>
                  <option value='Rejected'>Rejected</option>
                </select>

                {/* New Transfer Button */}
                <button
                  onClick={handleAddNew}
                  className='px-4 lg:px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  <span className='hidden lg:inline'>New Transfer</span>
                  <span className='lg:hidden'>New</span>
                </button>
              </div>

              {/* Results count */}
              <div className='mt-3 text-xs text-gray-600 font-semibold'>
                Showing {filteredTransfers.length} of {transfers.length} transfers
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Transfer Details</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Info</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Ownership Transfer</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Date</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Fee</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                    <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredTransfers.map((transfer) => (
                    <tr key={transfer.id} className='hover:bg-gradient-to-r hover:from-teal-50/50 hover:via-cyan-50/50 hover:to-blue-50/50 transition-all duration-200 group'>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                            </svg>
                          </div>
                          <div>
                            <div className='text-sm font-bold text-gray-900'>{transfer.id}</div>
                            <div className='text-xs text-gray-500 mt-0.5'>Transfer ID</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <svg className='w-4 h-4 text-teal-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                          </svg>
                          <div className='text-sm font-mono font-bold text-gray-900'>{transfer.vehicleNo}</div>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='flex-1'>
                            <div className='text-sm font-semibold text-gray-900'>{transfer.currentOwner}</div>
                            <div className='flex items-center gap-1 mt-1'>
                              <svg className='w-3 h-3 text-teal-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                              </svg>
                              <div className='text-xs font-semibold text-teal-700'>{transfer.newOwner}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center text-sm text-gray-600 font-semibold'>
                          <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {transfer.transferDate}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='text-sm font-bold text-gray-900'>₹{transfer.fee}</div>
                      </td>
                      <td className='px-4 py-4'>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleEdit(transfer)}
                            className='p-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-all duration-200'
                            title='Edit Transfer'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>
                          <button
                            className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200'
                            title='View Details'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                            </svg>
                          </button>
                          <button
                            className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200'
                            title='Delete Transfer'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransfers.length === 0 && (
              <div className='p-12 text-center'>
                <div className='text-gray-400'>
                  <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <p className='text-sm font-semibold text-gray-600'>No vehicle transfers found</p>
                  <p className='text-xs text-gray-500 mt-1'>Try adjusting your search or filter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddVehicleTransferModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditData(null)
        }}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </>
  )
}

export default VehicleTransfer
