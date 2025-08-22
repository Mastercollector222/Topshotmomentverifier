import { getAuth, signInAnonymously } from 'firebase/auth';

/**
 * Signs in anonymously to Firebase
 * @returns {Promise<Object>} Firebase auth user object
 */
export const signInAnonymouslyToFirebase = async () => {
  try {
    const auth = getAuth();
    const userCredential = await signInAnonymously(auth);
    console.log("Anonymous auth successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous auth error:", error);
    throw error;
  }
};

export default {
  signInAnonymouslyToFirebase
};
