import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Setting from './pages/Setting'
import DrivingLicence from './pages/DrivingLicence/DrivingLicence'
import NationalPermit from './pages/NationalPermit/NationalPermit'
import CgPermit from './pages/CgPermit/CgPermit'
import TemporaryPermit from './pages/TemporaryPermit/TemporaryPermit'
import TemporaryPermitOtherState from './pages/TemporaryPermitOtherState/TemporaryPermitOtherState'
import VehicleRegistration from './pages/VehicleRegistration/VehicleRegistration'
import Insurance from './pages/Insurance/Insurance'
import Fitness from './pages/Fitness/Fitness'
import VehicleTransfer from './pages/VehicleTransfer/VehicleTransfer'
import DealerBill from './pages/DealerBill'
import Tax from './pages/Tax/Tax'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastContainer />
          <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />} />

          {/* Protected Routes */}
          <Route
            path='/*'
            element={
              // <ProtectedRoute>
                <div className='min-h-screen bg-gray-50'>
                  {/* Unified Navbar - handles both desktop and mobile navigation */}
                  <Navbar />

                  {/* Main Content - Full width without sidebar margin */}
                  <div className='min-h-screen w-full'>
                    {/* Page Content */}
                    <main>
                      <Routes>
                        <Route path='/' element={<VehicleRegistration />} />
                        <Route path='/driving' element={<DrivingLicence />} />
                        <Route path='/setting' element={<Setting />} />
                        <Route path='/national-permit' element={<NationalPermit />} />
                        <Route path='/cg-permit' element={<CgPermit />} />
                        <Route path='/temporary-permit' element={<TemporaryPermit />} />
                        <Route path='/temporary-permit-other-state' element={<TemporaryPermitOtherState />} />
                        <Route path='/vehicle-registration' element={<VehicleRegistration />} />
                        <Route path='/insurance' element={<Insurance />} />
                        <Route path='/fitness' element={<Fitness />} />
                        <Route path='/tax' element={<Tax />} />
                        <Route path='/vehicle-transfer' element={<VehicleTransfer />} />
                        <Route path='/dealer-bill' element={<DealerBill />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              // </ProtectedRoute>
            }
          />
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
