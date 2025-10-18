import React from 'react'

const MobileHeader = ({ setIsSidebarOpen }) => {
  return (
    <div className='lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-30 shadow-sm'>
      <div className='flex items-center justify-between'>
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className='p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
          aria-label='Open Menu'
        >
          <svg className='w-6 h-6 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>

        {/* Logo */}
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
            <span className='text-lg font-black text-white'>R</span>
          </div>
          <div>
            <h1 className='text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600'>
              RTO Admin
            </h1>
          </div>
        </div>

        {/* Placeholder for right side alignment */}
        <div className='w-10'></div>
      </div>
    </div>
  )
}

export default MobileHeader
