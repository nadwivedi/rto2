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
    <div className='p-4'>
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

      {/* Registration Trend Chart & Performance Metrics */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5'>
        {/* Registration Trend */}
        <div className='lg:col-span-2 bg-white rounded-xl p-4 shadow-lg border border-gray-200'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h3 className='text-base font-bold text-gray-800'>
                Registration Trend ({timeFilter === '7days' ? 'Last 7 Days' : timeFilter === '30days' ? 'Last 30 Days' : timeFilter === '90days' ? 'Last 90 Days' : 'All Time'})
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>
                {timeFilter === 'all' ? 'Monthly' : 'Daily'} registration statistics
              </p>
            </div>
            <div className='text-right'>
              <div className='text-xl font-black text-indigo-600'>{currentData.totalRegistrations.toLocaleString()}</div>
              <div className='text-[10px] text-gray-500'>Total Registrations</div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className='flex items-end justify-between gap-2 h-48'>
            {currentData.registrationTrend.map((data, idx) => (
              <div key={idx} className='flex-1 flex flex-col items-center gap-2'>
                <div className='w-full flex items-end justify-center h-full'>
                  <div
                    className='w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg hover:from-indigo-500 hover:to-purple-400 transition-all cursor-pointer relative group'
                    style={{ height: `${(data.count / maxRegistrations) * 100}%` }}
                  >
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                      {data.count} registrations
                    </div>
                  </div>
                </div>
                <div className='text-xs text-gray-500 font-medium'>{data.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className='bg-white rounded-xl p-4 shadow-lg border border-gray-200'>
          <h3 className='text-base font-bold text-gray-800 mb-4'>Performance Metrics</h3>

          <div className='space-y-4'>
            {/* Approval Rate */}
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <span className='text-xs font-semibold text-gray-700'>Approval Rate</span>
                <span className='text-sm font-bold text-green-600'>
                  {((currentData.statusDistribution.approved / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600'
                  style={{ width: `${((currentData.statusDistribution.approved / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%` }}
                ></div>
              </div>
              <p className='text-[10px] text-gray-500 mt-0.5'>↑ 2.3% from last period</p>
            </div>

            {/* Processing Time */}
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <span className='text-xs font-semibold text-gray-700'>Avg. Processing</span>
                <span className='text-sm font-bold text-blue-600'>
                  {timeFilter === '7days' ? '1.8' : timeFilter === '30days' ? '2.4' : timeFilter === '90days' ? '2.8' : '3.2'} days
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600' style={{ width: '85%' }}></div>
              </div>
              <p className='text-[10px] text-gray-500 mt-0.5'>↓ 0.5 days faster</p>
            </div>

            {/* Pending Applications */}
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <span className='text-xs font-semibold text-gray-700'>Pending Queue</span>
                <span className='text-sm font-bold text-orange-600'>{currentData.statusDistribution.pending}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600'
                  style={{ width: `${(currentData.statusDistribution.pending / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100}%` }}
                ></div>
              </div>
              <p className='text-[10px] text-gray-500 mt-0.5'>Within normal range</p>
            </div>

            {/* Customer Satisfaction */}
            <div>
              <div className='flex justify-between items-center mb-1.5'>
                <span className='text-xs font-semibold text-gray-700'>Satisfaction Score</span>
                <span className='text-sm font-bold text-purple-600'>
                  {timeFilter === '7days' ? '4.9' : timeFilter === '30days' ? '4.8' : timeFilter === '90days' ? '4.7' : '4.6'}/5
                </span>
              </div>
              <div className='flex gap-0.5'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className='text-yellow-400 text-base'>★</div>
                ))}
              </div>
              <p className='text-[10px] text-gray-500 mt-0.5'>
                Based on {timeFilter === '7days' ? '145' : timeFilter === '30days' ? '1,245' : timeFilter === '90days' ? '3,567' : '12,456'} reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Status Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5'>
        {/* Quick Actions */}
        <div className='bg-white rounded-xl p-4 shadow-lg border border-gray-200'>
          <h3 className='text-base font-bold text-gray-800 mb-3'>Quick Actions</h3>
          <div className='space-y-2'>
            <button className='w-full flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition border border-blue-200'>
              <div className='text-xl'>➕</div>
              <div className='text-left flex-1'>
                <div className='font-semibold text-gray-800 text-xs'>New DL Application</div>
                <div className='text-[10px] text-gray-500'>Create driving licence</div>
              </div>
            </button>

            <button className='w-full flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition border border-purple-200'>
              <div className='text-xl'>📋</div>
              <div className='text-left flex-1'>
                <div className='font-semibold text-gray-800 text-xs'>Process Applications</div>
                <div className='text-[10px] text-gray-500'>{currentData.statusDistribution.pending} pending review</div>
              </div>
            </button>

            <button className='w-full flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-lg transition border border-green-200'>
              <div className='text-xl'>🚗</div>
              <div className='text-left flex-1'>
                <div className='font-semibold text-gray-800 text-xs'>Register Vehicle</div>
                <div className='text-[10px] text-gray-500'>Quick registration</div>
              </div>
            </button>

            <button className='w-full flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition border border-orange-200'>
              <div className='text-xl'>📊</div>
              <div className='text-left flex-1'>
                <div className='font-semibold text-gray-800 text-xs'>Generate Report</div>
                <div className='text-[10px] text-gray-500'>Export analytics</div>
              </div>
            </button>
          </div>
        </div>

        {/* Application Status Distribution */}
        <div className='lg:col-span-2 bg-white rounded-xl p-4 shadow-lg border border-gray-200'>
          <h3 className='text-base font-bold text-gray-800 mb-4'>Application Status Distribution</h3>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
            <div className='text-center p-3 bg-green-50 rounded-lg border border-green-200'>
              <div className='text-xl font-black text-green-600'>{currentData.statusDistribution.approved.toLocaleString()}</div>
              <div className='text-xs text-gray-600 font-medium mt-0.5'>Approved</div>
              <div className='text-[10px] text-green-600 mt-0.5'>
                {((currentData.statusDistribution.approved / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%
              </div>
            </div>

            <div className='text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
              <div className='text-xl font-black text-yellow-600'>{currentData.statusDistribution.pending.toLocaleString()}</div>
              <div className='text-xs text-gray-600 font-medium mt-0.5'>Pending</div>
              <div className='text-[10px] text-yellow-600 mt-0.5'>
                {((currentData.statusDistribution.pending / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%
              </div>
            </div>

            <div className='text-center p-3 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='text-xl font-black text-blue-600'>{currentData.statusDistribution.inReview.toLocaleString()}</div>
              <div className='text-xs text-gray-600 font-medium mt-0.5'>In Review</div>
              <div className='text-[10px] text-blue-600 mt-0.5'>
                {((currentData.statusDistribution.inReview / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%
              </div>
            </div>

            <div className='text-center p-3 bg-red-50 rounded-lg border border-red-200'>
              <div className='text-xl font-black text-red-600'>{currentData.statusDistribution.rejected.toLocaleString()}</div>
              <div className='text-xs text-gray-600 font-medium mt-0.5'>Rejected</div>
              <div className='text-[10px] text-red-600 mt-0.5'>
                {((currentData.statusDistribution.rejected / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Status Bars */}
          <div className='space-y-3'>
            <div>
              <div className='flex justify-between text-sm mb-1'>
                <span className='font-medium text-gray-700'>Overall Completion</span>
                <span className='font-bold text-gray-800'>
                  {((currentData.statusDistribution.approved / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500'
                  style={{ width: `${((currentData.statusDistribution.approved / (currentData.statusDistribution.approved + currentData.statusDistribution.pending + currentData.statusDistribution.inReview + currentData.statusDistribution.rejected)) * 100).toFixed(1)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications & Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5'>
        <div className='bg-white rounded-xl p-4 shadow-lg border border-gray-200'>
          <h3 className='text-base font-bold text-gray-800 mb-3'>Recent Applications</h3>
          <div className='space-y-2'>
            {[
              { type: 'Driving Licence', name: 'Rajesh Kumar', id: 'DL-2024-001', status: 'Approved', color: 'green', time: '2 min ago' },
              { type: "Learner's Licence", name: 'Priya Sharma', id: 'LL-2024-045', status: 'Pending', color: 'yellow', time: '5 min ago' },
              { type: 'Vehicle Registration', name: 'Amit Patel', id: 'VR-2024-123', status: 'Approved', color: 'green', time: '12 min ago' },
              { type: 'Permit', name: 'Suresh Gupta', id: 'PT-2024-078', status: 'In Review', color: 'blue', time: '18 min ago' },
              { type: 'License Renewal', name: 'Neha Singh', id: 'RN-2024-034', status: 'Approved', color: 'green', time: '25 min ago' }
            ].map((item, idx) => (
              <div key={idx} className='flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer'>
                <div className='flex items-center gap-2.5'>
                  <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px]'>
                    {item.id.split('-')[0]}
                  </div>
                  <div>
                    <div className='font-semibold text-gray-800 text-xs'>{item.name}</div>
                    <div className='text-[10px] text-gray-500'>{item.type} - {item.id}</div>
                  </div>
                </div>
                <div className='text-right'>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold block mb-0.5 ${
                    item.color === 'green' ? 'bg-green-100 text-green-700' :
                    item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    item.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className='text-[10px] text-gray-400'>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-xl p-4 shadow-lg border border-gray-200'>
          <h3 className='text-base font-bold text-gray-800 mb-3'>Recent Activity</h3>
          <div className='space-y-2.5'>
            {[
              { icon: '🪪', text: 'Driving Licence approved for Arun Sharma', time: '5 min ago', color: 'blue' },
              { icon: '📝', text: "New Learner's Licence application submitted", time: '15 min ago', color: 'purple' },
              { icon: '🚗', text: 'Vehicle registered: MH-12-AB-1234', time: '30 min ago', color: 'green' },
              { icon: '🔄', text: 'License renewal completed for ID: DL-2019-456', time: '1 hour ago', color: 'orange' },
              { icon: '📄', text: 'NOC issued for vehicle transfer', time: '2 hours ago', color: 'indigo' }
            ].map((activity, idx) => (
              <div key={idx} className='flex items-start gap-2.5 p-2.5 hover:bg-gray-50 rounded-lg transition cursor-pointer'>
                <div className={`w-8 h-8 bg-${activity.color}-100 rounded-lg flex items-center justify-center text-base flex-shrink-0`}>
                  {activity.icon}
                </div>
                <div className='flex-1'>
                  <div className='text-gray-800 font-medium text-xs'>{activity.text}</div>
                  <div className='text-[10px] text-gray-500 mt-0.5'>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className='bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white'>
        <h3 className='text-2xl font-bold mb-6'>
          Revenue Overview ({timeFilter === '7days' ? 'Last 7 Days' : timeFilter === '30days' ? 'Last 30 Days' : timeFilter === '90days' ? 'Last 90 Days' : 'All Time'})
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-sm text-indigo-100 mb-2'>Driving Licences</div>
            <div className='text-2xl font-black'>
              ₹{timeFilter === '7days' ? '0.35' : timeFilter === '30days' ? '2.34' : timeFilter === '90days' ? '6.89' : '45.6'}L
            </div>
            <div className='text-xs text-indigo-200 mt-2'>{currentData.drivingLicences.total.toLocaleString()} transactions</div>
          </div>

          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-sm text-purple-100 mb-2'>Vehicle Registration</div>
            <div className='text-2xl font-black'>
              ₹{timeFilter === '7days' ? '0.89' : timeFilter === '30days' ? '4.68' : timeFilter === '90days' ? '12.5' : '78.2'}L
            </div>
            <div className='text-xs text-purple-200 mt-2'>{currentData.vehicleRegistrations.total.toLocaleString()} transactions</div>
          </div>

          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-sm text-indigo-100 mb-2'>Permits & NOC</div>
            <div className='text-2xl font-black'>
              ₹{timeFilter === '7days' ? '0.12' : timeFilter === '30days' ? '0.89' : timeFilter === '90days' ? '2.45' : '12.8'}L
            </div>
            <div className='text-xs text-indigo-200 mt-2'>
              {timeFilter === '7days' ? '24' : timeFilter === '30days' ? '178' : timeFilter === '90days' ? '490' : '2,560'} transactions
            </div>
          </div>

          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='text-sm text-purple-100 mb-2'>Renewals</div>
            <div className='text-2xl font-black'>
              ₹{timeFilter === '7days' ? '0.15' : timeFilter === '30days' ? '0.78' : timeFilter === '90days' ? '2.12' : '9.2'}L
            </div>
            <div className='text-xs text-purple-200 mt-2'>
              {timeFilter === '7days' ? '30' : timeFilter === '30days' ? '156' : timeFilter === '90days' ? '424' : '1,840'} transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
