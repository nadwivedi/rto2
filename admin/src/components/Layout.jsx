import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const { admin, logout } = useAuth()

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />

      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex items-center justify-between px-8 py-4'>
            <div>
              <h2 className='text-xl font-bold text-gray-800'>Welcome back, {admin?.name}</h2>
              <p className='text-sm text-gray-500'>{admin?.email}</p>
            </div>

            <button
              onClick={logout}
              className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 p-8'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
