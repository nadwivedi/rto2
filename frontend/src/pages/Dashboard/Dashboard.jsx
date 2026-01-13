import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import StatisticsCard from '../../components/StatisticsCard'
import DashboardModuleSection from './components/DashboardModuleSection'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [statistics, setStatistics] = useState({
    fitness: { total: 0, expiringSoon: 0 },
    tax: { total: 0, expiring: 0 },
    puc: { total: 0, expiringSoon: 0 },
    gps: { total: 0, expiringSoon: 0 },
    busPermit: { total: 0, expiringSoon: 0 },
    nationalPermit: { total: 0, partAExpiringSoon: 0, partBExpiringSoon: 0 },
    cgPermit: { total: 0, expiringSoon: 0 },
    insurance: { total: 0, expiringSoon: 0 }
  })

  const [expiringRecords, setExpiringRecords] = useState({
    fitness: [],
    tax: [],
    puc: [],
    gps: [],
    busPermit: [],
    nationalPermit: [],
    cgPermit: [],
    insurance: []
  })

  const fetchAllData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard`, { withCredentials: true });
      const data = response.data.data;

      setStatistics(data.statistics || {
        fitness: { total: 0, expiringSoon: 0 },
        tax: { total: 0, expiring: 0 },
        puc: { total: 0, expiringSoon: 0 },
        gps: { total: 0, expiringSoon: 0 },
        busPermit: { total: 0, expiringSoon: 0 },
        nationalPermit: { total: 0, partAExpiringSoon: 0, partBExpiringSoon: 0 },
        cgPermit: { total: 0, expiringSoon: 0 },
        insurance: { total: 0, expiringSoon: 0 }
      });

      setExpiringRecords(data.expiringRecords || {
        fitness: [],
        tax: [],
        puc: [],
        gps: [],
        busPermit: [],
        nationalPermit: [],
        cgPermit: [],
        insurance: []
      });

      if (isRefresh) {
        toast.success('Dashboard refreshed successfully!');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData()
  }, [])

  const totalExpiring = useMemo(() => {
    return (
      (statistics.fitness.expiringSoon || 0) +
      (statistics.tax.expiring || 0) +
      (statistics.puc.expiringSoon || 0) +
      (statistics.gps.expiringSoon || 0) +
      (statistics.busPermit.expiringSoon || 0) +
      (statistics.nationalPermit.partAExpiringSoon || 0) +
      (statistics.nationalPermit.partBExpiringSoon || 0) +
      (statistics.cgPermit.expiringSoon || 0) +
      (statistics.insurance.expiringSoon || 0)
    )
  }, [statistics])

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 lg:p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-12 bg-gray-300 rounded w-1/3 mb-8'></div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8'>
              {[...Array(8)].map((_, i) => (
                <div key={i} className='bg-gray-200 h-24 rounded-lg'></div>
              ))}
            </div>
            <div className='space-y-6'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='bg-gray-200 h-64 rounded-2xl'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-2 lg:p-8'>
      <div className='mx-auto'>
      

        {/* Statistics Cards */}
        <div className='mt-16 lg:mt-14 grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-3 mb-4 lg:mb-8'>
          <StatisticsCard
            title='Fitness'
            value={statistics.fitness.expiringSoon || 0}
            color='red'
            onClick={() => navigate('/fitness')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            }
          />
          <StatisticsCard
            title='Tax'
            value={statistics.tax.expiring || 0}
            color='yellow'
            onClick={() => navigate('/tax')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            }
          />
          <StatisticsCard
            title='NP'
            value={(statistics.nationalPermit.partAExpiringSoon || 0) + (statistics.nationalPermit.partBExpiringSoon || 0)}
            color='indigo'
            onClick={() => navigate('/national-permit')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            }
          />
          <StatisticsCard
            title='PUC'
            value={statistics.puc.expiringSoon || 0}
            color='teal'
            onClick={() => navigate('/puc')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' />
              </svg>
            }
          />
          <StatisticsCard
            title='GPS'
            value={statistics.gps.expiringSoon || 0}
            color='purple'
            onClick={() => navigate('/gps')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            }
          />
          <StatisticsCard
            title='Bus Permit'
            value={statistics.busPermit.expiringSoon || 0}
            color='orange'
            onClick={() => navigate('/bus-permit')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
              </svg>
            }
          />
          <StatisticsCard
            title='CG Permit'
            value={statistics.cgPermit.expiringSoon || 0}
            color='blue'
            onClick={() => navigate('/cg-permit')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.345.962-4.854.962-7.425 0-6.075-2.91-11.238-7.5-11.238S1 4.925 1 11c0 2.571.317 5.08.962 7.425m16.076 1.132a11.956 11.956 0 01-2.118 2.956' />
              </svg>
            }
          />
          <StatisticsCard
            title='Insurance'
            value={statistics.insurance.expiringSoon || 0}
            color='amber'
            onClick={() => navigate('/insurance')}
            subtext='Expiring soon'
            icon={
              <svg className='w-4 h-4 lg:w-5 lg:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
              </svg>
            }
          />
        </div>

        {/* Module Sections */}
        <div className='grid grid-cols-2 gap-2 lg:gap-4'>
          <DashboardModuleSection
            title='Fitness'
            icon='✅'
            color='red'
            records={expiringRecords.fitness}
            viewAllLink='/fitness'
            emptyMessage='No fitness certificates expiring in the next 30 days'
          />

          <DashboardModuleSection
            title='Tax'
            icon='💰'
            color='yellow'
            records={expiringRecords.tax}
            viewAllLink='/tax'
            emptyMessage='No tax certificates expiring in the next 15 days'
          />

          <DashboardModuleSection
            title='PUC'
            icon='💨'
            color='teal'
            records={expiringRecords.puc}
            viewAllLink='/puc'
            emptyMessage='No PUC certificates expiring in the next 30 days'
          />

          <DashboardModuleSection
            title='GPS'
            icon='📍'
            color='purple'
            records={expiringRecords.gps}
            viewAllLink='/gps'
            emptyMessage='No GPS devices expiring in the next 30 days'
          />

          <DashboardModuleSection
            title='NP'
            icon='🗺️'
            color='indigo'
            records={expiringRecords.nationalPermit}
            viewAllLink='/national-permit'
            emptyMessage='No national permits expiring in the next 30 days'
          />

          <DashboardModuleSection
            title='Bus Permit'
            icon='🚌'
            color='orange'
            records={expiringRecords.busPermit}
            viewAllLink='/bus-permit'
            emptyMessage='No bus permits expiring in the next 30 days'
          />
          
          <DashboardModuleSection
            title='CG Permit'
            icon='📜'
            color='blue'
            records={expiringRecords.cgPermit}
            viewAllLink='/cg-permit'
            emptyMessage='No CG permits expiring in the next 30 days'
          />

          <DashboardModuleSection
            title='Insurance'
            icon='🛡️'
            color='amber'
            records={expiringRecords.insurance}
            viewAllLink='/insurance'
            emptyMessage='No insurance expiring in the next 30 days'
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
