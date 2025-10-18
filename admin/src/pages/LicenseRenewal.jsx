import { useState } from 'react'

const LicenseRenewal = () => {
  const [renewals] = useState([
    { id: 'RN-2024-034', name: 'Neha Singh', licenseNo: 'DL-2019-456', expiryDate: '2024-11-15', renewalDate: '2024-10-08', status: 'Completed', fee: 500 },
    { id: 'RN-2024-035', name: 'Karan Mehta', licenseNo: 'DL-2018-789', expiryDate: '2024-10-20', renewalDate: '2024-10-09', status: 'Pending', fee: 500 },
    { id: 'RN-2024-036', name: 'Anjali Verma', licenseNo: 'DL-2017-234', expiryDate: '2024-11-05', renewalDate: '2024-10-05', status: 'Under Review', fee: 750 },
    { id: 'RN-2024-037', name: 'Sanjay Gupta', licenseNo: 'DL-2016-890', expiryDate: '2024-10-12', renewalDate: '2024-10-10', status: 'Completed', fee: 500 },
    { id: 'RN-2024-038', name: 'Divya Patel', licenseNo: 'DL-2015-567', expiryDate: '2024-12-01', renewalDate: '2024-10-07', status: 'Pending', fee: 1000 },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Under Review': return 'bg-blue-100 text-blue-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>License Renewal</h1>
        <p className='text-gray-600'>Manage driving license renewal applications</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>🔄</div>
          <div className='text-2xl font-black text-gray-800'>789</div>
          <div className='text-sm text-gray-600'>Total Renewals</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>✅</div>
          <div className='text-2xl font-black text-green-600'>645</div>
          <div className='text-sm text-gray-600'>Completed</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>⏳</div>
          <div className='text-2xl font-black text-yellow-600'>89</div>
          <div className='text-sm text-gray-600'>Pending</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>⚠️</div>
          <div className='text-2xl font-black text-red-600'>234</div>
          <div className='text-sm text-gray-600'>Expiring Soon</div>
        </div>
      </div>

      {/* Renewals Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
          <h2 className='text-xl font-bold text-gray-800'>Renewal Applications</h2>
          <button className='px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            + New Renewal
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Renewal ID</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Applicant Name</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>License No.</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Expiry Date</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Renewal Date</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Fee (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {renewals.map((renewal) => (
                <tr key={renewal.id} className='hover:bg-gray-50 transition'>
                  <td className='px-6 py-4 text-sm font-semibold text-gray-800'>{renewal.id}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>{renewal.name}</td>
                  <td className='px-6 py-4 text-sm font-mono text-gray-800'>{renewal.licenseNo}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{renewal.expiryDate}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{renewal.renewalDate}</td>
                  <td className='px-6 py-4 text-sm font-semibold text-gray-800'>₹{renewal.fee}</td>
                  <td className='px-6 py-4'>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(renewal.status)}`}>
                      {renewal.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <button className='text-orange-600 hover:text-orange-800 font-semibold text-sm'>
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

export default LicenseRenewal
