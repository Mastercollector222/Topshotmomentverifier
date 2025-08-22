import { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

/**
 * Custom hook for Flow authentication
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState({ loggedIn: false });
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Subscribe to user authentication changes
    const unsubscribe = fcl.currentUser.subscribe(currentUser => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logIn = async () => {
    try {
      setAuthError(null);
      await fcl.authenticate();
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError("Failed to authenticate with wallet. Please try again.");
    }
  };

  const logOut = async () => {
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user,
    logIn,
    logOut,
    authError
  };
};

export default useAuth;
