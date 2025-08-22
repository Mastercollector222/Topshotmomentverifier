// Verification rules for NBA Top Shot moments
const verificationRules = {
  // Check if user owns at least one moment from a specific set
  hasSetMoment: (moments, setName) => {
    if (!setName) return { passed: false, message: "No set name provided" };
    
    const hasMoment = moments.some(moment => 
      moment.setName.toLowerCase().includes(setName.toLowerCase())
    );
    
    return {
      passed: hasMoment,
      message: hasMoment 
        ? `✓ Owns at least one moment from ${setName}`
        : `✗ Does not own any moments from ${setName}`
    };
  },
  
  // Check if user owns a moment of a specific player
  hasPlayerMoment: (moments, playerName) => {
    if (!playerName) return { passed: false, message: "No player name provided" };
    
    const hasMoment = moments.some(moment => 
      moment.player.toLowerCase().includes(playerName.toLowerCase())
    );
    
    return {
      passed: hasMoment,
      message: hasMoment 
        ? `✓ Owns at least one moment of ${playerName}`
        : `✗ Does not own any moments of ${playerName}`
    };
  },
  
  // Check if user owns a moment from a specific team
  hasTeamMoment: (moments, teamName) => {
    if (!teamName) return { passed: false, message: "No team name provided" };
    
    const hasMoment = moments.some(moment => 
      moment.team.toLowerCase().includes(teamName.toLowerCase())
    );
    
    return {
      passed: hasMoment,
      message: hasMoment 
        ? `✓ Owns at least one moment from ${teamName}`
        : `✗ Does not own any moments from ${teamName}`
    };
  },
  
  // Check if user owns a minimum number of moments
  hasMinimumMoments: (moments, count) => {
    const minimumCount = parseInt(count);
    if (isNaN(minimumCount) || minimumCount <= 0) {
      return { passed: false, message: "Invalid minimum count" };
    }
    
    const hasMoments = moments.length >= minimumCount;
    
    return {
      passed: hasMoments,
      message: hasMoments 
        ? `✓ Owns at least ${minimumCount} moments (${moments.length} total)`
        : `✗ Owns only ${moments.length} moments (minimum ${minimumCount} required)`
    };
  },
  
  // Check if user owns a specific moment by ID
  hasSpecificMoment: (moments, momentId) => {
    if (!momentId) return { passed: false, message: "No moment ID provided" };
    
    const id = parseInt(momentId);
    if (isNaN(id)) return { passed: false, message: "Invalid moment ID" };
    
    const hasMoment = moments.some(moment => moment.id === id);
    
    return {
      passed: hasMoment,
      message: hasMoment 
        ? `✓ Owns moment with ID ${id}`
        : `✗ Does not own moment with ID ${id}`
    };
  },
  
  // Check if user owns a moment from a specific play category
  hasPlayCategoryMoment: (moments, category) => {
    if (!category) return { passed: false, message: "No play category provided" };
    
    const hasMoment = moments.some(moment => 
      moment.playCategory.toLowerCase().includes(category.toLowerCase())
    );
    
    return {
      passed: hasMoment,
      message: hasMoment 
        ? `✓ Owns at least one ${category} moment`
        : `✗ Does not own any ${category} moments`
    };
  },
  
  // Check if user owns a low serial number moment (e.g., under 100)
  hasLowSerialMoment: (moments, maxSerial) => {
    const threshold = parseInt(maxSerial);
    if (isNaN(threshold) || threshold <= 0) {
      return { passed: false, message: "Invalid serial number threshold" };
    }
    
    const hasMoment = moments.some(moment => moment.serialNumber <= threshold);
    
    return {
      passed: hasMoment,
      message: hasMoment 
        ? `✓ Owns at least one moment with serial number <= ${threshold}`
        : `✗ Does not own any moments with serial number <= ${threshold}`
    };
  }
};

// Function to verify moments against a set of criteria
export function verifyMoments(moments, criteria) {
  if (!moments || !Array.isArray(moments)) {
    return { 
      passed: false, 
      results: [], 
      message: "No valid moments provided" 
    };
  }
  
  if (!criteria || typeof criteria !== 'object' || Object.keys(criteria).length === 0) {
    return { 
      passed: false, 
      results: [], 
      message: "No verification criteria provided" 
    };
  }
  
  const results = [];
  let allPassed = true;
  
  for (const [rule, params] of Object.entries(criteria)) {
    if (verificationRules[rule]) {
      const result = verificationRules[rule](moments, params);
      results.push({
        rule,
        params,
        passed: result.passed,
        message: result.message
      });
      
      if (!result.passed) {
        allPassed = false;
      }
    } else {
      results.push({
        rule,
        params,
        passed: false,
        message: `Unknown verification rule: ${rule}`
      });
      allPassed = false;
    }
  }
  
  return {
    passed: allPassed,
    results,
    message: allPassed 
      ? "All verification criteria passed!" 
      : "Some verification criteria failed."
  };
}

export default {
  verifyMoments,
  rules: Object.keys(verificationRules)
};
