const VehicleTransferDetailModal = ({ isOpen, onClose, transfer }) => {
  if (!isOpen || !transfer) return null

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-3xl shadow-2xl w-full md:w-[95%] lg:w-[90%] xl:w-[85%] max-h-[98vh] md:max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-3 md:p-5 text-white shadow-lg'>
          <div className='flex justify-between items-start gap-2'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2 mb-1 md:mb-2 flex-wrap'>
                <h2 className='text-base md:text-xl font-bold truncate'>Vehicle Transfer Details</h2>
                <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-xs font-semibold border ${
                  transfer.balance > 0
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}>
                  {transfer.balance > 0 ? 'Pending Payment' : 'Fully Paid'}
                </span>
              </div>
              <p className='text-[10px] md:text-sm text-white/90 font-mono'>{transfer.vehicleNumber}</p>
            </div>
            <button
              onClick={onClose}
              className='text-white/90 hover:text-white hover:bg-white/20 rounded-lg md:rounded-xl p-1.5 md:p-2.5 transition-all duration-200 hover:rotate-90 flex-shrink-0'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-3 md:p-5'>
          <div className='space-y-3 md:space-y-4'>
            {/* Transfer Information */}
            <div className='bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-teal-200'>
              <h3 className='text-sm md:text-base font-bold text-teal-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-teal-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                </svg>
                Transfer Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3'>
                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Number</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5 font-mono'>{transfer.vehicleNumber}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Transfer Date</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.transferDate}</p>
                </div>
              </div>
            </div>

            {/* Current Owner Details */}
            <div className='bg-gradient-to-br from-orange-50 to-red-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-orange-200'>
              <h3 className='text-sm md:text-base font-bold text-orange-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
                Previous Owner Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3'>
                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Owner Name</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.currentOwnerName}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Father/Guardian Name</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.currentOwnerFatherName}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Mobile Number</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.currentOwnerMobile}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg md:col-span-2'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Address</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{transfer.currentOwnerAddress}</p>
                </div>
              </div>
            </div>

            {/* New Owner Details */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-blue-200'>
              <h3 className='text-sm md:text-base font-bold text-blue-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
                New Owner Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3'>
                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Owner Name</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.newOwnerName}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Father/Guardian Name</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.newOwnerFatherName}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Mobile Number</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.newOwnerMobile}</p>
                </div>

                <div className='bg-white/80 p-2 rounded-lg md:col-span-2'>
                  <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Address</label>
                  <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{transfer.newOwnerAddress}</p>
                </div>
              </div>
            </div>

            {/* Broker/By Details - Show only if data exists */}
            {(transfer.byName || transfer.byMobile) && (
              <div className='bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-amber-200'>
                <h3 className='text-sm md:text-base font-bold text-amber-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                  <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                  Broker/Agent Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3'>
                  {transfer.byName && (
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Broker Name</label>
                      <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.byName}</p>
                    </div>
                  )}

                  {transfer.byMobile && (
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <label className='text-[10px] md:text-xs font-semibold text-gray-600'>Broker Mobile</label>
                      <p className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{transfer.byMobile}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-purple-200 relative'>
              {/* PAID Stamp - Show only when balance is 0 */}
              {transfer.balance === 0 && (
                <div className='absolute top-2 right-2 md:top-4 md:right-4 z-10'>
                  <div className='text-3xl md:text-5xl lg:text-6xl font-black text-green-600 opacity-25 transform -rotate-12 border-4 md:border-6 border-green-600 rounded-lg px-2 py-1 md:px-3 md:py-1.5'>
                    PAID
                  </div>
                </div>
              )}

              <h3 className='text-sm md:text-base font-bold text-purple-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
                Payment Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3'>
                {/* Total Fee */}
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5 md:p-3 border-2 border-blue-200'>
                  <label className='text-[10px] md:text-xs font-semibold text-blue-700'>Total Fee</label>
                  <p className='text-base md:text-xl lg:text-2xl font-black text-blue-900 mt-1'>
                    ₹{(transfer.totalFee || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Paid Amount */}
                <div className='bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-2.5 md:p-3 border-2 border-green-300'>
                  <label className='text-[10px] md:text-xs font-semibold text-green-700'>Paid Amount</label>
                  <p className='text-base md:text-xl lg:text-2xl font-black text-green-800 mt-1'>
                    ₹{(transfer.paid || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Balance Amount */}
                <div className={`rounded-lg p-2.5 md:p-3 border-2 ${
                  transfer.balance > 0
                    ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <label className={`text-[10px] md:text-xs font-semibold ${
                    transfer.balance > 0 ? 'text-orange-700' : 'text-green-700'
                  }`}>Balance</label>
                  <p className={`text-base md:text-xl lg:text-2xl font-black mt-1 ${
                    transfer.balance > 0 ? 'text-orange-800' : 'text-green-800'
                  }`}>
                    ₹{(transfer.balance || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Remarks - Show only if exists */}
            {transfer.remarks && (
              <div className='bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-gray-200'>
                <h3 className='text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                  <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                  </svg>
                  Remarks
                </h3>
                <div className='bg-white/80 p-2 rounded-lg'>
                  <p className='text-xs md:text-sm text-gray-900 leading-relaxed'>{transfer.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className='border-t border-gray-200 px-3 py-2.5 md:px-5 md:py-3 bg-gray-50'>
          <div className='flex justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg md:rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleTransferDetailModal
