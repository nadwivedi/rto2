import React from 'react'

const PermitBillModal = ({ permit, onClose }) => {
  if (!permit) return null

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const handlePrint = () => {
    const printContent = document.getElementById('bill-content')
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>National Permit Bill</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: white;
            }
            * {
              box-sizing: border-box;
            }
            .bg-white { background-color: white; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
            .from-green-50 { --tw-gradient-from: #f0fdf4; --tw-gradient-to: rgb(240 253 244 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
            .to-emerald-50 { --tw-gradient-to: #ecfdf5; }
            .border { border-width: 1px; }
            .border-b { border-bottom-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-green-300 { border-color: #86efac; }
            .border-dashed { border-style: dashed; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded { border-radius: 0.25rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pb-3 { padding-bottom: 0.75rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
            .space-y-0\.5 > * + * { margin-top: 0.125rem; }
            .space-y-1\.5 > * + * { margin-top: 0.375rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-white { color: white; }
            .bg-green-600 { background-color: #16a34a; }
            .uppercase { text-transform: uppercase; }
            .font-mono { font-family: ui-monospace, monospace; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .gap-2 { gap: 0.5rem; }
            .gap-4 { gap: 1rem; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Modal Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold'>National Permit Bill</h2>
          </div>
          <button
            onClick={onClose}
            className='text-white hover:bg-white/20 p-2 rounded-lg transition cursor-pointer'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Bill Content */}
        <div id='bill-content' className='p-4 overflow-y-auto flex-1 bg-white'>
          {/* Bill Header */}
          <div className='bg-white mb-3 border-b border-gray-300 pb-3'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <h1 className='text-2xl font-black text-gray-800 mb-1'>Ashok Kumar</h1>
                <p className='text-sm text-gray-600 font-semibold'>(Transport Consultant)</p>
                <div className='mt-2 space-y-0.5 text-xs text-gray-700'>
                  <p>Email: ashok123kumarbhatt@gmail.com</p>
                  <p>Address: GF-17, Ground Floor, Shyam Plaza, opp. Bus Stand, Pandri, Raipur</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-xs font-bold text-gray-700 mb-0.5'>Mobile:</p>
                <p className='text-sm font-semibold text-gray-800'>99934-48850</p>
                <p className='text-sm font-semibold text-gray-800'>9827146175</p>
              </div>
            </div>

            <div className='border-t border-dashed border-gray-300 my-2'></div>

            <div className='text-center mb-2'>
              <h2 className='text-base font-bold text-gray-800'>National Permit - Bill Receipt</h2>
              <div className='mt-1 flex justify-center gap-4 text-xs text-gray-600'>
                <span><strong>Date:</strong> {currentDate}</span>
                <span><strong>Time:</strong> {currentTime}</span>
              </div>
            </div>

            <div className='border-t border-dashed border-gray-300 my-2'></div>

            {/* Permit Holder Details */}
            <div className='mb-2'>
              <p className='text-gray-500 text-xs uppercase font-semibold mb-1'>Bill To</p>
              <p className='font-bold text-gray-800 text-base'>{permit.permitHolder}</p>
            </div>
          </div>

          {/* Permit Details */}
          <div className='bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200'>
            <h3 className='text-sm font-bold text-gray-800 mb-2 pb-1 border-b border-gray-300'>Permit Details</h3>

            <div className='space-y-1.5'>
              <div className='flex justify-between items-center py-1 border-b border-gray-200'>
                <span className='text-gray-700 font-semibold text-sm'>Permit Number:</span>
                <span className='font-mono font-bold text-gray-800 text-sm'>{permit.permitNumber}</span>
              </div>

              <div className='flex justify-between items-center py-1 border-b border-gray-200'>
                <span className='text-gray-700 font-semibold text-sm'>Vehicle Number:</span>
                <span className='font-mono font-bold text-gray-800 text-sm'>{permit.vehicleNo}</span>
              </div>

              <div className='flex justify-between items-center py-1 border-b border-gray-200'>
                <span className='text-gray-700 font-semibold text-sm'>Valid From:</span>
                <span className='font-semibold text-gray-800 text-sm'>{permit.partA?.permitValidFrom || permit.issueDate}</span>
              </div>

              <div className='flex justify-between items-center py-1'>
                <span className='text-gray-700 font-semibold text-sm'>Valid To:</span>
                <span className='font-semibold text-gray-800 text-sm'>{permit.partA?.permitValidUpto || permit.validTill}</span>
              </div>
            </div>
          </div>

          {/* Fees Section */}
          <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-300'>
            <h3 className='text-sm font-bold text-gray-800 mb-2 flex items-center gap-2'>
              <span className='text-lg'>💰</span>
              Fee Details
            </h3>

            <div className='flex justify-between items-center py-2 bg-green-600 text-white px-3 rounded'>
              <span className='text-base font-bold'>Total Amount</span>
              <span className='text-2xl font-black'>
                {permit.partA?.fees || '₹15,000'}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className='bg-white border-t border-gray-200 p-4 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold cursor-pointer'
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className='px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-semibold cursor-pointer flex items-center gap-2'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
            </svg>
            Print Bill
          </button>
        </div>
      </div>
    </div>
  )
}

export default PermitBillModal
