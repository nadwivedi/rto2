import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getTheme } from "../context/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = getTheme();

  const menuItems = [
    {
      name: "Vehicle Registration",
      icon: "🚗",
      path: "/",
      description: "Register Vehicles",
    },

    {
      name: "National Permit",
      icon: "🛣️",
      path: "/national-permit",
      description: "National Permits",
    },
    {
      name: "CG Permit",
      icon: "📄",
      path: "/cg-permit",
      description: "CG State Permits",
    },
    {
      name: "Temp Permit",
      icon: "⏰",
      path: "/temporary-permit",
      description: "Temporary Permits",
    },
    {
      name: "Temp Permit (Other State)",
      icon: "🚗",
      path: "/temporary-permit-other-state",
      description: "Temporary Permits from Other States",
    },

    {
      name: "Fitness",
      icon: "✅",
      path: "/fitness",
      description: "Fitness Certificate",
    },
    {
      name: "Tax",
      icon: "💰",
      path: "/tax",
      description: "Tax Management",
    },

     {
      name: "Bill",
      icon: "📈",
      path: "/dealer-bill",
      description: "Dealer Billing",
    },

    {
      name: "Insurance",
      icon: "🛡️",
      path: "/insurance",
      description: "Vehicle Insurance",
    },

    {
      name: "Driving Licence",
      icon: "🪪",
      path: "/driving",
      description: "DL Applications",
    },

    {
      name: "Vehicle Transfer",
      icon: "🔀",
      path: "/vehicle-transfer",
      description: "Transfer Ownership",
    },
    {
      name: "setting",
      icon: "⚙️",
      path: "/setting",
      description: "App Settings",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Header - Only visible on mobile */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 ${theme.navbar} text-white shadow-lg z-50`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-lg font-black text-white">R</span>
            </div>
            <h1 className="text-sm font-bold text-white">RTO Sarthi</h1>
          </div>

          {/* Placeholder for alignment */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white transform transition-transform duration-300 ease-in-out z-50 w-64 shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="p-4 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl font-black text-white">R</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">RTO Sarthi</h1>
                <p className="text-xs text-purple-300 font-medium">
                  Your RTO Companion
                </p>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-purple-300 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Items */}
        <nav className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 shadow-lg"
                  : "hover:bg-white/10 hover:border border-transparent hover:border-purple-400/20"
              }`}
            >
              <span
                className={`text-xl ${
                  isActive(item.path)
                    ? "text-orange-300"
                    : "text-purple-200 group-hover:text-orange-300"
                }`}
              >
                {item.icon}
              </span>
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-purple-100 group-hover:text-white"
                  }`}
                >
                  {item.name}
                </div>
                <div className="text-xs text-purple-400 group-hover:text-purple-300">
                  {item.description}
                </div>
              </div>
              {isActive(item.path) && (
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Navbar - Only visible on desktop */}
      <nav className={`hidden lg:block fixed top-0 left-0 right-0 ${theme.navbar} text-white shadow-2xl z-50`}>
        <div className="px-4 py-3">
          {/* Menu Items - Horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 group flex-shrink-0 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40 shadow-lg"
                    : "hover:bg-white/10 hover:border border-transparent hover:border-purple-400/20"
                }`}
                title={item.description}
              >
                <span
                  className={`text-lg ${
                    isActive(item.path)
                      ? "text-orange-300"
                      : "text-purple-200 group-hover:text-orange-300"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    isActive(item.path)
                      ? "text-purple-100"
                      : "text-purple-100 group-hover:text-white"
                  }`}
                >
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
    </>
  );
};

export default Navbar;