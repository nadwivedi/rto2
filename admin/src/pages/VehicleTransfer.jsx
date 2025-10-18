import { useState } from 'react'

const VehicleTransfer = () => {
  const [transfers] = useState([
    { id: 'VT-2024-056', vehicleNo: 'MH-12-AB-1234', currentOwner: 'Amit Patel', newOwner: 'Rohit Sharma', transferDate: '2024-10-08', status: 'Completed', fee: 1500 },
    { id: 'VT-2024-057', vehicleNo: 'KA-05-CD-5678', currentOwner: 'Sneha Reddy', newOwner: 'Priya Singh', transferDate: '2024-10-09', status: 'Pending', fee: 1200 },
    { id: 'VT-2024-058', vehicleNo: 'DL-8C-EF-9012', currentOwner: 'Ravi Kumar', newOwner: 'Vikram Gupta', transferDate: '2024-10-07', status: 'Under Verification', fee: 1800 },
    { id: 'VT-2024-059', vehicleNo: 'UP-16-GH-3456', currentOwner: 'Pooja Singh', newOwner: 'Anjali Verma', transferDate: '2024-10-10', status: 'Completed', fee: 1500 },
    { id: 'VT-2024-060', vehicleNo: 'RJ-14-IJ-7890', currentOwner: 'Arjun Sharma', newOwner: 'Karan Mehta', transferDate: '2024-10-06', status: 'Pending', fee: 2000 },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Under Verification': return 'bg-blue-100 text-blue-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>Vehicle Transfer</h1>
        <p className='text-gray-600'>Manage vehicle ownership transfer applications</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>🔀</div>
          <div className='text-2xl font-black text-gray-800'>456</div>
          <div className='text-sm text-gray-600'>Total Transfers</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>✅</div>
          <div className='text-2xl font-black text-green-600'>345</div>
          <div className='text-sm text-gray-600'>Completed</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>🔍</div>
          <div className='text-2xl font-black text-blue-600'>67</div>
          <div className='text-sm text-gray-600'>Under Verification</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>⏳</div>
          <div className='text-2xl font-black text-yellow-600'>44</div>
          <div className='text-sm text-gray-600'>Pending</div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
          <h2 className='text-xl font-bold text-gray-800'>Transfer Applications</h2>
          <button className='px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            + New Transfer
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Transfer ID</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Current Owner</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>New Owner</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Transfer Date</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Fee (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {transfers.map((transfer) => (
                <tr key={transfer.id} className='hover:bg-gray-50 transition'>
                  <td className='px-6 py-4 text-sm font-semibold text-gray-800'>{transfer.id}</td>
                  <td className='px-6 py-4 text-sm font-mono text-gray-800'>{transfer.vehicleNo}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>{transfer.currentOwner}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>{transfer.newOwner}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{transfer.transferDate}</td>
                  <td className='px-6 py-4 text-sm font-semibold text-gray-800'>₹{transfer.fee}</td>
                  <td className='px-6 py-4'>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transfer.status)}`}>
                      {transfer.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <button className='text-teal-600 hover:text-teal-800 font-semibold text-sm'>
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

export default VehicleTransfer
