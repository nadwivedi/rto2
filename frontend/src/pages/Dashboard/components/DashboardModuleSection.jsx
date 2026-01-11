import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate, getDaysRemaining } from '../../../utils/dateHelpers'
import { getVehicleNumberParts } from '../../../utils/vehicleNoCheck'

const DashboardModuleSection = ({
  title,
  icon,
  color,
  records,
  viewAllLink,
  emptyMessage,
  loading
}) => {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)

  // Helper to get the correct expiry date field based on record type
  const getExpiryDate = (record) => {
    return record.taxTo || record.validTo || record.permitExpiryDate
  }

  // Helper to get the correct balance field
  const getBalance = (record) => {
    return record.balance || record.balanceAmount || 0
  }

  const colorClasses = {
    red: {
      bg: 'from-red-500 to-orange-600',
      text: 'text-red-600',
      lightBg: 'bg-red-50',
      border: 'border-red-200'
    },
    yellow: {
      bg: 'from-yellow-500 to-orange-600',
      text: 'text-yellow-600',
      lightBg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    indigo: {
      bg: 'from-indigo-500 to-purple-600',
      text: 'text-indigo-600',
      lightBg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    teal: {
      bg: 'from-teal-500 to-cyan-600',
      text: 'text-teal-600',
      lightBg: 'bg-teal-50',
      border: 'border-teal-200'
    },
    purple: {
      bg: 'from-purple-500 to-pink-600',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'from-orange-500 to-red-600',
      text: 'text-orange-600',
      lightBg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  }

  const getDaysRemainingBadge = (validTo) => {
    const days = getDaysRemaining(validTo)
    if (days < 0) {
      return <span className='px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 lg:px-2 lg:py-1'>Expired</span>
    }
    if (days <= 7) {
      return <span className='px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 lg:px-2 lg:py-1'>{days}d</span>
    }
    if (days <= 15) {
      return <span className='px-1.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 lg:px-2 lg:py-1'>{days}d</span>
    }
    return <span className='px-1.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 lg:px-2 lg:py-1'>{days}d</span>
  }

  const formatVehicleNumber = (vehicleNumber, isMobile = false) => {
    const parts = getVehicleNumberParts(vehicleNumber)
    if (parts) {
      return (
        <div className='flex items-center gap-0.5 font-mono font-bold'>
          {!isMobile && (
            <svg className='w-3 h-3 mr-0.5 text-blue-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
            </svg>
          )}
          <span className={`text-blue-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>{parts.stateCode}</span>
          <span className={`text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>{parts.districtCode}</span>
          <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{parts.series}</span>
          <span className={`text-gray-900 font-black ${isMobile ? 'text-xs' : 'text-sm'}`}>{parts.last4Digits}</span>
        </div>
      )
    }
    return <span className={`font-mono font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>{vehicleNumber}</span>
  }

  if (loading) {
    return (
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse'>
        <div className={`px-6 py-5 bg-gradient-to-r ${colorClasses[color]?.lightBg} ${colorClasses[color]?.border} border-b`}>
          <div className='h-6 bg-gray-300 rounded w-1/3'></div>
        </div>
        <div className='p-6 space-y-3'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-12 bg-gray-200 rounded'></div>
          ))}
        </div>
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className={`px-6 py-5 bg-gradient-to-r ${colorClasses[color]?.lightBg} ${colorClasses[color]?.border} border-b`}>
          <div className='flex items-center gap-3'>
            <div className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${colorClasses[color]?.bg} rounded-xl flex items-center justify-center shadow-md text-2xl`}>
              {icon}
            </div>
            <div>
              <h2 className='text-base lg:text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis'>{title}</h2>
              <p className='text-xs text-gray-500'>Expiring in next 30 days</p>
            </div>
          </div>
        </div>
        <div className='p-12 text-center'>
          <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-10 h-10 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>All Clear!</h3>
          <p className='text-gray-500 text-sm'>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300'>
      <div className={`px-3 py-3 lg:px-6 lg:py-5 bg-gradient-to-r ${colorClasses[color]?.lightBg} ${colorClasses[color]?.border} border-b`}>
        <div className='flex items-center'>
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${colorClasses[color]?.bg} rounded-xl flex items-center justify-center shadow-md text-2xl`}>
              {icon}
            </div>
            <div>
              <h2 className='text-base lg:text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis'>{title}</h2>
              <p className='text-xs text-gray-500'>Expiring soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className='block lg:hidden p-1.5 space-y-2'>
        {records.slice(0, showAll ? records.length : 3).map((record, index) => (
          <div key={index} className='bg-white rounded-lg p-2.5 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200'>
            {/* Vehicle Number & Days Left - Same Row */}
            <div className='flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200'>
              {formatVehicleNumber(record.vehicleNumber, true)}
              {/* Days Badge */}
              {getDaysRemainingBadge(getExpiryDate(record))}
            </div>

            {/* Owner Name */}
            <div className='flex items-center gap-1'>
              <svg className='w-2.5 h-2.5 text-gray-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
              <span className='text-[10px] font-semibold text-gray-800 truncate'>{record.ownerName}</span>
            </div>
          </div>
        ))}

        {/* Show More Button for Mobile */}
        {records.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className='w-full py-2 mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200'
          >
            {showAll ? (
              <>
                Show Less
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
                </svg>
              </>
            ) : (
              <>
                Show More ({records.length - 3} more)
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Vehicle</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Owner</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Mobile</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Days Left</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {records.slice(0, showAll ? records.length : 3).map((record, index) => (
              <tr key={index} className='hover:bg-gray-50 transition-colors'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {formatVehicleNumber(record.vehicleNumber)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                  {record.ownerName}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                  {record.mobileNumber || 'N/A'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {getDaysRemainingBadge(getExpiryDate(record))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button for Desktop */}
      {records.length > 3 && (
        <div className='hidden lg:block px-6 py-4 bg-gray-50 border-t border-gray-200'>
          <button
            onClick={() => setShowAll(!showAll)}
            className={`w-full ${colorClasses[color]?.text} hover:bg-white rounded-lg py-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2`}
          >
            {showAll ? (
              <>
                Show Less
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
                </svg>
              </>
            ) : (
              <>
                Show More ({records.length - 3} more)
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardModuleSection
