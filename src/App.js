import React, { useState, useEffect } from 'react';
import './App.css';
import * as fcl from '@onflow/fcl';
import './config/fcl';
import Authentication from './components/Authentication';
import MomentBrowser from './components/MomentBrowser';
import VerificationWidget from './components/VerificationWidget';
import EdwardsMomentVerifier from './components/EdwardsMomentVerifier';
import AdminDashboard from './components/AdminDashboard';
import { getUserMoments } from './services/momentService';

function App() {
  const [user, setUser] = useState({ loggedIn: false });
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'verify', 'edwards', or 'admin'

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    if (user.loggedIn && user.addr) {
      loadUserMoments(user.addr);
    } else {
      setMoments([]);
    }
  }, [user.loggedIn, user.addr]);

  const loadUserMoments = async (address) => {
    setLoading(true);
    try {
      const userMoments = await getUserMoments(address);
      setMoments(userMoments || []);
    } catch (error) {
      console.error('Error loading moments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>NBA Top Shot Moment Verifier</h1>
        <Authentication />
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Moments
        </button>
        <button 
          className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          Verify Ownership
        </button>
        <button 
          className={`tab-button ${activeTab === 'edwards' ? 'active' : ''}`}
          onClick={() => setActiveTab('edwards')}
        >
          Edwards Moment
        </button>
        <button 
          className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin
        </button>
      </div>

      <main>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your NBA Top Shot moments...</p>
          </div>
        ) : (
          <>
            {activeTab === 'browse' && (
              <MomentBrowser address={user.addr} moments={moments} />
            )}
            
            {activeTab === 'verify' && (
              <VerificationWidget address={user.addr} moments={moments} />
            )}
            
            {activeTab === 'edwards' && (
              <EdwardsMomentVerifier requiredCount={5} />
            )}
            
            {activeTab === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} NBA Top Shot Moment Verifier</p>
        <p>Built with Flow blockchain</p>
      </footer>
    </div>
  );
}

export default App;
