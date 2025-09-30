import React, { useState, useEffect, createContext, useContext } from 'react';


interface AdminSession {
  access_token: string;
  // include other session properties if needed
}
interface AdminUser {
  email: string;
  role: string;
  id: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  session: AdminSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);
const ADMIN_SESSION_KEY = 'supabase.admin.session';



export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial load, try to load session from localStorage
    try {
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSession(parsed.session);
        setAdmin(parsed.admin);
      }
    } catch (error) {
      console.error("Failed to parse admin session from localStorage", error);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ email, password }),

      });

      const data = await response.json();


      if (response.ok && data.success) {
        setAdmin(data.admin);
        setSession(data.session);
        // Persist the session and user info
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ admin: data.admin, session: data.session }));

        return { success: true };
      } else {
        return { success: false, error: data.message || 'Admin login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {

    if (!session) return;
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
    } catch (error) {
      console.error('Admin logout API call failed:', error);
    } finally {
      // Always clear local state and storage regardless of API call success
      setAdmin(null);
      setSession(null);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  };

  const contextValue: AdminContextType = {
    admin,
    session,
    isLoading,
    isAuthenticated: !!admin && !!session,
    login,
    logout,

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