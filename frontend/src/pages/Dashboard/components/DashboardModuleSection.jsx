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
      return <span className='px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700'>Expired</span>
    }
    if (days <= 7) {
      return <span className='px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700'>{days} days</span>
    }
    if (days <= 15) {
      return <span className='px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700'>{days} days</span>
    }
    return <span className='px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700'>{days} days</span>
  }

  const formatVehicleNumber = (vehicleNumber) => {
    const parts = getVehicleNumberParts(vehicleNumber)
    if (parts) {
      return (
        <div className='flex items-center gap-0.5 font-mono font-bold text-xs lg:text-sm'>
          <svg className='w-3 h-4 mr-0.5 text-blue-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
          </svg>
          <span className='text-blue-900'>{parts.stateCode}</span>
          <span className='text-blue-700'>{parts.districtCode}</span>
          <span className='text-gray-600'>{parts.series}</span>
          <span className='text-gray-800 font-black'>{parts.last4Digits}</span>
        </div>
      )
    }
    return <span className='font-mono font-bold text-sm'>{vehicleNumber}</span>
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
            <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]?.bg} rounded-xl flex items-center justify-center shadow-md text-2xl`}>
              {icon}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
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
      <div className={`px-6 py-5 bg-gradient-to-r ${colorClasses[color]?.lightBg} ${colorClasses[color]?.border} border-b`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]?.bg} rounded-xl flex items-center justify-center shadow-md text-2xl`}>
              {icon}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
              <p className='text-xs text-gray-500'>{records.length} {records.length === 1 ? 'record' : 'records'} expiring soon</p>
            </div>
          </div>
          <button
            onClick={() => navigate(viewAllLink)}
            className={`px-4 py-2 ${colorClasses[color]?.text} hover:bg-white rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2`}
          >
            View All
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className='block lg:hidden p-4 space-y-3'>
        {records.slice(0, 10).map((record, index) => (
          <div key={index} className='bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all'>
            <div className='flex justify-between items-start mb-2'>
              {formatVehicleNumber(record.vehicleNumber)}
              {getDaysRemainingBadge(record.validTo)}
            </div>
            <div className='text-sm text-gray-700 font-semibold mb-1'>{record.ownerName}</div>
            <div className='flex justify-between items-center text-xs text-gray-500'>
              <span>Expires: {formatDate(record.validTo)}</span>
              {record.balance > 0 && (
                <span className='text-orange-600 font-bold'>₹{record.balance}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Vehicle</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Owner</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Mobile</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Expires</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Days Left</th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider'>Balance</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {records.slice(0, 10).map((record, index) => (
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
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                  {formatDate(record.validTo)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {getDaysRemainingBadge(record.validTo)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-bold'>
                  {record.balance > 0 ? (
                    <span className='text-orange-600'>₹{record.balance}</span>
                  ) : (
                    <span className='text-green-600'>Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length > 10 && (
        <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
          <button
            onClick={() => navigate(viewAllLink)}
            className={`w-full ${colorClasses[color]?.text} hover:bg-white rounded-lg py-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2`}
          >
            View All {records.length} Records
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardModuleSection
