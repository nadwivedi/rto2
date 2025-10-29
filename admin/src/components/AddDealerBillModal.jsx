import { useState } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

const AddDealerBillModal = ({ isOpen, onClose, onSuccess }) => {
  // Customer name
  const [customerName, setCustomerName] = useState('')

  // Items with checkbox approach and amounts
  const [items, setItems] = useState({
    permit: {
      isIncluded: false,
      amount: ''
    },
    fitness: {
      isIncluded: false,
      amount: ''
    },
    vehicleRegistration: {
      isIncluded: false,
      amount: ''
    },
    temporaryRegistration: {
      isIncluded: false,
      amount: ''
    }
  })

  // Total amount (calculated from item amounts)
  const [totalAmount, setTotalAmount] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle checkbox change
  const handleCheckboxChange = (itemName) => {
    setItems(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        isIncluded: !prev[itemName].isIncluded
      }
    }))
    setError('')
  }

  // Handle amount change
  const handleAmountChange = (itemName, value) => {
    setItems(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        amount: value
      }
    }))
    setError('')

    // Calculate total amount from all included items
    calculateTotalAmount(itemName, value)
  }

  // Calculate total amount
  const calculateTotalAmount = (changedItem, changedValue) => {
    let total = 0

    Object.keys(items).forEach(key => {
      if (items[key].isIncluded || key === changedItem) {
        const amount = key === changedItem ? changedValue : items[key].amount
        total += parseFloat(amount) || 0
      }
    })

    setTotalAmount(total.toString())
  }

  // Check if form is valid
  const isFormValid = () => {
    // Customer name is required
    if (!customerName || customerName.trim() === '') {
      return false
    }

    // At least one item must be included
    const hasIncludedItem = items.permit.isIncluded || items.fitness.isIncluded || items.vehicleRegistration.isIncluded || items.temporaryRegistration.isIncluded

    if (!hasIncludedItem) {
      return false
    }

    // Total amount must be valid
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      return false
    }

    return true
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid()) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Prepare items with amounts
      const itemsToSend = {
        permit: {
          isIncluded: items.permit.isIncluded,
          amount: items.permit.isIncluded ? parseFloat(items.permit.amount) || 0 : 0
        },
        fitness: {
          isIncluded: items.fitness.isIncluded,
          amount: items.fitness.isIncluded ? parseFloat(items.fitness.amount) || 0 : 0
        },
        vehicleRegistration: {
          isIncluded: items.vehicleRegistration.isIncluded,
          amount: items.vehicleRegistration.isIncluded ? parseFloat(items.vehicleRegistration.amount) || 0 : 0
        },
        temporaryRegistration: {
          isIncluded: items.temporaryRegistration.isIncluded,
          amount: items.temporaryRegistration.isIncluded ? parseFloat(items.temporaryRegistration.amount) || 0 : 0
        }
      }

      const response = await fetch(`${API_BASE_URL}/dealer-bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          items: itemsToSend,
          totalFees: parseFloat(totalAmount)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create dealer bill')
      }

      alert('Dealer bill created successfully! Bill number: ' + data.data.billNumber)

      // Reset form
      setCustomerName('')
      setItems({
        permit: {
          isIncluded: false,
          amount: ''
        },
        fitness: {
          isIncluded: false,
          amount: ''
        },
        vehicleRegistration: {
          isIncluded: false,
          amount: ''
        },
        temporaryRegistration: {
          isIncluded: false,
          amount: ''
        }
      })
      setTotalAmount('')

      onSuccess && onSuccess(data.data)
      onClose()
    } catch (err) {
      console.error('Error submitting dealer bill:', err)
      setError(err.message || 'Failed to create dealer bill. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex-shrink-0'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-black mb-1'>Add Dealer Bill</h2>
              <p className='text-blue-100 text-sm'>Create a combined bill for Permit, Fitness, and Registration</p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='mb-4 p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50'>
              <p className='text-sm font-semibold text-gray-700'>
                Enter customer name, select items to include in the bill, and enter the total amount.
              </p>
            </div>

            {/* Customer Name Section */}
            <div className='mb-6 p-4 border-2 border-purple-200 rounded-xl bg-purple-50'>
              <h3 className='text-lg font-bold text-gray-800 mb-3 flex items-center gap-2'>
                <span className='w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-black'>👤</span>
                Customer Name
              </h3>
              <input
                type='text'
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  setError('')
                }}
                placeholder='Enter customer name'
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-semibold'
                required
              />
            </div>

            {/* Items Selection Title */}
            <div className='mb-4'>
              <h3 className='text-md font-bold text-gray-800'>Select Items to Include:</h3>
            </div>

            {/* Permit Checkbox */}
            <div className='mb-4 p-3 border-2 border-blue-200 rounded-xl bg-blue-50'>
              <label className='flex items-center gap-3 cursor-pointer mb-2'>
                <input
                  type='checkbox'
                  checked={items.permit.isIncluded}
                  onChange={() => handleCheckboxChange('permit')}
                  className='w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-base font-bold text-gray-800'>Permit</span>
              </label>
              {items.permit.isIncluded && (
                <input
                  type='number'
                  value={items.permit.amount}
                  onChange={(e) => handleAmountChange('permit', e.target.value)}
                  placeholder='Enter amount for Permit'
                  min='0'
                  step='100'
                  className='w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold'
                />
              )}
            </div>

            {/* Fitness Checkbox */}
            <div className='mb-4 p-3 border-2 border-green-200 rounded-xl bg-green-50'>
              <label className='flex items-center gap-3 cursor-pointer mb-2'>
                <input
                  type='checkbox'
                  checked={items.fitness.isIncluded}
                  onChange={() => handleCheckboxChange('fitness')}
                  className='w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500'
                />
                <span className='text-base font-bold text-gray-800'>Fitness</span>
              </label>
              {items.fitness.isIncluded && (
                <input
                  type='number'
                  value={items.fitness.amount}
                  onChange={(e) => handleAmountChange('fitness', e.target.value)}
                  placeholder='Enter amount for Fitness'
                  min='0'
                  step='100'
                  className='w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base font-semibold'
                />
              )}
            </div>

            {/* Vehicle Registration Checkbox */}
            <div className='mb-4 p-3 border-2 border-orange-200 rounded-xl bg-orange-50'>
              <label className='flex items-center gap-3 cursor-pointer mb-2'>
                <input
                  type='checkbox'
                  checked={items.vehicleRegistration.isIncluded}
                  onChange={() => handleCheckboxChange('vehicleRegistration')}
                  className='w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500'
                />
                <span className='text-base font-bold text-gray-800'>Vehicle Registration</span>
              </label>
              {items.vehicleRegistration.isIncluded && (
                <input
                  type='number'
                  value={items.vehicleRegistration.amount}
                  onChange={(e) => handleAmountChange('vehicleRegistration', e.target.value)}
                  placeholder='Enter amount for Vehicle Registration'
                  min='0'
                  step='100'
                  className='w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base font-semibold'
                />
              )}
            </div>

            {/* Temporary Registration Checkbox */}
            <div className='mb-6 p-3 border-2 border-pink-200 rounded-xl bg-pink-50'>
              <label className='flex items-center gap-3 cursor-pointer mb-2'>
                <input
                  type='checkbox'
                  checked={items.temporaryRegistration.isIncluded}
                  onChange={() => handleCheckboxChange('temporaryRegistration')}
                  className='w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500'
                />
                <span className='text-base font-bold text-gray-800'>Temporary Registration</span>
              </label>
              {items.temporaryRegistration.isIncluded && (
                <input
                  type='number'
                  value={items.temporaryRegistration.amount}
                  onChange={(e) => handleAmountChange('temporaryRegistration', e.target.value)}
                  placeholder='Enter amount for Temporary Registration'
                  min='0'
                  step='100'
                  className='w-full px-3 py-2 border-2 border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base font-semibold'
                />
              )}
            </div>

            {/* Total Amount Section */}
            <div className='mb-6 p-4 border-2 border-indigo-200 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50'>
              <h3 className='text-lg font-bold text-gray-800 mb-3 flex items-center gap-2'>
                <span className='w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm font-black'>₹</span>
                Total Amount (Auto-calculated)
              </h3>
              <div className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-2xl font-bold text-gray-700'>
                ₹{totalAmount || '0'}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4'>
                <p className='text-sm text-red-700 font-semibold'>{error}</p>
              </div>
            )}
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4'>
            <div className='flex gap-3'>
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
                disabled={loading || !isFormValid()}
                className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
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
                  'Create Dealer Bill'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDealerBillModal
