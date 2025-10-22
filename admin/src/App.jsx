import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import DrivingLicence from './pages/DrivingLicence'
import NationalPermit from './pages/NationalPermit'
import CgPermit from './pages/CgPermit'
import TemporaryPermit from './pages/TemporaryPermit'
import VehicleRegistration from './pages/VehicleRegistration'
import Insurance from './pages/Insurance'
import Fitness from './pages/Fitness'
import LicenseRenewal from './pages/LicenseRenewal'
import VehicleTransfer from './pages/VehicleTransfer'
import Reports from './pages/Reports'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
        <ToastContainer />

        {/* Sidebar - with mobile hamburger menu */}
        {/* <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> */}

        {/* Navbar - Full width navigation */}
        <Navbar/>

        {/* Main Content - Full width without sidebar margin */}
        <div className='min-h-screen w-full'>
          {/* Page Content */}
          <main>
            <Routes>
              <Route path='/' element={<Dashboard setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/driving-licence' element={<DrivingLicence setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/national-permit' element={<NationalPermit setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/cg-permit' element={<CgPermit setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/temporary-permit' element={<TemporaryPermit setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/vehicle-registration' element={<VehicleRegistration setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/insurance' element={<Insurance setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/fitness' element={<Fitness setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/license-renewal' element={<LicenseRenewal setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/vehicle-transfer' element={<VehicleTransfer setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/reports' element={<Reports setIsSidebarOpen={setIsSidebarOpen} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
