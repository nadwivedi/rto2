import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const SarthiDashboard = () => {
  const [stats, setStats] = useState({
    dl: 0,
    transfer: 0,
    noc: 0,
    renewal: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // For now using individual counts if summary endpoint doesn't exist
      // In a real scenario, you'd have an API that returns these counts
      const [dlRes, transferRes, nocRes, renewalRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/driving-licence`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/vehicle-transfer`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/noc`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/registration-renewal`, { withCredentials: true })
      ])

      setStats({
        dl: dlRes.data.data?.length || 0,
        transfer: transferRes.data.data?.length || 0,
        noc: nocRes.data.data?.length || 0,
        renewal: renewalRes.data.data?.length || 0
      })
    } catch (error) {
      console.error('Error fetching Sarthi stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Driving License', count: stats.dl, path: '/driving', icon: '🪪', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { title: 'Vehicle Transfer', count: stats.transfer, path: '/vehicle-transfer', icon: '🔀', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { title: 'NOC Issued', count: stats.noc, path: '/noc', icon: '📄', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { title: 'RC renewals', count: stats.renewal, path: '/registration-renewal', icon: '🔄', color: 'bg-violet-50 border-violet-200 text-violet-700' }
  ]

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Sarthi Overview</h1>
          <p className='text-gray-500'>Summary of your RTO Sarthi applications</p>
        </div>
        <button 
          onClick={fetchStats}
          className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
        >
          Refresh Data
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((card) => (
          <Link 
            key={card.title} 
            to={card.path}
            className={`p-6 rounded-2xl border-2 transition transform hover:scale-105 ${card.color}`}
          >
            <div className='flex justify-between items-start'>
              <div>
                <span className='text-4xl mb-4 block'>{card.icon}</span>
                <h3 className='text-lg font-bold'>{card.title}</h3>
                <p className='text-2xl font-black mt-2'>{loading ? '...' : card.count}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className='mt-12'>
        <h2 className='text-xl font-bold text-gray-800 mb-6'>Quick Shortcuts</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold'>DL</div>
                    <div>
                        <p className='font-bold text-gray-800'>DL List</p>
                        <p className='text-sm text-gray-500'>View and manage all license applications</p>
                    </div>
                </div>
                <Link to='/driving' className='text-blue-600 hover:underline font-semibold'>View All →</Link>
            </div>
            <div className='p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold'>VT</div>
                    <div>
                        <p className='font-bold text-gray-800'>Transfer List</p>
                        <p className='text-sm text-gray-500'>View and manage all vehicle transfers</p>
                    </div>
                </div>
                <Link to='/vehicle-transfer' className='text-orange-600 hover:underline font-semibold'>View All →</Link>
            </div>
        </div>
      </div>
    </div>
  )
}

export default SarthiDashboard
