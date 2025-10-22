import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/',
      description: 'Overview & Analytics'
    },
    {
      name: 'Driving Licence',
      icon: '🪪',
      path: '/driving-licence',
      description: 'DL Applications'
    },
    {
      name: 'National Permit',
      icon: '🛣️',
      path: '/national-permit',
      description: 'National Permits'
    },
    {
      name: 'CG Permit',
      icon: '📄',
      path: '/cg-permit',
      description: 'CG State Permits'
    },
    {
      name: 'Temporary Permit',
      icon: '⏰',
      path: '/temporary-permit',
      description: 'Temporary Permits'
    },
    {
      name: 'Vehicle Registration',
      icon: '🚗',
      path: '/vehicle-registration',
      description: 'Register Vehicles'
    },
    {
      name: 'Insurance',
      icon: '🛡️',
      path: '/insurance',
      description: 'Vehicle Insurance'
    },
    {
      name: 'Fitness',
      icon: '✅',
      path: '/fitness',
      description: 'Fitness Certificate'
    },
    {
      name: 'License Renewal',
      icon: '🔄',
      path: '/license-renewal',
      description: 'Renew Licenses'
    },
    {
      name: 'Vehicle Transfer',
      icon: '🔀',
      path: '/vehicle-transfer',
      description: 'Transfer Ownership'
    },
    {
      name: 'Reports',
      icon: '📈',
      path: '/reports',
      description: 'Analytics & Reports'
    }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-56 shadow-2xl`}>

        {/* Logo */}
        <div className="p-3 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl font-black text-white">R</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-yellow-200">
                  RTO
                </h1>
                <p className="text-[10px] text-purple-300 font-medium">
                  Admin Panel
                </p>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-purple-300 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Close Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-70px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-500/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-purple-500/50">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 shadow-lg'
                  : 'hover:bg-white/10 hover:border border-transparent hover:border-purple-400/20'
              }`}
            >
              <span className={`text-lg ${isActive(item.path) ? 'text-orange-300' : 'text-purple-200 group-hover:text-orange-300'}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${isActive(item.path) ? 'text-purple-100' : 'text-purple-100 group-hover:text-white'}`}>
                  {item.name}
                </div>
                <div className={`text-[10px] truncate ${isActive(item.path) ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'}`}>
                  {item.description}
                </div>
              </div>
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse flex-shrink-0"></div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
