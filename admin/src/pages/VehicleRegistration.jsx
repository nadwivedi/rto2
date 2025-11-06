import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import RegisterVehicleModal from '../components/RegisterVehicleModal'
import Pagination from '../components/Pagination'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const VehicleRegistration = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statistics, setStatistics] = useState({
    total: 0
  })
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })

  useEffect(() => {
    fetchRegistrations(1)
    fetchStatistics()
  }, [searchTerm])

  const fetchRegistrations = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/vehicle-registrations`, {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm
        }
      })

      if (response.data.success) {
        setRegistrations(response.data.data)

        // Update pagination state
        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalRecords: response.data.pagination.totalRecords,
            limit: pagination.limit
          })
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vehicle-registrations/statistics`)

      if (response.data.success) {
        setStatistics(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle registration?')) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/vehicle-registrations/${id}`)

      if (response.data.success) {
        toast.success('Vehicle registration deleted successfully!', { position: 'top-right', autoClose: 3000 })
        fetchRegistrations()
        fetchStatistics()
      } else {
        toast.error(response.data.message || 'Failed to delete vehicle registration', { position: 'top-right', autoClose: 3000 })
      }
    } catch (error) {
      toast.error('Error deleting vehicle registration. Please try again.', { position: 'top-right', autoClose: 3000 })
      console.error('Error:', error)
    }
  }

  const handleEdit = (registration) => {
    setEditData(registration)
    setShowModal(true)
  }

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration)
    setShowDetailsModal(true)
  }

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchRegistrations(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Use registrations directly since filtering is done on backend
  const filteredRegistrations = registrations

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 gap-2 lg:gap-3 mb-5 max-w-sm'>
              {/* Total Registrations */}
              <div className='bg-white rounded-lg shadow-md border border-gray-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Vehicles</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
              <div className='flex flex-col lg:flex-row gap-3 items-stretch lg:items-center'>
                {/* Search Bar */}
                <div className='relative flex-1 lg:max-w-md'>
                  <input
                    type='text'
                    placeholder='Search by regn no, owner, chassis, engine...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
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

                {/* Register Button */}
                <button
                  onClick={() => {
                    setEditData(null)
                    setShowModal(true)
                  }}
                  className='px-4 lg:px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  <span className='hidden lg:inline'>Register Vehicle</span>
                  <span className='lg:hidden'>Register</span>
                </button>
              </div>

              {/* Results count */}
              <div className='mt-3 text-xs text-gray-600 font-semibold'>
                Showing {filteredRegistrations.length} of {registrations.length} records
              </div>
            </div>

            {loading ? (
              <div className='p-12 text-center'>
                <div className='text-gray-400'>
                  <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  <p className='text-sm font-semibold text-gray-600'>Loading registrations...</p>
                </div>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className='p-12 text-center'>
                <div className='text-gray-400'>
                  <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <p className='text-sm font-semibold text-gray-600'>No vehicle registrations found</p>
                  <p className='text-xs text-gray-500 mt-1'>Click &quot;Register Vehicle&quot; to add your first registration</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className='block lg:hidden'>
                  <div className='p-3 space-y-3'>
                    {filteredRegistrations.map((registration) => (
                      <div key={registration._id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                        {/* Card Header with Avatar and Actions */}
                        <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                              {registration.vehicleNumber?.substring(0, 2) || registration.registrationNumber?.substring(0, 2) || 'VH'}
                            </div>
                            <div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{registration.vehicleNumber || registration.registrationNumber}</div>
                              <div className='text-xs text-gray-600'>{registration.ownerName || '-'}</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex items-center gap-1.5'>
                            <button
                              onClick={() => handleViewDetails(registration)}
                              className='p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all cursor-pointer'
                              title='View'
                            >
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(registration)}
                              className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                              title='Edit'
                            >
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(registration._id)}
                              className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                              title='Delete'
                            >
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className='p-3 space-y-2.5'>
                          {/* Vehicle Details */}
                          <div className='grid grid-cols-2 gap-2'>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Chassis No</p>
                              <p className='text-sm font-mono font-bold text-gray-900'>{registration.chassisNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Engine No</p>
                              <p className='text-sm font-mono font-bold text-gray-900'>{registration.engineNumber || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Owner Details */}
                          {registration.sonWifeDaughterOf && (
                            <div className='pt-2 border-t border-gray-100'>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>S/W/D of</p>
                              <p className='text-xs font-semibold text-gray-700'>{registration.sonWifeDaughterOf}</p>
                            </div>
                          )}

                          {/* Weight Details */}
                          <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Laden Weight</p>
                              <p className='text-sm font-bold text-gray-800'>{registration.ladenWeight ? `${registration.ladenWeight} kg` : 'N/A'}</p>
                            </div>
                            <div>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase'>Unladen Weight</p>
                              <p className='text-sm font-bold text-gray-800'>{registration.unladenWeight ? `${registration.unladenWeight} kg` : 'N/A'}</p>
                            </div>
                          </div>

                          {/* Registration Date */}
                          {registration.dateOfRegistration && (
                            <div className='pt-2 border-t border-gray-100'>
                              <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                                <svg className='w-3 h-3 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                </svg>
                                Registration Date
                              </p>
                              <p className='text-xs font-semibold text-gray-700'>{registration.dateOfRegistration}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className='hidden lg:block overflow-x-auto'>
                  <table className='w-full'>
                  <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                    <tr>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Registration Number</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Chassis Number</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Engine Number</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Owner Name</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Laden Weight</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Unladen Weight</th>
                      <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredRegistrations.map((registration) => (
                      <tr key={registration._id} className='hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/50 hover:to-pink-50/50 transition-all duration-200 group'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {registration.vehicleNumber?.substring(0, 2) || registration.registrationNumber?.substring(0, 2) || 'VH'}
                            </div>
                            <div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{registration.vehicleNumber || registration.registrationNumber}</div>
                              <div className='text-xs text-gray-500 mt-0.5'>
                                {registration.dateOfRegistration && `Regn: ${registration.dateOfRegistration}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-gray-900'>{registration.chassisNumber || 'N/A'}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-gray-900'>{registration.engineNumber || 'N/A'}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-bold text-gray-900'>{registration.ownerName || 'N/A'}</div>
                          {registration.sonWifeDaughterOf && (
                            <div className='text-xs text-gray-500 mt-0.5'>S/W/D of {registration.sonWifeDaughterOf}</div>
                          )}
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-gray-900'>{registration.ladenWeight ? `${registration.ladenWeight} kg` : 'N/A'}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-gray-900'>{registration.unladenWeight ? `${registration.unladenWeight} kg` : 'N/A'}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center justify-center gap-1.5'>
                            <button
                              onClick={() => handleViewDetails(registration)}
                              className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='View Details'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(registration)}
                              className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Edit'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(registration._id)}
                              className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                              title='Delete'
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

              {/* Pagination */}
              {!loading && filteredRegistrations.length > 0 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalRecords={pagination.totalRecords}
                  itemsPerPage={pagination.limit}
                />
              )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Register/Edit Modal */}
      <RegisterVehicleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditData(null)
        }}
        onSuccess={() => {
          fetchRegistrations()
          fetchStatistics()
        }}
        editData={editData}
      />

      {/* View Details Modal */}
      {showDetailsModal && selectedRegistration && (
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
                    <h2 className='text-xl font-bold'>Vehicle Registration Details</h2>
                    <p className='text-white/80 text-sm mt-0.5'>{selectedRegistration.vehicleNumber || selectedRegistration.registrationNumber}</p>
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
                {/* Column 1: Registration & Vehicle Details */}
                <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200'>
                  <h3 className='text-base font-bold text-indigo-900 mb-3 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                    Registration & Vehicle
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    {selectedRegistration.registrationNumber && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Registration Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.registrationNumber}</div>
                      </div>
                    )}
                    {selectedRegistration.chassisNumber && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Chassis Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.chassisNumber}</div>
                      </div>
                    )}
                    {selectedRegistration.engineNumber && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Engine Number</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.engineNumber}</div>
                      </div>
                    )}
                    {selectedRegistration.dateOfRegistration && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Date of Registration</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.dateOfRegistration}</div>
                      </div>
                    )}
                    {selectedRegistration.makerName && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Maker Name</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.makerName}</div>
                      </div>
                    )}
                    {selectedRegistration.makerModel && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Maker Model</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.makerModel}</div>
                      </div>
                    )}
                    {selectedRegistration.colour && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Colour</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.colour}</div>
                      </div>
                    )}
                    {selectedRegistration.vehicleClass && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Vehicle Class</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.vehicleClass}</div>
                      </div>
                    )}
                    {selectedRegistration.vehicleType && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Vehicle Type</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.vehicleType}</div>
                      </div>
                    )}
                    {selectedRegistration.vehicleCategory && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Vehicle Category</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.vehicleCategory}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Owner Details */}
                <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200'>
                  <h3 className='text-base font-bold text-purple-900 mb-3 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Owner Details
                  </h3>
                  <div className='space-y-2'>
                    {selectedRegistration.ownerName && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Owner Name</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.ownerName}</div>
                      </div>
                    )}
                    {selectedRegistration.sonWifeDaughterOf && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Son/Wife/Daughter of</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.sonWifeDaughterOf}</div>
                      </div>
                    )}
                    {selectedRegistration.address && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Address</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{selectedRegistration.address}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3 & 4: Additional Details */}
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 lg:col-span-2'>
                  <h3 className='text-base font-bold text-blue-900 mb-3 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Additional Details
                  </h3>
                  <div className='grid grid-cols-3 gap-2'>
                    {selectedRegistration.seatingCapacity && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Seating Capacity</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.seatingCapacity} seats</div>
                      </div>
                    )}
                    {selectedRegistration.manufactureYear && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Manufacture Year</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.manufactureYear}</div>
                      </div>
                    )}
                    {(selectedRegistration.ladenWeight !== undefined && selectedRegistration.ladenWeight !== null) && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Laden Weight</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.ladenWeight} kg</div>
                      </div>
                    )}
                    {(selectedRegistration.unladenWeight !== undefined && selectedRegistration.unladenWeight !== null) && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Unladen Weight</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.unladenWeight} kg</div>
                      </div>
                    )}
                    {selectedRegistration.purchaseDeliveryDate && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Purchase/Delivery Date</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.purchaseDeliveryDate}</div>
                      </div>
                    )}
                    {selectedRegistration.saleAmount && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-xs font-semibold text-gray-600'>Sale Amount</div>
                        <div className='text-sm font-bold text-gray-900 mt-0.5'>₹{selectedRegistration.saleAmount.toLocaleString()}</div>
                      </div>
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
    </>
  )
}

export default VehicleRegistration
