const ViewVehicleRegistrationModal = ({ isOpen, onClose, selectedRegistration }) => {
  if (!isOpen || !selectedRegistration) {
    return null
  }

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fadeIn'>
      <div className='bg-white rounded-xl md:rounded-3xl shadow-2xl w-full md:w-[95%] lg:w-[90%] xl:w-[85%] max-h-[98vh] md:max-h-[95vh] overflow-hidden animate-slideUp'>
        {/* Header */}
        <div className='sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-3 md:p-5 z-10 shadow-lg'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 md:gap-3 min-w-0'>
              <div className='bg-white/20 backdrop-blur-lg p-1.5 md:p-2 rounded-lg md:rounded-xl flex-shrink-0'>
                <svg className='w-4 h-4 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              </div>
              <div className='min-w-0'>
                <h2 className='text-base md:text-xl font-bold truncate'>Vehicle Details</h2>
                <p className='text-white/80 text-xs md:text-sm mt-0.5 truncate'>{selectedRegistration.vehicleNumber || selectedRegistration.registrationNumber}</p>
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
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4'>
            {/* Column 1: Registration & Vehicle Details */}
            <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-indigo-200 flex flex-col'>
              <h3 className='text-sm md:text-base font-bold text-indigo-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                Registration & Vehicle
              </h3>
              <div className='grid grid-cols-2 gap-1.5 md:gap-2 flex-1'>
                {selectedRegistration.registrationNumber && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Registration Number</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.registrationNumber}</div>
                  </div>
                )}
                {selectedRegistration.chassisNumber && (
                  <div className='bg-gradient-to-br from-blue-100 to-cyan-100 p-2 md:p-2.5 rounded-lg border-2 border-blue-300'>
                    <div className='text-[10px] md:text-xs font-semibold text-blue-700'>
                      Chassis Number
                    </div>
                    <div className='text-[10px] md:text-[15px] font-bold text-blue-900 mt-1 font-mono break-all'>{selectedRegistration.chassisNumber}</div>
                  </div>
                )}
                {selectedRegistration.engineNumber && (
                  <div className='bg-gradient-to-br from-green-100 to-emerald-100 p-2 md:p-2.5 rounded-lg border-2 border-green-300'>
                    <div className='text-[10px] md:text-xs font-semibold text-green-700 flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      Engine Number
                    </div>
                    <div className='text-[10px] md:text-[15px] font-bold text-green-900 mt-1 font-mono break-all'>{selectedRegistration.engineNumber}</div>
                  </div>
                )}
                {selectedRegistration.dateOfRegistration && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Date of Registration</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.dateOfRegistration}</div>
                  </div>
                )}
                {selectedRegistration.makerName && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Maker Name</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.makerName}</div>
                  </div>
                )}
                {selectedRegistration.makerModel && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Maker Model</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.makerModel}</div>
                  </div>
                )}
                {selectedRegistration.colour && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Colour</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.colour}</div>
                  </div>
                )}
                {selectedRegistration.vehicleClass && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Class</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.vehicleClass}</div>
                  </div>
                )}
                {selectedRegistration.vehicleType && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Type</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.vehicleType}</div>
                  </div>
                )}
                {selectedRegistration.vehicleCategory && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Category</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.vehicleCategory}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Owner Details */}
            <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-purple-200 flex flex-col'>
              <h3 className='text-sm md:text-base font-bold text-purple-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
                Owner Details
              </h3>
              <div className='space-y-1.5 md:space-y-2 flex-1'>
                {selectedRegistration.ownerName && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Owner Name</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.ownerName}</div>
                  </div>
                )}
                {selectedRegistration.sonWifeDaughterOf && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Son/Wife/Daughter of</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.sonWifeDaughterOf}</div>
                  </div>
                )}
                {selectedRegistration.address && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Address</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{selectedRegistration.address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Additional Details */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-blue-200 flex flex-col'>
              <h3 className='text-sm md:text-base font-bold text-blue-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Additional Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5 flex-1'>
                {selectedRegistration.seatingCapacity && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Seating Capacity</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.seatingCapacity} seats</div>
                  </div>
                )}
                {selectedRegistration.manufactureYear && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Manufacture Year</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.manufactureYear}</div>
                  </div>
                )}
                {(selectedRegistration.ladenWeight !== undefined && selectedRegistration.ladenWeight !== null) && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Laden Weight</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.ladenWeight} kg</div>
                  </div>
                )}
                {(selectedRegistration.unladenWeight !== undefined && selectedRegistration.unladenWeight !== null) && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Unladen Weight</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.unladenWeight} kg</div>
                  </div>
                )}
                {selectedRegistration.purchaseDeliveryDate && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Purchase/Delivery Date</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedRegistration.purchaseDeliveryDate}</div>
                  </div>
                )}
                {selectedRegistration.saleAmount && (
                  <div className='bg-white/80 p-2 rounded-lg'>
                    <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Sale Amount</div>
                    <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>₹{selectedRegistration.saleAmount.toLocaleString()}</div>
                  </div>
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

export default ViewVehicleRegistrationModal
