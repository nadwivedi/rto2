import React from 'react';
import { getStatusColor, getStatusText } from '../../../utils/statusUtils';

const CgPermitMobileCardView = ({
  loading,
  filteredPermits,
  shouldShowRenewButton,
  handleRenewClick,
  handleViewDetails,
  handleEditPermit,
  handleWhatsAppShare,
  whatsappLoading,
  handleDeletePermit,
  API_URL
}) => {
  return (
    <div className='block lg:hidden'>
      {loading ? (
        <div className='flex flex-col justify-center items-center py-12'>
          <div className='relative'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
            <div className='absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
          </div>
          <p className='text-sm text-gray-600 mt-4'>Loading permits...</p>
        </div>
      ) : filteredPermits.length > 0 ? (
        <div className='p-3 space-y-3'>
          {filteredPermits.map((permit) => (
            <div key={permit.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
              {/* Card Header with Avatar and Actions */}
              <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                    {permit.permitHolder?.substring(0, 2)?.toUpperCase() || 'CG'}
                  </div>
                  <div>
                    <div className='text-xs font-mono font-bold text-gray-900'>{permit.permitNumber}</div>
                    <div className='text-xs text-gray-600 mt-0.5'>{permit.permitHolder || '-'}</div>
                  </div>
                </div>
                {/* Action Buttons on top right */}
                <div className='flex items-center gap-1.5'>
                  {shouldShowRenewButton(permit) && (
                    <button
                      onClick={() => handleRenewClick(permit)}
                      className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                      title='Renew Permit'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(permit)}
                    className='p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all cursor-pointer'
                    title='View Details'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditPermit(permit)}
                    className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                    title='Edit'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleWhatsAppShare(permit)}
                    disabled={whatsappLoading === permit.id}
                    className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer disabled:opacity-50'
                    title='Share via WhatsApp'
                  >
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePermit(permit)}
                    className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                    title='Delete Permit'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className='p-3 space-y-2.5'>
                {/* Status and Vehicle */}
                <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(permit.status)}`}>
                    {getStatusText(permit.status)}
                  </span>
                  <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                    <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                      <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                    </svg>
                    {permit.vehicleNo}
                  </span>
                </div>

                {/* Payment Details */}
                <div className='grid grid-cols-3 gap-2'>
                  <div className='bg-gray-50 rounded-lg p-2 border border-gray-200'>
                    <div className='text-xs text-gray-500 font-medium mb-0.5'>Total Fee</div>
                    <div className='text-sm font-bold text-gray-900'>₹{(permit.fees || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className='bg-emerald-50 rounded-lg p-2 border border-emerald-200'>
                    <div className='text-xs text-emerald-600 font-medium mb-0.5'>Paid</div>
                    <div className='text-sm font-bold text-emerald-700'>₹{(permit.paid || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className={`rounded-lg p-2 border ${(permit.balance || 0) > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-xs font-medium mb-0.5 ${(permit.balance || 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>Balance</div>
                    <div className={`text-sm font-bold ${(permit.balance || 0) > 0 ? 'text-orange-700' : 'text-gray-500'}`}>₹{(permit.balance || 0).toLocaleString('en-IN')}</div>
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
                    <div className='text-sm font-bold text-green-900'>{permit.validFrom}</div>
                  </div>
                  <div className='bg-red-50 rounded-lg p-2 border border-red-200'>
                    <div className='text-xs text-red-600 font-medium mb-0.5 flex items-center gap-1'>
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      Valid Till
                    </div>
                    <div className='text-sm font-bold text-red-900'>{permit.validTill}</div>
                  </div>
                </div>

                {/* Route and Goods Type */}
                {(permit.route || permit.goodsType) && (
                  <div className='bg-indigo-50 rounded-lg p-2 border border-indigo-200'>
                    <div className='text-xs text-indigo-600 font-medium mb-1'>Route & Goods</div>
                    <div className='space-y-0.5'>
                      {permit.route && (
                        <div className='text-xs font-semibold text-gray-700 flex items-start gap-1'>
                          <svg className='w-3 h-3 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                          </svg>
                          {permit.route}
                        </div>
                      )}
                      {permit.goodsType && (
                        <div className='text-xs font-semibold text-gray-700 flex items-start gap-1'>
                          <svg className='w-3 h-3 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                          </svg>
                          {permit.goodsType}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='p-6'>
          <div className='flex flex-col items-center justify-center py-12'>
            <div className='w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
              <svg className='w-10 h-10 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            </div>
            <h3 className='text-lg font-black text-gray-700 mb-2'>No CG Permits Found</h3>
            <p className='text-sm text-gray-500 text-center max-w-xs'>
              {filteredPermits.length === 0 && !loading ? 'No permits match your search criteria.' : 'Get started by adding your first CG permit.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CgPermitMobileCardView;
