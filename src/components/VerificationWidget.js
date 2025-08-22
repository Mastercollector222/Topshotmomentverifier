import React, { useState } from "react";
import { verifyMoments } from "../services/verificationService";
import "./VerificationWidget.css";

const VerificationWidget = ({ address, moments }) => {
  const [criteria, setCriteria] = useState([
    { type: "hasPlayerMoment", value: "" },
  ]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const criteriaOptions = [
    { value: "hasPlayerMoment", label: "Owns a player's moment" },
    { value: "hasSetMoment", label: "Owns a moment from set" },
    { value: "hasTeamMoment", label: "Owns a team's moment" },
    { value: "hasMinimumMoments", label: "Owns minimum number of moments" },
    { value: "hasPlayCategoryMoment", label: "Owns a play category moment" },
    { value: "hasLowSerialMoment", label: "Owns a low serial number moment" },
    { value: "hasSpecificMoment", label: "Owns a specific moment ID" }
  ];

  const handleCriteriaTypeChange = (index, type) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], type, value: "" };
    setCriteria(newCriteria);
  };

  const handleCriteriaValueChange = (index, value) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], value };
    setCriteria(newCriteria);
  };

  const addCriteria = () => {
    setCriteria([...criteria, { type: "hasPlayerMoment", value: "" }]);
  };

  const removeCriteria = (index) => {
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    setCriteria(newCriteria);
  };

  const handleVerify = () => {
    if (!address || !moments || moments.length === 0) {
      setResults({
        passed: false,
        results: [],
        message: "No moments available to verify"
      });
      return;
    }

    setLoading(true);

    // Convert criteria array to object format expected by verifyMoments
    const criteriaObj = {};
    criteria.forEach(c => {
      if (c.value.trim() !== "") {
        criteriaObj[c.type] = c.value.trim();
      }
    });

    // Perform verification
    const verificationResults = verifyMoments(moments, criteriaObj);
    setResults(verificationResults);
    setLoading(false);
  };

  const getPlaceholder = (type) => {
    switch (type) {
      case "hasPlayerMoment": return "e.g., LeBron James";
      case "hasSetMoment": return "e.g., Base Set Series 2";
      case "hasTeamMoment": return "e.g., Los Angeles Lakers";
      case "hasMinimumMoments": return "e.g., 5";
      case "hasPlayCategoryMoment": return "e.g., Dunk";
      case "hasLowSerialMoment": return "e.g., 100";
      case "hasSpecificMoment": return "e.g., 12345678";
      default: return "";
    }
  };

  return (
    <div className="verification-widget">
      <h2>Verify Moment Ownership</h2>

      {!address ? (
        <div className="connect-prompt">
          <p>Connect your wallet to verify moment ownership</p>
        </div>
      ) : moments.length === 0 ? (
        <div className="no-moments">
          <p>No moments found to verify</p>
        </div>
      ) : (
        <>
          <div className="criteria-container">
            <h3>Verification Criteria</h3>
            {criteria.map((criterion, index) => (
              <div key={index} className="criterion">
                <select
                  value={criterion.type}
                  onChange={(e) => handleCriteriaTypeChange(index, e.target.value)}
                >
                  {criteriaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={criterion.value}
                  onChange={(e) => handleCriteriaValueChange(index, e.target.value)}
                  placeholder={getPlaceholder(criterion.type)}
                />
                {criteria.length > 1 && (
                  <button 
                    className="remove-btn"
                    onClick={() => removeCriteria(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="add-criterion-btn" onClick={addCriteria}>
              + Add Criterion
            </button>
          </div>

          <button 
            className="verify-btn"
            onClick={handleVerify}
            disabled={loading || criteria.every(c => c.value.trim() === "")}
          >
            {loading ? "Verifying..." : "Verify Ownership"}
          </button>

          {results && (
            <div className={`verification-results ${results.passed ? 'passed' : 'failed'}`}>
              <h3>Verification Results</h3>
              <div className="results-message">{results.message}</div>
              <ul className="results-list">
                {results.results.map((result, index) => (
                  <li key={index} className={result.passed ? 'passed' : 'failed'}>
                    {result.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerificationWidget;
