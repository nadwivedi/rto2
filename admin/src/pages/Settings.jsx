const Settings = () => {
  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-black text-gray-800 mb-2'>Settings</h1>
        <p className='text-gray-600'>Manage system settings and configurations</p>
      </div>

      {/* Settings Sections */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

        {/* General Settings */}
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='text-3xl'>⚙️</div>
            <h2 className='text-xl font-bold text-gray-800'>General Settings</h2>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>RTO Office Name</label>
              <input
                type='text'
                defaultValue='Regional Transport Office - Mumbai'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Office Code</label>
              <input
                type='text'
                defaultValue='MH-01'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Contact Email</label>
              <input
                type='email'
                defaultValue='admin@rtomumbai.gov.in'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='text-3xl'>💰</div>
            <h2 className='text-xl font-bold text-gray-800'>Fee Structure</h2>
          </div>
          <div className='space-y-4'>
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm font-semibold text-gray-700'>Driving Licence (New)</span>
              <span className='text-sm font-bold text-gray-800'>₹500</span>
            </div>
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm font-semibold text-gray-700'>Learner's Licence</span>
              <span className='text-sm font-bold text-gray-800'>₹300</span>
            </div>
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm font-semibold text-gray-700'>Vehicle Registration</span>
              <span className='text-sm font-bold text-gray-800'>₹1,500</span>
            </div>
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm font-semibold text-gray-700'>License Renewal</span>
              <span className='text-sm font-bold text-gray-800'>₹500</span>
            </div>
            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
              <span className='text-sm font-semibold text-gray-700'>NOC Issuance</span>
              <span className='text-sm font-bold text-gray-800'>₹500</span>
            </div>
            <button className='w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold'>
              Update Fees
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='text-3xl'>🔔</div>
            <h2 className='text-xl font-bold text-gray-800'>Notifications</h2>
          </div>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div>
                <div className='font-semibold text-gray-800 text-sm'>Email Notifications</div>
                <div className='text-xs text-gray-500'>Receive email updates</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div>
                <div className='font-semibold text-gray-800 text-sm'>SMS Notifications</div>
                <div className='text-xs text-gray-500'>Receive SMS updates</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div>
                <div className='font-semibold text-gray-800 text-sm'>Application Updates</div>
                <div className='text-xs text-gray-500'>Notify on status changes</div>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='text-3xl'>🔒</div>
            <h2 className='text-xl font-bold text-gray-800'>Security</h2>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Current Password</label>
              <input
                type='password'
                placeholder='Enter current password'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>New Password</label>
              <input
                type='password'
                placeholder='Enter new password'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Confirm Password</label>
              <input
                type='password'
                placeholder='Confirm new password'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            </div>
            <button className='w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
              Update Password
            </button>
          </div>
        </div>

        {/* Backup & Maintenance */}
        <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200 lg:col-span-2'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='text-3xl'>💾</div>
            <h2 className='text-xl font-bold text-gray-800'>Backup & Maintenance</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button className='px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
              📦 Backup Database
            </button>
            <button className='px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
              🔄 Restore Backup
            </button>
            <button className='px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition font-semibold'>
              🧹 Clear Cache
            </button>
          </div>
          <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <div className='text-2xl'>ℹ️</div>
              <div>
                <div className='font-semibold text-blue-900 text-sm'>Last Backup</div>
                <div className='text-xs text-blue-700'>October 8, 2024 at 11:30 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
