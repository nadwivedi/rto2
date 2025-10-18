import { useState } from 'react'

const Permits = () => {
  const [permits] = useState([
    { id: 'PT-2024-078', name: 'Suresh Gupta', permitType: 'National Permit', vehicleNo: 'MH-12-AB-1234', validFrom: '2024-01-15', validTill: '2025-01-14', status: 'Active' },
    { id: 'PT-2024-079', name: 'Ramesh Singh', permitType: 'State Permit', vehicleNo: 'MH-14-CD-5678', validFrom: '2024-02-20', validTill: '2025-02-19', status: 'Active' },
    { id: 'PT-2024-080', name: 'Anil Kumar', permitType: 'Tourist Permit', vehicleNo: 'DL-8C-EF-9012', validFrom: '2024-03-10', validTill: '2024-09-10', status: 'Expired' },
    { id: 'PT-2024-081', name: 'Deepak Sharma', permitType: 'All India Permit', vehicleNo: 'KA-03-GH-3456', validFrom: '2024-05-01', validTill: '2025-04-30', status: 'Pending' },
    { id: 'PT-2024-082', name: 'Vijay Patel', permitType: 'Contract Carriage', vehicleNo: 'GJ-01-IJ-7890', validFrom: '2024-06-15', validTill: '2025-06-14', status: 'Active' },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Expired': return 'bg-red-100 text-red-700'
      case 'Suspended': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>Vehicle Permits</h1>
        <p className='text-gray-600'>Manage vehicle permits and authorizations</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>📋</div>
          <div className='text-2xl font-black text-gray-800'>567</div>
          <div className='text-sm text-gray-600'>Active Permits</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>🌍</div>
          <div className='text-2xl font-black text-blue-600'>234</div>
          <div className='text-sm text-gray-600'>National Permits</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>🗺️</div>
          <div className='text-2xl font-black text-green-600'>189</div>
          <div className='text-sm text-gray-600'>State Permits</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>⏰</div>
          <div className='text-2xl font-black text-orange-600'>45</div>
          <div className='text-sm text-gray-600'>Expiring Soon</div>
        </div>
      </div>

      {/* Permits Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
          <h2 className='text-xl font-bold text-gray-800'>Permit Records</h2>
          <button className='px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            + Issue New Permit
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Permit ID</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Owner Name</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Permit Type</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid Till</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {permits.map((permit) => (
                <tr key={permit.id} className='hover:bg-gray-50 transition'>
                  <td className='px-6 py-4 text-sm font-semibold text-gray-800'>{permit.id}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>{permit.name}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{permit.permitType}</td>
                  <td className='px-6 py-4 text-sm font-mono text-gray-800'>{permit.vehicleNo}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{permit.validFrom}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{permit.validTill}</td>
                  <td className='px-6 py-4'>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(permit.status)}`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <button className='text-blue-600 hover:text-blue-800 font-semibold text-sm'>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Permits
