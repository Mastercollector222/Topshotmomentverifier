// Test script to check a specific Flow address for NBA TopShot moments
import * as fcl from "@onflow/fcl";
import "./config/fcl"; // Import FCL configuration
import { getUserMoments, checkTopShotCapability } from "./services/momentService";

const TEST_ADDRESS = "0x214fdf1a68530b98";

async function testAddress() {
  console.log("Testing address:", TEST_ADDRESS);
  
  try {
    // First check if the address has TopShot capability
    console.log("Checking TopShot capability...");
    const hasCapability = await checkTopShotCapability(TEST_ADDRESS);
    console.log("Has TopShot capability:", hasCapability);
    
    if (hasCapability) {
      // If it has capability, fetch the moments
      console.log("Fetching moments...");
      const moments = await getUserMoments(TEST_ADDRESS);
      console.log("Found moments:", moments.length);
      
      if (moments.length > 0) {
        // Display some details about the first few moments
        console.log("\nFirst 5 moments:");
        moments.slice(0, 5).forEach((moment, index) => {
          console.log(`\nMoment #${index + 1}:`);
          console.log(`ID: ${moment.id}`);
          console.log(`Play ID: ${moment.playID}`);
          console.log(`Set ID: ${moment.setID}`);
          console.log(`Serial Number: ${moment.serialNumber}`);
        });
      } else {
        console.log("No moments found for this address.");
      }
    } else {
      console.log("This address does not have TopShot capability.");
    }
  } catch (error) {
    console.error("Error testing address:", error);
  }
}

// Run the test
testAddress();
