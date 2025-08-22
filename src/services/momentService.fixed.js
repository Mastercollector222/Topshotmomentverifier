import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Script to get all moments for a user
export async function getUserMoments(address) {
  if (!address) return [];
  
  const script = `
    import TopShot from 0x0b2a3299cc857e29
    import NonFungibleToken from 0x1d7e57aa55817448

    access(all) struct MomentData {
      access(all) let id: UInt64
      access(all) let serialNumber: UInt32
      access(all) let player: String
      access(all) let team: String
      access(all) let date: String
      access(all) let playCategory: String
      access(all) let setName: String

      init(id: UInt64, s: UInt32, p: String, t: String, d: String, pc: String, sn: String) {
        self.id = id
        self.serialNumber = s
        self.player = p
        self.team = t
        self.date = d
        self.playCategory = pc
        self.setName = sn
      }
    }

    access(all) fun main(user: Address): [MomentData] {
      let account = getAccount(user)
      
      // Check if the account has a TopShot collection
      if let collectionRef = account.getCapability(/public/MomentCollection)
                               .borrow<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>() {
        let answer: [MomentData] = []

        // Iterate through all of the user's moments
        for id in collectionRef.getIDs() {
          // Borrow the moment reference
          let moment = collectionRef.borrowMoment(id: id)!
          // Get extra metadata about the specific "play"
          let play = TopShot.getPlayMetaData(playID: moment.data.playID)!

          let momentData = MomentData(
            id: moment.id,
            s: moment.data.serialNumber,
            p: play["FullName"] ?? "N/A",
            t: play["TeamAtMoment"] ?? "N/A",
            d: play["DateOfMoment"] ?? "N/A",
            pc: play["PlayCategory"] ?? "N/A",
            sn: TopShot.getSetName(setID: moment.data.setID)!
          )
          answer.append(momentData)
        }

        return answer
      }

      // Return empty array if no collection found
      return []
    }
  `;

  try {
    return await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
      // Use sealed blocks instead of 'final'
      block: { sealed: true }
    });
  } catch (error) {
    console.error("Error fetching moments:", error);
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
      
      if let collection = account.getCapability(/public/MomentCollection)
                           .borrow<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>() {
        return collection.getIDs().contains(momentID)
      }
      
      return false
    }
  `;

  try {
    return await fcl.query({
      cadence: script,
      args: (arg, t) => [
        arg(address, t.Address),
        arg(momentId, t.UInt64)
      ],
      // Use sealed blocks instead of 'final'
      block: { sealed: true }
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

      if let collectionRef = account.getCapability(/public/MomentCollection)
                               .borrow<&{TopShot.MomentCollectionPublic, NonFungibleToken.CollectionPublic}>() {
        if let moment = collectionRef.borrowMoment(id: id) {
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
    return await fcl.query({
      cadence: script,
      args: (arg, t) => [
        arg(address, t.Address),
        arg(momentId, t.UInt64)
      ],
      // Use sealed blocks instead of 'final'
      block: { sealed: true }
    });
  } catch (error) {
    console.error("Error fetching moment metadata:", error);
    return null;
  }
}
