import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRobloxUser } from './useRobloxUser';

// Define the admin credentials interface
interface AdminCredentials {
  username: string;
  password: string;
}

// Define the admin authentication context type
interface AdminAuthContextType {
  isAdmin: boolean;
  isOwner: boolean;
  login: (credentials: AdminCredentials) => Promise<boolean>;
  logout: () => void;
  currentRole: string | null;
}

// Create context with default values
const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isOwner: false,
  login: async () => false,
  logout: () => {},
  currentRole: null
});

// Custom hook to use the admin auth context
export const useAdmin = () => useContext(AdminAuthContext);

// Provider component
interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const { user, login: userLogin, logout: userLogout } = useRobloxUser();
  
  // Determine admin status based on user role
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const isOwner = user?.role === 'owner';
  const currentRole = user?.role || null;

  // Login function using the API to verify credentials
  const login = async (credentials: AdminCredentials): Promise<boolean> => {
    const success = await userLogin(credentials.username, credentials.password, false);
    
    // We rely on the server to validate if the user has admin/owner role
    // The user status/role will be updated via the useRobloxUser hook
    return success;
  };

  // Logout function
  const logout = () => {
    userLogout();
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isOwner, login, logout, currentRole }}>
      {children}
    </AdminAuthContext.Provider>
  );
};