import React from 'react';
import { getStatusColor, getStatusText } from '../../../utils/statusUtils';
import { getVehicleNumberParts } from '../../../utils/vehicleNoCheck';
import { getVehicleNumberDesign } from '../../../context/ThemeContext';
import Pagination from '../../../components/Pagination';

const InsuranceMobileCardView = ({
  filteredInsurances,
  shouldShowRenewButton,
  handleRenewClick,
  handleEditClick,
  handleDeleteInsurance,
  pagination,
  handlePageChange,
  loading,
  searchQuery
}) => {
  const vehicleDesign = getVehicleNumberDesign()

  return (
    <div className='block lg:hidden'>
      {filteredInsurances.length > 0 ? (
        <div className='p-3 space-y-3'>
          {filteredInsurances.map((insurance) => (
            <div key={insurance.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
              {/* Card Header with Avatar and Status Badge */}
              <div className='bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 p-3 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                    </svg>
                  </div>
                  <div>
                    <div className='text-xs font-bold text-gray-900'>{insurance.vehicleNumber}</div>
                    <div className='text-xs font-mono text-gray-600 mt-0.5'>{insurance.policyNumber}</div>
                    <div className='text-xs text-gray-600 mt-0.5'>{insurance.ownerName || '-'}</div>
                    <div className='text-xs text-gray-500 flex items-center mt-1'>
                      <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                      </svg>
                      {insurance.mobileNumber || 'N/A'}
                    </div>
                  </div>
                </div>
                {/* Action Buttons on top right */}
                <div className='flex-shrink-0 flex items-center gap-1.5'>
                  {shouldShowRenewButton(insurance) && (
                    <button
                      onClick={() => handleRenewClick(insurance)}
                      className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                      title='Renew Insurance'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(insurance)}
                    className='p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-all cursor-pointer'
                    title='Edit Insurance'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteInsurance(insurance)}
                    className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                    title='Delete Insurance'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                  </button>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(insurance.status)} border-2 ${
                    getStatusText(insurance.status) === 'Expired' ? 'border-red-300' :
                    getStatusText(insurance.status) === 'Expiring Soon' ? 'border-orange-300' :
                    'border-green-300'
                  }`}>
                    {getStatusText(insurance.status)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className='p-3 space-y-2.5'>
                {/* Vehicle and Insurance Company */}
                <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                  {(() => {
                    const parts = getVehicleNumberParts(insurance.vehicleNumber)
                    if (!parts) {
                      return (
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                            <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                          </svg>
                          {insurance.vehicleNumber}
                        </span>
                      )
                    }
                    return (
                      <div className={vehicleDesign.container}>
                        <span className={vehicleDesign.stateCode}>{parts.stateCode}</span>
                        <span className={vehicleDesign.districtCode}>{parts.districtCode}</span>
                        <span className={vehicleDesign.series}>{parts.series}</span>
                        <span className={vehicleDesign.last4Digits}>{parts.last4Digits}</span>
                      </div>
                    )
                  })()}
                  <span className='text-xs font-semibold text-gray-600'>{insurance.vehicleType}</span>
                </div>

                {/* Payment Details */}
                <div className='grid grid-cols-3 gap-2'>
                  <div className='bg-gray-50 rounded-lg p-2 border border-gray-200'>
                    <div className='text-xs text-gray-500 font-medium mb-0.5'>Total Fee</div>
                    <div className='text-sm font-bold text-gray-900'>₹{(insurance.totalFee || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className='bg-emerald-50 rounded-lg p-2 border border-emerald-200'>
                    <div className='text-xs text-emerald-600 font-medium mb-0.5'>Paid</div>
                    <div className='text-sm font-bold text-emerald-700'>₹{(insurance.paid || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className={`rounded-lg p-2 border ${(insurance.balance || 0) > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-xs font-medium mb-0.5 ${(insurance.balance || 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>Balance</div>
                    <div className={`text-sm font-bold ${(insurance.balance || 0) > 0 ? 'text-orange-700' : 'text-gray-500'}`}>₹{(insurance.balance || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className='grid grid-cols-2 gap-2 pt-1'>
                  <div className='bg-green-50 rounded-lg p-2 border border-green-200'>
                    <div className='text-xs text-green-600 font-medium mb-0.5 flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      Valid From
                    </div>
                    <div className='text-sm font-bold text-green-900'>{insurance.validFrom}</div>
                  </div>
                  <div className='bg-red-50 rounded-lg p-2 border border-red-200'>
                    <div className='text-xs text-red-600 font-medium mb-0.5 flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      Valid To
                    </div>
                    <div className='text-sm font-bold text-red-900'>{insurance.validTo}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='p-6'>
          <div className='flex flex-col items-center justify-center py-12'>
            <div className='w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
              <svg className='w-10 h-10 text-cyan-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
              </svg>
            </div>
            <h3 className='text-lg font-black text-gray-700 mb-2'>No Insurance Records Found</h3>
            <p className='text-sm text-gray-500 text-center max-w-xs'>
              {searchQuery ? 'No insurance records match your search criteria.' : 'Get started by adding your first insurance record.'}
            </p>
          </div>
        </div>
      )}

      {/* Pagination for Mobile */}
      {!loading && filteredInsurances.length > 0 && (
        <div className='px-3 pb-3'>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalRecords={pagination.totalRecords}
            itemsPerPage={pagination.limit}
          />
        </div>
      )}
    </div>
  );
};

export default InsuranceMobileCardView;
