import { useState, useMemo, useEffect } from 'react'
import { toast } from 'react-toastify'
import QuickDLApplicationForm from '../components/QuickDLApplicationForm'
import EditDLApplicationForm from '../components/EditDLApplicationForm'
import ApplicationDetailModal from '../components/ApplicationDetailModal'
import MobileHeader from '../components/MobileHeader'
import { drivingLicenseAPI } from '../services/api'

const DrivingLicence = ({ setIsSidebarOpen }) => {
  // Demo data for when backend is not available
  const demoApplications = [
    {
      id: 'DL-2024-001',
      name: 'Rajesh Kumar',
      type: 'LMV',
      status: 'Approved',
      date: '2024-01-15',
      issueDate: '2024-01-20',
      expiryDate: '2044-01-20',
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
      issueDate: '2024-02-15',
      expiryDate: '2044-02-15',
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
      issueDate: '2024-03-10',
      expiryDate: '2044-03-10',
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
      issueDate: '2024-01-25',
      expiryDate: '2044-01-25',
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
      issueDate: '2024-03-05',
      expiryDate: '2044-03-05',
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
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('applicationDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Fetch applications from backend
  useEffect(() => {
    fetchApplications()
  }, [currentPage, searchQuery, typeFilter, sortBy, sortOrder, paymentStatusFilter])

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
      if (typeFilter !== 'All') params.licenseClass = typeFilter
      if (paymentStatusFilter !== 'All') params.paymentStatus = paymentStatusFilter

      const response = await drivingLicenseAPI.getAll(params)

      console.log('API Response:', response) // Debug log

      // Transform backend data to match frontend format
      const transformedData = (response.data || []).map(app => {

        // Safely handle date
        let formattedDate = '-'
        try {
          if (app.createdAt) {
            const d = new Date(app.createdAt);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            formattedDate = `${day}-${month}-${year}`;
          } else if (app.applicationDate) {
            const d = new Date(app.applicationDate);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            formattedDate = `${day}-${month}-${year}`;
          }
        } catch (err) {
          console.error('Date parsing error:', err)
        }

        return {
          id: app._id,
          name: app.name || '-',
          type: app.licenseClass || '-',
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


  // Use applications directly from backend (backend handles filtering, sorting, and pagination)
  const currentApplications = applications

  // Calculate statistics
  const stats = useMemo(() => {
    const total = totalItems
    const totalRevenue = applications.reduce((sum, app) => sum + (app.totalAmount || 0), 0)
    const totalPaid = applications.reduce((sum, app) => sum + (app.paidAmount || 0), 0)
    const totalPending = applications.reduce((sum, app) => sum + (app.balanceAmount || 0), 0)

    return {
      total,
      totalRevenue,
      totalPaid,
      totalPending
    }
  }, [applications, totalItems])

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
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application. Please try again.', { autoClose: 700 })
    }
  }

  return (
    <>
      <MobileHeader setIsSidebarOpen={setIsSidebarOpen} />
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'>
        <div className='w-full px-3 md:px-4 lg:px-6 pt-20 lg:pt-20 pb-8'>

          {/* Statistics Cards */}
          <div className='mb-2 mt-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5'>
              {/* Total Applications */}
              <div className='bg-white rounded-lg shadow-md border border-indigo-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Applications</p>
                    <h3 className='text-2xl font-black text-gray-800'>{stats.total}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className='bg-white rounded-lg shadow-md border border-purple-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Revenue</p>
                    <h3 className='text-2xl font-black text-gray-800'>₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Paid */}
              <div className='bg-white rounded-lg shadow-md border border-emerald-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Total Paid</p>
                    <h3 className='text-2xl font-black text-emerald-600'>₹{stats.totalPaid.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Amount */}
              <div className='bg-white rounded-lg shadow-md border border-orange-100 p-3.5 hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1'>Pending Amount</p>
                    <h3 className='text-2xl font-black text-orange-600'>₹{stats.totalPending.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className='w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md'>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
              </div>
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
        <div className='px-6 py-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200'>
          {/* All Filters, Search and Action in One Line */}
          <div className='flex flex-col lg:flex-row gap-2 items-stretch lg:items-center'>
            {/* Search Bar */}
            <div className='relative flex-1 lg:max-w-md'>
              <input
                type='text'
                placeholder='Search by DL number or name...'
                value={searchQuery}
                onChange={handleSearchChange}
                className='w-full pl-11 pr-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all bg-white shadow-sm'
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


              {/* License Class Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Types</option>
                <option value='MCWG'>MCWG</option>
                <option value='LMV'>LMV</option>
                <option value='MCWG+LMV'>Both</option>
                <option value='HMV'>HMV</option>
                <option value='Commercial'>Commercial</option>
                <option value='Transport'>Transport</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='applicationDate'>By Date</option>
                <option value='name'>By Name</option>
                <option value='id'>By ID</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 font-semibold bg-white hover:border-indigo-300 transition-all shadow-sm'
              >
                <option value='All'>All Statuses</option>
                <option value='Paid'>Paid</option>
                <option value='Pending'>Pending</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className='px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all font-bold bg-white shadow-sm'
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>

              {/* Clear Filters */}
              {(typeFilter !== 'All' || searchQuery || paymentStatusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setTypeFilter('All')
                    setSearchQuery('')
                    setPaymentStatusFilter('All')
                    setCurrentPage(1)
                  }}
                  className='px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-bold shadow-md hover:shadow-lg'
                >
                  Clear
                </button>
              )}
            </div>

            {/* New Application Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className='px-5 py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold whitespace-nowrap cursor-pointer lg:ml-auto shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <span className='flex items-center gap-2'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                New Application
              </span>
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'>
              <tr>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Applicant Details</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Class</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>License Number</th>
                <th className='px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wide'>Application Date</th>
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
                  <td colSpan='11' className='px-4 py-8 text-center'>
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
                      <div className='flex items-center text-sm text-gray-700 font-medium'>
                        <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        {app.date}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center text-sm text-emerald-700 font-medium'>
                        <svg className='w-4 h-4 mr-2 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        {app.issueDate || '-'}
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center text-sm text-orange-700 font-medium'>
                        <svg className='w-4 h-4 mr-2 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='11' className='px-4 py-8 text-center'>
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
        {totalItems > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='text-sm font-bold text-gray-700'>
                Page {currentPage} of {totalPages}
              </div>

              <div className='flex items-center gap-2'>
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-indigo-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className='flex gap-1.5'>
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
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            currentPage === pageNumber
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-110'
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
                      return <span key={pageNumber} className='px-2 py-2 text-gray-400 font-bold text-sm'>...</span>
                    }
                    return null
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
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
      </div>
    </>
  )
}

export default DrivingLicence
