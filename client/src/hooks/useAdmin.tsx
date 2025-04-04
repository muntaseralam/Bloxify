import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the admin credentials interface
interface AdminCredentials {
  username: string;
  password: string;
}

// Define the admin authentication context type
interface AdminAuthContextType {
  isAdmin: boolean;
  login: (credentials: AdminCredentials) => boolean;
  logout: () => void;
}

// Create context with default values
const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

// Admin credentials (in a real app, this would be verified by an API)
// This is a simple solution for your needs - in production this should be server-side
const ADMIN_USERNAME = 'bloxify2025';
const ADMIN_PASSWORD = 'Gamewebsite@2025'; // You should change this to a secure password

// Custom hook to use the admin auth context
export const useAdmin = () => useContext(AdminAuthContext);

// Provider component
interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for existing admin session on first load
  useEffect(() => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const adminSession = localStorage.getItem('blox_admin_session');
      if (adminSession === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  // Login function to verify admin credentials
  const login = (credentials: AdminCredentials): boolean => {
    if (
      credentials.username === ADMIN_USERNAME &&
      credentials.password === ADMIN_PASSWORD
    ) {
      setIsAdmin(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('blox_admin_session', 'true');
      }
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blox_admin_session');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};