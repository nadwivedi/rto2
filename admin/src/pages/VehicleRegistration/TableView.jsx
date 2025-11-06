const TableView = ({ registrations, onViewDetails, onEdit, onDelete, onCopyChassisNumber }) => {
  return (
    <div className='hidden lg:block overflow-x-auto'>
      <table className='w-full'>
        <thead className='bg-gray-50 border-b border-gray-200'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Registration No.</th>
            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Chassis No.</th>
            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Engine No.</th>
            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Owner Name</th>
            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Laden Weight</th>
            <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Unladen Weight</th>
            <th className='px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 bg-white'>
          {registrations.map((registration) => (
            <tr key={registration._id} className='hover:bg-gray-50 transition-colors duration-150 group'>
              <td className='px-6 py-4'>
                <div>
                  <div className='text-[17px] font-mono font-semibold text-gray-900 mb-1'>
                    {registration.vehicleNumber || registration.registrationNumber}
                  </div>
                  {registration.dateOfRegistration && (
                    <div className='text-xs text-gray-500'>
                      Registered: {registration.dateOfRegistration}
                    </div>
                  )}
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-mono text-gray-700'>{registration.chassisNumber || 'N/A'}</span>
                  {registration.chassisNumber && registration.chassisNumber !== 'N/A' && (
                    <button
                      onClick={() => onCopyChassisNumber(registration.chassisNumber)}
                      className='p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200 cursor-pointer'
                      title='Copy Chassis Number'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
              <td className='px-6 py-4'>
                <span className='text-sm font-mono text-gray-700'>{registration.engineNumber || 'N/A'}</span>
              </td>
              <td className='px-6 py-4'>
                <div>
                  <div className='text-sm font-semibold text-gray-900'>{registration.ownerName || 'N/A'}</div>
                  {registration.sonWifeDaughterOf && (
                    <div className='text-xs text-gray-500 mt-0.5'>S/W/D of {registration.sonWifeDaughterOf}</div>
                  )}
                </div>
              </td>
              <td className='px-6 py-4'>
                <span className='text-sm text-gray-700'>{registration.ladenWeight ? `${registration.ladenWeight} kg` : 'N/A'}</span>
              </td>
              <td className='px-6 py-4'>
                <span className='text-sm text-gray-700'>{registration.unladenWeight ? `${registration.unladenWeight} kg` : 'N/A'}</span>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center justify-center gap-2'>
                  <button
                    onClick={() => onViewDetails(registration)}
                    className='p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 cursor-pointer'
                    title='View Details'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(registration)}
                    className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer'
                    title='Edit'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(registration._id)}
                    className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer'
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
  )
}

export default TableView
