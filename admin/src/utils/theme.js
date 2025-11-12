export const themes = {
  theme1: {
    navbar: 'bg-gray-800',
    addButton: 'bg-gray-700',
    tableHeader: 'bg-gray-700',
  },
  theme2: {
    navbar: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900',
    addButton: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    tableHeader: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600',
  },

  theme3: {
    navbar: 'bg-gradient-to-r from-slate-800 via-blue-900 to-cyan-900',
    addButton: 'bg-gradient-to-r from-slate-700 to-gray-800',
    tableHeader: 'bg-gradient-to-r from-slate-600 via-blue-600 to-cyan-600',
  },


  theme4: {
    navbar: 'bg-gradient-to-r from-teal-800 via-cyan-800 to-sky-800',
    addButton: 'bg-gradient-to-r from-teal-600 to-sky-600',
    tableHeader: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600',
  },
 


  theme5: {
    navbar: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-blue-950',
    addButton: 'bg-gradient-to-r from-purple-900 to-indigo-900',
    tableHeader: 'bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900',
  },


  theme6: {
    navbar: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950',
    addButton: 'bg-gradient-to-r from-emerald-800 to-teal-800',
    tableHeader: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900',
  },
};

// Vehicle Number Design Styles
export const vehicleNumberDesigns = {
  design1: {
    name: 'Classic',
    description: 'Yellow highlight on last 4 digits',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-gray-900 px-1.5 py-0.5 rounded',
  },
  design2: {
    name: 'Classic Highlight',
    description: 'Yellow highlight on last 4 digits',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-indigo-600 bg-yellow-100 px-1.5 py-0.5 rounded',
  },

  design3: {
    name: 'Modern Gradient',
    description: 'Gradient background with shadow',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-2 py-0.5 rounded shadow-md',
  },

  design3: {
    name: 'Bold Badge',
    description: 'Badge style with border',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-blue-700 bg-blue-50 border-2 border-blue-500 px-1.5 py-0.5 rounded',
  },

  design4: {
    name: 'Neon Glow',
    description: 'Glowing effect on digits',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ring-2 ring-emerald-300',
  },

  design5: {
    name: 'Dark Mode',
    description: 'Dark background with light text',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-white bg-gray-600 px-2 py-0.5 rounded',
  },

  design6: {
    name: 'Colorful Parts',
    description: 'Different colors for each part',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded',
    districtCode: 'text-sm font-inter font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded',
    series: 'text-sm font-inter font-bold text-purple-600 bg-purple-50 px-1 py-0.5 rounded',
    last4Digits: 'text-sm font-inter font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded font-extrabold',
  },

  design7: {
    name: 'Minimal Clean',
    description: 'Simple and clean design',
    container: 'flex items-center gap-1',
    stateCode: 'text-sm font-inter font-semibold text-gray-600',
    districtCode: 'text-sm font-inter font-semibold text-gray-600',
    series: 'text-sm font-inter font-semibold text-gray-600',
    last4Digits: 'text-sm font-inter font-bold text-gray-900 underline decoration-2 decoration-indigo-500',
  },

  design8: {
    name: 'Premium Gold',
    description: 'Luxury gold accent',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-amber-900 bg-gradient-to-r from-amber-200 to-yellow-300 px-2 py-0.5 rounded border border-amber-400',
  },
  design9: {
    name: 'Premium neon',
    description: 'Luxury gold accent',
    container: 'flex items-center gap-0.5',
    stateCode: 'text-sm font-inter font-bold text-gray-700',
    districtCode: 'text-sm font-inter font-bold text-gray-700',
    series: 'text-sm font-inter font-bold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-amber-900 bg-gradient-to-r from-amber-200 to-yellow-300 px-2 py-0.5 rounded border border-amber-400',
  },

  design10: {
    name: 'Sleek Blue',
    description: 'Simple blue accent',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-800',
    districtCode: 'text-sm font-inter font-semibold text-gray-800',
    series: 'text-sm font-inter font-semibold text-gray-800',
    last4Digits: 'text-sm font-inter font-bold text-blue-600 ml-0.5',
  },

  design11: {
    name: 'Soft Pink',
    description: 'Gentle pink highlight',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-medium text-gray-700',
    districtCode: 'text-sm font-inter font-medium text-gray-700',
    series: 'text-sm font-inter font-medium text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-pink-600 bg-pink-50 px-1 py-0.5 rounded ml-0.5',
  },

  design12: {
    name: 'Sharp Teal',
    description: 'Bold teal emphasis',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-teal-700 bg-teal-100 px-1 py-0.5 ml-0.5',
  },

  design13: {
    name: 'Elegant Purple',
    description: 'Sophisticated purple',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-medium text-gray-600',
    districtCode: 'text-sm font-inter font-medium text-gray-600',
    series: 'text-sm font-inter font-medium text-gray-600',
    last4Digits: 'text-sm font-inter font-bold text-purple-700 border-b-2 border-purple-500 ml-0.5',
  },

  design14: {
    name: 'Fresh Lime',
    description: 'Vibrant lime accent',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-lime-700 bg-lime-100 px-1 py-0.5 rounded ml-0.5',
  },

  design15: {
    name: 'Warm Orange',
    description: 'Warm orange glow',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-medium text-gray-700',
    districtCode: 'text-sm font-inter font-medium text-gray-700',
    series: 'text-sm font-inter font-medium text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-orange-700 bg-orange-50 px-1 py-0.5 rounded ml-0.5',
  },

  design16: {
    name: 'Cool Cyan',
    description: 'Cool cyan highlight',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-cyan-700 bg-cyan-50 px-1 py-0.5 ml-0.5',
  },

  design17: {
    name: 'Royal Red',
    description: 'Bold red emphasis',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-medium text-gray-700',
    districtCode: 'text-sm font-inter font-medium text-gray-700',
    series: 'text-sm font-inter font-medium text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-red-700 bg-red-50 px-1 py-0.5 rounded ml-0.5',
  },

  design18: {
    name: 'Forest Green',
    description: 'Natural green tone',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-sm font-inter font-bold text-green-700 bg-green-50 px-1 py-0.5 rounded ml-0.5',
  },

  design19: {
    name: 'Steel Gray',
    description: 'Professional gray',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-medium text-gray-600',
    districtCode: 'text-sm font-inter font-medium text-gray-600',
    series: 'text-sm font-inter font-medium text-gray-600',
    last4Digits: 'text-sm font-inter font-bold text-gray-900 bg-gray-200 px-1 py-0.5 rounded ml-0.5',
  },

  design20: {
    name: 'Big Bold Blue',
    description: 'Large blue vehicle number',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-lg font-inter font-extrabold text-blue-700 ml-0.5',
  },

  design21: {
    name: 'Large Crimson',
    description: 'Big crimson red style',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-lg font-inter font-extrabold text-red-700 ml-0.5',
  },

  design22: {
    name: 'Big Emerald',
    description: 'Large emerald green',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-lg font-inter font-extrabold text-emerald-700 ml-0.5',
  },

  design23: {
    name: 'Large Violet',
    description: 'Big violet purple',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-lg font-inter font-extrabold text-violet-700 ml-0.5',
  },

  design24: {
    name: 'Big Amber',
    description: 'Large amber gold',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700',
    districtCode: 'text-sm font-inter font-semibold text-gray-700',
    series: 'text-sm font-inter font-semibold text-gray-700',
    last4Digits: 'text-lg font-inter font-extrabold text-amber-700 ml-0.5',
  },

  design25: {
    name: 'Dash Classic',
    description: 'Classic with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-gray-700 after:content-["-"] after:mx-0.5 after:text-gray-400',
    districtCode: 'text-sm font-inter font-semibold text-gray-700 after:content-["-"] after:mx-0.5 after:text-gray-400',
    series: 'text-sm font-inter font-semibold text-gray-700 after:content-["-"] after:mx-0.5 after:text-gray-400',
    last4Digits: 'text-sm font-inter font-bold text-indigo-600',
  },

  design26: {
    name: 'Dash Blue',
    description: 'Blue with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-blue-700 after:content-["-"] after:mx-0.5 after:text-blue-300',
    districtCode: 'text-sm font-inter font-semibold text-blue-700 after:content-["-"] after:mx-0.5 after:text-blue-300',
    series: 'text-sm font-inter font-semibold text-blue-700 after:content-["-"] after:mx-0.5 after:text-blue-300',
    last4Digits: 'text-sm font-inter font-bold text-blue-900 bg-blue-50 px-1 py-0.5 rounded',
  },

  design27: {
    name: 'Dash Green',
    description: 'Green with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-green-700 after:content-["-"] after:mx-0.5 after:text-green-300',
    districtCode: 'text-sm font-inter font-semibold text-green-700 after:content-["-"] after:mx-0.5 after:text-green-300',
    series: 'text-sm font-inter font-semibold text-green-700 after:content-["-"] after:mx-0.5 after:text-green-300',
    last4Digits: 'text-sm font-inter font-bold text-green-900 bg-green-50 px-1 py-0.5 rounded',
  },

  design28: {
    name: 'Dash Red',
    description: 'Red with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-red-700 after:content-["-"] after:mx-0.5 after:text-red-300',
    districtCode: 'text-sm font-inter font-semibold text-red-700 after:content-["-"] after:mx-0.5 after:text-red-300',
    series: 'text-sm font-inter font-semibold text-red-700 after:content-["-"] after:mx-0.5 after:text-red-300',
    last4Digits: 'text-sm font-inter font-bold text-red-900 bg-red-50 px-1 py-0.5 rounded',
  },

  design29: {
    name: 'Dash Purple',
    description: 'Purple with dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-semibold text-purple-700 after:content-["-"] after:mx-0.5 after:text-purple-300',
    districtCode: 'text-sm font-inter font-semibold text-purple-700 after:content-["-"] after:mx-0.5 after:text-purple-300',
    series: 'text-sm font-inter font-semibold text-purple-700 after:content-["-"] after:mx-0.5 after:text-purple-300',
    last4Digits: 'text-sm font-inter font-bold text-purple-900 bg-purple-50 px-1 py-0.5 rounded',
  },

  design30: {
    name: 'Dash Bold',
    description: 'Bold with thick dashes',
    container: 'flex items-center gap-0',
    stateCode: 'text-sm font-inter font-bold text-gray-800 after:content-["-"] after:mx-1 after:text-gray-600 after:font-extrabold',
    districtCode: 'text-sm font-inter font-bold text-gray-800 after:content-["-"] after:mx-1 after:text-gray-600 after:font-extrabold',
    series: 'text-sm font-inter font-bold text-gray-800 after:content-["-"] after:mx-1 after:text-gray-600 after:font-extrabold',
    last4Digits: 'text-sm font-inter font-extrabold text-gray-900 bg-yellow-100 px-1.5 py-0.5 rounded',
  },
};
