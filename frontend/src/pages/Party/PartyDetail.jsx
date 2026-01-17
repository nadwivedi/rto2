import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getTheme } from '../../context/ThemeContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const PartyDetail = () => {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const theme = getTheme()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchPartyData()
  }, [partyId])

  const fetchPartyData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/parties/${partyId}/all-work`, {
        withCredentials: true
      })
      if (response.data.success) {
        setData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching party data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get all pending payments (balance > 0)
  const getPendingPayments = () => {
    if (!data?.work) return []
    const pending = []

    // Tax
    data.work.tax?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'Tax', typeColor: 'blue' })
      }
    })

    // Fitness
    data.work.fitness?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'Fitness', typeColor: 'green' })
      }
    })

    // Insurance
    data.work.insurance?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'Insurance', typeColor: 'purple' })
      }
    })

    // PUC
    data.work.puc?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'PUC', typeColor: 'orange' })
      }
    })

    // GPS
    data.work.gps?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'GPS', typeColor: 'cyan' })
      }
    })

    // CG Permit
    data.work.cgPermit?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'CG Permit', typeColor: 'red' })
      }
    })

    // National Permit
    data.work.nationalPermit?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'National Permit', typeColor: 'indigo' })
      }
    })

    // Bus Permit
    data.work.busPermit?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'Bus Permit', typeColor: 'pink' })
      }
    })

    // Temporary Permit
    data.work.temporaryPermit?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'Temporary Permit', typeColor: 'amber' })
      }
    })

    // Temporary Permit Other State
    data.work.temporaryPermitOtherState?.forEach(item => {
      if (item.balanceAmount > 0) {
        pending.push({ ...item, type: 'Temp Permit (Other State)', typeColor: 'teal' })
      }
    })

    return pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getTypeColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      pink: 'bg-pink-100 text-pink-800',
      amber: 'bg-amber-100 text-amber-800',
      teal: 'bg-teal-100 text-teal-800'
    }
    return colors[color] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 pt-20'>
        <div className='w-full px-3 md:px-4 lg:px-6 py-8'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
              </svg>
              <p className='text-sm font-semibold text-gray-600'>Loading party details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 pt-20'>
        <div className='w-full px-3 md:px-4 lg:px-6 py-8'>
          <div className='text-center py-12'>
            <p className='text-gray-600'>Party not found</p>
            <button
              onClick={() => navigate('/parties')}
              className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
            >
              Back to Parties
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pendingPayments = getPendingPayments()
  const totalPending = pendingPayments.reduce((sum, item) => sum + (item.balanceAmount || 0), 0)

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50'>
      <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>
        {/* Back Button & Party Header */}
        <div className='mb-6'>
          <button
            onClick={() => navigate('/parties')}
            className='flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4 transition-colors'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            <span className='font-semibold'>Back to Parties</span>
          </button>

          {/* Party Info Card */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
            <div className='flex items-start gap-4'>
              <div className='w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0'>
                {data.party?.partyName?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div className='flex-1 min-w-0'>
                <h1 className='text-2xl font-bold text-gray-900 mb-1'>{data.party?.partyName}</h1>
                {data.party?.sonWifeDaughterOf && (
                  <p className='text-sm text-gray-600'>S/o, W/o, D/o: {data.party.sonWifeDaughterOf}</p>
                )}
                <div className='flex flex-wrap gap-4 mt-2'>
                  {data.party?.mobile && (
                    <span className='text-sm text-gray-600'>
                      <span className='font-semibold'>Mobile:</span> {data.party.mobile}
                    </span>
                  )}
                  {data.party?.email && (
                    <span className='text-sm text-gray-600'>
                      <span className='font-semibold'>Email:</span> {data.party.email}
                    </span>
                  )}
                </div>
                {data.party?.address && (
                  <p className='text-sm text-gray-600 mt-1'>
                    <span className='font-semibold'>Address:</span> {data.party.address}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
              <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200'>
                <p className='text-xs text-blue-600 font-semibold uppercase'>Total Vehicles</p>
                <p className='text-2xl font-bold text-blue-700'>{data.summary?.totalVehicles || 0}</p>
              </div>
              <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200'>
                <p className='text-xs text-green-600 font-semibold uppercase'>Total Records</p>
                <p className='text-2xl font-bold text-green-700'>{data.summary?.totalRecords || 0}</p>
              </div>
              <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200'>
                <p className='text-xs text-red-600 font-semibold uppercase'>Pending Entries</p>
                <p className='text-2xl font-bold text-red-700'>{pendingPayments.length}</p>
              </div>
              <div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200'>
                <p className='text-xs text-orange-600 font-semibold uppercase'>Total Pending</p>
                <p className='text-2xl font-bold text-orange-700'>{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
          <div className='border-b border-gray-200'>
            <div className='flex overflow-x-auto'>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Pending Payments ({pendingPayments.length})
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'vehicles'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Vehicles ({data.vehicles?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'tax'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Tax ({data.work?.tax?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('fitness')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'fitness'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Fitness ({data.work?.fitness?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('insurance')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'insurance'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Insurance ({data.work?.insurance?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('puc')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'puc'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                PUC ({data.work?.puc?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('gps')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'gps'
                    ? 'border-cyan-500 text-cyan-600 bg-cyan-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                GPS ({data.work?.gps?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('permits')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'permits'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Permits ({(data.work?.cgPermit?.length || 0) + (data.work?.nationalPermit?.length || 0) + (data.work?.busPermit?.length || 0) + (data.work?.temporaryPermit?.length || 0) + (data.work?.temporaryPermitOtherState?.length || 0)})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className='p-6'>
            {/* Pending Payments Tab */}
            {activeTab === 'pending' && (
              <div>
                {pendingPayments.length === 0 ? (
                  <div className='text-center py-12'>
                    <svg className='mx-auto h-12 w-12 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <p className='mt-2 text-sm font-semibold text-gray-600'>No pending payments!</p>
                    <p className='text-xs text-gray-500'>All payments are cleared for this party.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Type</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Date</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Total</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Received</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Balance</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {pendingPayments.map((item, index) => (
                          <tr key={`${item.type}-${item._id}`} className='hover:bg-gray-50'>
                            <td className='px-4 py-3'>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColorClass(item.typeColor)}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className='px-4 py-3 text-sm font-semibold text-gray-900'>{item.vehicleNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.createdAt)}</td>
                            <td className='px-4 py-3 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                            <td className='px-4 py-3 text-sm text-green-600 text-right font-semibold'>{formatCurrency(item.receivedAmount || 0)}</td>
                            <td className='px-4 py-3 text-sm text-red-600 text-right font-bold'>{formatCurrency(item.balanceAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className='bg-gray-100'>
                        <tr>
                          <td colSpan='5' className='px-4 py-3 text-sm font-bold text-gray-900 text-right'>Total Pending:</td>
                          <td className='px-4 py-3 text-sm font-bold text-red-600 text-right'>{formatCurrency(totalPending)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div>
                {!data.vehicles?.length ? (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No vehicles found for this party.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Owner Name</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Mobile</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle Type</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Registered On</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {data.vehicles.map((vehicle) => (
                          <tr key={vehicle._id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3 text-sm font-bold text-gray-900'>{vehicle.registrationNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{vehicle.ownerName || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{vehicle.mobileNumber || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{vehicle.vehicleType || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(vehicle.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tax Tab */}
            {activeTab === 'tax' && (
              <div>
                {!data.work?.tax?.length ? (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No tax records found.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Tax Type</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Valid From</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Valid To</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Total</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Balance</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {data.work.tax.map((item) => (
                          <tr key={item._id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.taxType || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.validFrom)}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.validTo)}</td>
                            <td className='px-4 py-3 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(item.balanceAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Fitness Tab */}
            {activeTab === 'fitness' && (
              <div>
                {!data.work?.fitness?.length ? (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No fitness records found.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Fitness Type</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Application Date</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Total</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Balance</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {data.work.fitness.map((item) => (
                          <tr key={item._id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.fitnessType || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.applicationDate)}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                            <td className='px-4 py-3 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(item.balanceAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <div>
                {!data.work?.insurance?.length ? (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No insurance records found.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Company</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Policy No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Valid To</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Total</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Balance</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {data.work.insurance.map((item) => (
                          <tr key={item._id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.insuranceCompany || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.policyNumber || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.validTo)}</td>
                            <td className='px-4 py-3 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(item.balanceAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PUC Tab */}
            {activeTab === 'puc' && (
              <div>
                {!data.work?.puc?.length ? (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No PUC records found.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Certificate No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Issue Date</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Total</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Balance</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {data.work.puc.map((item) => (
                          <tr key={item._id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.certificateNumber || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.issueDate)}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                            <td className='px-4 py-3 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(item.balanceAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* GPS Tab */}
            {activeTab === 'gps' && (
              <div>
                {!data.work?.gps?.length ? (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No GPS records found.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={theme.tableHeader}>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Provider</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>IMEI</th>
                          <th className='px-4 py-3 text-left text-xs font-bold text-white uppercase'>Installation Date</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Total</th>
                          <th className='px-4 py-3 text-right text-xs font-bold text-white uppercase'>Balance</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {data.work.gps.map((item) => (
                          <tr key={item._id} className='hover:bg-gray-50'>
                            <td className='px-4 py-3 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.gpsProvider || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-700'>{item.imeiNumber || '-'}</td>
                            <td className='px-4 py-3 text-sm text-gray-600'>{formatDate(item.installationDate)}</td>
                            <td className='px-4 py-3 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(item.balanceAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Permits Tab */}
            {activeTab === 'permits' && (
              <div className='space-y-6'>
                {/* CG Permit */}
                {data.work?.cgPermit?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold text-gray-700 mb-3 flex items-center gap-2'>
                      <span className='w-3 h-3 bg-red-500 rounded-full'></span>
                      CG Permit ({data.work.cgPermit.length})
                    </h3>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='bg-gradient-to-r from-red-500 to-red-600'>
                          <tr>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Permit Type</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Issue Date</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Total</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Balance</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                          {data.work.cgPermit.map((item) => (
                            <tr key={item._id} className='hover:bg-gray-50'>
                              <td className='px-4 py-2 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.permitType || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.issueDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                              <td className={`px-4 py-2 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(item.balanceAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* National Permit */}
                {data.work?.nationalPermit?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold text-gray-700 mb-3 flex items-center gap-2'>
                      <span className='w-3 h-3 bg-indigo-500 rounded-full'></span>
                      National Permit ({data.work.nationalPermit.length})
                    </h3>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='bg-gradient-to-r from-indigo-500 to-indigo-600'>
                          <tr>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Permit No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Issue Date</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Total</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Balance</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                          {data.work.nationalPermit.map((item) => (
                            <tr key={item._id} className='hover:bg-gray-50'>
                              <td className='px-4 py-2 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.permitNumber || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.issueDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                              <td className={`px-4 py-2 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(item.balanceAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bus Permit */}
                {data.work?.busPermit?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold text-gray-700 mb-3 flex items-center gap-2'>
                      <span className='w-3 h-3 bg-pink-500 rounded-full'></span>
                      Bus Permit ({data.work.busPermit.length})
                    </h3>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='bg-gradient-to-r from-pink-500 to-pink-600'>
                          <tr>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Permit No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Route</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Total</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Balance</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                          {data.work.busPermit.map((item) => (
                            <tr key={item._id} className='hover:bg-gray-50'>
                              <td className='px-4 py-2 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.permitNumber || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.route || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                              <td className={`px-4 py-2 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(item.balanceAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Temporary Permit */}
                {data.work?.temporaryPermit?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold text-gray-700 mb-3 flex items-center gap-2'>
                      <span className='w-3 h-3 bg-amber-500 rounded-full'></span>
                      Temporary Permit ({data.work.temporaryPermit.length})
                    </h3>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='bg-gradient-to-r from-amber-500 to-amber-600'>
                          <tr>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Permit No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Issue Date</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Total</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Balance</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                          {data.work.temporaryPermit.map((item) => (
                            <tr key={item._id} className='hover:bg-gray-50'>
                              <td className='px-4 py-2 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.permitNumber || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.issueDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                              <td className={`px-4 py-2 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(item.balanceAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Temporary Permit Other State */}
                {data.work?.temporaryPermitOtherState?.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold text-gray-700 mb-3 flex items-center gap-2'>
                      <span className='w-3 h-3 bg-teal-500 rounded-full'></span>
                      Temporary Permit (Other State) ({data.work.temporaryPermitOtherState.length})
                    </h3>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='bg-gradient-to-r from-teal-500 to-teal-600'>
                          <tr>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Vehicle No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Permit No.</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>State</th>
                            <th className='px-4 py-2 text-left text-xs font-bold text-white uppercase'>Expiry Date</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Total</th>
                            <th className='px-4 py-2 text-right text-xs font-bold text-white uppercase'>Balance</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                          {data.work.temporaryPermitOtherState.map((item) => (
                            <tr key={item._id} className='hover:bg-gray-50'>
                              <td className='px-4 py-2 text-sm font-bold text-gray-900'>{item.vehicleNumber}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.permitNumber || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-700'>{item.state || '-'}</td>
                              <td className='px-4 py-2 text-sm text-gray-600'>{formatDate(item.expiryDate)}</td>
                              <td className='px-4 py-2 text-sm text-gray-900 text-right'>{formatCurrency(item.totalAmount)}</td>
                              <td className={`px-4 py-2 text-sm text-right font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(item.balanceAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* No permits message */}
                {!data.work?.cgPermit?.length && !data.work?.nationalPermit?.length && !data.work?.busPermit?.length && !data.work?.temporaryPermit?.length && !data.work?.temporaryPermitOtherState?.length && (
                  <div className='text-center py-12'>
                    <p className='text-sm text-gray-600'>No permit records found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartyDetail
