import { useState, useMemo, useEffect } from 'react'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import IssueTemporaryPermitModal from '../components/IssueTemporaryPermitModal'

const API_BASE_URL = 'http://localhost:5000/api'

const TemporaryPermit = () => {
  const [permits, setPermits] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch permits from backend on component mount
  useEffect(() => {
    fetchPermits()
  }, [])

  const fetchPermits = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/temporary-permits`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch temporary permits')
      }

      // Transform backend data to match frontend structure
      const transformedPermits = data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        vehicleType: permit.vehicleType,
        vehicleTypeFull: permit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle',
        validityPeriod: permit.validityPeriod,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validFrom: permit.validFrom,
        validTill: permit.validTo,
        status: permit.status,
        fees: permit.fees,
        address: permit.address || 'N/A',
        mobileNumber: permit.mobileNumber || 'N/A',
        route: permit.route || 'N/A',
        purpose: permit.purpose || 'Temporary Use',
        issuingAuthority: permit.issuingAuthority,
        vehicleModel: permit.vehicleModel || 'N/A',
        vehicleClass: permit.vehicleClass || 'N/A',
        chassisNumber: permit.chassisNumber || 'N/A',
        engineNumber: permit.engineNumber || 'N/A',
        insuranceDetails: permit.insuranceDetails || {
          policyNumber: 'N/A',
          company: 'N/A',
          validUpto: 'N/A'
        }
      }))

      setPermits(transformedPermits)
    } catch (error) {
      console.error('Error fetching temporary permits:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Expiring Soon': return 'bg-orange-100 text-orange-700'
      case 'Expired': return 'bg-red-100 text-red-700'
      case 'Cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getVehicleTypeColor = (type) => {
    return type === 'CV' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  }

  // Filter permits based on search query
  const filteredPermits = useMemo(() => {
    if (!searchQuery.trim()) {
      return permits
    }

    const searchLower = searchQuery.toLowerCase()
    return permits.filter((permit) =>
      permit.permitNumber.toLowerCase().includes(searchLower) ||
      permit.permitHolder.toLowerCase().includes(searchLower) ||
      permit.vehicleNo.toLowerCase().includes(searchLower)
    )
  }, [permits, searchQuery])

  const handleViewBill = (permit) => {
    setSelectedPermit(permit)
    setShowBillModal(true)
  }

  const handleShare = (permit) => {
    setSelectedPermit(permit)
    setShowShareModal(true)
  }

  const handleIssuePermit = async (formData) => {
    try {
      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolderName,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        validityPeriod: formData.vehicleType === 'CV' ? 3 : 4,
        issueDate: formData.validFrom,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleClass: formData.vehicleClass || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        yearOfManufacture: new Date().getFullYear().toString(),
        seatingCapacity: formData.seatingCapacity || '',
        route: formData.route || '',
        purpose: formData.purpose || 'Temporary Use',
        fees: Number(formData.fees) || 1000,
        status: 'Active'
      }

      // Make POST request to backend
      const response = await fetch(`${API_BASE_URL}/temporary-permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create temporary permit')
      }

      // Show success message
      alert('Temporary Permit added successfully!')

      // Refresh the permits list
      await fetchPermits()
    } catch (error) {
      console.error('Error creating temporary permit:', error)
      alert(`Failed to create temporary permit: ${error.message}`)
    }
  }

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>Temporary Permit</h1>
        <p className='text-gray-600'>Manage temporary permit applications and records</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg'>
          <div className='flex items-center'>
            <svg className='w-6 h-6 text-red-500 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <div>
              <h3 className='text-red-800 font-semibold'>Error loading temporary permits</h3>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center items-center py-20'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
          <span className='ml-3 text-gray-600 font-semibold'>Loading temporary permits...</span>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && (
      <>
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>ð</div>
            <div className='text-xl font-black text-gray-800'>{permits.length}</div>
          </div>
          <div className='text-xs text-gray-600'>Total Temporary Permits</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'></div>
            <div className='text-xl font-black text-green-600'>
              {permits.filter(p => p.status === 'Active').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Active Permits</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>=›</div>
            <div className='text-xl font-black text-blue-600'>
              {permits.filter(p => p.vehicleType === 'CV').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Commercial Vehicle</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>=—</div>
            <div className='text-xl font-black text-purple-600'>
              {permits.filter(p => p.vehicleType === 'PV').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Passenger Vehicle</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'> </div>
            <div className='text-xl font-black text-orange-600'>
              {permits.filter(p => p.status === 'Expiring Soon').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Expiring Soon</div>
        </div>
      </div>

      {/* Permits Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>Temporary Permit Records</h2>

            {/* Search Bar */}
            <div className='flex flex-col md:flex-row gap-3 w-full md:w-auto'>
              <div className='relative flex-1 md:w-96'>
                <input
                  type='text'
                  placeholder='Search by permit number, holder name, or vehicle no...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
                <svg
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>

              <button
                onClick={() => setShowIssuePermitModal(true)}
                className='px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold whitespace-nowrap cursor-pointer'
              >
                + Add New Temporary Permit
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className='mt-4 text-sm text-gray-600'>
            Showing {filteredPermits.length} of {permits.length} permits
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Permit Number</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle Type</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Permit Holder</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid Till</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Validity</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredPermits.length > 0 ? (
                filteredPermits.map((permit) => (
                  <tr key={permit.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-4 text-sm font-semibold text-gray-800 font-mono'>{permit.permitNumber}</td>
                    <td className='px-6 py-4'>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getVehicleTypeColor(permit.vehicleType)}`}>
                          {permit.vehicleType}
                        </span>
                        <div className='text-xs text-gray-500 mt-1'>{permit.vehicleTypeFull}</div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-800'>{permit.permitHolder}</td>
                    <td className='px-6 py-4 text-sm font-mono text-gray-800'>{permit.vehicleNo}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{permit.validFrom}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{permit.validTill}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{permit.validityPeriod} months</td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(permit.status)}`}>
                        {permit.status}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleViewBill(permit)}
                          className='px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold text-sm transition cursor-pointer'
                        >
                          Bill
                        </button>
                        <button
                          onClick={() => handleShare(permit)}
                          className='px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-semibold text-sm transition cursor-pointer'
                          title='Share via WhatsApp'
                        >
                          Share
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='9' className='px-6 py-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-12 w-12 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-lg font-semibold text-gray-600'>No temporary permits found</p>
                      <p className='text-sm text-gray-500 mt-1'>Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Add New Temporary Permit Modal */}
      <IssueTemporaryPermitModal
        isOpen={showIssuePermitModal}
        onClose={() => setShowIssuePermitModal(false)}
        onSubmit={handleIssuePermit}
      />

      {/* Bill Modal */}
      {showBillModal && selectedPermit && (
        <PermitBillModal
          permit={selectedPermit}
          onClose={() => {
            setShowBillModal(false)
            setSelectedPermit(null)
          }}
          permitType="Temporary"
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedPermit && (
        <SharePermitModal
          permit={selectedPermit}
          onClose={() => {
            setShowShareModal(false)
            setSelectedPermit(null)
          }}
          permitType="Temporary"
        />
      )}
    </div>
  )
}

export default TemporaryPermit
