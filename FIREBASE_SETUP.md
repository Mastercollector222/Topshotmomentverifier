# Firebase Setup Instructions

Follow these steps to set up Firebase for the NBA Top Shot Moment Verifier application:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "nba-topshot-verifier")
4. Choose whether to enable Google Analytics (recommended)
5. Follow the prompts to complete project creation

## 2. Register Your Web App

1. From the Firebase project dashboard, click the web icon (</>) to add a web app
2. Enter a nickname for your app (e.g., "NBA TopShot Verifier")
3. Check "Also set up Firebase Hosting" if you plan to deploy through Firebase
4. Click "Register app"
5. Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 3. Update Your Firebase Configuration

1. Open `src/config/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase configuration values

## 4. Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location for your database (choose the closest to your users)
5. Click "Enable"

## 5. Set Up Firestore Security Rules

1. In the Firestore Database section, go to the "Rules" tab
2. Update the rules to secure your database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to verified users collection
    match /verifiedUsers/{document=**} {
      allow read: if true;
      // Allow public write access for verification
      allow write: if true;
    }
  }
}
```

> **Note:** These rules allow public write access to the verifiedUsers collection. This is suitable for development and testing but may need to be restricted in a production environment.

## 6. Set Up Authentication (Optional for Admin Access)

1. In the Firebase console, go to "Authentication"
2. Click "Get started"
3. Enable the authentication methods you want to use (Email/Password is recommended for admin access)
4. Add admin users through the Firebase console

## 7. Deploy Your Application

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init`
4. Select Hosting and other services you need
5. Deploy your application: `firebase deploy`

## 8. Add Admin Access Control

To restrict access to the admin dashboard, you'll need to implement authentication checks in your application. Update the `AdminDashboard.js` component to check for admin privileges before showing sensitive data.

## 9. Testing Your Firebase Integration

1. Start your application locally: `npm start`
2. Connect your Flow wallet and verify ownership of Anthony Edwards moments
3. Check the Firebase console to confirm that verification data is being stored correctly
