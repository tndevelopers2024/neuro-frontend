import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try {
      return localStorage.getItem('neuromind_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const location = useLocation();

  // Automatically close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Sync desktop collapse state to localStorage
  const toggleDesktopCollapsed = () => {
    setIsDesktopCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('neuromind_sidebar_collapsed', String(next));
      } catch (e) {
        // Ignore local storage error
      }
      return next;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const openMobileSidebar = () => {
    setIsMobileOpen(true);
  };

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
        isDesktopCollapsed,
        setIsDesktopCollapsed,
        toggleDesktopCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
