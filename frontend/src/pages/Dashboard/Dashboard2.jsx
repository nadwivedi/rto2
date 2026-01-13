import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import DashboardModuleSection from './components/DashboardModuleSection'
import DashboardSlider from './components/DashboardSlider'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Dashboard2 = () => {
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
        {/* Module Sections */}
        <div className='mt-16 grid grid-cols-2 gap-2 lg:gap-4'>
          <div className='col-span-2'>
            <DashboardSlider
              records={expiringRecords.fitness}
              title='Fitness'
              icon='✅'
              color='red'
              emptyMessage='No fitness certificates expiring in the next 30 days'
            />
          </div>

          <div className='col-span-2'>
            <DashboardSlider
              records={expiringRecords.tax}
              title='Tax'
              icon='💰'
              color='yellow'
              emptyMessage='No tax certificates expiring in the next 15 days'
            />
          </div>

          <div className='col-span-2'>
            <DashboardSlider
              records={expiringRecords.puc}
              title='PUC'
              icon='💨'
              color='teal'
              emptyMessage='No PUC certificates expiring in the next 30 days'
            />
          </div>

          <div className='col-span-2'>
            <DashboardSlider
              records={expiringRecords.gps}
              title='GPS'
              icon='📍'
              color='purple'
              emptyMessage='No GPS devices expiring in the next 30 days'
            />
          </div>

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

export default Dashboard2
