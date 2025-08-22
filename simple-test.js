// Simple test script for Flow address capability check
const fcl = require("@onflow/fcl");

// Configure FCL for Flow mainnet with QuickNode
fcl.config()
  .put("accessNode.api", "https://tame-withered-dinghy.flow-mainnet.quiknode.pro/649d8a6cc7fe28ef47bc69d33ee14ba18427fd8c/")
  .put("flow.network", "mainnet")
  .put("0xTopShot", "0x0b2a3299cc857e29")
  .put("0xNonFungibleToken", "0x1d7e57aa55817448");

// The address we want to test
const TEST_ADDRESS = "0x599ee3b622bf2721";

// Simple capability check script
const checkCapabilityScript = `
  import TopShot from 0x0b2a3299cc857e29
  import NonFungibleToken from 0x1d7e57aa55817448

  pub fun main(user: Address): Bool {
    let account = getAccount(user)
    
    // Try multiple possible capability paths
    // First try the standard path
    let capability = account.getCapability<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/MomentCollection)
    if capability.check() {
      return true
    }
    
    // Try alternative paths
    let altCapability = account.getCapability<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
    if altCapability.check() {
      return true
    }
    
    // Try with a different path
    let altCapability2 = account.getCapability<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/TopShotCollection)
    if altCapability2.check() {
      return true
    }
    
    return false
  }
`;

async function runTest() {
  console.log("Testing address:", TEST_ADDRESS);
  
  try {
    console.log("Checking capability...");
    const result = await fcl.query({
      cadence: checkCapabilityScript,
      args: (arg, t) => [arg(TEST_ADDRESS, t.Address)],
      limit: 9999
    });
    
    console.log("Capability check result:", result);
    
    if (result) {
      console.log("Address has TopShot capability");
    } else {
      console.log("Address does not have TopShot capability");
    }
  } catch (error) {
    console.error("Error in test:", error);
  }
}

// Run the test
console.log("Starting test...");
runTest()
  .then(() => console.log("Test completed"))
  .catch(err => console.error("Test failed:", err));
