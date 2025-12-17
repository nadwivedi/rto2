import React from 'react';
import { getStatusColor, getStatusText } from '../utils/statusUtils';
import { getVehicleNumberParts } from '../utils/vehicleNoCheck';
import { getVehicleNumberDesign } from '../context/ThemeContext';
import Pagination from './Pagination';

const MobileCardView = ({
  records = [],
  loading = false,
  emptyMessage = {
    title: 'No records found',
    description: 'Click "Add New" to add your first record',
  },
  loadingMessage = 'Loading...',
  cardConfig = {},
  actions = [],
  pagination = null,
  searchQuery = '',
  headerGradient = 'from-indigo-50 via-purple-50 to-pink-50',
  avatarGradient = 'from-indigo-500 to-purple-500',
  emptyIconGradient = 'from-indigo-100 to-purple-100',
  emptyIconColor = 'text-indigo-400',
}) => {
  const vehicleDesign = getVehicleNumberDesign();

  // Default card configuration
  const defaultConfig = {
    // Header configuration
    header: {
      avatar: (record) => record.vehicleNumber?.substring(0, 2) || 'V',
      title: (record) => record.vehicleNumber,
      subtitle: (record) => record.ownerName || '-',
      showVehicleParts: true,
    },
    // Body configuration
    body: {
      showStatus: true,
      showPayment: true,
      showValidity: true,
      customFields: [],
    },
    // Footer configuration
    footer: null,
  };

  const config = { ...defaultConfig, ...cardConfig };

  const renderVehicleNumber = (vehicleNumber) => {
    const parts = getVehicleNumberParts(vehicleNumber);
    if (!parts) {
      return <div className='text-sm font-mono font-bold text-gray-900'>{vehicleNumber}</div>;
    }
    return (
      <div className={`${vehicleDesign.container} mb-1`}>
        <span className={vehicleDesign.stateCode}>{parts.stateCode}</span>
        <span className={vehicleDesign.districtCode}>{parts.districtCode}</span>
        <span className={vehicleDesign.series}>{parts.series}</span>
        <span className={vehicleDesign.last4Digits}>{parts.last4Digits}</span>
      </div>
    );
  };

  const renderVehicleBadge = (vehicleNumber) => {
    const parts = getVehicleNumberParts(vehicleNumber);
    if (!parts) {
      return (
        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
            <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
          </svg>
          {vehicleNumber}
        </span>
      );
    }
    return (
      <div className={vehicleDesign.container}>
        <span className={vehicleDesign.stateCode}>{parts.stateCode}</span>
        <span className={vehicleDesign.districtCode}>{parts.districtCode}</span>
        <span className={vehicleDesign.series}>{parts.series}</span>
        <span className={vehicleDesign.last4Digits}>{parts.last4Digits}</span>
      </div>
    );
  };

  const renderActionButtons = (record) => {
    return actions.map((action, index) => {
      // Check if action should be shown based on condition
      if (action.condition && !action.condition(record)) {
        return null;
      }

      const isLoading = action.loading && action.loading === record.id;

      return (
        <button
          key={index}
          onClick={() => action.onClick(record)}
          onMouseEnter={action.onMouseEnter}
          disabled={isLoading || action.disabled}
          className={`p-2 ${action.bgColor || 'bg-gray-100'} ${action.textColor || 'text-gray-600'} rounded-lg hover:${action.hoverBgColor || 'bg-gray-200'} transition-all cursor-pointer disabled:opacity-50`}
          title={action.title}
        >
          {action.icon}
        </button>
      );
    });
  };

  const renderPaymentDetails = (record) => {
    const totalFee = record.totalFee || record.fees || record.totalAmount || 0;
    const paid = record.paid || record.paidAmount || 0;
    const balance = record.balance || record.balanceAmount || 0;

    return (
      <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-100'>
        <div>
          <p className='text-[10px] text-gray-500 font-semibold uppercase'>Total Fee</p>
          <p className='text-sm font-bold text-gray-800'>₹{totalFee.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className='text-[10px] text-gray-500 font-semibold uppercase'>Paid</p>
          <p className='text-sm font-bold text-emerald-600'>₹{paid.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className='text-[10px] text-gray-500 font-semibold uppercase'>Balance</p>
          <p className={`text-sm font-bold ${balance > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
            ₹{balance.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    );
  };

  const renderValidityPeriod = (record) => {
    const validFrom = record.validFrom || record.taxFrom || '';
    const validTo = record.validTo || record.validTill || record.taxTo || '';

    return (
      <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
        <div>
          <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
            <svg className='w-3 h-3 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
            Valid From
          </p>
          <p className='text-xs font-semibold text-gray-700'>{validFrom}</p>
        </div>
        <div>
          <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
            <svg className='w-3 h-3 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
            Valid To
          </p>
          <p className='text-xs font-semibold text-gray-700'>{validTo}</p>
        </div>
      </div>
    );
  };

  return (
    <div className='block lg:hidden'>
      {loading ? (
        <div className='flex flex-col justify-center items-center py-12'>
          <div className='relative'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
            <div className='absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
          </div>
          <p className='text-sm text-gray-600 mt-4'>{loadingMessage}</p>
        </div>
      ) : records.length > 0 ? (
        <>
          <div className='p-3 space-y-3'>
            {records.map((record) => (
              <div key={record.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                {/* Card Header with Avatar and Actions */}
                <div className={`bg-gradient-to-r ${headerGradient} p-3 flex items-start justify-between`}>
                  <div className='flex items-center gap-3'>
                    {config.header.avatar !== null && (
                      <div className={`flex-shrink-0 h-12 w-12 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                        {typeof config.header.avatar === 'function'
                          ? config.header.avatar(record)
                          : config.header.avatar}
                      </div>
                    )}
                    <div>
                      {config.header.showVehicleParts && config.header.title(record) ? (
                        renderVehicleNumber(config.header.title(record))
                      ) : (
                        <div className='text-sm font-mono font-bold text-gray-900'>
                          {config.header.title(record)}
                        </div>
                      )}
                      <div className='text-xs text-gray-600'>
                        {config.header.subtitle(record)}
                      </div>
                      {config.header.extraInfo && (
                        <div className='text-xs text-gray-500 mt-0.5'>
                          {config.header.extraInfo(record)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex items-center gap-1.5'>
                    {renderActionButtons(record)}
                  </div>
                </div>

                {/* Card Body */}
                <div className='p-3 space-y-2.5'>
                  {/* Custom Fields */}
                  {config.body.customFields && config.body.customFields.length > 0 && (
                    <div className='space-y-2.5'>
                      {config.body.customFields.map((field, index) => (
                        <div key={index}>
                          {field.render(record, { renderVehicleBadge, getStatusColor, getStatusText })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status Badge */}
                  {config.body.showStatus && record.status && (
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500 font-semibold uppercase'>Status</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                  )}

                  {/* Payment Details */}
                  {config.body.showPayment && renderPaymentDetails(record)}

                  {/* Validity Period */}
                  {config.body.showValidity && renderValidityPeriod(record)}
                </div>

                {/* Card Footer */}
                {config.footer && (
                  <div className='px-3 pb-3'>
                    {config.footer(record)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && records.length > 0 && (
            <div className='px-3 pb-3'>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                totalRecords={pagination.totalRecords}
                itemsPerPage={pagination.limit}
              />
            </div>
          )}
        </>
      ) : (
        <div className='p-8 text-center'>
          <div className='text-gray-400'>
            <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${emptyIconGradient} rounded-full flex items-center justify-center mb-4 shadow-lg`}>
              <svg className={`w-10 h-10 ${emptyIconColor}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            </div>
            <h3 className='text-lg font-black text-gray-700 mb-2'>{emptyMessage.title}</h3>
            <p className='text-sm text-gray-500 text-center max-w-xs mx-auto'>
              {searchQuery
                ? `No records match your search criteria.`
                : emptyMessage.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCardView;
