import { useState } from 'react'

const NOC = () => {
  const [nocs] = useState([
    { id: 'NOC-2024-089', vehicleNo: 'MH-12-AB-1234', owner: 'Amit Patel', purpose: 'Interstate Transfer', fromState: 'Maharashtra', toState: 'Gujarat', issueDate: '2024-10-08', status: 'Issued' },
    { id: 'NOC-2024-090', vehicleNo: 'KA-05-CD-5678', owner: 'Sneha Reddy', purpose: 'Loan Clearance', fromState: 'Karnataka', toState: '-', issueDate: '2024-10-09', status: 'Pending' },
    { id: 'NOC-2024-091', vehicleNo: 'DL-8C-EF-9012', owner: 'Ravi Kumar', purpose: 'Vehicle Sale', fromState: 'Delhi', toState: 'Uttar Pradesh', issueDate: '2024-10-07', status: 'Under Review' },
    { id: 'NOC-2024-092', vehicleNo: 'UP-16-GH-3456', owner: 'Pooja Singh', purpose: 'Interstate Transfer', fromState: 'Uttar Pradesh', toState: 'Maharashtra', issueDate: '2024-10-10', status: 'Issued' },
    { id: 'NOC-2024-093', vehicleNo: 'RJ-14-IJ-7890', owner: 'Arjun Sharma', purpose: 'Hypothecation', fromState: 'Rajasthan', toState: '-', issueDate: '2024-10-06', status: 'Rejected' },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Issued': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Under Review': return 'bg-blue-100 text-blue-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>NOC (No Objection Certificate)</h1>
        <p className='text-gray-600'>Manage NOC applications for vehicle transfers and clearances</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>📄</div>
          <div className='text-2xl font-black text-gray-800'>678</div>
          <div className='text-sm text-gray-600'>Total NOCs</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>✅</div>
          <div className='text-2xl font-black text-green-600'>534</div>
          <div className='text-sm text-gray-600'>Issued</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>🔍</div>
          <div className='text-2xl font-black text-blue-600'>89</div>
          <div className='text-sm text-gray-600'>Under Review</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='text-3xl mb-2'>⏳</div>
          <div className='text-2xl font-black text-yellow-600'>55</div>
          <div className='text-sm text-gray-600'>Pending</div>
        </div>
      </div>

      {/* NOC Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
          <h2 className='text-xl font-bold text-gray-800'>NOC Applications</h2>
          <button className='px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            + Issue New NOC
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>NOC ID</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Owner Name</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Purpose</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>From State</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>To State</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Issue Date</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {nocs.map((noc) => (
                <tr key={noc.id} className='hover:bg-gray-50 transition'>
                  <td className='px-6 py-4 text-sm font-semibold text-gray-800'>{noc.id}</td>
                  <td className='px-6 py-4 text-sm font-mono text-gray-800'>{noc.vehicleNo}</td>
                  <td className='px-6 py-4 text-sm text-gray-800'>{noc.owner}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{noc.purpose}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{noc.fromState}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{noc.toState}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>{noc.issueDate}</td>
                  <td className='px-6 py-4'>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(noc.status)}`}>
                      {noc.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <button className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm'>
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

export default NOC
