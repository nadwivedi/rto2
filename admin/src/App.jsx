import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Users from './pages/Users'

function App() {
  return (
    <Router>
      <div className='flex min-h-screen bg-gray-50'>
        <Sidebar />

        <div className='flex-1 p-8'>
          <Routes>
            <Route path='/' element={<Users />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
