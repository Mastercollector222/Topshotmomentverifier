import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

const Authentication = () => {
  const [user, setUser] = useState({ loggedIn: false });
  const [authError, setAuthError] = useState(null);
  
  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);
  
  const login = async () => {
    try {
      console.log("Starting authentication process...");
      setAuthError(null);
      await fcl.authenticate();
      console.log("Authentication successful");
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError("Failed to connect wallet. Please try again.");
    }
  };
  
  const logout = () => {
    try {
      fcl.unauthenticate();
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
    <div className="authentication">
      {user.loggedIn ? (
        <div className="user-info">
          <span>Connected: {user.addr}</span>
          <button onClick={logout} className="logout-button">Log Out</button>
        </div>
      ) : (
        <div>
          <button onClick={login} className="login-button">Connect Wallet</button>
          {authError && <div className="auth-error">{authError}</div>}
        </div>
      )}
    </div>
  );
};

export default Authentication;
