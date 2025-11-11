import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import QuickDLApplicationForm from './components/QuickDLApplicationForm'
import EditDLApplicationForm from './components/EditDLApplicationForm'
import ApplicationDetailModal from './components/ApplicationDetailModal'
import Pagination from '../../components/Pagination'
import AddButton from '../../components/AddButton'
import SearchBar from '../../components/SearchBar'
import StatisticsCard from '../../components/StatisticsCard'
import { getTheme } from '../../context/ThemeContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const DrivingLicence = () => {
  const theme = getTheme()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')
  const [dlExpiryFilter, setDlExpiryFilter] = useState('All')
  const [llExpiryFilter, setLlExpiryFilter] = useState('All')
  const [llExpiringCount, setLlExpiringCount] = useState(0)
  const [dlExpiringCount, setDlExpiringCount] = useState(0)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })

  // Fetch applications from backend
  useEffect(() => {
    fetchApplications(1)
  }, [searchQuery, typeFilter, paymentStatusFilter, dlExpiryFilter, llExpiryFilter])

  // Fetch expiring counts on component mount
  useEffect(() => {
    fetchExpiringCounts()
  }, [])

  const fetchExpiringCounts = async () => {
    try {
      console.log('Fetching expiring counts...')

      // Fetch LL expiring count
      const llResponse = await axios.get(`${API_URL}/api/driving-licenses/ll-expiring-soon`, {
        params: { page: 1, limit: 1 }
      })
      console.log('LL Response:', llResponse.data)
      const llCount = llResponse.data.pagination?.totalItems || 0
      console.log('LL Count:', llCount)
      setLlExpiringCount(llCount)

      // Fetch DL expiring count
      const dlResponse = await axios.get(`${API_URL}/api/driving-licenses/dl-expiring-soon`, {
        params: { page: 1, limit: 1 }
      })
      console.log('DL Response:', dlResponse.data)
      const dlCount = dlResponse.data.pagination?.totalItems || 0
      console.log('DL Count:', dlCount)
      setDlExpiringCount(dlCount)

      console.log('Expiring counts updated - LL:', llCount, 'DL:', dlCount)
    } catch (error) {
      console.error('Error fetching expiring counts:', error)
      setLlExpiringCount(0)
      setDlExpiringCount(0)
    }
  }

  const fetchApplications = async (page = pagination.currentPage) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: pagination.limit
      }

      if (searchQuery) params.search = searchQuery
      if (typeFilter !== 'All') params.licenseClass = typeFilter
      if (paymentStatusFilter !== 'All') params.paymentStatus = paymentStatusFilter

      const response = await axios.get(`${API_URL}/api/driving-licenses`, { params })

      console.log('API Response:', response.data) // Debug log

      // Transform backend data to match frontend format
      const transformedData = (response.data.data || []).map(app => {

        // Safely handle date
        let formattedDate = '-'
        try {
          if (app.createdAt) {
            const d = new Date(app.createdAt);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            formattedDate = `${day}-${month}-${year}`;
          }
        } catch (err) {
          console.error('Date parsing error:', err)
        }

        // Format license issue date (prioritize new field, fallback to old field)
        let formattedIssueDate = '-'
        try {
          const issueDate = app.LicenseIssueDate || app.drivingLicenseIssueDate
          if (issueDate) {
            const d = new Date(issueDate);
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              formattedIssueDate = `${day}-${month}-${year}`;
            }
          }
        } catch (err) {
          console.error('Issue date parsing error:', err)
        }

        // Format license expiry date (prioritize new field, fallback to old field)
        let formattedExpiryDate = '-'
        try {
          const expiryDate = app.LicenseExpiryDate || app.drivingLicenseExpiryDate
          if (expiryDate) {
            const d = new Date(expiryDate);
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              formattedExpiryDate = `${day}-${month}-${year}`;
            }
          }
        } catch (err) {
          console.error('Expiry date parsing error:', err)
        }

        return {
          id: app._id,
          name: app.name || '-',
          type: app.licenseClass || '-',
          date: formattedDate,
          licenseNumber: app.LicenseNumber || app.drivingLicenseNumber || '-',
          issueDate: formattedIssueDate,
          expiryDate: formattedExpiryDate,
          licenseClass: app.licenseClass || '-',
          totalAmount: app.totalAmount || 0,
          paidAmount: app.paidAmount || 0,
          balanceAmount: app.balanceAmount || 0,
          mobile: app.mobileNumber || '-',
          email: app.email || '-',
          fullData: app
        }
      })

      console.log('Transformed Data:', transformedData) // Debug log

      setApplications(transformedData)

      // Update pagination state
      if (response.data.pagination) {
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalRecords: response.data.pagination.totalItems,
          limit: pagination.limit
        })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications. Please try again.', { autoClose: 700 })
      setApplications([])
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: pagination.limit
      })
    } finally {
      setLoading(false)
    }
  }


  // Apply client-side filtering for DL and LL expiry
  const currentApplications = useMemo(() => {
    let filtered = [...applications]

    const today = new Date()

    // Filter by DL Expiry
    if (dlExpiryFilter !== 'All') {
      filtered = filtered.filter(app => {
        if (!app.expiryDate || app.expiryDate === '-') return false

        try {
          const [day, month, year] = app.expiryDate.split('-')
          const expiryDate = new Date(year, month - 1, day)
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

          if (dlExpiryFilter === '30') {
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
          } else if (dlExpiryFilter === '60') {
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 60
          }
        } catch (e) {
          return false
        }
        return true
      })
    }

    // Filter by LL Expiry
    if (llExpiryFilter !== 'All') {
      filtered = filtered.filter(app => {
        const llExpiryDate = app.fullData?.learningLicenseExpiryDate
        if (!llExpiryDate) return false

        try {
          const expiry = new Date(llExpiryDate)
          const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

          if (llExpiryFilter === '30') {
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
          } else if (llExpiryFilter === '45') {
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 45
          }
        } catch (e) {
          return false
        }
        return true
      })
    }

    return filtered
  }, [applications, dlExpiryFilter, llExpiryFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination.totalRecords

    // Use the fetched counts instead of calculating from current page
    const expiringSoon = dlExpiringCount
    const llExpiringSoon = llExpiringCount

    const totalPending = applications.reduce((sum, app) => sum + (app.balanceAmount || 0), 0)
    const pendingCount = applications.filter(app => (app.balanceAmount || 0) > 0).length

    return {
      total,
      expiringSoon,
      llExpiringSoon,
      totalPending,
      pendingCount
    }
  }, [applications, pagination.totalRecords, dlExpiringCount, llExpiringCount])

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchApplications(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewDetails = (app) => {
    setSelectedApplication(app)
    setIsDetailModalOpen(true)
  }

  const handleEdit = (app) => {
    setSelectedApplication(app)
    setIsEditFormOpen(true)
  }

  const handleDelete = async (app) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this driving license application?\n\n` +
      `License Number: ${app.licenseNumber || 'N/A'}\n` +
      `Name: ${app.name}\n` +
      `License Class: ${app.licenseClass}\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmDelete) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/driving-licenses/${app.id}`)

      if (response.data.success) {
        toast.success('Application deleted successfully!', { autoClose: 700 })
        fetchApplications() // Refresh the list
        fetchExpiringCounts() // Refresh the expiring counts
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      toast.error('Failed to delete application. Please try again.', { autoClose: 700 })
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      // Helper function to convert DD-MM-YYYY to ISO date format
      const convertDateToISO = (dateStr) => {
        if (!dateStr) return null
        const [day, month, year] = dateStr.split('-')
        return `${year}-${month}-${day}` // Convert to YYYY-MM-DD format
      }

      // Transform form data to match backend schema
      const applicationData = {
        name: formData.name,
        dateOfBirth: convertDateToISO(formData.dateOfBirth),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        licenseClass: formData.licenseClass,
        licenseNumber: formData.licenseNumber,
        licenseIssueDate: formData.licenseIssueDate,
        licenseExpiryDate: formData.licenseExpiryDate,
        learningLicenseNumber: formData.learningLicenseNumber,
        learningLicenseIssueDate: formData.learningLicenseIssueDate,
        learningLicenseExpiryDate: formData.learningLicenseExpiryDate,
        qualification: formData.qualification,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        emergencyContact: formData.emergencyContact,
        emergencyRelation: formData.emergencyRelation,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        balanceAmount: parseFloat(formData.balanceAmount) || 0,
        applicationStatus: 'pending'
      }

      const response = await axios.post(`${API_URL}/api/driving-licenses`, applicationData)

      if (response.data.success) {
        toast.success('Application submitted successfully!', { autoClose: 700 })
        fetchApplications() // Refresh the list
        fetchExpiringCounts() // Refresh the expiring counts
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.', { autoClose: 700 })
    }
  }

  const handleEditSubmit = async (formData) => {
    try {
      // Helper function to convert DD-MM-YYYY to ISO date format
      const convertDateToISO = (dateStr) => {
        if (!dateStr) return null
        const [day, month, year] = dateStr.split('-')
        return `${year}-${month}-${day}` // Convert to YYYY-MM-DD format
      }

      // Transform form data to match backend schema
      const applicationData = {
        name: formData.name,
        dateOfBirth: convertDateToISO(formData.dateOfBirth),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        licenseClass: formData.licenseClass,
        licenseNumber: formData.licenseNumber,
        licenseIssueDate: formData.licenseIssueDate,
        licenseExpiryDate: formData.licenseExpiryDate,
        learningLicenseNumber: formData.learningLicenseNumber,
        learningLicenseIssueDate: formData.learningLicenseIssueDate,
        learningLicenseExpiryDate: formData.learningLicenseExpiryDate,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        drivingLicenseIssueDate: convertDateToISO(formData.drivingLicenseIssueDate),
        drivingLicenseExpiryDate: convertDateToISO(formData.drivingLicenseExpiryDate),
        qualification: formData.qualification,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        emergencyContact: formData.emergencyContact,
        emergencyRelation: formData.emergencyRelation,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        balanceAmount: parseFloat(formData.balanceAmount) || 0,
        applicationStatus: formData.applicationStatus,
        notes: formData.notes
      }

      const response = await axios.put(`${API_URL}/api/driving-licenses/${selectedApplication.id}`, applicationData)

      if (response.data.success) {
        toast.success('Application updated successfully!', { autoClose: 700 })
        setIsEditFormOpen(false)
        fetchApplications() // Refresh the list
        fetchExpiringCounts() // Refresh the expiring counts
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application. Please try again.', { autoClose: 700 })
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-5'>
              <StatisticsCard
                title='Total Applications'
                value={stats.total}
                color='blue'
                isActive={dlExpiryFilter === 'All' && llExpiryFilter === 'All' && paymentStatusFilter === 'All'}
                onClick={() => {
                  setDlExpiryFilter('All')
                  setLlExpiryFilter('All')
                  setPaymentStatusFilter('All')
                }}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='DL Expiring Soon'
                value={stats.expiringSoon}
                color='purple'
                isActive={dlExpiryFilter === '30'}
                onClick={() => {
                  setDlExpiryFilter(dlExpiryFilter === '30' ? 'All' : '30')
                  setLlExpiryFilter('All')
                  setPaymentStatusFilter('All')
                }}
                subtext='Within 30 days'
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='LL Expiring Soon'
                value={stats.llExpiringSoon}
                color='yellow'
                isActive={llExpiryFilter === '30'}
                onClick={() => {
                  setLlExpiryFilter(llExpiryFilter === '30' ? 'All' : '30')
                  setDlExpiryFilter('All')
                  setPaymentStatusFilter('All')
                }}
                subtext='Within 30 days'
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
              <StatisticsCard
                title='Pending Payment'
                value={stats.pendingCount}
                color='orange'
                isActive={paymentStatusFilter === 'Pending'}
                onClick={() => {
                  setPaymentStatusFilter(paymentStatusFilter === 'Pending' ? 'All' : 'Pending')
                  setDlExpiryFilter('All')
                  setLlExpiryFilter('All')
                }}
                extraValue={`₹${stats.totalPending.toLocaleString('en-IN')}`}
                icon={
                  <svg className='w-4 h-4 lg:w-6 lg:h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                }
              />
            </div>
          </div>

          <QuickDLApplicationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <EditDLApplicationForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleEditSubmit}
        application={selectedApplication}
      />

      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        application={selectedApplication}
      />

      {/* Applications Table */}
      <div className='bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'>
        <div className='px-3 lg:px-6 py-3 lg:py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          {/* All Filters, Search and Action in One Line */}
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              placeholder='Search by DL number or name...'
            />

            {/* Filters Group */}
            <div className='flex flex-wrap gap-2'>


              {/* License Class Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                }}
                className='w-[calc(50%-0.25rem)] lg:w-auto px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Types</option>
                <option value='MCWG'>MCWG</option>
                <option value='LMV'>LMV</option>
                <option value='MCWG+LMV'>Both</option>
                <option value='HMV'>HMV</option>
                <option value='Commercial'>Commercial</option>
                <option value='Transport'>Transport</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value)
                }}
                className='w-[calc(50%-0.25rem)] lg:w-auto px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Status</option>
                <option value='Paid'>Paid</option>
                <option value='Pending'>Pending</option>
              </select>

              {/* DL Expiry Filter */}
              <select
                value={dlExpiryFilter}
                onChange={(e) => {
                  setDlExpiryFilter(e.target.value)
                }}
                className='w-[calc(50%-0.25rem)] lg:w-auto px-2 lg:px-3 py-2 lg:py-3 text-xs lg:text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 font-semibold bg-white hover:border-purple-300 transition-all shadow-sm'
              >
                <option value='All'>DL Expiry</option>
                <option value='30'>30 Days</option>
                <option value='60'>60 Days</option>
              </select>

              {/* LL Expiry Filter */}
              <select
                value={llExpiryFilter}
                onChange={(e) => {
                  setLlExpiryFilter(e.target.value)
                }}
                className='w-[calc(50%-0.25rem)] lg:w-auto px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 font-semibold bg-white hover:border-yellow-300 transition-all shadow-sm'
              >
                <option value='All'>LL Expiry</option>
                <option value='30'>30 Days</option>
                <option value='45'>45 Days</option>
              </select>

              {/* Clear Filters */}
              {(typeFilter !== 'All' || searchQuery || paymentStatusFilter !== 'All' || dlExpiryFilter !== 'All' || llExpiryFilter !== 'All') && (
                <button
                  onClick={() => {
                    setTypeFilter('All')
                    setSearchQuery('')
                    setPaymentStatusFilter('All')
                    setDlExpiryFilter('All')
                    setLlExpiryFilter('All')
                  }}
                  className='px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg'
                >
                  Clear
                </button>
              )}
            </div>

            {/* New Application Button */}
            <AddButton onClick={() => setIsFormOpen(true)} title='New Application' />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className='block lg:hidden'>
          {loading ? (
            <div className='p-8 text-center'>
              <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
              <p className='mt-4 text-gray-600 font-semibold'>Loading applications...</p>
            </div>
          ) : currentApplications.length > 0 ? (
            <div className='p-3 space-y-3'>
              {currentApplications.map((app) => (
                <div key={app.id} className='bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
                  {/* Card Header with Avatar and Actions */}
                  <div className='bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md'>
                        {app.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className='text-sm font-bold text-gray-900'>{app.name}</div>
                        <div className='text-xs text-gray-600 flex items-center mt-0.5'>
                          <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                          </svg>
                          {app.mobile}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center gap-1.5'>
                      <button
                        onClick={() => handleViewDetails(app)}
                        className='p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all cursor-pointer'
                        title='View Details'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(app)}
                        className='p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all cursor-pointer'
                        title='Edit'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className='p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all cursor-pointer'
                        title='Delete'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className='p-3 space-y-2.5'>
                    {/* License Class & Number */}
                    <div className='flex items-center justify-between pb-2 border-b border-gray-100'>
                      <div>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase'>License Class</p>
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 mt-1'>
                          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                            <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                          </svg>
                          {app.type}
                        </span>
                      </div>
                      <div className='text-right'>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase'>DL Number</p>
                        <div className='text-xs font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 mt-1'>
                          {app.licenseNumber}
                        </div>
                      </div>
                    </div>

                    {/* Payment Status Badge */}
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500 font-semibold uppercase'>Payment Status</span>
                      {app.balanceAmount === 0 ? (
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200'>
                          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                          </svg>
                          Paid
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200'>
                          <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                          </svg>
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div className='grid grid-cols-3 gap-2 pt-2 border-t border-gray-100'>
                      <div>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase'>Total Amount</p>
                        <p className='text-sm font-bold text-gray-800'>₹{app.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase'>Paid</p>
                        <p className='text-sm font-bold text-emerald-600'>₹{app.paidAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase'>Balance</p>
                        <p className={`text-sm font-bold ${app.balanceAmount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                          ₹{app.balanceAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* License Dates */}
                    <div className='grid grid-cols-2 gap-2 pt-2 border-t border-gray-100'>
                      <div>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                          <svg className='w-3 h-3 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          Issue Date
                        </p>
                        <p className='text-xs font-semibold text-gray-700'>{app.issueDate || '-'}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-500 font-semibold uppercase flex items-center gap-1'>
                          <svg className='w-3 h-3 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                          </svg>
                          Expiry Date
                        </p>
                        <p className='text-xs font-semibold text-gray-700'>{app.expiryDate || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-8 text-center'>
              <div className='text-gray-400'>
                <svg className='mx-auto h-12 w-12 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <p className='text-sm font-semibold text-gray-600'>No applications found</p>
                <p className='text-xs text-gray-500 mt-1'>Click "New Application" to add your first application</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className='hidden lg:block overflow-x-auto'>
          <table className='w-full'>
            <thead className={theme.tableHeader}>
              <tr>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Applicant Details</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Class</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Number</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Issue Date</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Expiry Date</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Total Amount</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Paid Amount</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Balance</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Status</th>
                <th className='px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wide'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan='10' className='px-4 py-8 text-center'>
                    <div className='text-gray-400'>
                      <svg className='animate-spin mx-auto h-8 w-8 mb-3 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      <p className='text-sm font-semibold text-gray-600'>Loading applications...</p>
                    </div>
                  </td>
                </tr>
              ) : currentApplications.length > 0 ? (
                currentApplications.map((app, index) => (
                  <tr key={app.id} className='hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 group'>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md'>
                          {app.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className='text-sm font-bold text-gray-900'>{app.name}</div>
                          <div className='text-xs text-gray-500 flex items-center mt-1'>
                            <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                            {app.mobile}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-blue-100 text-blue-800 border-blue-200'>
                        <svg className='w-3 h-3 mr-1.5' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z' />
                        </svg>
                        {app.type}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
                        {app.licenseNumber}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center text-sm text-green-600 font-semibold'>
                        <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {app.issueDate || '-'}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center text-sm text-red-600 font-semibold'>
                        <svg className='w-4 h-4 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {app.expiryDate || '-'}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <span className='text-sm font-bold text-gray-800'>₹{app.totalAmount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200'>
                        ₹{app.paidAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      {app.balanceAmount > 0 ? (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200'>
                          ₹{app.balanceAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>
                          ₹0
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-4'>
                      {app.balanceAmount === 0 ? (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200'>
                          <svg className='w-3 h-3 mr-1.5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                          </svg>
                          Paid
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200'>
                          <svg className='w-3 h-3 mr-1.5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                          </svg>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleViewDetails(app)}
                          className='p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='View Details'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(app)}
                          className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='Edit Application'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(app)}
                          className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all group-hover:scale-110 duration-200'
                          title='Delete Application'
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
                  <td colSpan='10' className='px-4 py-8 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-8 w-8 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-sm font-semibold text-gray-600'>No applications found</p>
                      <p className='text-xs text-gray-500 mt-1'>Click "New Application" to add your first application</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && currentApplications.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalRecords={pagination.totalRecords}
            itemsPerPage={pagination.limit}
          />
        )}
        </div>
        </div>
      </div>
    </>
  )
}

export default DrivingLicence
