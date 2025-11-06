const Header = ({ searchTerm, onSearchChange, onRegisterClick, totalRecords, filteredCount }) => {
  return (
    <div className='px-6 py-4 bg-white border-b border-gray-200'>
      <div className='flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between'>
        {/* Title and Count */}
        <div>
          <h2 className='text-xl font-bold text-gray-900'>Vehicle Registrations</h2>
          <p className='text-sm text-gray-500 mt-0.5'>
            {filteredCount} of {totalRecords} records
          </p>
        </div>

        <div className='flex flex-col lg:flex-row gap-3'>
          {/* Search Bar */}
          <div className='relative lg:w-80'>
            <input
              type='text'
              placeholder='Search by regn no, owner, chassis...'
              value={searchTerm}
              onChange={onSearchChange}
              className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white'
            />
            <svg
              className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </div>

          {/* Register Button */}
          <button
            onClick={onRegisterClick}
            className='px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            <span>Register Vehicle</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
