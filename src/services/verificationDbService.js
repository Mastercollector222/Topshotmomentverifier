import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const VERIFIED_USERS_COLLECTION = 'verifiedUsers';
const EDWARDS_MOMENT_CRITERIA = {
  player: "Anthony Edwards",
  team: "Minnesota Timberwolves",
  playCategory: "Jump Shot",
  setName: "Crunch Time"
};

/**
 * Verifies if a user owns the specified Anthony Edwards moment and records their verification
 * @param {string} address - Flow address of the user
 * @param {Array} moments - Array of moments owned by the user
 * @param {number} requiredCount - Minimum number of moments required for verification
 * @returns {Object} Verification result with status and message
 */
export const verifyEdwardsMomentOwnership = async (address, moments, requiredCount = 1) => {
  try {
    // Count how many Anthony Edwards moments the user owns
    const edwardsMoments = moments.filter(moment => 
      moment.player === EDWARDS_MOMENT_CRITERIA.player &&
      moment.team === EDWARDS_MOMENT_CRITERIA.team &&
      moment.playCategory === EDWARDS_MOMENT_CRITERIA.playCategory &&
      moment.setName === EDWARDS_MOMENT_CRITERIA.setName
    );
    
    // Log for debugging
    console.log("Filtering for Edwards moments:", {
      criteria: EDWARDS_MOMENT_CRITERIA,
      totalMoments: moments.length,
      foundMoments: edwardsMoments.length,
      sampleMoment: moments.length > 0 ? moments[0] : null
    });
    
    const ownedCount = edwardsMoments.length;
    
    // Check if user meets the required count
    if (ownedCount >= requiredCount) {
      // Check if user is already verified
      const userRef = query(
        collection(db, VERIFIED_USERS_COLLECTION), 
        where("address", "==", address)
      );
      
      const userSnapshot = await getDocs(userRef);
      
      if (userSnapshot.empty) {
        // New verification
        await addDoc(collection(db, VERIFIED_USERS_COLLECTION), {
          address,
          momentCount: ownedCount,
          momentIds: edwardsMoments.map(m => m.id),
          verifiedAt: serverTimestamp(),
          lastCheckedAt: serverTimestamp()
        });
        
        return {
          success: true,
          verified: true,
          message: `Congratulations! You've been verified as an owner of ${ownedCount} Anthony Edwards moment(s).`,
          count: ownedCount
        };
      } else {
        // Update existing verification
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(db, VERIFIED_USERS_COLLECTION, userDoc.id), {
          momentCount: ownedCount,
          momentIds: edwardsMoments.map(m => m.id),
          lastCheckedAt: serverTimestamp()
        });
        
        return {
          success: true,
          verified: true,
          message: `Your verification has been updated. You own ${ownedCount} Anthony Edwards moment(s).`,
          count: ownedCount
        };
      }
    } else {
      return {
        success: true,
        verified: false,
        message: `Verification failed. You need at least ${requiredCount} Anthony Edwards moment(s), but you only have ${ownedCount}.`,
        count: ownedCount
      };
    }
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      verified: false,
      message: `Error during verification: ${error.message}`,
      count: 0
    };
  }
};

/**
 * Gets all verified addresses
 * @returns {Array} List of verified users with their moment counts
 */
export const getVerifiedAddresses = async () => {
  try {
    const verifiedUsersRef = collection(db, VERIFIED_USERS_COLLECTION);
    const snapshot = await getDocs(verifiedUsersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching verified addresses:", error);
    return [];
  }
};

export default {
  verifyEdwardsMomentOwnership,
  getVerifiedAddresses
};
