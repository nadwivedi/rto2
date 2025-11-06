const StatisticsCard = ({ statistics }) => {
  return (
    <div className='mb-2 mt-3'>
      <div className='grid grid-cols-1 gap-2 lg:gap-3 mb-5 max-w-sm'>
        {/* Total Registrations */}
        <div className='bg-white rounded-lg shadow-md border border-gray-100 p-2 lg:p-3.5 hover:shadow-lg transition-shadow duration-300'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total Vehicles</p>
              <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
            </div>
            <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md'>
              <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatisticsCard
