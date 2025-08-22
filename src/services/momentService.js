import * as fcl from "@onflow/fcl";
// eslint-disable-next-line no-unused-vars
import * as t from "@onflow/types";

// Rate limiting implementation
const requestQueue = [];
let isProcessing = false;
const MAX_REQUESTS_PER_MINUTE = 30; // Limit to 30 requests per minute
const requestTimestamps = [];

// Helper function to implement rate limiting
async function executeWithRateLimit(fn) {
  return new Promise((resolve, reject) => {
    // Add request to queue
    requestQueue.push({ fn, resolve, reject });
    
    // Start processing if not already processing
    if (!isProcessing) {
      processQueue();
    }
  });
}

async function processQueue() {
  if (requestQueue.length === 0) {
    isProcessing = false;
    return;
  }
  
  isProcessing = true;
  
  // Check if we're within rate limits
  const now = Date.now();
  // Remove timestamps older than 1 minute
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > 60000) {
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    // We've hit the rate limit, wait and try again
    console.log(`Rate limit reached. Waiting before next request...`);
    setTimeout(processQueue, 2000);
    return;
  }
  
  // Process next request
  const { fn, resolve, reject } = requestQueue.shift();
  requestTimestamps.push(now);
  
  try {
    const result = await fn();
    resolve(result);
  } catch (error) {
    console.error("Error in rate-limited function:", error);
    reject(error);
  }
  
  // Wait a short time between requests to avoid bursts
  setTimeout(processQueue, 200);
}

// Script to get all moments for a user
export async function getUserMoments(address) {
  if (!address) return [];
  
  console.log("========== STARTING getUserMoments ==========");
  console.log("Address to query:", address);
  
  const script = `
    import TopShot from 0x0b2a3299cc857e29
    import NonFungibleToken from 0x1d7e57aa55817448
    import MetadataViews from 0x1d7e57aa55817448

    access(all) struct MomentData {
      access(all) let id: UInt64
      access(all) let serialNumber: UInt32
      access(all) let player: String
      access(all) let team: String
      access(all) let date: String
      access(all) let playCategory: String
      access(all) let setName: String
      access(all) let imageURL: String
      access(all) let videoURL: String

      init(id: UInt64, s: UInt32, p: String, t: String, d: String, pc: String, sn: String, img: String, vid: String) {
        self.id = id
        self.serialNumber = s
        self.player = p
        self.team = t
        self.date = d
        self.playCategory = pc
        self.setName = sn
        self.imageURL = img
        self.videoURL = vid
      }
    }

    access(all) fun main(user: Address): [MomentData] {
      let account = getAccount(user)
      var collectionRef: &{TopShot.MomentCollectionPublic}? = nil
      
      // Try multiple possible capability paths
      // First try the standard path
      if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/MomentCollection).borrow() {
        collectionRef = ref
        log("Found collection at /public/MomentCollection with TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic")
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection).borrow() {
        collectionRef = ref
        log("Found collection at /public/MomentCollection with TopShot.MomentCollectionPublic")
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/TopShotCollection).borrow() {
        collectionRef = ref
        log("Found collection at /public/TopShotCollection with both interfaces")
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/TopShotCollection).borrow() {
        collectionRef = ref
        log("Found collection at /public/TopShotCollection with TopShot interface only")
      } else if let ref = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection).borrow() {
        // Try to cast to TopShot collection
        if let tsRef = ref as? &{TopShot.MomentCollectionPublic} {
          collectionRef = tsRef
          log("Found collection at /public/MomentCollection with NFT interface, cast to TopShot")
        } else {
          log("Found NFT collection but couldn't cast to TopShot collection")
        }
      } else if let ref = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/TopShotCollection).borrow() {
        // Try to cast to TopShot collection
        if let tsRef = ref as? &{TopShot.MomentCollectionPublic} {
          collectionRef = tsRef
          log("Found collection at /public/TopShotCollection with NFT interface, cast to TopShot")
        } else {
          log("Found NFT collection at TopShotCollection but couldn't cast to TopShot collection")
        }
      } else if let ref = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/NFTCollection).borrow() {
        // Try to cast to TopShot collection
        if let tsRef = ref as? &{TopShot.MomentCollectionPublic} {
          collectionRef = tsRef
          log("Found collection at /public/NFTCollection, cast to TopShot")
        } else {
          log("Found NFT collection at NFTCollection but couldn't cast to TopShot collection")
        }
      } else {
        log("No collection capability found at any path")
      }
      
      if collectionRef != nil {
        let answer: [MomentData] = []
        let ids = collectionRef!.getIDs()
        log("Found collection with ".concat(ids.length.toString()).concat(" moments"))

        // Iterate through all of the user's moments
        for id in ids {
          log("Processing moment ID: ".concat(id.toString()))
          // Borrow the moment reference
          let moment = collectionRef!.borrowMoment(id: id)!
          // Get extra metadata about the specific "play"
          let play = TopShot.getPlayMetaData(playID: moment.data.playID)!
          
          // Get image and video URLs
          var imageURL = ""
          var videoURL = ""
          
          // Try to get image URL from play metadata
          if play.containsKey("Image") {
            imageURL = play["Image"]!
          }
          
          // Try to get video URL from play metadata
          if play.containsKey("Video") {
            videoURL = play["Video"]!
          }
          
          // If not found in play metadata, use default URLs based on play ID
          if imageURL == "" {
            imageURL = "https://assets.nbatopshot.com/media/".concat(moment.data.playID.toString()).concat("/image.jpg")
          }
          
          if videoURL == "" {
            videoURL = "https://assets.nbatopshot.com/media/".concat(moment.data.playID.toString()).concat("/video.mp4")
          }

          let momentData = MomentData(
            id: moment.id,
            s: moment.data.serialNumber,
            p: play["FullName"] ?? "N/A",
            t: play["TeamAtMoment"] ?? "N/A",
            d: play["DateOfMoment"] ?? "N/A",
            pc: play["PlayCategory"] ?? "N/A",
            sn: TopShot.getSetName(setID: moment.data.setID)!,
            img: imageURL,
            vid: videoURL
          )
          answer.append(momentData)
          log("Added moment to result: ".concat(play["FullName"] ?? "N/A"))
        }

        log("Returning ".concat(answer.length.toString()).concat(" moments"))
        return answer
      }

      // Return empty array if no collection found
      log("No valid collection reference found, returning empty array")
      return []
    }
  `;

  try {
    console.log("Executing getUserMoments script for address:", address);
    console.log("FCL config:", JSON.stringify(fcl.config().all(), null, 2));
    
    // Add a timestamp to track execution time
    const timerName = `getUserMoments-execution-${Date.now()}`;
    console.time(timerName);
    
    console.log("Sending query to Flow blockchain...");
    const result = await executeWithRateLimit(async () => {
      return fcl.query({
        cadence: script,
        args: (arg, t) => [arg(address, t.Address)],
        // Use sealed blocks instead of 'final'
        block: { sealed: true }
      });
    });
    
    console.timeEnd(timerName);
    console.log("Script execution completed");
    console.log("Result type:", typeof result);
    console.log("Is array?", Array.isArray(result));
    
    if (Array.isArray(result)) {
      console.log(`Found ${result.length} moments`);
      if (result.length > 0) {
        console.log("First moment sample:", JSON.stringify(result[0], null, 2));
        console.log("Moment properties:", Object.keys(result[0]));
      } else {
        console.log("No moments found in the collection");
      }
    } else {
      console.log("Unexpected result format:", typeof result);
      console.log("Result value:", result);
    }
    
    console.log("========== FINISHED getUserMoments ==========");
    return result;
  } catch (error) {
    console.error("Error fetching moments:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.log("========== ERROR in getUserMoments ==========");
    return [];
  }
}

// Script to verify if a user owns a specific moment
export async function verifyMomentOwnership(address, momentId) {
  if (!address || !momentId) return false;
  
  const script = `
    import TopShot from 0x0b2a3299cc857e29
    import NonFungibleToken from 0x1d7e57aa55817448

    access(all) fun main(user: Address, momentID: UInt64): Bool {
      let account = getAccount(user)
      var collectionRef: &{TopShot.MomentCollectionPublic}? = nil
      
      // Try multiple possible capability paths
      if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/MomentCollection).borrow() {
        collectionRef = ref
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection).borrow() {
        collectionRef = ref
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/TopShotCollection).borrow() {
        collectionRef = ref
      }
      
      if collectionRef != nil {
        return collectionRef!.getIDs().contains(momentID)
      }
      
      return false
    }
  `;

  try {
    return await executeWithRateLimit(async () => {
      return fcl.query({
        cadence: script,
        args: (arg, t) => [
          arg(address, t.Address),
          arg(momentId, t.UInt64)
        ],
        // Use sealed blocks instead of 'final'
        block: { sealed: true }
      });
    });
  } catch (error) {
    console.error("Error verifying moment ownership:", error);
    return false;
  }
}

// Script to get detailed metadata for a specific moment
export async function getMomentMetadata(address, momentId) {
  if (!address || !momentId) return null;
  
  const script = `
    import TopShot from 0x0b2a3299cc857e29
    import MetadataViews from 0x1d7e57aa55817448 // MetadataViews contract on mainnet
    import NonFungibleToken from 0x1d7e57aa55817448

    access(all) fun main(address: Address, id: UInt64): {String: String} {
      let account = getAccount(address)
      var collectionRef: &{TopShot.MomentCollectionPublic}? = nil
      
      // Try multiple possible capability paths
      if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/MomentCollection).borrow() {
        collectionRef = ref
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection).borrow() {
        collectionRef = ref
      } else if let ref = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/TopShotCollection).borrow() {
        collectionRef = ref
      }
      
      if collectionRef != nil {
        if let moment = collectionRef!.borrowMoment(id: id) {
          // Get the play metadata
          let playID = moment.data.playID
          let setID = moment.data.setID
          let serialNumber = moment.data.serialNumber
          
          let playMetadata = TopShot.getPlayMetaData(playID: playID) ?? {}
          let setName = TopShot.getSetName(setID: setID) ?? "Unknown Set"
          
          // Combine all metadata into a single dictionary
          let metadata: {String: String} = {
            "id": id.toString(),
            "serialNumber": serialNumber.toString(),
            "setName": setName,
          }
          
          // Add play metadata
          for key in playMetadata.keys {
            metadata[key] = playMetadata[key]!
          }
          
          return metadata
        }
      }
      
      return {}
    }
  `;

  try {
    console.log(`Fetching metadata for moment ${momentId} from address ${address}`);
    
    // Use rate limiting for API calls
    const result = await executeWithRateLimit(async () => {
      return fcl.query({
        cadence: script,
        args: (arg, t) => [
          arg(address, t.Address),
          arg(momentId, t.UInt64)
        ],
        // Use sealed blocks instead of 'final'
        block: { sealed: true }
      });
    });
    
    console.log(`Metadata result:`, result);
    return result;
  } catch (error) {
    console.error("Error fetching moment metadata:", error);
    return null;
  }
}

// Utility function to check if an account has a TopShot collection capability
export async function checkTopShotCapability(address) {
  if (!address) return false;
  
  const script = `
    import TopShot from 0x0b2a3299cc857e29
    import NonFungibleToken from 0x1d7e57aa55817448

    access(all) fun main(user: Address): Bool {
      let account = getAccount(user)
      
      // Try multiple possible capability paths
      // First try the standard path
      let capability = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/MomentCollection)
      if capability.check() {
        log("Found capability at /public/MomentCollection with both interfaces")
        return true
      }
      
      // Try alternative paths that might be used
      let altCapability1 = account.capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
      if altCapability1.check() {
        log("Found capability at /public/MomentCollection with TopShot interface")
        return true
      }
      
      // Try just the NFT collection interface
      let altCapability2 = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection)
      if altCapability2.check() {
        log("Found capability at /public/MomentCollection with NFT interface")
        return true
      }
      
      // Try with a different path
      let altCapability3 = account.capabilities.get<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>(/public/TopShotCollection)
      if altCapability3.check() {
        log("Found capability at /public/TopShotCollection with both interfaces")
        return true
      }
      
      // Try TopShot interface only at TopShotCollection path
      let altCapability4 = account.capabilities.get<&{TopShot.MomentCollectionPublic}>(/public/TopShotCollection)
      if altCapability4.check() {
        log("Found capability at /public/TopShotCollection with TopShot interface")
        return true
      }
      
      // Try NFT interface only at TopShotCollection path
      let altCapability5 = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/TopShotCollection)
      if altCapability5.check() {
        log("Found capability at /public/TopShotCollection with NFT interface")
        return true
      }
      
      // Try generic NFT collection path
      let altCapability6 = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/NFTCollection)
      if altCapability6.check() {
        log("Found capability at /public/NFTCollection with NFT interface")
        return true
      }
      
      log("No TopShot capability found at any path")
      return false
    }
  `;

  try {
    console.log("Checking if address has TopShot capability:", address);
    const result = await executeWithRateLimit(async () => {
      return fcl.query({
        cadence: script,
        args: (arg, t) => [arg(address, t.Address)],
        block: { sealed: true }
      });
    });
    console.log("TopShot capability check result:", result);
    return result;
  } catch (error) {
    console.error("Error checking TopShot capability:", error);
    return false;
  }
}
