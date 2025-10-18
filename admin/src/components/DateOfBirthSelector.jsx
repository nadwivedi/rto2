import { useState, useEffect } from 'react'

const DateOfBirthSelector = ({ value, onChange, required = false }) => {
  // Parse existing value or set defaults
  const parseDate = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' }
    const date = new Date(dateString)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      year: date.getFullYear().toString()
    }
  }

  const [dateComponents, setDateComponents] = useState(parseDate(value))

  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  // Generate years from 1950 to current year - 16 (minimum age for license)
  const currentYear = new Date().getFullYear()
  const maxYear = currentYear - 16 // Minimum age 16 for two-wheeler
  const minYear = currentYear - 80 // Reasonable maximum age
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (maxYear - i).toString())

  // Update parent component when any dropdown changes
  useEffect(() => {
    const { day, month, year } = dateComponents
    if (day && month && year) {
      const dateString = `${year}-${month}-${day}`
      onChange(dateString)
    }
  }, [dateComponents, onChange])

  const handleDayChange = (e) => {
    setDateComponents(prev => ({ ...prev, day: e.target.value }))
  }

  const handleMonthChange = (e) => {
    setDateComponents(prev => ({ ...prev, month: e.target.value }))
  }

  const handleYearChange = (e) => {
    setDateComponents(prev => ({ ...prev, year: e.target.value }))
  }

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-3 gap-3'>
        {/* Day Dropdown */}
        <div>
          <label className='block text-xs font-semibold text-gray-600 mb-1'>Day</label>
          <select
            value={dateComponents.day}
            onChange={handleDayChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base font-semibold'
            required={required}
          >
            <option value=''>DD</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* Month Dropdown */}
        <div>
          <label className='block text-xs font-semibold text-gray-600 mb-1'>Month</label>
          <select
            value={dateComponents.month}
            onChange={handleMonthChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base font-semibold'
            required={required}
          >
            <option value=''>Month</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div>
          <label className='block text-xs font-semibold text-gray-600 mb-1'>Year</label>
          <select
            value={dateComponents.year}
            onChange={handleYearChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base font-semibold'
            required={required}
          >
            <option value=''>YYYY</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default DateOfBirthSelector
