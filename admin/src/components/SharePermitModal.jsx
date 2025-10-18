import { useState, useRef } from 'react'

const SharePermitModal = ({ permit, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState(permit.partA?.ownerMobile || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const billRef = useRef(null)

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const generatePDF = async (asBlob = false) => {
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default

      const element = billRef.current

      if (!element) {
        throw new Error('Bill content not found')
      }

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `National_Permit_${permit.permitNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      }

      console.log('Starting PDF generation...')

      if (asBlob) {
        // Generate PDF as blob for sharing
        console.log('Generating PDF as blob...')
        const worker = html2pdf().set(opt).from(element)
        const blob = await worker.outputPdf('blob')
        console.log('PDF blob generated successfully', blob)
        return blob
      } else {
        // Download PDF
        console.log('Generating PDF for download...')
        await html2pdf().set(opt).from(element).save()
        console.log('PDF downloaded successfully')
        return true
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  }

  const handleDownloadPDF = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await generatePDF(false)
      setMessage('PDF downloaded successfully!')
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      setError(error.message || 'Failed to download PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.trim() === '') {
      setError('Please enter a phone number')
      return
    }

    // Basic validation for 10-digit number
    const cleanedNumber = phoneNumber.replace(/\D/g, '')
    if (cleanedNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare) {
        // Generate PDF as blob for sharing
        const pdfBlob = await generatePDF(true)

        // Create a File object from the blob
        const pdfFile = new File(
          [pdfBlob],
          `National_Permit_${permit.permitNumber}.pdf`,
          { type: 'application/pdf' }
        )

        // Check if we can share files
        if (navigator.canShare({ files: [pdfFile] })) {
          try {
            await navigator.share({
              files: [pdfFile],
              title: `National Permit Bill - ${permit.permitNumber}`,
              text: `National Permit Bill for ${permit.permitHolder}\nPermit: ${permit.permitNumber}\nVehicle: ${permit.vehicleNo}`
            })

            setMessage('PDF shared successfully!')
            setTimeout(() => {
              onClose()
            }, 2000)
            return
          } catch (shareError) {
            // User cancelled the share or error occurred
            if (shareError.name === 'AbortError') {
              setError('Share cancelled')
              setLoading(false)
              return
            }
            throw shareError
          }
        }
      }

      // Fallback: Download PDF and open WhatsApp
      await generatePDF(false)

      setMessage('PDF downloaded! Opening WhatsApp...')

      // Wait a bit for download to complete
      setTimeout(() => {
        // Format phone number for WhatsApp
        const formattedPhone = `91${cleanedNumber}`

        // Open WhatsApp without message (user will attach PDF manually)
        const whatsappUrl = `https://wa.me/${formattedPhone}`
        window.open(whatsappUrl, '_blank')

        setMessage('PDF downloaded! Please attach it in WhatsApp and send.')
        setTimeout(() => {
          onClose()
        }, 3000)
      }, 1000)
    } catch (error) {
      console.error('Error sharing permit:', error)
      setError(error.message || 'Failed to share permit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold'>Share National Permit Bill</h2>
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

        {/* Bill Preview */}
        <div ref={billRef} className='p-4 overflow-y-auto flex-1 bg-white'>
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

        {/* Footer with Share Options */}
        <div className='bg-white border-t border-gray-200 p-4'>
          {/* Phone Number Input */}
          <div className='mb-4'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              WhatsApp Number <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold'>
                +91
              </span>
              <input
                type='tel'
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setError('')
                }}
                placeholder='Enter 10-digit mobile number'
                maxLength='10'
                className='w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono'
                disabled={loading}
              />
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className='mb-3 bg-green-50 border-l-4 border-green-500 p-3 rounded-lg'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-green-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                <p className='text-sm text-green-700 font-semibold'>{message}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-red-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <p className='text-sm text-red-700 font-semibold'>{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold cursor-pointer'
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold cursor-pointer flex items-center gap-2'
              disabled={loading}
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className='flex-1 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-semibold cursor-pointer flex items-center justify-center gap-2'
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Sharing...
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                  </svg>
                  Share on WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharePermitModal
