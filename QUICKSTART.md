# SYNAPSE - Quick Setup

## ⚠️ CRITICAL: Enable Firestore Database

**Google SSO will not work until you enable Firestore!**

### Step 1: Enable Firestore

1. Go to: https://console.firebase.google.com/project/lyflog-21b81/firestore
2. Click **"Create Database"**
3. Choose **"Start in production mode"**
4. Select a location (closest to your users)
5. Click **"Enable"**

### Step 2: Enable Google Authentication

1. Go to: https://console.firebase.google.com/project/lyflog-21b81/authentication/providers
2. Click on **"Google"** provider
3. Click **"Enable"**
4. Add your email as a test user
5. Save

### Step 3: Deploy Security Rules

Copy the rules from `firestore.rules` to Firebase Console → Firestore → Rules tab, or use Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## Test Accounts

For development/testing without Google:
- **admin** / **admin**
- **test** / **test**

These work immediately without any Firebase configuration.

## Troubleshooting

**Error: "Failed to get document because the client is offline"**
- This means Firestore is not enabled. Follow Step 1 above.

**Google SSO button does nothing**
- Check browser console for errors
- Verify Google provider is enabled in Firebase Console
- Make sure you're testing on localhost:3000 (authorized domain)
