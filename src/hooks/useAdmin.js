import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// List of admin addresses that are allowed to access the admin dashboard
const ADMIN_ADDRESSES = [
  // Add your admin Flow addresses here
  "0x9d3c5dbd3a95f717",  // Default admin address - replace with your own if needed
  // You can add more admin addresses here
];

/**
 * Hook to check if the current user has admin privileges
 * @returns {Object} Admin state and login function
 */
export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if the current Flow address is in the admin list
  useEffect(() => {
    if (user?.addr) {
      setIsAdmin(ADMIN_ADDRESSES.includes(user.addr));
      setLoading(false);
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);
  
  // Admin login with email/password (separate from Flow wallet)
  const adminLogin = async (email, password) => {
    try {
      setError(null);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdmin(true);
      return true;
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message);
      return false;
    }
  };
  
  return { isAdmin, loading, error, adminLogin };
};

export default useAdmin;
