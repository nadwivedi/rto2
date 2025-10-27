import { useState, useMemo } from 'react'

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('30days')

  const timeFilters = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ]

  // Data for different time periods
  const statsData = {
    '7days': {
      drivingLicences: { total: 234, growth: 8 },
      learnersLicences: { total: 112, growth: 12 },
      vehicleRegistrations: { total: 198, growth: 15 },
      revenue: { total: 2.8, growth: 18 },
      registrationTrend: [
        { day: 'Mon', count: 25 },
        { day: 'Tue', count: 32 },
        { day: 'Wed', count: 28 },
        { day: 'Thu', count: 35 },
        { day: 'Fri', count: 30 },
        { day: 'Sat', count: 26 },
        { day: 'Sun', count: 22 }
      ],
      totalRegistrations: 198,
      statusDistribution: {
        approved: 145,
        pending: 32,
        inReview: 42,
        rejected: 15
      }
    },
    '30days': {
      drivingLicences: { total: 1234, growth: 15 },
      learnersLicences: { total: 567, growth: 22 },
      vehicleRegistrations: { total: 891, growth: 18 },
      revenue: { total: 8.5, growth: 28 },
      registrationTrend: [
        { day: 'Day 1', count: 45 },
        { day: 'Day 5', count: 62 },
        { day: 'Day 10', count: 78 },
        { day: 'Day 15', count: 91 },
        { day: 'Day 20', count: 85 },
        { day: 'Day 25', count: 95 },
        { day: 'Day 30', count: 112 }
      ],
      totalRegistrations: 568,
      statusDistribution: {
        approved: 389,
        pending: 78,
        inReview: 95,
        rejected: 28
      }
    },
    '90days': {
      drivingLicences: { total: 3456, growth: 24 },
      learnersLicences: { total: 1678, growth: 31 },
      vehicleRegistrations: { total: 2567, growth: 27 },
      revenue: { total: 24.5, growth: 35 },
      registrationTrend: [
        { day: 'Week 1', count: 145 },
        { day: 'Week 3', count: 178 },
        { day: 'Week 5', count: 198 },
        { day: 'Week 7', count: 215 },
        { day: 'Week 9', count: 234 },
        { day: 'Week 11', count: 256 },
        { day: 'Week 13', count: 289 }
      ],
      totalRegistrations: 1515,
      statusDistribution: {
        approved: 1045,
        pending: 198,
        inReview: 245,
        rejected: 78
      }
    },
    all: {
      drivingLicences: { total: 18547, growth: 42 },
      learnersLicences: { total: 8923, growth: 38 },
      vehicleRegistrations: { total: 15678, growth: 45 },
      revenue: { total: 145.8, growth: 52 },
      registrationTrend: [
        { day: 'Jan', count: 456 },
        { day: 'Mar', count: 567 },
        { day: 'May', count: 645 },
        { day: 'Jul', count: 723 },
        { day: 'Sep', count: 789 },
        { day: 'Nov', count: 845 },
        { day: 'Dec', count: 912 }
      ],
      totalRegistrations: 4937,
      statusDistribution: {
        approved: 3456,
        pending: 567,
        inReview: 789,
        rejected: 234
      }
    }
  }

  const currentData = useMemo(() => statsData[timeFilter], [timeFilter])
  const maxRegistrations = useMemo(() =>
    Math.max(...currentData.registrationTrend.map(d => d.count)),
    [currentData]
  )

  const getPeriodLabel = () => {
    switch(timeFilter) {
      case '7days': return '7'
      case '30days': return '30'
      case '90days': return '90'
      case 'all': return 'all'
      default: return '30'
    }
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 pt-20 lg:pt-20 max-w-[1800px] mx-auto'>
      {/* Header with Time Filter */}
      <div className='mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3'>
        <div>
          <h1 className='text-2xl font-black text-gray-800 mb-1'>Dashboard</h1>
          <p className='text-sm text-gray-600'>RTO Management System Overview</p>
        </div>

        {/* Time Filter */}
        <div className='flex gap-1.5 bg-white rounded-lg p-1 shadow-md border border-gray-200'>
          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                timeFilter === filter.value
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-2xl group-hover:scale-110 transition-transform'>🪪</div>
            <div className='bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold'>+{currentData.drivingLicences.growth}%</div>
          </div>
          <div className='text-2xl font-black mb-0.5'>{currentData.drivingLicences.total.toLocaleString()}</div>
          <div className='text-blue-50 text-xs font-medium'>Driving Licences</div>
        </div>

        <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-2xl group-hover:scale-110 transition-transform'>📝</div>
            <div className='bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold'>+{currentData.learnersLicences.growth}%</div>
          </div>
          <div className='text-2xl font-black mb-0.5'>{currentData.learnersLicences.total.toLocaleString()}</div>
          <div className='text-purple-50 text-xs font-medium'>Learner's Licences</div>
        </div>

        <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-2xl group-hover:scale-110 transition-transform'>🚗</div>
            <div className='bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold'>+{currentData.vehicleRegistrations.growth}%</div>
          </div>
          <div className='text-2xl font-black mb-0.5'>{currentData.vehicleRegistrations.total.toLocaleString()}</div>
          <div className='text-green-50 text-xs font-medium'>Vehicle Registrations</div>
        </div>

        <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-2xl group-hover:scale-110 transition-transform'>💰</div>
            <div className='bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold'>+{currentData.revenue.growth}%</div>
          </div>
          <div className='text-2xl font-black mb-0.5'>₹{currentData.revenue.total}L</div>
          <div className='text-orange-50 text-xs font-medium'>Total Revenue</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
