const VehicleTransferDetailModal = ({ isOpen, onClose, transfer }) => {
  if (!isOpen || !transfer) return null

  return (
    <div className='fixed inset-0 bg-black/70  z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl shadow-2xl w-full md:w-[90%] lg:w-[85%] xl:w-[80%] max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-3 md:p-4 text-white shadow-lg'>
          <div className='flex justify-between items-center gap-2'>
            <div className='flex items-center gap-3'>
              <div className='bg-white/20 rounded-lg p-2'>
                <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                </svg>
              </div>
              <div>
                <h2 className='text-base md:text-xl font-bold'>Vehicle Transfer Details</h2>
                <p className='text-xs md:text-sm text-white/90 font-mono mt-0.5'>{transfer.vehicleNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 flex-shrink-0'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4 md:p-5'>
          <div className='space-y-4'>
            {/* Vehicle & Transfer Details */}
            <div className='bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border-l-4 border-teal-500'>
              <h3 className='text-sm md:text-base font-bold text-teal-900 mb-3 flex items-center gap-2'>
                <svg className='w-4 h-4 md:w-5 md:h-5 text-teal-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Vehicle & Transfer Details
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                <div className='bg-white/70 p-3 rounded-lg'>
                  <label className='text-xs font-semibold text-gray-600 block mb-1'>Vehicle Number</label>
                  <p className='text-sm md:text-base font-bold text-gray-900 font-mono'>{transfer.vehicleNumber}</p>
                </div>
                <div className='bg-white/70 p-3 rounded-lg'>
                  <label className='text-xs font-semibold text-gray-600 block mb-1'>Transfer Date</label>
                  <p className='text-sm md:text-base font-bold text-gray-900'>{transfer.transferDate}</p>
                </div>
                <div className='bg-white/70 p-3 rounded-lg'>
                  <label className='text-xs font-semibold text-gray-600 block mb-1'>Payment Status</label>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    transfer.balance > 0
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  }`}>
                    {transfer.balance > 0 ? 'Pending Payment' : 'Fully Paid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ownership Transfer - Side by Side */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Previous Owner */}
              <div className='bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-l-4 border-orange-500'>
                <h3 className='text-sm md:text-base font-bold text-orange-900 mb-3 flex items-center gap-2'>
                  <svg className='w-4 h-4 md:w-5 md:h-5 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                  Previous Owner
                </h3>
                <div className='space-y-2.5'>
                  {/* Name and S/W/D of in one row */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-white/70 p-2.5 rounded-lg'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>Name</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.currentOwnerName}</p>
                    </div>
                    <div className='bg-white/70 p-2.5 rounded-lg'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>S/W/D of</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.currentOwnerFatherName}</p>
                    </div>
                  </div>
                  {/* Mobile and Address in one row */}
                  <div className='grid grid-cols-10 gap-3'>
                    <div className='bg-white/70 p-2.5 rounded-lg col-span-3'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>Mobile Number</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.currentOwnerMobile}</p>
                    </div>
                    <div className='bg-white/70 p-2.5 rounded-lg col-span-7'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>Address</label>
                      <p className='text-sm font-semibold text-gray-900 leading-relaxed'>{transfer.currentOwnerAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Owner */}
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500'>
                <h3 className='text-sm md:text-base font-bold text-blue-900 mb-3 flex items-center gap-2'>
                  <svg className='w-4 h-4 md:w-5 md:h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                  New Owner
                </h3>
                <div className='space-y-2.5'>
                  {/* Name and S/W/D of in one row */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-white/70 p-2.5 rounded-lg'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>Name</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.newOwnerName}</p>
                    </div>
                    <div className='bg-white/70 p-2.5 rounded-lg'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>S/W/D of</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.newOwnerFatherName}</p>
                    </div>
                  </div>
                  {/* Mobile and Address in one row */}
                  <div className='grid grid-cols-10 gap-3'>
                    <div className='bg-white/70 p-2.5 rounded-lg col-span-3'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>Mobile Number</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.newOwnerMobile}</p>
                    </div>
                    <div className='bg-white/70 p-2.5 rounded-lg col-span-7'>
                      <label className='text-xs font-semibold text-gray-600 block mb-0.5'>Address</label>
                      <p className='text-sm font-semibold text-gray-900 leading-relaxed'>{transfer.newOwnerAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* By/Referral Details - Show only if data exists */}
            {(transfer.byName || transfer.byMobile) && (
              <div className='bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border-l-4 border-amber-500'>
                <h3 className='text-sm md:text-base font-bold text-amber-900 mb-3 flex items-center gap-2'>
                  <svg className='w-4 h-4 md:w-5 md:h-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                  By/Referral Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {transfer.byName && (
                    <div className='bg-white/70 p-3 rounded-lg'>
                      <label className='text-xs font-semibold text-gray-600 block mb-1'>Name</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.byName}</p>
                    </div>
                  )}
                  {transfer.byMobile && (
                    <div className='bg-white/70 p-3 rounded-lg'>
                      <label className='text-xs font-semibold text-gray-600 block mb-1'>Mobile Number</label>
                      <p className='text-sm font-bold text-gray-900'>{transfer.byMobile}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500 relative'>
              {/* PAID Stamp - Show only when balance is 0 */}
              {transfer.balance === 0 && (
                <div className='absolute top-2 right-2 md:top-3 md:right-3'>
                  <div className='text-2xl md:text-4xl font-black text-green-600 opacity-20 transform -rotate-12 border-4 border-green-600 rounded-lg px-2 py-1'>
                    PAID
                  </div>
                </div>
              )}

              <h3 className='text-sm md:text-base font-bold text-purple-900 mb-3 flex items-center gap-2'>
                <svg className='w-4 h-4 md:w-5 md:h-5 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
                Payment Information
              </h3>
              <div className='grid grid-cols-3 gap-3'>
                <div className='bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-3 border border-blue-300'>
                  <label className='text-xs font-semibold text-blue-700 block mb-1'>Total Fee</label>
                  <p className='text-lg md:text-xl font-black text-blue-900'>
                    ₹{(transfer.totalFee || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className='bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-3 border border-green-300'>
                  <label className='text-xs font-semibold text-green-700 block mb-1'>Paid Amount</label>
                  <p className='text-lg md:text-xl font-black text-green-900'>
                    ₹{(transfer.paid || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`rounded-lg p-3 border ${
                  transfer.balance > 0
                    ? 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-300'
                    : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300'
                }`}>
                  <label className={`text-xs font-semibold block mb-1 ${
                    transfer.balance > 0 ? 'text-orange-700' : 'text-green-700'
                  }`}>Balance</label>
                  <p className={`text-lg md:text-xl font-black ${
                    transfer.balance > 0 ? 'text-orange-900' : 'text-green-900'
                  }`}>
                    ₹{(transfer.balance || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Remarks - Show only if exists */}
            {transfer.remarks && (
              <div className='bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border-l-4 border-gray-400'>
                <h3 className='text-sm md:text-base font-bold text-gray-900 mb-3 flex items-center gap-2'>
                  <svg className='w-4 h-4 md:w-5 md:h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                  </svg>
                  Remarks
                </h3>
                <div className='bg-white/70 p-3 rounded-lg'>
                  <p className='text-sm text-gray-900 leading-relaxed'>{transfer.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-gray-200 px-4 py-3 md:px-5 md:py-4 bg-gray-50 flex justify-end'>
          <button
            onClick={onClose}
            className='px-5 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VehicleTransferDetailModal
