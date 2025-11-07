import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const BlankBillModal = ({ isOpen, onClose, onSuccess }) => {
  const [billDate, setBillDate] = useState(new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }))
  const [customerName, setCustomerName] = useState('')
  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: '', amount: '' },
    { description: '', quantity: 1, rate: '', amount: '' },
    { description: '', quantity: 1, rate: '', amount: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate total amount
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0
      return sum + amount
    }, 0)
  }

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value

    // Auto-calculate amount if quantity and rate are provided
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(field === 'quantity' ? value : newItems[index].quantity) || 0
      const rate = parseFloat(field === 'rate' ? value : newItems[index].rate) || 0
      newItems[index].amount = (quantity * rate).toString()
    }

    setItems(newItems)
    setError('')
  }

  // Add new item row
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: '', amount: '' }])
  }

  // Remove item row
  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
    }
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!customerName || customerName.trim() === '') {
      setError('Customer name is required')
      return
    }

    // Filter out empty items
    const filledItems = items.filter(item => item.description && item.description.trim() !== '')

    if (filledItems.length === 0) {
      setError('At least one item with description is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/custom-bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          billDate,
          customerName: customerName.trim(),
          items: filledItems.map(item => ({
            description: item.description.trim(),
            quantity: parseFloat(item.quantity) || 1,
            rate: parseFloat(item.rate) || 0,
            amount: parseFloat(item.amount) || 0
          })),
          totalAmount: calculateTotal()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create custom bill')
      }

      alert('Custom bill created successfully! Bill number: ' + data.data.billNumber)

      // Reset form
      setBillDate(new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }))
      setCustomerName('')
      setItems([
        { description: '', quantity: 1, rate: '', amount: '' },
        { description: '', quantity: 1, rate: '', amount: '' },
        { description: '', quantity: 1, rate: '', amount: '' }
      ])

      onSuccess && onSuccess(data.data)
      onClose()
    } catch (err) {
      console.error('Error submitting custom bill:', err)
      setError(err.message || 'Failed to create custom bill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8'>
        {/* Header */}
        <div className='bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 text-white flex-shrink-0 rounded-t-3xl'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-lg font-bold'>Blank Bill Generator</h2>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Bill Form styled like actual bill */}
        <form onSubmit={handleSubmit} className='p-8'>
          <div className='border-2 border-black p-6 bg-white' style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Bill Header */}
            <div className='text-center mb-6'>
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'></div>
                <div className='flex-1 text-center'>
                  <div className='inline-block bg-gray-800 text-white px-4 py-1 rounded-full text-xs font-bold mb-3'>
                    BILL / CASH MEMO
                  </div>
                </div>
                <div className='flex-1 text-right text-xs font-bold'>
                  Mob.: 99934-48850<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;98271-46175
                </div>
              </div>
              <div>
                <h1 className='text-4xl font-bold italic mb-1' style={{ whiteSpace: 'nowrap' }}>ASHOK KUMAR</h1>
                <p className='text-sm italic mb-2'>(Transport Consultant)</p>
                <p className='text-xs mb-3'>
                  GF-17, Ground Floor, Shyam Plaza, Opp. Bus Stand, Pandri, RAIPUR<br />
                  Email : ashok123kumarbhatt@gmail.com
                </p>
              </div>
            </div>

            {/* Bill No and Date */}
            <div className='flex justify-between mb-4 text-sm'>
              <div>
                <span className='font-bold'>No.</span>
                <span className='ml-2 text-red-700 font-bold'>PENDING</span>
              </div>
              <div>
                <span className='font-bold'>Date</span>
                <input
                  type='text'
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className='ml-2 border-b border-black px-2 py-0.5 text-sm w-32'
                  placeholder='DD/MM/YYYY'
                />
              </div>
            </div>

            {/* Customer Name */}
            <div className='mb-4 pb-2 border-b border-black flex items-baseline gap-2'>
              <label className='text-sm font-bold whitespace-nowrap'>M/s.</label>
              <input
                type='text'
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className='flex-1 border-b border-black px-2 py-0.5 text-sm'
                placeholder='Customer Name'
                required
              />
            </div>

            {/* Items Table */}
            <table className='w-full border-2 border-black mb-4' style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className='bg-gray-200'>
                  <th className='border border-black px-2 py-2 text-xs font-bold text-center' style={{ width: '8%' }}>
                    SI<br />No.
                  </th>
                  <th className='border border-black px-2 py-2 text-xs font-bold text-center' style={{ width: '52%' }}>
                    DESCRIPTION
                  </th>
                  <th className='border border-black px-2 py-2 text-xs font-bold text-center' style={{ width: '10%' }}>
                    Qty.
                  </th>
                  <th className='border border-black px-2 py-2 text-xs font-bold text-center' style={{ width: '15%' }}>
                    Rate
                  </th>
                  <th className='border border-black px-2 py-2 text-xs font-bold text-center' style={{ width: '15%' }}>
                    AMOUNT<br />Rs.
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} style={{ height: '60px' }}>
                    <td className='border border-black px-2 text-center align-top pt-2 text-sm font-bold text-blue-600'>
                      {index + 1}
                    </td>
                    <td className='border border-black px-2 align-top pt-2'>
                      <input
                        type='text'
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className='w-full text-sm px-1 py-0.5 focus:outline-none focus:bg-yellow-50'
                        placeholder='Enter description'
                      />
                    </td>
                    <td className='border border-black px-2 text-center align-top pt-2'>
                      <input
                        type='number'
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className='w-full text-sm text-center px-1 py-0.5 focus:outline-none focus:bg-yellow-50'
                        min='0'
                        step='1'
                      />
                    </td>
                    <td className='border border-black px-2 text-right align-top pt-2'>
                      <input
                        type='number'
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className='w-full text-sm text-right px-1 py-0.5 focus:outline-none focus:bg-yellow-50'
                        placeholder='0'
                        min='0'
                        step='0.01'
                      />
                    </td>
                    <td className='border border-black px-2 text-right align-top pt-2'>
                      <input
                        type='number'
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        className='w-full text-sm text-right px-1 py-0.5 focus:outline-none focus:bg-yellow-50'
                        placeholder='0'
                        min='0'
                        step='0.01'
                      />
                    </td>
                  </tr>
                ))}
                <tr className='bg-gray-100'>
                  <td colSpan='4' className='border border-black px-2 py-2 text-right font-bold text-sm'>
                    TOTAL
                  </td>
                  <td className='border border-black px-2 py-2 text-right font-bold text-sm'>
                    ₹{calculateTotal().toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Add/Remove Item Buttons */}
            <div className='flex gap-2 mb-4'>
              <button
                type='button'
                onClick={addItem}
                className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors'
              >
                + Add Row
              </button>
              {items.length > 1 && (
                <button
                  type='button'
                  onClick={() => removeItem(items.length - 1)}
                  className='px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors'
                >
                  - Remove Last Row
                </button>
              )}
            </div>

            {/* Amount in Words */}
            <div className='mb-6 text-sm'>
              <span className='font-bold'>Rs</span>
              <span className='ml-2 border-b border-black inline-block px-2' style={{ minWidth: '400px' }}>
                {/* Amount in words will be shown on PDF */}
              </span>
            </div>

            {/* Signature */}
            <div className='text-right mt-12'>
              <div className='text-sm font-bold'>For, ASHOK KUMAR</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border-2 border-red-500 rounded-xl p-4 mt-4'>
              <p className='text-sm text-red-700 font-semibold'>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className='flex gap-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading || !customerName.trim()}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Generate Bill'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BlankBillModal
