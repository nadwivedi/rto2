import React from 'react';
import { getStatusColor, getStatusText } from '../../../utils/statusUtils';

const TaxMobileCardView = ({
  taxRecords,
  shouldShowRenewButton,
  handleRenewClick,
  handleEditClick,
  handleDeleteTax,
}) => {
  return (
    <div className='block lg:hidden'>
      {taxRecords.length > 0 ? (
        <div className='p-3 space-y-3'>
          {taxRecords.map((record) => (
            <div key={record.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
              {/* Card Header with Avatar and Actions */}
              <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                    {record.vehicleNumber?.substring(0, 2) || 'V'}
                  </div>
                  <div>
                    <div className='text-sm font-mono font-bold text-gray-900'>{record.vehicleNumber}</div>
                    <div className='text-xs text-gray-600'>{record.ownerName || '-'}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex items-center gap-1.5'>
                  {/* Renew Button - Smart logic based on vehicle tax status */}
                  {shouldShowRenewButton(record) && (
                    <button
                      onClick={() => handleRenewClick(record)}
                      className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                      title='Renew Tax'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(record)}
                    className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                    title='Edit'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTax(record.id)}
                    className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
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
                {/* Receipt & Status Row */}
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] text-gray-500 font-semibold uppercase'>Receipt No</p>
                    <p className='text-sm font-mono font-bold text-gray-900'>{record.receiptNo}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(record.status)}`}>
                    {getStatusText(record.status)}
                  </span>
                </div>

                {/* Payment Details */}
                <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-100'>
                  <div>
                    <p className='text-[10px] text-gray-500 font-semibold uppercase'>Total</p>
                    <p className='text-sm font-bold text-gray-800'>₹{(record.totalAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className='text-[10px] text-gray-500 font-semibold uppercase'>Paid</p>
                    <p className='text-sm font-bold text-emerald-600'>₹{(record.paidAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className='text-[10px] text-gray-500 font-semibold uppercase'>Balance</p>
                    <p className={`text-sm font-bold ${record.balanceAmount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                      ₹{(record.balanceAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Tax Period */}
                <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                  <div>
                    <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                      <svg className='w-3 h-3 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      Tax From
                    </p>
                    <p className='text-xs font-semibold text-gray-700'>{record.taxFrom}</p>
                  </div>
                  <div>
                    <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                      <svg className='w-3 h-3 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      Tax To
                    </p>
                    <p className='text-xs font-semibold text-gray-700'>{record.taxTo}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='p-8 text-center'>
          <div className='text-gray-400'>
            <svg className='mx-auto h-12 w-12 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <p className='text-sm font-semibold text-gray-600'>No tax records found</p>
            <p className='text-xs text-gray-500 mt-1'>Click "Add New" to add your first record</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxMobileCardView;
