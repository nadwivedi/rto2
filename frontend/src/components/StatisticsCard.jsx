const StatisticsCard = ({ title, value, icon, color, onClick, isActive, extraValue, subtext }) => {
  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      ring: 'ring-blue-300',
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    yellow: {
      border: 'border-yellow-500',
      ring: 'ring-yellow-300',
      bg: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    },
    red: {
      border: 'border-red-500',
      ring: 'ring-red-300',
      bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
    amber: {
      border: 'border-amber-500',
      ring: 'ring-amber-300',
      bg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    },
    indigo: {
      border: 'border-indigo-500',
      ring: 'ring-indigo-300',
      bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    purple: {
        border: 'border-purple-500',
        ring: 'ring-purple-300',
        bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    },
    gray: {
        border: 'border-gray-500',
        ring: 'ring-gray-300',
        bg: 'bg-gradient-to-br from-gray-500 to-gray-700',
    },
    teal: {
        border: 'border-teal-500',
        ring: 'ring-teal-300',
        bg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
    orange: {
        border: 'border-orange-500',
        ring: 'ring-orange-300',
        bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    }
  };

  const activeClasses = isActive ? `${colorClasses[color]?.border} ring-2 ${colorClasses[color]?.ring} shadow-xl` : 'border-transparent';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${activeClasses}`}
      title={isActive ? 'Click to clear filter' : `Click to filter by ${title}`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-[8px] lg:text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-0.5 lg:mb-1 whitespace-nowrap'>{title}</p>
          <h3 className='text-lg lg:text-2xl font-black text-gray-900'>{value || value === 0 ? value : '-'}</h3>
          {extraValue && <p className='text-[8px] lg:text-xs text-orange-600 font-bold mt-0.5'>{extraValue}</p>}
          {subtext && <p className='text-[7px] lg:text-[9px] text-gray-400 mt-0.5'>{subtext}</p>}
        </div>
        <div className={`w-6 h-6 lg:w-8 lg:h-8 ${colorClasses[color]?.bg} rounded-lg flex items-center justify-center shadow-md`}>
          {icon && (
            <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
