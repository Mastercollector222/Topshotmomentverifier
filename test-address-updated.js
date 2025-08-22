// Test script to check a specific Flow address for NBA TopShot moments with updated capability paths
const fcl = require("@onflow/fcl");
require("./src/config/fcl"); // Import FCL configuration
const { getUserMoments, checkTopShotCapability } = require("./src/services/momentService");

// The address we want to test
const TEST_ADDRESS = "0x599ee3b622bf2721";

async function testAddress() {
  console.log("Testing address:", TEST_ADDRESS);
  console.log("FCL config:", fcl.config().all());
  
  try {
    // First check if the address has TopShot capability
    console.log("Checking TopShot capability...");
    console.log("Starting capability check at:", new Date().toISOString());
    const hasCapability = await checkTopShotCapability(TEST_ADDRESS);
    console.log("Capability check completed at:", new Date().toISOString());
    console.log("Has TopShot capability:", hasCapability);
    
    // Regardless of capability check result, try to fetch moments
    console.log("Fetching moments...");
    console.log("Starting moment fetch at:", new Date().toISOString());
    const moments = await getUserMoments(TEST_ADDRESS);
    console.log("Moment fetch completed at:", new Date().toISOString());
    console.log("Found moments:", moments.length);
    
    if (moments.length > 0) {
      // Display some details about the first few moments
      console.log("First moment details:", JSON.stringify(moments[0], null, 2));
      
      if (moments.length > 1) {
        console.log("Second moment details:", JSON.stringify(moments[1], null, 2));
      }
    } else {
      console.log("No moments found for this address");
    }
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

// Force console output to be synchronous
process.stdout.write = function(str) {
  return require('fs').writeSync(1, str);
};

console.log('Starting test script execution...');

// Run the test
testAddress()
  .then(() => console.log("Test completed"))
  .catch(err => {
    console.error("Test failed with error:");
    console.error(err);
    if (err.stack) console.error(err.stack);
  })
  .finally(() => console.log('Test script execution finished'));
