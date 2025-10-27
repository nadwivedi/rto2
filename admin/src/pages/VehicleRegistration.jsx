import { useState, useEffect, useMemo } from 'react'
import RegisterVehicleModal from '../components/RegisterVehicleModal'

const VehicleRegistration = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    transferred: 0,
    cancelled: 0
  })

  useEffect(() => {
    fetchRegistrations()
    fetchStatistics()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/vehicle-registrations')
      const data = await response.json()

      if (data.success) {
        setRegistrations(data.data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicle-registrations/statistics')
      const data = await response.json()

      if (data.success) {
        setStatistics(data.data)
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
      const response = await fetch(`http://localhost:5000/api/vehicle-registrations/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('Vehicle registration deleted successfully!')
        fetchRegistrations()
        fetchStatistics()
      } else {
        alert(data.message || 'Failed to delete vehicle registration')
      }
    } catch (error) {
      alert('Error deleting vehicle registration. Please try again.')
      console.error('Error:', error)
    }
  }

  const handleEdit = (registration) => {
    setEditData(registration)
    setShowModal(true)
  }

  const handleShare = async (registration) => {
    const phoneNumber = prompt('Enter WhatsApp number (with country code):')
    if (!phoneNumber) return

    try {
      const response = await fetch(`http://localhost:5000/api/vehicle-registrations/${registration._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (data.success) {
        window.open(data.data.whatsappUrl, '_blank')
      } else {
        alert(data.message || 'Failed to share vehicle registration')
      }
    } catch (error) {
      alert('Error sharing vehicle registration. Please try again.')
      console.error('Error:', error)
    }
  }

  const handlePrintBill = (registration) => {
    const billWindow = window.open('', '_blank')
    billWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vehicle Registration Certificate - ${registration.registrationNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #333;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            background: #f0f0f0;
            padding: 10px;
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #333;
          }
          .field {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .field-label {
            font-weight: bold;
            width: 200px;
            color: #555;
          }
          .field-value {
            flex: 1;
            color: #333;
          }
          .status {
            display: inline-block;
            padding: 5px 15px;
            background: #4CAF50;
            color: white;
            border-radius: 4px;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VEHICLE REGISTRATION CERTIFICATE</h1>
          <p>Regional Transport Office</p>
          <p>Government Authority</p>
        </div>

        <div class="section">
          <h2>Registration Details</h2>
          <div class="field">
            <div class="field-label">Registration Number:</div>
            <div class="field-value"><strong>${registration.registrationNumber}</strong></div>
          </div>
          <div class="field">
            <div class="field-label">Date of Registration:</div>
            <div class="field-value">${registration.dateOfRegistration}</div>
          </div>
          <div class="field">
            <div class="field-label">Status:</div>
            <div class="field-value"><span class="status">${registration.status}</span></div>
          </div>
        </div>

        <div class="section">
          <h2>Vehicle Details</h2>
          <div class="field">
            <div class="field-label">Chassis Number:</div>
            <div class="field-value">${registration.chassisNumber}</div>
          </div>
          <div class="field">
            <div class="field-label">Engine Number:</div>
            <div class="field-value">${registration.engineNumber}</div>
          </div>
          <div class="field">
            <div class="field-label">Maker Name:</div>
            <div class="field-value">${registration.makerName}</div>
          </div>
          <div class="field">
            <div class="field-label">Model Name:</div>
            <div class="field-value">${registration.modelName}</div>
          </div>
          <div class="field">
            <div class="field-label">Colour:</div>
            <div class="field-value">${registration.colour}</div>
          </div>
        </div>

        <div class="section">
          <h2>Owner Details</h2>
          <div class="field">
            <div class="field-label">Owner Name:</div>
            <div class="field-value">${registration.ownerName}</div>
          </div>
          <div class="field">
            <div class="field-label">S/W/D of:</div>
            <div class="field-value">${registration.relationOf}</div>
          </div>
          <div class="field">
            <div class="field-label">Address:</div>
            <div class="field-value">${registration.address}</div>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated document.</p>
          <p>For verification, please contact the Regional Transport Office.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `)
    billWindow.document.close()
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const matchesSearch =
        registration.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.engineNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !filterStatus || registration.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [registrations, searchTerm, filterStatus])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border border-green-200'
      case 'Transferred': return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200'
      case 'Scrapped': return 'bg-gray-100 text-gray-700 border border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {/* Total Registrations */}
              <div className='bg-white rounded-lg shadow-md border border-gray-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Vehicles</p>
                    <h3 className='text-2xl font-black text-gray-800'>{statistics.total}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
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

              {/* Transferred */}
              <div className='bg-white rounded-lg shadow-md border border-blue-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Transferred</p>
                    <h3 className='text-2xl font-black text-blue-600'>{statistics.transferred}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Cancelled */}
              <div className='bg-white rounded-lg shadow-md border border-red-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Cancelled</p>
                    <h3 className='text-2xl font-black text-red-600'>{statistics.cancelled}</h3>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
                >
                  <option value=''>All Status</option>
                  <option value='Active'>Active</option>
                  <option value='Transferred'>Transferred</option>
                  <option value='Cancelled'>Cancelled</option>
                  <option value='Scrapped'>Scrapped</option>
                </select>

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
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                    <tr>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Registration Details</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Owner Info</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Vehicle Details</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Regn. Date</th>
                      <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                      <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredRegistrations.map((registration, index) => (
                      <tr key={registration._id} className='hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/50 hover:to-pink-50/50 transition-all duration-200 group'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                              {registration.registrationNumber?.substring(0, 2) || 'RC'}
                            </div>
                            <div>
                              <div className='text-sm font-mono font-bold text-gray-900'>{registration.registrationNumber}</div>
                              <div className='text-xs text-gray-500 mt-0.5'>Chassis: {registration.chassisNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-bold text-gray-900'>{registration.ownerName}</div>
                          <div className='text-xs text-gray-500 mt-0.5'>S/W/D of {registration.relationOf}</div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='text-sm font-semibold text-gray-900'>{registration.makerName} {registration.modelName}</div>
                          <div className='text-xs text-gray-500 mt-0.5'>
                            <span className='inline-flex items-center'>
                              <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                                <circle cx='10' cy='10' r='6'></circle>
                              </svg>
                              {registration.colour}
                            </span>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center text-sm text-gray-600 font-semibold'>
                            <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            {registration.dateOfRegistration}
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(registration.status)}`}>
                            {registration.status}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={() => handlePrintBill(registration)}
                              className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200'
                              title='Print Bill'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleShare(registration)}
                              className='p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200'
                              title='Share on WhatsApp'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(registration)}
                              className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200'
                              title='Edit'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(registration._id)}
                              className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200'
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
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
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
    </>
  )
}

export default VehicleRegistration
