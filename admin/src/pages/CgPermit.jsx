import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import PermitBillModal from '../components/PermitBillModal'
import SharePermitModal from '../components/SharePermitModal'
import IssueCgPermitModal from '../components/IssueCgPermitModal'
import EditCgPermitModal from '../components/EditCgPermitModal'
import Pagination from '../components/Pagination'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedPermit, setSelectedPermit] = useState(null)
  const [showIssuePermitModal, setShowIssuePermitModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [editingPermit, setEditingPermit] = useState(null)
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('All')
  const [whatsappLoading, setWhatsappLoading] = useState(null) // Track which permit is loading
  const [initialPermitData, setInitialPermitData] = useState(null) // For pre-filling renewal data
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'expiring', 'pending'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    pendingPaymentCount: 0,
    pendingPaymentAmount: 0
  })

  // Fetch CG permit statistics from API
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cg-permits/statistics`)
      if (response.data.success) {
        setStatistics({
          total: response.data.data.total,
          active: response.data.data.active,
          expiringSoon: response.data.data.expiringSoon,
          expired: response.data.data.expired,
          pendingPaymentCount: response.data.data.pendingPaymentCount,
          pendingPaymentAmount: response.data.data.pendingPaymentAmount
        })
      }
    } catch (error) {
      console.error('Error fetching CG permit statistics:', error)
    }
  }

  // Debounce search query to avoid losing focus on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch permits from backend on component mount and when filters change
  useEffect(() => {
    // Only fetch if search query is empty or has at least 4 characters
    if (debouncedSearchQuery.length === 0 || debouncedSearchQuery.length >= 4) {
      fetchPermits(1)
      fetchStatistics()
    }
  }, [debouncedSearchQuery, statusFilter])

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchPermits(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fetchPermits = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/api/cg-permits`, {
        params: {
          page,
          limit: pagination.limit,
          search: debouncedSearchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      })

      // Transform backend data to match frontend structure
      const transformedPermits = response.data.data.map(permit => ({
        id: permit._id,
        permitNumber: permit.permitNumber,
        permitType: permit.permitType,
        permitHolder: permit.permitHolder,
        vehicleNo: permit.vehicleNumber || 'N/A',
        issueDate: permit.issueDate,
        validFrom: permit.validFrom,
        validTo: permit.validTo, // Keep original field
        validTill: permit.validTo, // Also map to validTill for compatibility
        validityPeriod: permit.validityPeriod,
        bill: permit.bill, // Include bill reference
        totalFee: permit.totalFee || 0, // Keep original field name for edit modal
        fees: permit.totalFee || permit.fees || 0, // Keep for backward compatibility
        balance: permit.balance || 0,
        paid: permit.paid || 0,
        status: permit.status || 'Active', // Status field for edit modal
        fatherName: permit.fatherName || '', // Optional field for edit modal
        email: permit.email || '', // Optional field for edit modal
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

      // Update pagination state
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalRecords: response.data.pagination.totalRecords,
          limit: pagination.limit
        })
      }
    } catch (error) {
      console.error('Error fetching CG permits:', error)
      toast.error('Failed to fetch CG permits. Please check if the backend server is running.', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (validTo) => {
    if (!validTo) return 'bg-gray-100 text-gray-700'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateParts = validTo.split(/[/-]/)
    const validToDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
    validToDate.setHours(0, 0, 0, 0)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'bg-red-100 text-red-700'
    if (diffDays <= 15) return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusText = (validTo) => {
    if (!validTo) return 'Unknown'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateParts = validTo.split(/[/-]/)
    const validToDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
    validToDate.setHours(0, 0, 0, 0)
    const diffTime = validToDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Expired'
    if (diffDays <= 15) return 'Expiring Soon'
    return 'Active'
  }

  // Helper to convert DD-MM-YYYY to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null

    // If it's already a valid date string (YYYY-MM-DD or ISO format)
    const standardDate = new Date(dateStr)
    if (!isNaN(standardDate.getTime())) {
      return standardDate
    }

    // Try DD-MM-YYYY format
    const parts = dateStr.split(/[/-]/)
    if (parts.length === 3) {
      const [day, month, year] = parts
      const parsedDate = new Date(year, month - 1, day)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    return null
  }

  // Use permits directly since filtering is done on backend
  const filteredPermits = permits

  const handleViewDetails = (permit) => {
    setSelectedPermit(permit)
    setShowDetailsModal(true)
  }

  const handleViewBill = (permit) => {
    setSelectedPermit(permit)
    setShowBillModal(true)
  }

  const handleShare = (permit) => {
    setSelectedPermit(permit)
    setShowShareModal(true)
  }

  const handleWhatsAppShare = async (permit) => {
    // Set loading state
    setWhatsappLoading(permit.id)

    try {
      // Get phone number first (validate before API call)
      const phoneNumber = permit.mobileNumber?.replace(/\D/g, '') || ''

      if (!phoneNumber || phoneNumber.length < 10) {
        alert('No valid mobile number found for this permit holder')
        setWhatsappLoading(null)
        return
      }

      // Generate bill PDF if needed
      let pdfUrl = null

      if (permit.bill?.billPdfPath) {
        pdfUrl = `${API_URL}${permit.bill.billPdfPath}`
      } else {
        const response = await axios.post(`${API_URL}/api/cg-permits/${permit.id}/generate-bill-pdf`)
        if (!response.data.success) {
          throw new Error('Failed to generate bill PDF')
        }

        pdfUrl = response.data.data.pdfUrl || `${API_URL}${response.data.data.pdfPath}`
      }

      // Create WhatsApp message
      const message = `Hello ${permit.permitHolderName || permit.permitHolder || 'Sir/Madam'},

Your CG Permit Bill is ready!

*Bill Number:* ${permit.bill?.billNumber || 'N/A'}
*Permit Number:* ${permit.permitNumber}
*Vehicle Number:* ${permit.vehicleNo || permit.vehicleNumber}
*Total Fee:* ₹${permit.totalFee || permit.fees || 0}
*Valid From:* ${permit.validFrom}
*Valid To:* ${permit.validTo || permit.validTill}

You can view and download your bill from the link below:
${pdfUrl}

Thank you!`

      const encodedMessage = encodeURIComponent(message)

      // Clear loading state
      setWhatsappLoading(null)

      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`

      // Use WhatsApp Web for reliable message pre-fill (works for saved and unsaved contacts)
      const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`

      // Open in same tab named 'whatsapp_share' - reuses tab if already open
      const whatsappWindow = window.open(whatsappWebUrl, 'whatsapp_share')
      if (whatsappWindow) {
        whatsappWindow.focus()
      } else {
        // If popup blocked, show message
        alert('Please allow popups for this site to share via WhatsApp, or copy the link manually.')
      }

    } catch (error) {
      console.error('Error sharing via WhatsApp:', error)
      setWhatsappLoading(null)
      alert('Failed to prepare WhatsApp message. Please try again.')
    }
  }

  const handleRenewClick = (permit) => {
    // Pre-fill vehicle number and other details for renewal
    setInitialPermitData({
      vehicleNumber: permit.vehicleNo,
      permitHolderName: permit.permitHolder || '',
      permitType: permit.permitType || '',
      address: permit.address || '',
      mobileNumber: permit.mobileNumber || '',
      chassisNumber: permit.chassisNumber || '',
      engineNumber: permit.engineNumber || '',
      route: permit.route || '',
      goodsType: permit.goodsType || ''
    })
    setShowIssuePermitModal(true)
  }

  const handleDeletePermit = async (permit) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this CG permit?\n\n` +
      `Permit Number: ${permit.permitNumber}\n` +
      `Vehicle Number: ${permit.vehicleNo}\n` +
      `Permit Holder: ${permit.permitHolder}\n` +
      `Permit Type: ${permit.permitType}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmDelete) {
      return
    }

    try {
      // Make DELETE request to backend
      const response = await axios.delete(`${API_URL}/api/cg-permits/${permit.id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete CG permit')
      }

      // Show success message
      toast.success('CG Permit deleted successfully!', {
        position: 'top-right',
        autoClose: 3000
      })

      // Refresh the permits list
      await fetchPermits()
    } catch (error) {
      console.error('Error deleting CG permit:', error)
      toast.error(`Failed to delete CG permit: ${error.message}`, {
        position: 'top-right',
        autoClose: 3000
      })
    }
  }

  // Determine if renew button should be shown for a permit
  const shouldShowRenewButton = (permit) => {
    const status = getStatusText(permit.validTill)

    // Show renew button for expiring soon permits
    if (status === 'Expiring Soon') {
      return true
    }

    // Show renew button for expired permits
    if (status === 'Expired') {
      return true
    }

    return false
  }

  const handleEditPermit = (permit) => {
    setEditingPermit(permit)
    setShowEditPermitModal(true)
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'date') {
      setDateFilter(value)
    }
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
        totalFee: Number(formData.totalFee) || 0,
        paid: Number(formData.paid) || 0,
        balance: Number(formData.balance) || 0,
        status: 'Active'
      }

      // Make POST request to backend
      const response = await axios.post(`${API_URL}/api/cg-permits`, permitData)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create CG permit')
      }

      // Show success message
      toast.success('CG Permit added successfully!', { position: 'top-right', autoClose: 3000 })

      // Refresh the permits list and statistics
      await fetchPermits()
      await fetchStatistics()
    } catch (error) {
      console.error('Error creating CG permit:', error)

      // Handle detailed error response from backend
      if (error.response?.data) {
        const errorData = error.response.data

        // Show main error message
        const mainMessage = errorData.errorCount > 1
          ? `${errorData.message} (${errorData.errorCount} errors)`
          : (errorData.message || 'Failed to create CG permit')

        toast.error(mainMessage, { position: 'top-right', autoClose: 5000 })

        // Show each detailed error if available
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err, index) => {
            setTimeout(() => {
              toast.error(`• ${err}`, { position: 'top-right', autoClose: 4000 })
            }, (index + 1) * 150)
          })
        }
      } else {
        // Network or other errors
        toast.error(`Failed to create CG permit: ${error.message}`, { position: 'top-right', autoClose: 5000 })
      }
    }
  }

  const handleUpdatePermit = async (formData) => {
    try {
      if (!editingPermit || !editingPermit.id) {
        throw new Error('No permit selected for editing')
      }

      // Prepare data to match backend model
      const permitData = {
        permitNumber: formData.permitNumber,
        permitHolder: formData.permitHolder,
        vehicleNumber: formData.vehicleNumber,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
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
        goodsType: formData.goodsType || 'General Goods',
        totalFee: Number(formData.totalFee) || 0,
        paid: Number(formData.paid) || 0,
        balance: Number(formData.balance) || 0
      }

      // Make PUT request to backend
      const response = await axios.put(`${API_URL}/api/cg-permits/${editingPermit.id}`, permitData)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update CG permit')
      }

      // Show success message
      toast.success('CG Permit updated successfully!', { position: 'top-right', autoClose: 3000 })

      // Refresh the permits list and statistics
      await fetchPermits()
      await fetchStatistics()

      // Close the modal
      setShowEditPermitModal(false)
      setEditingPermit(null)
    } catch (error) {
      console.error('Error updating CG permit:', error)
      toast.error(`Failed to update CG permit: ${error.message}`, { position: 'top-right', autoClose: 3000 })
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              {/* Total Permits */}
              <div
                onClick={() => setStatusFilter('all')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-300 shadow-xl' : 'border-indigo-100'
                }`}
                title={statusFilter === 'all' ? 'Currently showing all permits' : 'Click to show all permits'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Total CG Permits</p>
                    <h3 className='text-lg lg:text-2xl font-black text-gray-800'>{statistics.total}</h3>
                    <p className='text-[7px] lg:text-[9px] text-emerald-600 font-bold mt-0.5'>({statistics.active} active)</p>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expiring Soon */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'expiring_soon' ? 'border-orange-500 ring-2 ring-orange-300 shadow-xl' : 'border-orange-100'
                }`}
                title={statusFilter === 'expiring_soon' ? 'Click to clear filter' : 'Click to filter expiring permits'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expiring Soon</p>
                    <h3 className='text-lg lg:text-2xl font-black text-orange-600'>{statistics.expiringSoon}</h3>
                    <p className='text-[7px] lg:text-[9px] text-gray-400 mt-0.5'>Within 30 days</p>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expired */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'expired' ? 'border-red-500 ring-2 ring-red-300 shadow-xl' : 'border-red-100'
                }`}
                title={statusFilter === 'expired' ? 'Click to clear filter' : 'Click to filter expired permits'}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Expired</p>
                    <h3 className='text-lg lg:text-2xl font-black text-red-600'>{statistics.expired}</h3>
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Payment */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                className={`bg-white rounded-lg shadow-md border p-2 lg:p-3.5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform ${
                  statusFilter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-300 shadow-xl' : 'border-yellow-100'
                }`}
                title={statusFilter === 'pending' ? 'Click to clear filter' : 'Click to filter pending payments'}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <p className='text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 lg:mb-1'>Pending Payment</p>
                    <h3 className='text-lg lg:text-2xl font-black text-yellow-600'>{statistics.pendingPaymentCount}</h3>
                    {statistics.pendingPaymentAmount > 0 && (
                      <p className='text-[7px] lg:text-[9px] text-gray-500 font-semibold mt-0.5'>
                        ₹{statistics.pendingPaymentAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className='w-8 h-8 lg:w-11 lg:h-11 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Permits Table */}
      <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
        {/* Search and Filters Header */}
        <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <div className='relative flex-1 lg:max-w-md'>
              <input
                type='text'
                placeholder='Search by permit number, holder, or vehicle...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className='w-full pl-11 pr-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm uppercase'
              />
              <svg
                className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>

            {/* Filters Group */}
            <div className='flex flex-wrap gap-2'>
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Permits</option>
                <option value='Expiring30Days'>Expiring in 30 Days</option>
                <option value='Expiring60Days'>Expiring in 60 Days</option>
                <option value='Expired'>Expired</option>
              </select>

              {/* Clear Filters */}
              {dateFilter !== 'All' && (
                <button
                  onClick={() => handleFilterChange('date', 'All')}
                  className='px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg'
                >
                  Clear
                </button>
              )}
            </div>

            {/* New Permit Button */}
            <button
              onClick={() => setShowIssuePermitModal(true)}
              className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <span className='flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                New CG Permit
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className='block lg:hidden'>
          {loading ? (
            <div className='flex flex-col justify-center items-center py-12'>
              <div className='relative'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
                <div className='absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
              </div>
              <p className='text-sm text-gray-600 mt-4'>Loading permits...</p>
            </div>
          ) : filteredPermits.length > 0 ? (
            <div className='p-3 space-y-3'>
              {filteredPermits.map((permit) => (
                <div key={permit.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                  {/* Card Header with Avatar and Actions */}
                  <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                        {permit.permitHolder?.substring(0, 2)?.toUpperCase() || 'CG'}
                      </div>
                      <div>
                        <div className='text-xs font-mono font-bold text-gray-900'>{permit.permitNumber}</div>
                        <div className='text-xs text-gray-600 mt-0.5'>{permit.permitHolder || '-'}</div>
                      </div>
                    </div>
                    {/* Action Buttons on top right */}
                    <div className='flex items-center gap-1.5'>
                      {shouldShowRenewButton(permit) && (
                        <button
                          onClick={() => handleRenewClick(permit)}
                          className='p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all cursor-pointer'
                          title='Renew Permit'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(permit)}
                        className='p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all cursor-pointer'
                        title='View Details'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditPermit(permit)}
                        className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                        title='Edit'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleWhatsAppShare(permit)}
                        disabled={whatsappLoading === permit.id}
                        className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer disabled:opacity-50'
                        title='Share via WhatsApp'
                      >
                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePermit(permit)}
                        className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                        title='Delete Permit'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className='p-3 space-y-2.5'>
                    {/* Status and Vehicle */}
                    <div className='flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100'>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(permit.validTill)}`}>
                        {getStatusText(permit.validTill)}
                      </span>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200'>
                        <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                        </svg>
                        {permit.vehicleNo}
                      </span>
                    </div>

                    {/* Payment Details */}
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='bg-gray-50 rounded-lg p-2 border border-gray-200'>
                        <div className='text-xs text-gray-500 font-medium mb-0.5'>Total Fee</div>
                        <div className='text-sm font-bold text-gray-900'>₹{(permit.fees || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className='bg-emerald-50 rounded-lg p-2 border border-emerald-200'>
                        <div className='text-xs text-emerald-600 font-medium mb-0.5'>Paid</div>
                        <div className='text-sm font-bold text-emerald-700'>₹{(permit.paid || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className={`rounded-lg p-2 border ${(permit.balance || 0) > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`text-xs font-medium mb-0.5 ${(permit.balance || 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>Balance</div>
                        <div className={`text-sm font-bold ${(permit.balance || 0) > 0 ? 'text-orange-700' : 'text-gray-500'}`}>₹{(permit.balance || 0).toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className='grid grid-cols-2 gap-2 pt-1'>
                      <div className='bg-green-50 rounded-lg p-2 border border-green-200'>
                        <div className='text-xs text-green-600 font-medium mb-0.5 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          Valid From
                        </div>
                        <div className='text-sm font-bold text-green-900'>{permit.validFrom}</div>
                      </div>
                      <div className='bg-red-50 rounded-lg p-2 border border-red-200'>
                        <div className='text-xs text-red-600 font-medium mb-0.5 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          Valid Till
                        </div>
                        <div className='text-sm font-bold text-red-900'>{permit.validTill}</div>
                      </div>
                    </div>

                    {/* Route and Goods Type */}
                    {(permit.route || permit.goodsType) && (
                      <div className='bg-indigo-50 rounded-lg p-2 border border-indigo-200'>
                        <div className='text-xs text-indigo-600 font-medium mb-1'>Route & Goods</div>
                        <div className='space-y-0.5'>
                          {permit.route && (
                            <div className='text-xs font-semibold text-gray-700 flex items-start gap-1'>
                              <svg className='w-3 h-3 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                              </svg>
                              {permit.route}
                            </div>
                          )}
                          {permit.goodsType && (
                            <div className='text-xs font-semibold text-gray-700 flex items-start gap-1'>
                              <svg className='w-3 h-3 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                              </svg>
                              {permit.goodsType}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-6'>
              <div className='flex flex-col items-center justify-center py-12'>
                <div className='w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-lg'>
                  <svg className='w-10 h-10 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <h3 className='text-lg font-black text-gray-700 mb-2'>No CG Permits Found</h3>
                <p className='text-sm text-gray-500 text-center max-w-xs'>
                  {searchQuery ? 'No permits match your search criteria.' : 'Get started by adding your first CG permit.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className='hidden lg:block overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Vehicle/Permit No.</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Permit Holder</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid From</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Valid Till</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Total Fee (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Paid (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Balance (₹)</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {loading ? (
                <tr>
                  <td colSpan='9' className='px-6 py-16'>
                    <div className='flex flex-col justify-center items-center'>
                      <div className='relative'>
                        <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse shadow-lg'></div>
                        <div className='absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin'></div>
                      </div>
                      <p className='text-gray-600 mt-6'>Loading CG permits...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPermits.length > 0 ? (
                filteredPermits.map((permit) => (
                  <tr key={permit.id} className='hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group'>
                    <td className='px-6 py-5'>
                      <div className='flex flex-col gap-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <svg className='w-4 h-4 text-blue-600 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                            <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                          </svg>
                          <span className='text-[15px] font-semibold text-gray-900'>{permit.vehicleNo}</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <svg className='w-3.5 h-3.5 text-indigo-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                          <span className='text-[13px] font-medium text-gray-600'>{permit.permitNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                          {permit.permitHolder?.charAt(0) || 'P'}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-bold text-gray-900'>{permit.permitHolder}</div>
                          <div className='text-xs text-gray-500 flex items-center mt-1'>
                            <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {permit.mobileNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm'>
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold border border-green-200'>
                          <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {permit.validFrom}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center text-sm'>
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold border border-red-200'>
                          <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          {permit.validTill}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-[15px] font-bold text-gray-900'>₹{(permit.fees || 0).toLocaleString('en-IN')}</span>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                        ₹{(permit.paid || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      {(permit.balance || 0) > 0 ? (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                          ₹{(permit.balance || 0).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                          ₹0
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-5'>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(permit.validTill)}`}>
                        {getStatusText(permit.validTill)}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center justify-end gap-1'>
                        {shouldShowRenewButton(permit) ? (
                          <button
                            onClick={() => handleRenewClick(permit)}
                            className='p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 cursor-pointer'
                            title='Renew Permit'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                            </svg>
                          </button>
                        ) : (
                          <div className='w-9'></div>
                        )}
                        <button
                          onClick={() => handleViewDetails(permit)}
                          className='p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 cursor-pointer'
                          title='View Details'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditPermit(permit)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer'
                          title='Edit Permit'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleViewBill(permit)}
                          className='p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 cursor-pointer'
                          title='View Bill'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleWhatsAppShare(permit)}
                          disabled={whatsappLoading === permit.id}
                          className={`p-2 rounded-lg transition-all group-hover:scale-110 duration-200 relative flex-shrink-0 ${
                            whatsappLoading === permit.id
                              ? 'text-gray-400 bg-gray-100 cursor-wait'
                              : 'text-green-600 hover:bg-green-100 cursor-pointer'
                          }`}
                          title={whatsappLoading === permit.id ? 'Loading...' : 'Share via WhatsApp'}
                        >
                          {whatsappLoading === permit.id ? (
                            <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                          ) : (
                            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePermit(permit)}
                          className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer'
                          title='Delete Permit'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='9' className='px-6 py-16'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg'>
                        <svg className='w-12 h-12 text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                      </div>
                      <h3 className='text-xl font-black text-gray-700 mb-2'>No CG Permits Found</h3>
                      <p className='text-sm text-gray-500 mb-6 max-w-md text-center'>
                        {searchQuery ? 'No permits match your search criteria. Try adjusting your search terms.' : 'Get started by adding your first CG permit.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPermits.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalRecords={pagination.totalRecords}
            itemsPerPage={pagination.limit}
          />
        )}
      </div>

      {/* Add New CG Permit Modal */}
      <IssueCgPermitModal
        isOpen={showIssuePermitModal}
        onClose={() => {
          setShowIssuePermitModal(false)
          setInitialPermitData(null) // Clear initial data when closing
        }}
        onSubmit={handleIssuePermit}
        initialData={initialPermitData} // Pass initial data for renewal
      />

      {/* Edit CG Permit Modal */}
      <EditCgPermitModal
        isOpen={showEditPermitModal}
        onClose={() => {
          setShowEditPermitModal(false)
          setEditingPermit(null)
        }}
        onSubmit={handleUpdatePermit}
        permit={editingPermit}
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

      {/* View Details Modal */}
      {showDetailsModal && selectedPermit && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fadeIn'>
          <div className='bg-white rounded-xl md:rounded-3xl shadow-2xl w-full md:w-[95%] lg:w-[90%] xl:w-[85%] max-h-[98vh] md:max-h-[95vh] overflow-hidden animate-slideUp'>
            {/* Header */}
            <div className='sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-3 md:p-5 z-10 shadow-lg'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 md:gap-3 min-w-0'>
                  <div className='bg-white/20 backdrop-blur-lg p-1.5 md:p-2 rounded-lg md:rounded-xl flex-shrink-0'>
                    <svg className='w-4 h-4 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                  <div className='min-w-0'>
                    <h2 className='text-base md:text-xl font-bold truncate'>CG Permit Details</h2>
                    <p className='text-white/80 text-xs md:text-sm mt-0.5 truncate'>{selectedPermit.permitNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className='text-white/90 hover:text-white hover:bg-white/20 p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-200 hover:rotate-90 flex-shrink-0'
                >
                  <svg className='w-5 h-5 md:w-6 md:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='overflow-y-auto max-h-[calc(98vh-100px)] md:max-h-[calc(95vh-130px)] p-3 md:p-5'>
              <div className='grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4'>
                {/* Column 1: Permit Details */}
                <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-indigo-200'>
                  <h3 className='text-sm md:text-base font-bold text-indigo-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                    <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                    Permit Information
                  </h3>
                  <div className='grid grid-cols-2 gap-1.5 md:gap-2'>
                    {selectedPermit.permitNumber && (
                      <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Permit Number</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitNumber}</div>
                      </div>
                    )}
                    {selectedPermit.permitType && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Permit Type</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitType}</div>
                      </div>
                    )}
                    {selectedPermit.status && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Status</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>
                          <span className={`inline-flex px-2 py-1 rounded-full text-[9px] md:text-xs font-bold ${
                            selectedPermit.status === 'Active' ? 'bg-green-100 text-green-700' :
                            selectedPermit.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {selectedPermit.status}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedPermit.issueDate && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Issue Date</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.issueDate}</div>
                      </div>
                    )}
                    {selectedPermit.validFrom && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Valid From</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validFrom}</div>
                      </div>
                    )}
                    {selectedPermit.validTill && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Valid Till</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validTill}</div>
                      </div>
                    )}
                    {selectedPermit.validityPeriod && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Validity Period</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.validityPeriod} months</div>
                      </div>
                    )}
                    {selectedPermit.issuingAuthority && (
                      <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Issuing Authority</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.issuingAuthority}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Holder Details */}
                <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-purple-200'>
                  <h3 className='text-sm md:text-base font-bold text-purple-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                    <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                    Holder Details
                  </h3>
                  <div className='space-y-1.5 md:space-y-2'>
                    {selectedPermit.permitHolder && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Permit Holder</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.permitHolder}</div>
                      </div>
                    )}
                    {selectedPermit.address && selectedPermit.address !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Address</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5 leading-relaxed'>{selectedPermit.address}</div>
                      </div>
                    )}
                    {selectedPermit.mobileNumber && selectedPermit.mobileNumber !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Mobile Number</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.mobileNumber}</div>
                      </div>
                    )}
                    {selectedPermit.goodsType && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Goods Type</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.goodsType}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3: Vehicle Details */}
                <div className='bg-gradient-to-br from-blue-50 to-cyan-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-blue-200'>
                  <h3 className='text-sm md:text-base font-bold text-blue-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                    <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h4m10 0a2 2 0 104 0m-4 0h4' />
                    </svg>
                    Vehicle Details
                  </h3>
                  <div className='grid grid-cols-2 gap-1.5 md:gap-2'>
                    {selectedPermit.vehicleNo && selectedPermit.vehicleNo !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg col-span-2'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Number</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleNo}</div>
                      </div>
                    )}
                    {selectedPermit.chassisNumber && selectedPermit.chassisNumber !== 'N/A' && (
                      <div className='bg-gradient-to-br from-blue-100 to-cyan-100 p-2 md:p-2.5 rounded-lg border-2 border-blue-300 col-span-2'>
                        <div className='text-[10px] md:text-xs font-semibold text-blue-700'>Chassis Number</div>
                        <div className='text-[10px] md:text-sm font-bold text-blue-900 mt-1 font-mono break-all'>{selectedPermit.chassisNumber}</div>
                      </div>
                    )}
                    {selectedPermit.engineNumber && selectedPermit.engineNumber !== 'N/A' && (
                      <div className='bg-gradient-to-br from-green-100 to-emerald-100 p-2 md:p-2.5 rounded-lg border-2 border-green-300 col-span-2'>
                        <div className='text-[10px] md:text-xs font-semibold text-green-700 flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          </svg>
                          Engine Number
                        </div>
                        <div className='text-[10px] md:text-sm font-bold text-green-900 mt-1 font-mono break-all'>{selectedPermit.engineNumber}</div>
                      </div>
                    )}
                    {selectedPermit.vehicleType && selectedPermit.vehicleType !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Type</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleType}</div>
                      </div>
                    )}
                    {selectedPermit.vehicleModel && selectedPermit.vehicleModel !== 'N/A' && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Vehicle Model</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.vehicleModel}</div>
                      </div>
                    )}
                    {selectedPermit.ladenWeight && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Laden Weight</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.ladenWeight} kg</div>
                      </div>
                    )}
                    {selectedPermit.unladenWeight && (
                      <div className='bg-white/80 p-2 rounded-lg'>
                        <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Unladen Weight</div>
                        <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.unladenWeight} kg</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 4: Payment & Other Details */}
                <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-green-200'>
                  <h3 className='text-sm md:text-base font-bold text-green-900 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2'>
                    <svg className='w-3.5 h-3.5 md:w-4 md:h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                    Payment Details
                  </h3>
                  <div className='space-y-1.5 md:space-y-2'>
                    {selectedPermit.fees !== undefined && (
                      <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-lg border-2 border-blue-200'>
                        <div className='text-[10px] md:text-xs font-semibold text-blue-700'>Total Fee</div>
                        <div className='text-sm md:text-base font-bold text-blue-900 mt-0.5'>₹{selectedPermit.fees.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    {selectedPermit.paid !== undefined && (
                      <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-2.5 rounded-lg border-2 border-green-200'>
                        <div className='text-[10px] md:text-xs font-semibold text-green-700'>Paid Amount</div>
                        <div className='text-sm md:text-base font-bold text-green-800 mt-0.5'>₹{selectedPermit.paid.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    {selectedPermit.balance !== undefined && (
                      <div className={`p-2.5 rounded-lg border-2 ${selectedPermit.balance > 0 ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                        <div className={`text-[10px] md:text-xs font-semibold ${selectedPermit.balance > 0 ? 'text-orange-700' : 'text-green-700'}`}>Balance</div>
                        <div className={`text-sm md:text-base font-bold mt-0.5 ${selectedPermit.balance > 0 ? 'text-orange-800' : 'text-green-800'}`}>₹{selectedPermit.balance.toLocaleString('en-IN')}</div>
                      </div>
                    )}

                    {selectedPermit.insuranceDetails && selectedPermit.insuranceDetails.policyNumber !== 'N/A' && (
                      <>
                        <div className='bg-indigo-100 p-2 rounded-lg mt-3'>
                          <div className='text-[10px] md:text-xs font-bold text-indigo-800'>Insurance Details</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Policy Number</div>
                          <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.policyNumber}</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Company</div>
                          <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.company}</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Valid Upto</div>
                          <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.insuranceDetails.validUpto}</div>
                        </div>
                      </>
                    )}

                    {selectedPermit.taxDetails && selectedPermit.taxDetails.taxPaidUpto !== 'N/A' && (
                      <>
                        <div className='bg-purple-100 p-2 rounded-lg mt-3'>
                          <div className='text-[10px] md:text-xs font-bold text-purple-800'>Tax Details</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Tax Paid Upto</div>
                          <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>{selectedPermit.taxDetails.taxPaidUpto}</div>
                        </div>
                        <div className='bg-white/80 p-2 rounded-lg'>
                          <div className='text-[10px] md:text-xs font-semibold text-gray-600'>Tax Amount</div>
                          <div className='text-xs md:text-sm font-bold text-gray-900 mt-0.5'>₹{selectedPermit.taxDetails.taxAmount}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='sticky bottom-0 bg-gray-50 px-3 py-2.5 md:px-5 md:py-3 border-t border-gray-200 flex justify-end'>
              <button
                onClick={() => setShowDetailsModal(false)}
                className='px-4 py-2 md:px-6 md:py-2 bg-gray-600 text-white rounded-lg md:rounded-xl hover:bg-gray-700 transition-all duration-200 font-bold text-sm shadow-md hover:shadow-lg'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  )
}

export default CgPermit
