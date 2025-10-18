const Reports = () => {
  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>Reports & Analytics</h1>
        <p className='text-gray-600'>View comprehensive reports and analytics</p>
      </div>

      {/* Report Categories */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <div className='text-4xl mb-4'>📊</div>
          <h3 className='text-xl font-bold mb-2'>License Reports</h3>
          <p className='text-blue-100 text-sm mb-4'>DL and LL statistics</p>
          <button className='bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition'>
            View Report
          </button>
        </div>

        <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <div className='text-4xl mb-4'>🚗</div>
          <h3 className='text-xl font-bold mb-2'>Vehicle Reports</h3>
          <p className='text-green-100 text-sm mb-4'>Registration statistics</p>
          <button className='bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition'>
            View Report
          </button>
        </div>

        <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <div className='text-4xl mb-4'>📋</div>
          <h3 className='text-xl font-bold mb-2'>Permit Reports</h3>
          <p className='text-purple-100 text-sm mb-4'>Active permit statistics</p>
          <button className='bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition'>
            View Report
          </button>
        </div>

        <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <div className='text-4xl mb-4'>💰</div>
          <h3 className='text-xl font-bold mb-2'>Revenue Reports</h3>
          <p className='text-orange-100 text-sm mb-4'>Fee collection statistics</p>
          <button className='bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition'>
            View Report
          </button>
        </div>

        <div className='bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <div className='text-4xl mb-4'>📄</div>
          <h3 className='text-xl font-bold mb-2'>NOC Reports</h3>
          <p className='text-pink-100 text-sm mb-4'>NOC issuance statistics</p>
          <button className='bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-50 transition'>
            View Report
          </button>
        </div>

        <div className='bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <div className='text-4xl mb-4'>🔄</div>
          <h3 className='text-xl font-bold mb-2'>Renewal Reports</h3>
          <p className='text-indigo-100 text-sm mb-4'>License renewal statistics</p>
          <button className='bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition'>
            View Report
          </button>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
          <h3 className='text-xl font-bold text-gray-800 mb-6'>Monthly Overview</h3>
          <div className='space-y-4'>
            {[
              { month: 'January 2024', applications: 1234, revenue: '₹12.5L', color: 'blue' },
              { month: 'February 2024', applications: 1456, revenue: '₹14.2L', color: 'green' },
              { month: 'March 2024', applications: 1567, revenue: '₹15.8L', color: 'purple' },
              { month: 'April 2024', applications: 1389, revenue: '₹13.9L', color: 'orange' },
              { month: 'May 2024', applications: 1678, revenue: '₹16.7L', color: 'pink' }
            ].map((data, idx) => (
              <div key={idx} className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition'>
                <div>
                  <div className='font-semibold text-gray-800'>{data.month}</div>
                  <div className='text-sm text-gray-600'>{data.applications} applications</div>
                </div>
                <div className='text-right'>
                  <div className={`text-lg font-bold text-${data.color}-600`}>{data.revenue}</div>
                  <div className='text-xs text-gray-500'>Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
          <h3 className='text-xl font-bold text-gray-800 mb-6'>Top Services</h3>
          <div className='space-y-4'>
            {[
              { service: 'Vehicle Registration', count: 3456, percentage: 35 },
              { service: 'Driving Licence', count: 1847, percentage: 25 },
              { service: 'Learner\'s Licence', count: 892, percentage: 15 },
              { service: 'License Renewal', count: 789, percentage: 12 },
              { service: 'Permits', count: 567, percentage: 8 }
            ].map((service, idx) => (
              <div key={idx}>
                <div className='flex justify-between mb-2'>
                  <span className='text-sm font-semibold text-gray-700'>{service.service}</span>
                  <span className='text-sm font-bold text-gray-800'>{service.count}</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600'
                    style={{ width: `${service.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
        <h3 className='text-xl font-bold text-gray-800 mb-4'>Export Reports</h3>
        <div className='flex flex-wrap gap-4'>
          <button className='px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            📊 Export to Excel
          </button>
          <button className='px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            📄 Export to PDF
          </button>
          <button className='px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
            📝 Export to CSV
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reports
