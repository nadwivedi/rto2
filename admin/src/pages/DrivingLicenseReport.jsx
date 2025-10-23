import { useState, useEffect } from 'react'
import { drivingLicenseAPI } from '../services/api'
import MobileHeader from '../components/MobileHeader'

const DrivingLicenseReport = ({ setIsSidebarOpen }) => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await drivingLicenseAPI.getExpiryReport()
      if (response.success) {
        setReportData(response.data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Get days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get licenses based on selected category
  const getFilteredLicenses = () => {
    if (!reportData) return []

    let licenses = []
    switch (selectedCategory) {
      case 'expired':
        licenses = reportData.licenses.expired
        break
      case '30days':
        licenses = reportData.licenses.expiringIn30Days
        break
      case '60days':
        licenses = reportData.licenses.expiringIn60Days
        break
      case '90days':
        licenses = reportData.licenses.expiringIn90Days
        break
      case 'valid':
        licenses = reportData.licenses.valid
        break
      default:
        licenses = [
          ...reportData.licenses.expired,
          ...reportData.licenses.expiringIn30Days,
          ...reportData.licenses.expiringIn60Days,
          ...reportData.licenses.expiringIn90Days,
          ...reportData.licenses.valid
        ]
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      licenses = licenses.filter(license =>
        license.name?.toLowerCase().includes(query) ||
        license.LicenseNumber?.toLowerCase().includes(query) ||
        license.mobileNumber?.includes(query)
      )
    }

    return licenses
  }

  const filteredLicenses = getFilteredLicenses()

  if (loading) {
    return (
      <>
        <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
        <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4'></div>
            <p className='text-gray-600 font-semibold'>Loading report...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-2xl md:text-3xl font-black text-gray-800 mb-2'>
              Driving License Expiry Report
            </h1>
            <p className='text-gray-600'>Track and monitor license expiry dates</p>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6'>
            {/* Total */}
            <div className='bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer'
              onClick={() => setSelectedCategory('all')}>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-black text-gray-800'>{reportData?.summary.total || 0}</h3>
              <p className='text-xs font-semibold text-gray-500'>Total Licenses</p>
            </div>

            {/* Expired */}
            <div className='bg-white rounded-xl shadow-md border border-red-200 p-4 hover:shadow-lg transition-all cursor-pointer'
              onClick={() => setSelectedCategory('expired')}>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-black text-red-600'>{reportData?.summary.expired || 0}</h3>
              <p className='text-xs font-semibold text-gray-500'>Expired</p>
            </div>

            {/* 30 Days */}
            <div className='bg-white rounded-xl shadow-md border border-orange-200 p-4 hover:shadow-lg transition-all cursor-pointer'
              onClick={() => setSelectedCategory('30days')}>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-black text-orange-600'>{reportData?.summary.expiringIn30Days || 0}</h3>
              <p className='text-xs font-semibold text-gray-500'>30 Days</p>
            </div>

            {/* 60 Days */}
            <div className='bg-white rounded-xl shadow-md border border-yellow-200 p-4 hover:shadow-lg transition-all cursor-pointer'
              onClick={() => setSelectedCategory('60days')}>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-black text-yellow-600'>{reportData?.summary.expiringIn60Days || 0}</h3>
              <p className='text-xs font-semibold text-gray-500'>60 Days</p>
            </div>

            {/* 90 Days */}
            <div className='bg-white rounded-xl shadow-md border border-blue-200 p-4 hover:shadow-lg transition-all cursor-pointer'
              onClick={() => setSelectedCategory('90days')}>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-black text-blue-600'>{reportData?.summary.expiringIn90Days || 0}</h3>
              <p className='text-xs font-semibold text-gray-500'>90 Days</p>
            </div>

            {/* Valid */}
            <div className='bg-white rounded-xl shadow-md border border-green-200 p-4 hover:shadow-lg transition-all cursor-pointer'
              onClick={() => setSelectedCategory('valid')}>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                  <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <h3 className='text-2xl font-black text-green-600'>{reportData?.summary.valid || 0}</h3>
              <p className='text-xs font-semibold text-gray-500'>Valid</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
              <div className='flex flex-col md:flex-row gap-3 items-stretch md:items-center'>
                <div className='relative flex-1'>
                  <input
                    type='text'
                    placeholder='Search by name, license number, or mobile...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-11 pr-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm'
                  />
                  <svg className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                </div>
                <button
                  onClick={fetchReport}
                  className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl'
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
                  <tr>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Name</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Number</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Class</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Issue Date</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Expiry Date</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Days Until Expiry</th>
                    <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredLicenses.length > 0 ? (
                    filteredLicenses.map((license, index) => {
                      const daysUntilExpiry = getDaysUntilExpiry(license.LicenseExpiryDate)
                      let statusColor = 'bg-green-100 text-green-700 border-green-300'
                      let statusText = 'Valid'

                      if (daysUntilExpiry < 0) {
                        statusColor = 'bg-red-100 text-red-700 border-red-300'
                        statusText = 'Expired'
                      } else if (daysUntilExpiry <= 30) {
                        statusColor = 'bg-orange-100 text-orange-700 border-orange-300'
                        statusText = 'Critical'
                      } else if (daysUntilExpiry <= 60) {
                        statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        statusText = 'Warning'
                      } else if (daysUntilExpiry <= 90) {
                        statusColor = 'bg-blue-100 text-blue-700 border-blue-300'
                        statusText = 'Attention'
                      }

                      return (
                        <tr key={index} className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all'>
                          <td className='px-4 py-4'>
                            <div className='text-sm font-bold text-gray-900'>{license.name || 'N/A'}</div>
                            <div className='text-xs text-gray-500'>{license.mobileNumber || 'N/A'}</div>
                          </td>
                          <td className='px-4 py-4'>
                            <span className='text-sm font-mono font-semibold text-gray-800'>{license.LicenseNumber || 'N/A'}</span>
                          </td>
                          <td className='px-4 py-4'>
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200'>
                              {license.licenseClass || 'N/A'}
                            </span>
                          </td>
                          <td className='px-4 py-4'>
                            <span className='text-sm text-green-600 font-semibold'>{formatDate(license.LicenseIssueDate)}</span>
                          </td>
                          <td className='px-4 py-4'>
                            <span className='text-sm text-red-600 font-semibold'>{formatDate(license.LicenseExpiryDate)}</span>
                          </td>
                          <td className='px-4 py-4'>
                            <span className={`text-sm font-bold ${daysUntilExpiry < 0 ? 'text-red-600' : daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-gray-700'}`}>
                              {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` : `${daysUntilExpiry} days`}
                            </span>
                          </td>
                          <td className='px-4 py-4'>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan='7' className='px-6 py-16 text-center'>
                        <div className='text-gray-400'>
                          <svg className='mx-auto h-12 w-12 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                          </svg>
                          <p className='text-sm font-semibold text-gray-600'>No licenses found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DrivingLicenseReport
