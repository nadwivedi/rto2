import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import DrivingLicence from './pages/DrivingLicence'
import Permits from './pages/Permits'
import NationalPermit from './pages/NationalPermit'
import CgPermit from './pages/CgPermit'
import TemporaryPermit from './pages/TemporaryPermit'
import VehicleRegistration from './pages/VehicleRegistration'
import Insurance from './pages/Insurance'
import Fitness from './pages/Fitness'
import LicenseRenewal from './pages/LicenseRenewal'
import VehicleTransfer from './pages/VehicleTransfer'
import NOC from './pages/NOC'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
        <ToastContainer />
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className='lg:ml-64 min-h-screen'>
          {/* Page Content */}
          <main>
            <Routes>
              <Route path='/' element={<Dashboard setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/driving-licence' element={<DrivingLicence setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/permits' element={<Permits setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/national-permit' element={<NationalPermit setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/cg-permit' element={<CgPermit setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/temporary-permit' element={<TemporaryPermit setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/vehicle-registration' element={<VehicleRegistration setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/insurance' element={<Insurance setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/fitness' element={<Fitness setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/license-renewal' element={<LicenseRenewal setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/vehicle-transfer' element={<VehicleTransfer setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/noc' element={<NOC setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/reports' element={<Reports setIsSidebarOpen={setIsSidebarOpen} />} />
              <Route path='/settings' element={<Settings setIsSidebarOpen={setIsSidebarOpen} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
