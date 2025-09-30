import React, { useState, useEffect, createContext, useContext } from 'react';

interface AdminContextType {
  admin: { username: string; role: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [admin, setAdmin] = useState<{ username: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = async () => {
    try {
      const response = await fetch('/api/admin/me');
      if (response.ok) {
        const { admin } = await response.json();
        setAdmin(admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Admin login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setAdmin(null);
    } catch (error) {
      console.error('Admin logout error:', error);
      setAdmin(null);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  const contextValue: AdminContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    refreshAdmin,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}