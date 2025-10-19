import { useState, useMemo, useEffect } from 'react'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import IssueCgPermitModal from '../components/IssueCgPermitModal'

const API_BASE_URL = 'http://localhost:5000/api'

const CgPermit = () => {
  // Demo data for when backend is not available
  const demoPermits = [
    {
      id: 'CG-2024-001',
      permitNumber: 'CG001234567',
      permitType: 'State Goods Permit',
      permitHolder: 'Kumar Transport Services',
      vehicleNo: 'CG-04-AB-1234',
      issueDate: '2024-01-15',
      validFrom: '2024-01-15',
      validTill: '2025-01-14',
      validityPeriod: '1 Year',
      status: 'Active',
      fees: 8000,
      address: '123, Transport Nagar, Raipur, CG - 492001',
      mobileNumber: '+91 9876543210',
      route: 'Within Chhattisgarh State',
      goodsType: 'General Goods',
      issuingAuthority: 'RTO Raipur',
      vehicleModel: 'TATA LPT 1212',
      vehicleType: 'Truck',
      chassisNumber: 'MB1234567890ABCDE',
      engineNumber: 'ENG12345678'
    },
    {
      id: 'CG-2024-002',
      permitNumber: 'CG001234568',
      permitType: 'State Passenger Permit',
      permitHolder: 'Singh Bus Services',
      vehicleNo: 'CG-07-CD-5678',
      issueDate: '2024-02-10',
      validFrom: '2024-02-10',
      validTill: '2025-02-09',
      validityPeriod: '1 Year',
      status: 'Active',
      fees: 10000,
      address: '456, Bus Stand Road, Bilaspur, CG - 495001',
      mobileNumber: '+91 9876543211',
      route: 'Raipur to Bilaspur',
      goodsType: 'N/A',
      issuingAuthority: 'RTO Bilaspur',
      vehicleModel: 'ASHOK LEYLAND Viking',
      vehicleType: 'Bus',
      chassisNumber: 'MB1234567890ABCDF',
      engineNumber: 'ENG12345679'
    },
    {
      id: 'CG-2024-003',
      permitNumber: 'CG001234569',
      permitType: 'State Goods Permit',
      permitHolder: 'Patel Logistics',
      vehicleNo: 'CG-20-EF-9012',
      issueDate: '2024-03-05',
      validFrom: '2024-03-05',
      validTill: '2024-12-31',
      validityPeriod: '9 Months',
      status: 'Expiring Soon',
      fees: 7500,
      address: '789, Industrial Area, Durg, CG - 491001',
      mobileNumber: '+91 9876543212',
      route: 'Within Chhattisgarh State',
      goodsType: 'Industrial Materials',
      issuingAuthority: 'RTO Durg',
      vehicleModel: 'EICHER PRO 3015',
      vehicleType: 'Truck',
      chassisNumber: 'MB1234567890ABCDG',
      engineNumber: 'ENG12345680'
    },
    {
      id: 'CG-2024-004',
      permitNumber: 'CG001234570',
      permitType: 'State Goods Permit',
      permitHolder: 'Verma Freight Services',
      vehicleNo: 'CG-10-GH-3456',
      issueDate: '2023-12-15',
      validFrom: '2023-12-15',
      validTill: '2024-12-14',
      validityPeriod: '1 Year',
      status: 'Pending Renewal',
      fees: 8500,
      address: '321, Cargo Complex, Raigarh, CG - 496001',
      mobileNumber: '+91 9876543213',
      route: 'Within Chhattisgarh State',
      goodsType: 'Agricultural Products',
      issuingAuthority: 'RTO Raigarh',
      vehicleModel: 'MAHINDRA Bolero Pickup',
      vehicleType: 'Pickup Truck',
      chassisNumber: 'MB1234567890ABCDH',
      engineNumber: 'ENG12345681'
    },
    {
      id: 'CG-2024-005',
      permitNumber: 'CG001234571',
      permitType: 'State Passenger Permit',
      permitHolder: 'Sharma Tours & Travels',
      vehicleNo: 'CG-04-IJ-7890',
      issueDate: '2024-01-20',
      validFrom: '2024-01-20',
      validTill: '2025-01-19',
      validityPeriod: '1 Year',
      status: 'Active',
      fees: 9500,
      address: '654, Station Road, Korba, CG - 495677',
      mobileNumber: '+91 9876543214',
      route: 'Raipur to Korba',
      goodsType: 'N/A',
      issuingAuthority: 'RTO Korba',
      vehicleModel: 'TATA Winger',
      vehicleType: 'Maxi Cab',
      chassisNumber: 'MB1234567890ABCDI',
      engineNumber: 'ENG12345682'
    }
  ]

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
      const response = await fetch(`${API_BASE_URL}/cg-permits`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch CG permits')
      }

      // Transform backend data to match frontend structure
      const transformedPermits = data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        permitType: permit.permitType,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validFrom: permit.validFrom,
        validTill: permit.validTo,
        validityPeriod: permit.validityPeriod,
        status: permit.status,
        fees: permit.fees,
        address: permit.address || 'N/A',
        mobileNumber: permit.mobileNumber || 'N/A',
        route: permit.route,
        goodsType: permit.goodsType || 'General Goods',
        issuingAuthority: permit.issuingAuthority,
        vehicleModel: permit.vehicleModel || 'N/A',
        vehicleType: permit.vehicleType || 'N/A',
        chassisNumber: permit.chassisNumber || 'N/A',
        engineNumber: permit.engineNumber || 'N/A',
        renewalHistory: permit.renewalHistory || [],
        insuranceDetails: permit.insuranceDetails || {
          policyNumber: 'N/A',
          company: 'N/A',
          validUpto: 'N/A'
        },
        taxDetails: permit.taxDetails || {
          taxPaidUpto: 'N/A',
          taxAmount: 'N/A'
        }
      }))

      setPermits(transformedPermits)
    } catch (error) {
      console.error('Error fetching CG permits:', error)
      console.log('Using demo data as fallback')
      // Use demo data when backend is not available
      setPermits(demoPermits)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Pending Renewal': return 'bg-yellow-100 text-yellow-700'
      case 'Expiring Soon': return 'bg-orange-100 text-orange-700'
      case 'Expired': return 'bg-red-100 text-red-700'
      case 'Suspended': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
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
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        issueDate: formData.validFrom,
        permitType: 'Type A',
        validityPeriod: 5,
        fatherName: formData.fatherName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        vehicleModel: formData.vehicleModel || '',
        vehicleType: formData.vehicleType || '',
        chassisNumber: formData.chassisNumber || '',
        engineNumber: formData.engineNumber || '',
        unladenWeight: formData.unladenWeight ? Number(formData.unladenWeight) : 0,
        grossWeight: formData.grossWeight ? Number(formData.grossWeight) : 0,
        yearOfManufacture: new Date().getFullYear().toString(),
        seatingCapacity: '2',
        goodsType: formData.goodsType || 'General Goods',
        route: 'Chhattisgarh State',
        maxLoadCapacity: formData.grossWeight ? `${formData.grossWeight} kg` : '',
        fees: Number(formData.fees) || 10000,
        status: 'Active'
      }

      // Make POST request to backend
      const response = await fetch(`${API_BASE_URL}/cg-permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create CG permit')
      }

      // Show success message
      alert('CG Permit added successfully!')

      // Refresh the permits list
      await fetchPermits()
    } catch (error) {
      console.error('Error creating CG permit:', error)
      alert(`Failed to create CG permit: ${error.message}`)
    }
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 pt-20 lg:pt-20 max-w-[1800px] mx-auto'>
      <div className='mb-6 md:mb-8'>
        <h1 className='text-xl md:text-3xl font-black text-gray-800 mb-1 md:mb-2'>CG Permit</h1>
        <p className='text-sm md:text-base text-gray-600'>Manage Chhattisgarh state permit applications and records</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg'>
          <div className='flex items-center'>
            <svg className='w-6 h-6 text-red-500 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <div>
              <h3 className='text-red-800 font-semibold'>Error loading CG permits</h3>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center items-center py-20'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
          <span className='ml-3 text-gray-600 font-semibold'>Loading CG permits...</span>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && (
      <>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>📋</div>
            <div className='text-xl font-black text-gray-800'>{permits.length}</div>
          </div>
          <div className='text-xs text-gray-600'>Total CG Permits</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>✅</div>
            <div className='text-xl font-black text-green-600'>
              {permits.filter(p => p.status === 'Active').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Active Permits</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>⏰</div>
            <div className='text-xl font-black text-orange-600'>
              {permits.filter(p => p.status === 'Expiring Soon').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Expiring Soon</div>
        </div>
        <div className='bg-white rounded-lg p-4 shadow border border-gray-200'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>🔄</div>
            <div className='text-xl font-black text-yellow-600'>
              {permits.filter(p => p.status === 'Pending Renewal').length}
            </div>
          </div>
          <div className='text-xs text-gray-600'>Pending Renewal</div>
        </div>
      </div>

      {/* Permits Table */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>CG Permit Records</h2>

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
                + Add New CG Permit
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
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Type</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Permit Holder</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Vehicle No.</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase'>Valid Till</th>
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
                      <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold'>
                        {permit.permitType}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-800'>{permit.permitHolder}</td>
                    <td className='px-6 py-4 text-sm font-mono text-gray-800'>{permit.vehicleNo}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{permit.validFrom}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>{permit.validTill}</td>
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
                  <td colSpan='8' className='px-6 py-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-12 w-12 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-lg font-semibold text-gray-600'>No CG permits found</p>
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

      {/* Add New CG Permit Modal */}
      <IssueCgPermitModal
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
          permitType="CG"
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
          permitType="CG"
        />
      )}
    </div>
  )
}

export default CgPermit
