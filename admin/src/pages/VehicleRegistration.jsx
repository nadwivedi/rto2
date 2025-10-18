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
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Transferred': return 'bg-blue-100 text-blue-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      case 'Scrapped': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-6 md:mb-8'>
        <h1 className='text-xl md:text-3xl font-black text-gray-800 mb-1 md:mb-2'>Vehicle Registration</h1>
        <p className='text-sm md:text-base text-gray-600'>Manage vehicle registration records</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8'>
        <div className='bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border border-gray-200'>
          <div className='text-2xl md:text-3xl mb-2'>🚗</div>
          <div className='text-xl md:text-2xl font-black text-gray-800'>{statistics.total}</div>
          <div className='text-xs md:text-sm text-gray-600'>Total Registrations</div>
        </div>
        <div className='bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border border-gray-200'>
          <div className='text-2xl md:text-3xl mb-2'>✅</div>
          <div className='text-xl md:text-2xl font-black text-green-600'>{statistics.active}</div>
          <div className='text-xs md:text-sm text-gray-600'>Active</div>
        </div>
        <div className='bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border border-gray-200'>
          <div className='text-2xl md:text-3xl mb-2'>🔄</div>
          <div className='text-xl md:text-2xl font-black text-blue-600'>{statistics.transferred}</div>
          <div className='text-xs md:text-sm text-gray-600'>Transferred</div>
        </div>
        <div className='bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border border-gray-200'>
          <div className='text-2xl md:text-3xl mb-2'>❌</div>
          <div className='text-xl md:text-2xl font-black text-red-600'>{statistics.cancelled}</div>
          <div className='text-xs md:text-sm text-gray-600'>Cancelled</div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>Registration Records</h2>
            <div className='flex flex-col sm:flex-row gap-3'>
              <input
                type='text'
                placeholder='Search by regn no, owner, chassis, engine...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              >
                <option value=''>All Status</option>
                <option value='Active'>Active</option>
                <option value='Transferred'>Transferred</option>
                <option value='Cancelled'>Cancelled</option>
                <option value='Scrapped'>Scrapped</option>
              </select>
              <button
                onClick={() => {
                  setEditData(null)
                  setShowModal(true)
                }}
                className='px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-semibold whitespace-nowrap'
              >
                + Register Vehicle
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='p-12 text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600'></div>
            <p className='mt-4 text-gray-600'>Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className='p-12 text-center'>
            <div className='text-6xl mb-4'>🚗</div>
            <p className='text-gray-600 text-lg'>No registrations found</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Regn. Number</th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Owner Name</th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle Details</th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Regn. Date</th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredRegistrations.map((registration) => (
                  <tr key={registration._id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-4'>
                      <div className='font-mono text-sm font-bold text-gray-800'>
                        {registration.registrationNumber}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Chassis: {registration.chassisNumber}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-gray-800'>{registration.ownerName}</div>
                      <div className='text-xs text-gray-500'>S/W/D of {registration.relationOf}</div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-800'>{registration.makerName} {registration.modelName}</div>
                      <div className='text-xs text-gray-500'>{registration.colour}</div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {registration.dateOfRegistration}
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(registration.status)}`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handlePrintBill(registration)}
                          className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm'
                          title='Print Bill'
                        >
                          🖨️
                        </button>
                        <button
                          onClick={() => handleShare(registration)}
                          className='text-green-600 hover:text-green-800 font-semibold text-sm'
                          title='Share on WhatsApp'
                        >
                          📤
                        </button>
                        <button
                          onClick={() => handleEdit(registration)}
                          className='text-blue-600 hover:text-blue-800 font-semibold text-sm'
                          title='Edit'
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(registration._id)}
                          className='text-red-600 hover:text-red-800 font-semibold text-sm'
                          title='Delete'
                        >
                          🗑️
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
    </div>
  )
}

export default VehicleRegistration
