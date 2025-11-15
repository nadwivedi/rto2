const ViewCgPermitModal = ({ isOpen, onClose, selectedPermit }) => {
  if (!isOpen || !selectedPermit) {
    return null
  }

  return (
    <div className='fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-2 md:p-4 animate-fadeIn'>
      <div className='bg-white rounded-xl md:rounded-3xl shadow-2xl w-full md:w-[95%] lg:w-[90%] xl:w-[85%] max-h-[98vh] md:max-h-[95vh] overflow-hidden animate-slideUp'>
        {/* Header */}
        <div className='sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-3 md:p-5 z-10 shadow-lg'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 md:gap-3 min-w-0'>
              <div className='bg-white/20 -lg p-1.5 md:p-2 rounded-lg md:rounded-xl flex-shrink-0'>
                <svg className='w-4 h-4 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <div className='min-w-0'>
                <h2 className='text-base md:text-xl font-bold truncate'>CG Permit Details</h2>
                <p className='text-white/80 text-xs md:text-sm mt-0.5 truncate'>{selectedPermit.permitNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white/90 hover:text-white hover:bg-white/20 p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-200 hover:rotate-90 flex-shrink-0'
            >
              <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-y-auto max-h-[calc(98vh-100px)] md:max-h-[calc(95vh-130px)] p-3 md:p-5'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4'>
            {/* Column 1: Permit Details */}
            <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-indigo-200'>
              <h3 className='text-sm md:text-base font-bold text-indigo-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                Permit Information
              </h3>
              <div className='grid grid-cols-2 gap-1.5 md:gap-2'>
                {selectedPermit.permitNumber && (
                  <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Permit Number</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitNumber}</div>
                  </div>
                )}
                {selectedPermit.permitType && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Permit Type</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitType}</div>
                  </div>
                )}
                {selectedPermit.status && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Status</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>
                      <span className={`inline-flex px-2 py-1 rounded-full text-[9px] md:text-xs font-bold ${
                        selectedPermit.status === 'Active' ? 'bg-green-100 text-green-700' :
                        selectedPermit.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedPermit.status}
                      </span>
                    </div>
                  </div>
                )}
                {selectedPermit.issueDate && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Issue Date</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.issueDate}</div>
                  </div>
                )}
                {selectedPermit.validFrom && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Valid From</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validFrom}</div>
                  </div>
                )}
                {selectedPermit.validTill && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Valid Till</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validTill}</div>
                  </div>
                )}
                {selectedPermit.validityPeriod && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Validity Period</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validityPeriod} months</div>
                  </div>
                )}
                {selectedPermit.issuingAuthority && (
                  <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Issuing Authority</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.issuingAuthority}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Holder Details */}
            <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-purple-200'>
              <h3 className='text-sm md:text-base font-bold text-purple-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
                Holder Details
              </h3>
              <div className='space-y-1.5 md:space-y-2'>
                {selectedPermit.permitHolder && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Permit Holder</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitHolder}</div>
                  </div>
                )}
                {selectedPermit.address && selectedPermit.address !== 'N/A' && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Address</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{selectedPermit.address}</div>
                  </div>
                )}
                {selectedPermit.mobileNumber && selectedPermit.mobileNumber !== 'N/A' && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Mobile Number</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.mobileNumber}</div>
                  </div>
                )}
                {selectedPermit.goodsType && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Goods Type</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.goodsType}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Vehicle Details */}
            <div className='bg-gradient-to-br from-blue-50 to-cyan-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-blue-200'>
              <h3 className='text-sm md:text-base font-bold text-blue-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h4m10 0a2 2 0 104 0m-4 0h4' />
                </svg>
                Vehicle Details
              </h3>
              <div className='grid grid-cols-2 gap-1.5 md:gap-2'>
                {selectedPermit.vehicleNo && selectedPermit.vehicleNo !== 'N/A' && (
                  <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Number</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleNo}</div>
                  </div>
                )}
                {selectedPermit.chassisNumber && selectedPermit.chassisNumber !== 'N/A' && (
                  <div className='bg-gradient-to-br from-blue-100 to-cyan-100 p-2 md:p-2.5 rounded-lg border-2 border-blue-300 col-span-2'>
                    <div className='text-[10px] md:text-xs font-semibold text-blue-700'>Chassis Number</div>
                    <div className='text-[10px] md:text-sm font-bold text-blue-900 mt-1 font-mono break-all'>{selectedPermit.chassisNumber}</div>
                  </div>
                )}
                {selectedPermit.engineNumber && selectedPermit.engineNumber !== 'N/A' && (
                  <div className='bg-gradient-to-br from-green-100 to-emerald-100 p-2 md:p-2.5 rounded-lg border-2 border-green-300 col-span-2'>
                    <div className='text-[10px] md:text-xs font-semibold text-green-700 flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      Engine Number
                    </div>
                    <div className='text-[10px] md:text-sm font-bold text-green-900 mt-1 font-mono break-all'>{selectedPermit.engineNumber}</div>
                  </div>
                )}
                {selectedPermit.vehicleType && selectedPermit.vehicleType !== 'N/A' && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Type</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleType}</div>
                  </div>
                )}
                {selectedPermit.vehicleModel && selectedPermit.vehicleModel !== 'N/A' && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Model</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleModel}</div>
                  </div>
                )}
                {selectedPermit.ladenWeight && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Laden Weight</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.ladenWeight} kg</div>
                  </div>
                )}
                {selectedPermit.unladenWeight && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Unladen Weight</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.unladenWeight} kg</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 4: Payment & Other Details */}
            <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-green-200'>
              <h3 className='text-sm md:text-base font-bold text-green-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
                Payment Details
              </h3>
              <div className='space-y-1.5 md:space-y-2'>
                {selectedPermit.fees !== undefined && (
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-lg border-2 border-blue-200'>
                    <div className='text-[10px] md:text-xs font-semibold text-blue-700'>Total Fee</div>
                    <div className='text-sm md:text-base font-bold text-blue-900 mt-0.5'>₹{selectedPermit.fees.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {selectedPermit.paid !== undefined && (
                  <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-2.5 rounded-lg border-2 border-green-200'>
                    <div className='text-[10px] md:text-xs font-semibold text-green-700'>Paid Amount</div>
                    <div className='text-sm md:text-base font-bold text-green-800 mt-0.5'>₹{selectedPermit.paid.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {selectedPermit.balance !== undefined && (
                  <div className={`p-2.5 rounded-lg border-2 ${selectedPermit.balance > 0 ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                    <div className={`text-[10px] md:text-xs font-semibold ${selectedPermit.balance > 0 ? 'text-orange-700' : 'text-green-700'}`}>Balance</div>
                    <div className={`text-sm md:text-base font-bold mt-0.5 ${selectedPermit.balance > 0 ? 'text-orange-800' : 'text-green-800'}`}>₹{selectedPermit.balance.toLocaleString('en-IN')}</div>
                  </div>
                )}

                {selectedPermit.insuranceDetails && selectedPermit.insuranceDetails.policyNumber !== 'N/A' && (
                  <>
                    <div className='bg-indigo-100 p-2 rounded-lg mt-3'>
                      <div className='text-[10px] md:text-xs font-bold text-indigo-800'>Insurance Details</div>
                    </div>
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Policy Number</div>
                      <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.policyNumber}</div>
                    </div>
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Company</div>
                      <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.company}</div>
                    </div>
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Valid Upto</div>
                      <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.validUpto}</div>
                    </div>
                  </>
                )}

                {selectedPermit.taxDetails && selectedPermit.taxDetails.taxPaidUpto !== 'N/A' && (
                  <>
                    <div className='bg-purple-100 p-2 rounded-lg mt-3'>
                      <div className='text-[10px] md:text-xs font-bold text-purple-800'>Tax Details</div>
                    </div>
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Tax Paid Upto</div>
                      <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.taxDetails.taxPaidUpto}</div>
                    </div>
                    <div className='bg-white/80 p-2 rounded-lg'>
                      <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Tax Amount</div>
                      <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>₹{selectedPermit.taxDetails.taxAmount}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-gray-50 px-3 py-2.5 md:px-5 md:py-3 border-t border-gray-200 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 md:px-6 md:py-2 bg-gray-600 text-white rounded-lg md:rounded-xl hover:bg-gray-700 transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewCgPermitModal
