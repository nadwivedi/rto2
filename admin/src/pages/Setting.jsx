import React, { useState } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'

const Setting = () => {
  const [theme, setTheme] = useState('light')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { isInstallable, isInstalled, installPWA } = usePWAInstall()

  const handleInstallClick = async () => {
    const success = await installPWA()
    if (success) {
      console.log('App installation initiated')
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
        {/* PWA Install App */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xl'>
              📱
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Install App</h2>
              <p className='text-xs text-gray-500'>Install RTO Admin as a desktop application</p>
            </div>
          </div>

          <div className='space-y-3'>
            {isInstalled ? (
              <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>✅</div>
                  <div className='flex-1'>
                    <div className='font-semibold text-green-800 text-sm'>App Installed</div>
                    <div className='text-xs text-green-600'>RTO Admin is installed on your device</div>
                  </div>
                </div>
              </div>
            ) : isInstallable ? (
              <div className='space-y-3'>
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='text-sm text-blue-800 mb-3'>
                    Install this app on your device for quick access without opening a browser. Works offline and provides a native app experience.
                  </div>
                  <ul className='text-xs text-blue-700 space-y-1 ml-4 list-disc'>
                    <li>Launch directly from desktop/home screen</li>
                    <li>Works offline with cached data</li>
                    <li>Faster loading times</li>
                    <li>No browser address bar</li>
                  </ul>
                </div>
                <button
                  onClick={handleInstallClick}
                  className='w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105'
                >
                  <span className='text-xl'>⬇️</span>
                  <span>Install RTO Admin App</span>
                </button>
              </div>
            ) : (
              <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>ℹ️</div>
                  <div className='flex-1'>
                    <div className='font-semibold text-gray-800 text-sm'>Installation Not Available</div>
                    <div className='text-xs text-gray-600 mt-1'>
                      To install this app:
                      <ul className='mt-2 ml-4 list-disc space-y-1'>
                        <li>Use Chrome, Edge, or Safari browser</li>
                        <li>Access via HTTPS (secure connection)</li>
                        <li>App may already be installed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Settings */}
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl'>
              🎨
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Theme Settings</h2>
              <p className='text-xs text-gray-500'>Change the appearance of the application</p>
            </div>
          </div>

          <div className='space-y-3'>
            <label className='text-sm font-semibold text-gray-700'>Select Theme</label>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>☀️</div>
                  <div className='text-left'>
                    <div className='font-semibold text-gray-800 text-sm'>Light Mode</div>
                    <div className='text-xs text-gray-500'>Default theme</div>
                  </div>
                  {theme === 'light' && (
                    <div className='ml-auto text-indigo-600'>✓</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>🌙</div>
                  <div className='text-left'>
                    <div className='font-semibold text-gray-800 text-sm'>Dark Mode</div>
                    <div className='text-xs text-gray-500'>Easy on eyes</div>
                  </div>
                  {theme === 'dark' && (
                    <div className='ml-auto text-indigo-600'>✓</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setTheme('auto')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'auto'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div className='text-2xl'>🔄</div>
                  <div className='text-left'>
                    <div className='font-semibold text-gray-800 text-sm'>Auto Mode</div>
                    <div className='text-xs text-gray-500'>System based</div>
                  </div>
                  {theme === 'auto' && (
                    <div className='ml-auto text-indigo-600'>✓</div>
                  )}
                </div>
              </button>
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
              <button className='flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 rounded-lg transition border border-green-200 group'>
                <div className='w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform'>
                  XLS
                </div>
                <div className='text-left flex-1'>
                  <div className='font-semibold text-gray-800 text-sm'>Export as Excel</div>
                  <div className='text-xs text-gray-500'>Download all data in Excel format</div>
                </div>
                <div className='text-gray-400 group-hover:text-green-600'>→</div>
              </button>

              <button className='flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition border border-orange-200 group'>
                <div className='w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform'>
                  JSON
                </div>
                <div className='text-left flex-1'>
                  <div className='font-semibold text-gray-800 text-sm'>Export as JSON</div>
                  <div className='text-xs text-gray-500'>Download all data in JSON format</div>
                </div>
                <div className='text-gray-400 group-hover:text-orange-600'>→</div>
              </button>
            </div>
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

          <div className='space-y-4 max-w-2xl'>
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
      </div>
    </div>
  )
}

export default Setting
