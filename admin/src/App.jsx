import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Setting from './pages/Setting'
import DrivingLicence from './pages/DrivingLicence'
import LLExpiring from './pages/LLExpiring'
import DLExpiring from './pages/DLExpiring'
import NationalPermit from './pages/NationalPermit'
import NationalPartAExpiring from './pages/NationalPartAExpiring'
import NationalPartBExpiring from './pages/NationalPartBExpiring'
import CgPermit from './pages/CgPermit'
import CgPermitExpiring from './pages/CgPermitExpiring'
import TemporaryPermit from './pages/TemporaryPermit'
import VehicleRegistration from './pages/VehicleRegistration'
import Insurance from './pages/Insurance'
import Fitness from './pages/Fitness'
import VehicleTransfer from './pages/VehicleTransfer'
import DealerBill from './pages/DealerBill'

function App() {
  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
        <ToastContainer />

        {/* Unified Navbar - handles both desktop and mobile navigation */}
        <Navbar />

        {/* Main Content - Full width without sidebar margin */}
        <div className='min-h-screen w-full'>
          {/* Page Content */}
          <main>
            <Routes>
              <Route path='/' element={<Setting />} />
              <Route path='/driving-licence' element={<DrivingLicence />} />
              <Route path='/ll-expiring' element={<LLExpiring />} />
              <Route path='/dl-expiring' element={<DLExpiring />} />
              <Route path='/national-permit' element={<NationalPermit />} />
              <Route path='/national-part-a-expiring' element={<NationalPartAExpiring />} />
              <Route path='/national-part-b-expiring' element={<NationalPartBExpiring />} />
              <Route path='/cg-permit' element={<CgPermit />} />
              <Route path='/cg-permit-expiring' element={<CgPermitExpiring />} />
              <Route path='/temporary-permit' element={<TemporaryPermit />} />
              <Route path='/vehicle-registration' element={<VehicleRegistration />} />
              <Route path='/insurance' element={<Insurance />} />
              <Route path='/fitness' element={<Fitness />} />
              <Route path='/vehicle-transfer' element={<VehicleTransfer />} />
              <Route path='/dealer-bill' element={<DealerBill />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
