import React, { createContext } from 'react';
import { themes, vehicleNumberDesigns } from '../utils/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const themeName = localStorage.getItem('theme') || 'theme1';
  const currentTheme = themes[themeName] || themes.theme1;

  const vehicleDesignName = localStorage.getItem('vehicleNumberDesign') || 'design1';
  const currentVehicleDesign = vehicleNumberDesigns[vehicleDesignName] || vehicleNumberDesigns.design1;

  const setTheme = (name) => {
    localStorage.setItem('theme', name);
    window.location.reload();
  };

  const setVehicleNumberDesign = (name) => {
    localStorage.setItem('vehicleNumberDesign', name);
    window.location.reload();
  };

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      setTheme,
      themes,
      themeName,
      vehicleNumberDesign: currentVehicleDesign,
      vehicleDesignName,
      setVehicleNumberDesign,
      vehicleNumberDesigns
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const getTheme = () => {
  const themeName = localStorage.getItem('theme') || 'theme1';
  return themes[themeName] || themes.theme1;
};

export const getVehicleNumberDesign = () => {
  const vehicleDesignName = localStorage.getItem('vehicleNumberDesign') || 'design1';
  return vehicleNumberDesigns[vehicleDesignName] || vehicleNumberDesigns.design1;
};

export const getAllThemes = () => themes;

export const getAllVehicleNumberDesigns = () => vehicleNumberDesigns;

export default ThemeContext;
