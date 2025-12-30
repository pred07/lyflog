# NYTVND LifeLog - Firebase Setup Instructions

## ⚠️ IMPORTANT: Enable Firestore First

Before the app will work, you MUST enable Firestore in your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/project/lyflog-21b81/firestore)
2. Click **"Create Database"**
3. Choose **"Start in production mode"**
4. Select a location (closest to your users)
5. Click **"Enable"**

## Deploy Firestore Security Rules

After enabling Firestore, deploy the security rules:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Select your project: lyflog-21b81
# Use default file names
firebase deploy --only firestore:rules
```

Or manually copy the rules from `firestore.rules` to your Firebase Console.

## Enable Google SSO (Optional)

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Add your domain to authorized domains

## Test Accounts

The app includes two hardcoded test accounts:
- **Admin**: username `admin`, password `admin` (full access)
- **Test**: username `test`, password `test` (limited access)

These work without Firebase for quick testing.
