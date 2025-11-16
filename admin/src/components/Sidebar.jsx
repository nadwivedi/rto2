import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  return (
    <div className='w-64 bg-indigo-900 min-h-screen text-white'>
      {/* Logo */}
      <div className='p-6 border-b border-indigo-700'>
        <h1 className='text-2xl font-bold'>RTO Admin</h1>
        <p className='text-xs text-indigo-300 mt-1'>Management Panel</p>
      </div>

      {/* Menu */}
      <nav className='p-4'>
        <Link
          to='/'
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            location.pathname === '/'
              ? 'bg-white text-indigo-800 font-bold'
              : 'text-indigo-200 hover:bg-indigo-800'
          }`}
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
          </svg>
          <span>Manage Users</span>
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar
