import { useState, useEffect, useLayoutEffect } from 'react';
import { getDaysRemaining } from '../../../utils/dateHelpers';
import { getVehicleNumberParts } from '../../../utils/vehicleNoCheck';

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

const DashboardSlider = ({ records, title, icon, color, emptyMessage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width] = useWindowSize();
  const isMobile = width < 768;

  const itemsToShow = isMobile ? 2 : 6;
  const shouldSlide = records.length > itemsToShow;

  useEffect(() => {
    if (shouldSlide) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [records.length, shouldSlide]);

  const colorClasses = {
    red: {
      bg: 'from-red-500 to-orange-600',
      lightBg: 'from-red-50 to-red-100',
      border: 'border-red-200'
    },
    yellow: {
      bg: 'from-yellow-500 to-orange-600',
      lightBg: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200'
    },
    teal: {
      bg: 'from-teal-500 to-cyan-600',
      lightBg: 'from-teal-50 to-teal-100',
      border: 'border-teal-200'
    },
    purple: {
      bg: 'from-purple-500 to-pink-600',
      lightBg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200'
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.red;

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

  const getExpiryDate = (record) => {
    return record.taxTo || record.validTo || record.permitExpiryDate
  }

  if (!records || records.length === 0) {
    return (
      <div className='col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-38 lg:h-40'>
        <div className={`px-2 py-2 lg:px-4 lg:py-3 bg-gradient-to-r ${selectedColor.lightBg} border-b ${selectedColor.border}`}>
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className={`w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br ${selectedColor.bg} rounded-xl flex items-center justify-center shadow-md text-xl`}>
              {icon}
            </div>
            <div className='flex items-baseline gap-2 lg:gap-3'>
              <h2 className='text-sm lg:text-lg font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis mb-0'>{title}</h2>
              <span className='text-[10px] text-gray-500'>-</span>
              <p className='text-[10px] text-gray-500'>0 expiring soon</p>
            </div>
          </div>
        </div>
        <div className='p-6 text-center'>
          <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h3 className='text-md font-semibold text-gray-700 mb-1'>All Clear!</h3>
          <p className='text-gray-500 text-xs'>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  const loopedRecords = shouldSlide ? [...records, ...records.slice(0, itemsToShow)] : records;


  return (
    <div className='col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-38 lg:h-40'>
      <div className={`px-2 py-2 lg:px-4 lg:py-3 bg-gradient-to-r ${selectedColor.lightBg} border-b ${selectedColor.border}`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className={`w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br ${selectedColor.bg} rounded-xl flex items-center justify-center shadow-md text-xl`}>
              {icon}
            </div>
            <div className='flex items-baseline gap-2 lg:gap-3'>
              <h2 className='text-sm lg:text-lg font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis mb-0'>{title}</h2>
              <span className='text-[10px] text-gray-500'>-</span>
              <p className='text-[10px] text-gray-500'>{records.length} expiring soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className='p-4 overflow-hidden'>
        <div 
            className='flex'
            style={{
                width: `${(loopedRecords.length / itemsToShow) * 100}%`,
                transform: shouldSlide ? `translateX(-${(currentIndex * (100 / loopedRecords.length))}%)` : 'none',
                transition: shouldSlide ? 'transform 0.5s ease-in-out' : 'none',
            }}
            onTransitionEnd={() => {
                if(currentIndex >= records.length){
                    setCurrentIndex(0);
                    const newStyle = {
                        width: `${(loopedRecords.length / itemsToShow) * 100}%`,
                        transform: 'none',
                        transition: 'none',
                    }
                    setTimeout(() => {
                        const newStyle2 = {
                            width: `${(loopedRecords.length / itemsToShow) * 100}%`,
                            transform: `translateX(-${(0 * (100 / loopedRecords.length))}%)`,
                            transition: 'transform 0.5s ease-in-out',
                        }
                    }, 50)
                }
            }}
        >
            {loopedRecords.map((record, index) => (
              <div key={index} style={{ width: `${100 / loopedRecords.length}%`}} className='flex-shrink-0 px-2'>
                <div className='bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200'>
                  <div className='flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200'>
                    {formatVehicleNumber(record.vehicleNumber, true)}
                    {getDaysRemainingBadge(getExpiryDate(record))}
                  </div>
                  <div className='flex items-center gap-1'>
                    <svg className='w-2.5 h-2.5 text-gray-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    <span className='text-[10px] font-semibold text-gray-800 truncate'>{record.ownerName}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSlider;