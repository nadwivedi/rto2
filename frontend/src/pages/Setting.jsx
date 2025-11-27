import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import ImportModal from '../components/ImportModal'
import ExportModal from '../components/ExportModal'
import ExportExcelModal from '../components/ExportExcelModal'
import { getAllThemes, getAllVehicleNumberDesigns } from '../context/ThemeContext'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const Setting = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExportExcelModalOpen, setIsExportExcelModalOpen] = useState(false)

  const themes = getAllThemes()
  const currentTheme = localStorage.getItem('theme') || 'theme1'

  const vehicleNumberDesigns = getAllVehicleNumberDesigns()
  const currentVehicleDesign = localStorage.getItem('vehicleNumberDesign') || 'design1'

  const handleThemeChange = (themeName) => {
    localStorage.setItem('theme', themeName)
    window.location.reload()
  }

  const handleVehicleDesignChange = (designName) => {
    localStorage.setItem('vehicleNumberDesign', designName)
    window.location.reload()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Export all data as Excel (separate files for each collection)
  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      toast.info('Starting Excel export...', { position: 'top-right', autoClose: 2000 })

      // List of all collections to export
      const collections = [
        { name: 'Vehicle Registration', endpoint: '/api/vehicle-registrations/export' },
        { name: 'National Permit', endpoint: '/api/national-permits/export' },
        { name: 'Temporary Permit', endpoint: '/api/temporary-permits/export' },
        { name: 'CG Permit', endpoint: '/api/cg-permits/export' },
        { name: 'Fitness', endpoint: '/api/fitness/export' },
        { name: 'Insurance', endpoint: '/api/insurance/export' },
        { name: 'Tax', endpoint: '/api/tax/export' },
        { name: 'Driving License', endpoint: '/api/driving-licenses/export' }
      ]

      // Fetch data from all collections
      for (const collection of collections) {
        try {
          const response = await axios.get(`${API_URL}${collection.endpoint}`, { withCredentials: true })
          const data = response.data.data || response.data || []

          if (data.length === 0) {
            console.log(`No data found for ${collection.name}`)
            continue
          }

          // Convert to worksheet
          const worksheet = XLSX.utils.json_to_sheet(data)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0]
          const filename = `${collection.name.replace(/ /g, '_')}_${timestamp}.xlsx`

          // Download the file
          XLSX.writeFile(workbook, filename)

          await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between downloads
        } catch (error) {
          console.error(`Error exporting ${collection.name}:`, error)
        }
      }

      toast.success('Excel export completed successfully!', {
        position: 'top-right',
        autoClose: 3000
      })
    } catch (error) {
      console.error('Error during Excel export:', error)
      toast.error('Failed to export data as Excel', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Export all data as JSON (separate files for each collection)
  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      toast.info('Starting JSON export...', { position: 'top-right', autoClose: 2000 })

      // List of all collections to export
      const collections = [
        { name: 'Vehicle Registration', endpoint: '/api/vehicle-registrations/export' },
        { name: 'National Permit', endpoint: '/api/national-permits/export' },
        { name: 'Temporary Permit', endpoint: '/api/temporary-permits/export' },
        { name: 'CG Permit', endpoint: '/api/cg-permits/export' },
        { name: 'Fitness', endpoint: '/api/fitness/export' },
        { name: 'Insurance', endpoint: '/api/insurance/export' },
        { name: 'Tax', endpoint: '/api/tax/export' },
        { name: 'Driving License', endpoint: '/api/driving-licenses/export' }
      ]

      // Fetch data from all collections
      for (const collection of collections) {
        try {
          const response = await axios.get(`${API_URL}${collection.endpoint}`, { withCredentials: true })
          const data = response.data.data || response.data || []

          if (data.length === 0) {
            console.log(`No data found for ${collection.name}`)
            continue
          }

          // Create JSON blob
          const jsonString = JSON.stringify(data, null, 2)
          const blob = new Blob([jsonString], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)

          // Create download link
          const link = document.createElement('a')
          link.href = url
          const timestamp = new Date().toISOString().split('T')[0]
          link.download = `${collection.name.replace(/ /g, '_')}_${timestamp}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between downloads
        } catch (error) {
          console.error(`Error exporting ${collection.name}:`, error)
        }
      }

      toast.success('JSON export completed successfully!', {
        position: 'top-right',
        autoClose: 3000
      })
    } catch (error) {
      console.error('Error during JSON export:', error)
      toast.error('Failed to export data as JSON', {
        position: 'top-right',
        autoClose: 3000
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 pt-20 lg:pt-20 max-w-[1400px] mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-black text-gray-800 mb-1'>Settings</h1>
        <p className='text-sm text-gray-600'>Manage your application preferences and configuration</p>
      </div>

      {/* Settings Cards */}
      <div className='space-y-4'>
        {/* Theme Settings */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl'>
              🎨
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Theme Settings</h2>
              <p className='text-xs text-gray-500'>Customize the appearance of your application</p>
            </div>
          </div>

          <div className='space-y-3'>
            <label className='text-sm font-semibold text-gray-700'>Select Theme</label>
            <div className='flex flex-wrap gap-3'>
              {Object.keys(themes).map((themeName) => {
                const themeData = themes[themeName]
                const isSelected = currentTheme === themeName
                return (
                  <button
                    key={themeName}
                    onClick={() => handleThemeChange(themeName)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <span className='font-semibold text-gray-800 text-xs capitalize'>
                      {themeName.replace('theme', 'Theme ')}
                    </span>
                    <div className={`w-16 h-5 rounded ${themeData.navbar}`}></div>
                    {isSelected && (
                      <div className='w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]'>
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Vehicle Number Design Settings */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xl'>
              🚗
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Vehicle Number Design</h2>
              <p className='text-xs text-gray-500'>Customize how vehicle numbers are displayed</p>
            </div>
          </div>

          <div className='space-y-3'>
            <label className='text-sm font-semibold text-gray-700'>Select Design</label>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
              {Object.keys(vehicleNumberDesigns).map((designName) => {
                const design = vehicleNumberDesigns[designName]
                const isSelected = currentVehicleDesign === designName
                return (
                  <button
                    key={designName}
                    onClick={() => handleVehicleDesignChange(designName)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className='flex flex-col items-center mb-2'>
                      <div className='text-center mb-1.5'>
                        <div className='font-semibold text-gray-800 text-xs leading-tight'>{design.name}</div>
                      </div>
                      {isSelected && (
                        <div className='w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]'>
                          ✓
                        </div>
                      )}
                    </div>
                    {/* Preview with larger text */}
                    <div className='mt-2 p-2 bg-gray-50 rounded flex justify-center items-center min-h-[55px]'>
                      <div className={design.container}>
                        <span className={design.stateCode.replace('text-sm', 'text-xs')}>CG</span>
                        <span className={design.districtCode.replace('text-sm', 'text-xs')}>04</span>
                        <span className={design.series.replace('text-sm', 'text-xs')}>AA</span>
                        <span className={design.last4Digits.replace('text-sm', 'text-xs')}>4793</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xl'>
              📊
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Export Data</h2>
              <p className='text-xs text-gray-500'>Download your data in various formats</p>
            </div>
          </div>

          <div className='space-y-3'>
            <label className='text-sm font-semibold text-gray-700'>Export Options</label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <button
                onClick={() => setIsExportExcelModalOpen(true)}
                className='flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-lg transition border border-green-200 group'
              >
                <div className='w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform'>
                  XLS
                </div>
                <div className='text-left flex-1'>
                  <div className='font-semibold text-gray-800 text-sm'>Export as Excel</div>
                  <div className='text-xs text-gray-500'>Choose data types to export</div>
                </div>
                <div className='text-gray-400 group-hover:text-green-600'>→</div>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className='flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition border border-orange-200 group'
              >
                <div className='w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform'>
                  JSON
                </div>
                <div className='text-left flex-1'>
                  <div className='font-semibold text-gray-800 text-sm'>Export as JSON</div>
                  <div className='text-xs text-gray-500'>Choose data types to export</div>
                </div>
                <div className='text-gray-400 group-hover:text-orange-600'>→</div>
              </button>
            </div>
          </div>
        </div>

        {/* Import Data */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl'>
              📥
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Import Data</h2>
              <p className='text-xs text-gray-500'>Upload JSON files to import data into the system</p>
            </div>
          </div>

          <div className='space-y-3'>
            <p className='text-sm text-gray-600'>
              Import bulk data from JSON files for various modules like Driving License, Insurance, Tax, Fitness, and more.
            </p>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className='flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition border border-blue-200 group w-full md:w-auto'
            >
              <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform'>
                📥
              </div>
              <div className='text-left flex-1'>
                <div className='font-semibold text-gray-800 text-sm'>Import Data</div>
                <div className='text-xs text-gray-500'>Upload and import JSON files</div>
              </div>
              <div className='text-gray-400 group-hover:text-blue-600'>→</div>
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl'>
              🔒
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Change Password</h2>
              <p className='text-xs text-gray-500'>Update your account password</p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='text-sm font-semibold text-gray-700 block mb-2'>
                  Current Password
                </label>
                <input
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder='Enter current password'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
                />
              </div>

              <div>
                <label className='text-sm font-semibold text-gray-700 block mb-2'>
                  New Password
                </label>
                <input
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder='Enter new password'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
                />
              </div>

              <div>
                <label className='text-sm font-semibold text-gray-700 block mb-2'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Confirm new password'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
                />
              </div>
            </div>

            <div className='flex gap-3 pt-2'>
              <button className='px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition text-sm'>
                Update Password
              </button>
              <button className='px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm'>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl'>
              🔔
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Notification Settings</h2>
              <p className='text-xs text-gray-500'>Manage your notification preferences</p>
            </div>
          </div>

          <div className='space-y-3 max-w-2xl'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
              <div>
                <div className='font-semibold text-gray-800 text-sm'>Email Notifications</div>
                <div className='text-xs text-gray-500'>Receive email updates about your account</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
              <div>
                <div className='font-semibold text-gray-800 text-sm'>SMS Notifications</div>
                <div className='text-xs text-gray-500'>Receive text messages for important updates</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
              <div>
                <div className='font-semibold text-gray-800 text-sm'>Push Notifications</div>
                <div className='text-xs text-gray-500'>Receive push notifications in the browser</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-red-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-white text-xl'>
              🚪
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Logout</h2>
              <p className='text-xs text-gray-500'>Sign out of your account</p>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-800 mb-4'>
                You will be signed out of your account and redirected to the login page. Make sure you have saved any unsaved work before logging out.
              </p>
              <button
                onClick={handleLogout}
                className='w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                <span className='text-xl'>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Export JSON Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Export Excel Modal */}
      <ExportExcelModal
        isOpen={isExportExcelModalOpen}
        onClose={() => setIsExportExcelModalOpen(false)}
      />
    </div>
  )
}

export default Setting
