import React, { useState, useEffect, useCallback } from "react";
import { getUserMoments, checkTopShotCapability } from "../services/momentService";
import "./MomentBrowser.css";

// Known TopShot-owning address for testing
const TEST_ADDRESS = "0x599ee3b622bf2721";

const MomentBrowser = ({ address }) => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasCapability, setHasCapability] = useState(null);
  const [filters, setFilters] = useState({
    player: "",
    team: "",
    set: ""
  });

  useEffect(() => {
    if (address) {
      checkCapability(address);
    }
  }, [address, checkCapability]);

  // Function to test with a known TopShot-owning address
  // eslint-disable-next-line no-unused-vars
  const testWithKnownAddress = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("TESTING with known TopShot address:", TEST_ADDRESS);

      // Check capability
      console.log("Checking TopShot capability for test address");
      const hasCapability = await checkTopShotCapability(TEST_ADDRESS);
      console.log("Test address has TopShot capability:", hasCapability);

      if (hasCapability) {
        console.log("Fetching moments for test address");
        const userMoments = await getUserMoments(TEST_ADDRESS);
        console.log("Test address moments count:", userMoments ? userMoments.length : 0);
        console.log("Test address moments data:", userMoments);

        // Display the test results but don't update the main UI state
        alert(`Test Results:\n- Has capability: ${hasCapability}\n- Moments found: ${userMoments ? userMoments.length : 0}`);
      } else {
        alert("Test address does not have TopShot capability. This is unexpected!");
      }
    } catch (err) {
      console.error("Error in test function:", err);
      alert(`Test error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMoments = useCallback(async (userAddress) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching moments for address:", userAddress);
      const result = await getUserMoments(userAddress);
      console.log("Moments data received:", result);
      setMoments(result || []);
    } catch (err) {
      console.error("Failed to load moments:", err);
      setError("Failed to load moments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCapability = useCallback(async (userAddress) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Checking TopShot capability for address:", userAddress);
      const hasCapability = await checkTopShotCapability(userAddress);
      setHasCapability(hasCapability);

      if (hasCapability) {
        loadMoments(userAddress);
      } else {
        setLoading(false);
        setError("This wallet does not have a TopShot collection. Make sure you've connected a wallet that owns NBA Top Shot moments.");
      }
    } catch (err) {
      console.error("Failed to check capability:", err);
      setLoading(false);
      setError("Failed to check if wallet has TopShot collection.");
    }
  }, [loadMoments]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const filteredMoments = moments.filter(moment => {
    return (
      (filters.player === "" || moment.player.toLowerCase().includes(filters.player.toLowerCase())) &&
      (filters.team === "" || moment.team.toLowerCase().includes(filters.team.toLowerCase())) &&
      (filters.set === "" || moment.setName.toLowerCase().includes(filters.set.toLowerCase()))
    );
  });

  // Get unique values for filter dropdowns
  const uniquePlayers = [...new Set(moments.map(m => m.player))].sort();
  const uniqueTeams = [...new Set(moments.map(m => m.team))].sort();
  const uniqueSets = [...new Set(moments.map(m => m.setName))].sort();

  return (
    <div className="moment-browser">
      <h2>Your NBA Top Shot Moments</h2>
      
      {!address ? (
        <div className="connect-prompt">
          <p>Connect your wallet to view your moments</p>
        </div>
      ) : loading ? (
        <div className="loading">Loading your moments...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : hasCapability === false ? (
        <div className="no-moments">
          <p>This wallet does not have a TopShot collection. Please connect a wallet that owns NBA Top Shot moments.</p>
        </div>
      ) : moments.length === 0 ? (
        <div className="no-moments">
          <p>No moments found in your collection</p>
        </div>
      ) : (
        <>
          {/* Debug display to show raw moment data */}
          <div className="debug-section">
            <details>
              <summary>Debug: Raw Moment Data ({moments.length} moments)</summary>
              <pre style={{ textAlign: 'left', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(moments, null, 2)}
              </pre>
            </details>
          </div>
          
          <div className="filters">
            <div className="filter-item">
              <label htmlFor="player-filter">Player:</label>
              <select 
                id="player-filter" 
                name="player" 
                value={filters.player} 
                onChange={handleFilterChange}
              >
                <option value="">All Players</option>
                {uniquePlayers.map(player => (
                  <option key={player} value={player}>{player}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="team-filter">Team:</label>
              <select 
                id="team-filter" 
                name="team" 
                value={filters.team} 
                onChange={handleFilterChange}
              >
                <option value="">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="set-filter">Set:</label>
              <select 
                id="set-filter" 
                name="set" 
                value={filters.set} 
                onChange={handleFilterChange}
              >
                <option value="">All Sets</option>
                {uniqueSets.map(set => (
                  <option key={set} value={set}>{set}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="moments-count">
            Showing {filteredMoments.length} of {moments.length} moments
          </div>
          
          <div className="moment-grid">
            {filteredMoments.map(moment => (
              <div key={moment.id} className="moment-card">
                <div className="moment-header">
                  <h3>{moment.player}</h3>
                  <span className="serial-number">#{moment.serialNumber}</span>
                </div>
                <div className="moment-image">
                  {moment.imageURL && (
                    <img 
                      src={moment.imageURL} 
                      alt={`${moment.player} - ${moment.playCategory}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://assets.nbatopshot.com/static/img/placeholder.png";
                      }}
                    />
                  )}
                </div>
                <div className="moment-details">
                  <p><strong>Set:</strong> {moment.setName}</p>
                  <p><strong>Team:</strong> {moment.team}</p>
                  <p><strong>Play:</strong> {moment.playCategory}</p>
                  <p><strong>Date:</strong> {moment.date}</p>
                  {moment.videoURL && (
                    <p>
                      <a href={moment.videoURL} target="_blank" rel="noopener noreferrer" className="video-link">
                        Watch Video
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MomentBrowser;
