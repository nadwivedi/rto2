import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Define theme color schemes
export const themeConfig = {
  default: {
    name: 'Default',
    description: 'Blue & Purple',
    // Navbar
    navbarFrom: 'from-blue-600',
    navbarVia: 'via-indigo-600',
    navbarTo: 'to-purple-600',
    // Table headers
    tableFrom: 'from-indigo-600',
    tableVia: 'via-purple-600',
    tableTo: 'to-pink-600',
    // Buttons
    buttonFrom: 'from-indigo-600',
    buttonTo: 'to-purple-600',
    // Card gradients
    cardFrom: 'from-indigo-50',
    cardVia: 'via-purple-50',
    cardTo: 'to-pink-50',
    // Border colors
    borderColor: 'border-indigo-200',
    focusRing: 'focus:ring-indigo-500',
    // Background gradients
    bgFrom: 'from-blue-500',
    bgVia: 'via-indigo-500',
    bgTo: 'to-purple-600',
  },
  ocean: {
    name: 'Ocean',
    description: 'Cyan & Teal',
    // Navbar
    navbarFrom: 'from-cyan-600',
    navbarVia: 'via-teal-600',
    navbarTo: 'to-emerald-600',
    // Table headers
    tableFrom: 'from-cyan-600',
    tableVia: 'via-teal-600',
    tableTo: 'to-emerald-600',
    // Buttons
    buttonFrom: 'from-cyan-600',
    buttonTo: 'to-teal-600',
    // Card gradients
    cardFrom: 'from-cyan-50',
    cardVia: 'via-teal-50',
    cardTo: 'to-emerald-50',
    // Border colors
    borderColor: 'border-cyan-200',
    focusRing: 'focus:ring-cyan-500',
    // Background gradients
    bgFrom: 'from-cyan-500',
    bgVia: 'via-teal-500',
    bgTo: 'to-emerald-600',
  },
  sunset: {
    name: 'Sunset',
    description: 'Orange & Pink',
    // Navbar
    navbarFrom: 'from-orange-600',
    navbarVia: 'via-red-600',
    navbarTo: 'to-pink-600',
    // Table headers
    tableFrom: 'from-orange-600',
    tableVia: 'via-red-600',
    tableTo: 'to-pink-600',
    // Buttons
    buttonFrom: 'from-orange-600',
    buttonTo: 'to-pink-600',
    // Card gradients
    cardFrom: 'from-orange-50',
    cardVia: 'via-red-50',
    cardTo: 'to-pink-50',
    // Border colors
    borderColor: 'border-orange-200',
    focusRing: 'focus:ring-orange-500',
    // Background gradients
    bgFrom: 'from-orange-500',
    bgVia: 'via-red-500',
    bgTo: 'to-pink-600',
  },
}

export const ThemeProvider = ({ children }) => {
  const [colorTheme, setColorTheme] = useState(() => {
    // Load theme from localStorage or default to 'default'
    const savedTheme = localStorage.getItem('colorTheme')
    return savedTheme || 'default'
  })

  const [mode, setMode] = useState(() => {
    // Load mode from localStorage or default to 'light'
    const savedMode = localStorage.getItem('mode')
    return savedMode || 'light'
  })

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme)
  }, [colorTheme])

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mode', mode)
  }, [mode])

  const theme = themeConfig[colorTheme]

  const value = {
    colorTheme,
    setColorTheme,
    mode,
    setMode,
    theme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
