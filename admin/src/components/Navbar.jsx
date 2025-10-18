import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
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
    <nav className="hidden lg:block fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white shadow-2xl z-50">
      <div className="px-6 py-3">
        {/* Menu Items - Horizontal */}
        <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-500/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-purple-500/50">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group flex-shrink-0 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 shadow-lg'
                  : 'hover:bg-white/10 hover:border border-transparent hover:border-purple-400/20'
              }`}
              title={item.description}
            >
              <span className={`text-lg ${isActive(item.path) ? 'text-orange-300' : 'text-purple-200 group-hover:text-orange-300'}`}>
                {item.icon}
              </span>
              <span className={`text-sm font-semibold whitespace-nowrap ${isActive(item.path) ? 'text-purple-100' : 'text-purple-100 group-hover:text-white'}`}>
                {item.name}
              </span>
              {isActive(item.path) && (
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
