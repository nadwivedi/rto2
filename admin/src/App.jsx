import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Users from './pages/Users'
import VehicleRegistrations from './pages/VehicleRegistrations'
import Export from './pages/Export'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <Router>
      <div className='flex min-h-screen bg-gray-50'>
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <div className='flex-1 flex flex-col min-h-screen'>
          {/* Mobile Header with Hamburger */}
          <div className='md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10'>
            <button
              onClick={toggleSidebar}
              className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
              aria-label='Toggle menu'
            >
              <svg className='w-6 h-6 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <h1 className='text-lg font-bold text-gray-800'>RTO Sarthi</h1>
            <div className='w-10'></div> {/* Spacer for centering */}
          </div>

          {/* Main Content */}
          <div className='flex-1 p-4 md:p-8'>
            <Routes>
              <Route path='/' element={<Users />} />
              <Route path='/vehicle-registrations' element={<VehicleRegistrations />} />
              <Route path='/export' element={<Export />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
