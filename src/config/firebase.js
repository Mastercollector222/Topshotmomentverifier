import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBf-lGq31SBHGnOnAwHQfVgS5DKXVkRLqc",
  authDomain: "topshotmomentverifier-6c98d.firebaseapp.com",
  projectId: "topshotmomentverifier-6c98d",
  storageBucket: "topshotmomentverifier-6c98d.firebasestorage.app",
  messagingSenderId: "735087291157",
  appId: "1:735087291157:web:9393c85863ae141db1d71c",
  measurementId: "G-9E30XFZ03M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, analytics, auth };
