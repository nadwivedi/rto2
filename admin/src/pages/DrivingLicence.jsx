import { useState, useMemo, useEffect } from 'react'
import { toast } from 'react-toastify'
import QuickDLApplicationForm from '../components/QuickDLApplicationForm'
import EditDLApplicationForm from '../components/EditDLApplicationForm'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import { drivingLicenseAPI } from '../services/api'

const DrivingLicence = () => {
  // Demo data for when backend is not available
  const demoApplications = [
    {
      id: 'DL-2024-001',
      name: 'Rajesh Kumar',
      type: 'LMV',
      status: 'Approved',
      date: '2024-01-15',
      licenseNumber: 'CG071234567890',
      licenseClass: 'LMV',
      totalAmount: 1500,
      paidAmount: 1500,
      balanceAmount: 0,
      mobile: '+91 9876543210',
      email: 'rajesh.kumar@email.com'
    },
    {
      id: 'DL-2024-002',
      name: 'Priya Sharma',
      type: 'MCWG',
      status: 'Pending',
      date: '2024-02-10',
      licenseNumber: 'CG071234567891',
      licenseClass: 'MCWG',
      totalAmount: 1200,
      paidAmount: 600,
      balanceAmount: 600,
      mobile: '+91 9876543211',
      email: 'priya.sharma@email.com'
    },
    {
      id: 'DL-2024-003',
      name: 'Amit Patel',
      type: 'HMV',
      status: 'Under Review',
      date: '2024-03-05',
      licenseNumber: 'CG071234567892',
      licenseClass: 'HMV',
      totalAmount: 2000,
      paidAmount: 2000,
      balanceAmount: 0,
      mobile: '+91 9876543212',
      email: 'amit.patel@email.com'
    },
    {
      id: 'DL-2024-004',
      name: 'Sneha Verma',
      type: 'LMV',
      status: 'Rejected',
      date: '2024-01-20',
      licenseNumber: 'CG071234567893',
      licenseClass: 'LMV',
      totalAmount: 1500,
      paidAmount: 1500,
      balanceAmount: 0,
      mobile: '+91 9876543213',
      email: 'sneha.verma@email.com'
    },
    {
      id: 'DL-2024-005',
      name: 'Vikram Singh',
      type: 'TRANS',
      status: 'Approved',
      date: '2024-02-28',
      licenseNumber: 'CG071234567894',
      licenseClass: 'TRANS',
      totalAmount: 2500,
      paidAmount: 2500,
      balanceAmount: 0,
      mobile: '+91 9876543214',
      email: 'vikram.singh@email.com'
    }
  ]

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch applications from backend
  useEffect(() => {
    fetchApplications()
    fetchStatistics()
  }, [currentPage, searchQuery, statusFilter, typeFilter, sortBy, sortOrder])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder
      }

      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'All') params.applicationStatus = statusFilter.toLowerCase().replace(' ', '_')
      if (typeFilter !== 'All') params.licenseClass = typeFilter

      const response = await drivingLicenseAPI.getAll(params)

      console.log('API Response:', response) // Debug log

      // Transform backend data to match frontend format
      const transformedData = (response.data || []).map(app => {
        // Safely handle application status
        const appStatus = app.applicationStatus || 'pending'
        const formattedStatus = appStatus.charAt(0).toUpperCase() + appStatus.slice(1).replace('_', ' ')

        // Safely handle date
        let formattedDate = '-'
        try {
          if (app.createdAt) {
            formattedDate = new Date(app.createdAt).toISOString().split('T')[0]
          } else if (app.applicationDate) {
            formattedDate = app.applicationDate
          }
        } catch (err) {
          console.error('Date parsing error:', err)
        }

        return {
          id: app._id,
          name: app.name || '-',
          type: app.licenseClass || '-',
          status: formattedStatus,
          date: formattedDate,
          licenseNumber: app.drivingLicenseNumber || '-',
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
      setTotalPages(response.pagination?.totalPages || 0)
      setTotalItems(response.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Error fetching applications:', error)
      console.log('Using demo data as fallback')
      // Use demo data when backend is not available
      setApplications(demoApplications)
      setTotalPages(1)
      setTotalItems(demoApplications.length)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await drivingLicenseAPI.getStatistics()
      setStatistics({
        total: response.data.applications.total,
        approved: response.data.applications.approved,
        pending: response.data.applications.pending,
        rejected: response.data.applications.rejected
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
      // Use demo statistics when backend is not available
      setStatistics({
        total: demoApplications.length,
        approved: demoApplications.filter(app => app.status === 'Approved').length,
        pending: demoApplications.filter(app => app.status === 'Pending').length,
        rejected: demoApplications.filter(app => app.status === 'Rejected').length
      })
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'approved': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
      case 'under review': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'under_review': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'rejected': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
    }
  }

  // Use applications directly from backend (backend handles filtering, sorting, and pagination)
  const currentApplications = applications

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (app) => {
    setSelectedApplication(app)
    setIsDetailModalOpen(true)
  }

  const handleEdit = (app) => {
    setSelectedApplication(app)
    setIsEditFormOpen(true)
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
        applicationDate: formData.applicationDate,
        licenseClass: formData.licenseClass,
        licenseNumber: formData.licenseNumber,
        qualification: formData.qualification,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        emergencyContact: formData.emergencyContact,
        emergencyRelation: formData.emergencyRelation,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        balanceAmount: parseFloat(formData.balanceAmount) || 0,
        applicationStatus: 'pending',
        learningLicenseNumber: formData.existingLLNumber || null
      }

      const response = await drivingLicenseAPI.create(applicationData)

      if (response.success) {
        toast.success('Application submitted successfully!', { autoClose: 700 })
        fetchApplications() // Refresh the list
        fetchStatistics() // Refresh statistics
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
        applicationDate: formData.applicationDate,
        licenseClass: formData.licenseClass,
        licenseNumber: formData.licenseNumber,
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

      const response = await drivingLicenseAPI.update(selectedApplication.id, applicationData)

      if (response.success) {
        toast.success('Application updated successfully!', { autoClose: 700 })
        setIsEditFormOpen(false)
        fetchApplications() // Refresh the list
        fetchStatistics() // Refresh statistics
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application. Please try again.', { autoClose: 700 })
    }
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 pt-20 lg:pt-20 max-w-[1800px] mx-auto'>
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
      <div className='mb-6 md:mb-8'>
        <h1 className='text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2'>Driving Licence Applications</h1>
        <p className='text-sm md:text-base text-gray-600'>Manage and review driving licence applications</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>📊</div>
            <div className='text-xl font-black bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent'>{statistics.total}</div>
          </div>
          <div className='text-xs font-semibold text-gray-600'>Total Applications</div>
        </div>
        <div className='bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 shadow-md border border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>✅</div>
            <div className='text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>{statistics.approved}</div>
          </div>
          <div className='text-xs font-semibold text-green-700'>Approved</div>
        </div>
        <div className='bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-4 shadow-md border border-yellow-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>⏳</div>
            <div className='text-xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent'>{statistics.pending}</div>
          </div>
          <div className='text-xs font-semibold text-yellow-700'>Pending</div>
        </div>
        <div className='bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-4 shadow-md border border-red-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='text-2xl'>❌</div>
            <div className='text-xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'>{statistics.rejected}</div>
          </div>
          <div className='text-xs font-semibold text-red-700'>Rejected</div>
        </div>
      </div>

      {/* Applications Table */}
      <div className='bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden'>
        <div className='p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4'>
            <h2 className='text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent'>Applications List</h2>

            {/* Search Bar */}
            <div className='flex flex-col md:flex-row gap-3 w-full md:w-auto'>
              <div className='relative flex-1 md:w-80'>
                <input
                  type='text'
                  placeholder='Search by DL number or name...'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className='w-full pl-10 pr-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all shadow-sm'
                />
                <svg
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className='px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-300 font-semibold whitespace-nowrap cursor-pointer transform hover:scale-105'
              >
                + New Application
              </button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className='flex flex-col md:flex-row gap-2 md:gap-3 mt-3 md:mt-4'>
            {/* First row on mobile - Status and Type filters */}
            <div className='grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0 md:contents'>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className='px-3 md:px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-sm md:text-base font-medium bg-white shadow-sm hover:border-indigo-300 transition-all'
              >
                <option value='All'>All Status</option>
                <option value='Pending'>Pending</option>
                <option value='Under Review'>Under Review</option>
                <option value='Approved'>Approved</option>
                <option value='Rejected'>Rejected</option>
              </select>

              {/* License Class Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className='px-3 md:px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-sm md:text-base font-medium bg-white shadow-sm hover:border-indigo-300 transition-all'
              >
                <option value='All'>All License Types</option>
                <option value='MCWG'>MCWG (Two Wheeler)</option>
                <option value='LMV'>LMV (Four Wheeler)</option>
                <option value='MCWG+LMV'>MCWG+LMV (Both)</option>
                <option value='HMV'>HMV (Heavy Vehicle)</option>
                <option value='Commercial'>Commercial</option>
                <option value='Transport'>Transport</option>
              </select>
            </div>

            {/* Second row on mobile - Sort options */}
            <div className='grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0 md:contents'>
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-3 md:px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-sm md:text-base font-medium bg-white shadow-sm hover:border-indigo-300 transition-all'
              >
                <option value='date'>Sort by Date</option>
                <option value='name'>Sort by Name</option>
                <option value='status'>Sort by Status</option>
                <option value='id'>Sort by ID</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className='px-3 md:px-4 py-2 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all font-semibold text-sm md:text-base bg-white shadow-sm'
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>

            {/* Clear Filters - Full width on mobile */}
            {(statusFilter !== 'All' || typeFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('All')
                  setTypeFilter('All')
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className='px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all font-semibold text-sm md:text-base w-full md:w-auto shadow-md hover:shadow-lg'
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results count */}
          <div className='mt-4 text-sm font-semibold text-gray-700'>
            Showing {currentApplications.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 to-purple-600'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Applicant Name</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>License Class</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>License Number</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Date</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {loading ? (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='animate-spin mx-auto h-12 w-12 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      <p className='text-lg font-semibold text-gray-600'>Loading applications...</p>
                    </div>
                  </td>
                </tr>
              ) : currentApplications.length > 0 ? (
                currentApplications.map((app) => (
                  <tr key={app.id} className='hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200'>
                    <td className='px-6 py-4 text-sm font-semibold text-gray-800'>{app.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{app.type}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{app.licenseNumber}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{app.date}</td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-6'>
                        <button
                          onClick={() => handleViewDetails(app)}
                          className='text-indigo-600 hover:text-indigo-800 font-bold text-sm cursor-pointer hover:underline transition-all'
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(app)}
                          className='text-blue-600 hover:text-blue-800 font-bold text-sm cursor-pointer hover:underline transition-all'
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center'>
                    <div className='text-gray-400'>
                      <svg className='mx-auto h-12 w-12 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-lg font-semibold text-gray-600'>No applications found</p>
                      <p className='text-sm text-gray-500 mt-1'>Click "New Application" to add your first application</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='text-sm font-semibold text-gray-700'>
                Page {currentPage} of {totalPages}
              </div>

              <div className='flex items-center gap-2'>
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className='flex gap-1'>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                            currentPage === pageNumber
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-110'
                              : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className='px-2 py-2 text-gray-400 font-bold'>...</span>
                    }
                    return null
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DrivingLicence
