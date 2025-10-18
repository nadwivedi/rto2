import { useState } from 'react'

const ApplicationDetailModal = ({ isOpen, onClose, application }) => {
  const [status, setStatus] = useState(application?.status || 'Pending')
  const [remarks, setRemarks] = useState('')

  if (!isOpen || !application) return null

  // Helper function to format date from ISO to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Under Review': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    // In production, this would trigger an API call
    console.log('Status changed to:', newStatus)
  }

  const handleApprove = () => {
    handleStatusChange('Approved')
    // Additional approval logic here
  }

  const handleReject = () => {
    if (remarks.trim()) {
      handleStatusChange('Rejected')
      // Additional rejection logic here
    } else {
      alert('Please provide remarks for rejection')
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4'>
      <div className='bg-white rounded-none md:rounded-2xl shadow-2xl max-w-6xl w-full h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-6 text-white'>
          <div className='flex justify-between items-start'>
            <div>
              <div className='flex items-center gap-2 md:gap-3 mb-2'>
                <h2 className='text-lg md:text-2xl font-bold'>Application Details</h2>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold border ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
              <p className='text-xs md:text-sm text-indigo-100'>Application ID: {application.id}</p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:bg-white/20 rounded-lg p-2 transition'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4 md:p-6'>
          {/* Application Details */}
          <div className='space-y-6'>
            {/* Personal Information */}
            <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='text-2xl'>👤</span>
                Personal Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Full Name - Always show */}
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Full Name</label>
                  <p className='text-gray-800 font-medium mt-1'>{application.name}</p>
                </div>

                {/* Date of Birth - Always show */}
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Date of Birth</label>
                  <p className='text-gray-800 font-medium mt-1'>{formatDate(application.fullData?.dateOfBirth) || '15-08-1995'}</p>
                </div>

                {/* Gender - Always show */}
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Gender</label>
                  <p className='text-gray-800 font-medium mt-1'>{application.fullData?.gender || 'Male'}</p>
                </div>

                {/* Father's Name - Always show */}
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Father's Name</label>
                  <p className='text-gray-800 font-medium mt-1'>{application.fullData?.fatherName || 'Ramesh Kumar'}</p>
                </div>

                {/* Blood Group - Show only if filled */}
                {application.fullData?.bloodGroup && (
                  <div>
                    <label className='text-sm font-semibold text-gray-600'>Blood Group</label>
                    <p className='text-gray-800 font-medium mt-1'>{application.fullData.bloodGroup}</p>
                  </div>
                )}

                {/* Mother's Name - Show only if filled */}
                {application.fullData?.motherName && (
                  <div>
                    <label className='text-sm font-semibold text-gray-600'>Mother's Name</label>
                    <p className='text-gray-800 font-medium mt-1'>{application.fullData.motherName}</p>
                  </div>
                )}

                {/* Education - Show only if filled */}
                {application.fullData?.qualification && (
                  <div>
                    <label className='text-sm font-semibold text-gray-600'>Education</label>
                    <p className='text-gray-800 font-medium mt-1'>{application.fullData.qualification}</p>
                  </div>
                )}

                {/* Phone Number - Always show */}
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Phone Number</label>
                  <p className='text-gray-800 font-medium mt-1'>{application.mobile || application.fullData?.mobileNumber || '+91 9876543210'}</p>
                </div>

                {/* Email - Show only if filled */}
                {(application.email || application.fullData?.email) && (
                  <div>
                    <label className='text-sm font-semibold text-gray-600'>Email</label>
                    <p className='text-gray-800 font-medium mt-1'>{application.email || application.fullData?.email}</p>
                  </div>
                )}

                {/* Address - Always show */}
                <div className='md:col-span-3'>
                  <label className='text-sm font-semibold text-gray-600'>Address</label>
                  <p className='text-gray-800 font-medium mt-1'>
                    {application.fullData?.address || '123, MG Road, Sector 15, Mumbai, Maharashtra - 400001'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 relative'>
              {/* PAID Stamp - Show only when balance is 0 */}
              {(application.fullData?.balanceAmount === 0 || application.balanceAmount === 0) && (
                <div className='absolute top-4 right-4 md:top-6 md:right-6 z-10'>
                  <div className='text-6xl md:text-7xl font-black text-green-600 opacity-30 transform -rotate-12 border-8 border-green-600 rounded-lg px-4 py-2'>
                    PAID
                  </div>
                </div>
              )}

              <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <span className='text-2xl'>💰</span>
                Payment Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Total Amount */}
                <div className='bg-white rounded-lg p-4 border border-green-200'>
                  <label className='text-sm font-semibold text-gray-600'>Total Amount</label>
                  <p className='text-2xl font-black text-gray-800 mt-2'>
                    ₹ {application.fullData?.totalAmount?.toLocaleString() || application.totalAmount?.toLocaleString() || '0'}
                  </p>
                </div>

                {/* Paid Amount */}
                <div className='bg-white rounded-lg p-4 border border-green-200'>
                  <label className='text-sm font-semibold text-gray-600'>Paid Amount</label>
                  <p className='text-2xl font-black text-green-600 mt-2'>
                    ₹ {application.fullData?.paidAmount?.toLocaleString() || application.paidAmount?.toLocaleString() || '0'}
                  </p>
                </div>

                {/* Balance Amount */}
                <div className='bg-white rounded-lg p-4 border border-orange-200'>
                  <label className='text-sm font-semibold text-gray-600'>Balance Amount</label>
                  <p className='text-2xl font-black text-orange-600 mt-2'>
                    ₹ {application.fullData?.balanceAmount?.toLocaleString() || application.balanceAmount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details - Show only if aadhar or signature is uploaded */}
            {(application.fullData?.aadharCard || application.fullData?.signature) && (
              <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
                <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                  <span className='text-2xl'>📎</span>
                  Additional Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Aadhar Card - Show only if uploaded */}
                  {application.fullData?.aadharCard && (
                    <div>
                      <label className='text-sm font-semibold text-gray-600'>Aadhar Card</label>
                      <p className='text-gray-800 font-medium mt-1'>{application.fullData.aadharCard}</p>
                    </div>
                  )}

                  {/* Signature - Show only if uploaded */}
                  {application.fullData?.signature && (
                    <div>
                      <label className='text-sm font-semibold text-gray-600'>Signature</label>
                      <p className='text-gray-800 font-medium mt-1'>{application.fullData.signature}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className='border-t border-gray-200 p-4 md:p-6 bg-gray-50'>
          <div className='flex flex-col gap-3 md:flex-row md:justify-between md:items-center'>
            <div className='text-xs md:text-sm text-gray-600 text-center md:text-left'>
              Last updated: 2 hours ago
            </div>

            <div className='flex flex-col md:flex-row gap-2 md:gap-3'>
              <button
                onClick={onClose}
                className='px-4 md:px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition text-sm md:text-base cursor-pointer'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetailModal
