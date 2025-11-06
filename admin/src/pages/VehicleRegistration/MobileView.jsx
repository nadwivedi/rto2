const MobileView = ({ registrations, onViewDetails, onEdit, onDelete, onCopyChassisNumber }) => {
  return (
    <div className='block lg:hidden'>
      <div className='p-4 space-y-3'>
        {registrations.map((registration) => (
          <div key={registration._id} className='bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'>
            {/* Card Header with Avatar and Actions */}
            <div className='bg-gray-50 p-3 flex items-start justify-between border-b border-gray-200'>
              <div>
                <div className='text-base font-mono font-bold text-gray-900 mb-1'>
                  {registration.vehicleNumber || registration.registrationNumber}
                </div>
                <div className='text-xs text-gray-600'>{registration.ownerName || '-'}</div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => onViewDetails(registration)}
                  className='p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all cursor-pointer'
                  title='View'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                  </svg>
                </button>
                <button
                  onClick={() => onEdit(registration)}
                  className='p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer'
                  title='Edit'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(registration._id)}
                  className='p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer'
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
                  <div className='flex items-center gap-1.5'>
                    <p className='text-sm font-mono text-gray-700'>{registration.chassisNumber || 'N/A'}</p>
                    {registration.chassisNumber && registration.chassisNumber !== 'N/A' && (
                      <button
                        onClick={() => onCopyChassisNumber(registration.chassisNumber)}
                        className='p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all duration-200'
                        title='Copy Chassis Number'
                      >
                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className='text-[10px] text-gray-500 font-semibold uppercase'>Engine No</p>
                  <p className='text-sm font-mono text-gray-700'>{registration.engineNumber || 'N/A'}</p>
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
                  <p className='text-sm text-gray-700'>{registration.ladenWeight ? `${registration.ladenWeight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <p className='text-[10px] text-gray-500 font-semibold uppercase'>Unladen Weight</p>
                  <p className='text-sm text-gray-700'>{registration.unladenWeight ? `${registration.unladenWeight} kg` : 'N/A'}</p>
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
  )
}

export default MobileView
