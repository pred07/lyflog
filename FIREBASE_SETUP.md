# Firebase Setup Guide for NYTVND LifeLog

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `nytvnd-lifelog` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the web icon (`</>`)
2. Register app with nickname: "NYTVND LifeLog Web"
3. Don't enable Firebase Hosting yet
4. Copy the Firebase configuration object

## Step 3: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode**
4. Choose a Cloud Firestore location (closest to your users)
5. Click "Enable"

## Step 4: Set Up Firestore Security Rules

1. Go to "Firestore Database" → "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily logs - users can only access their own logs
    match /daily_logs/{logId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click "Publish"

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Firebase config values from Step 2:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

## Step 6: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Register a test account
4. Create a log entry
5. Check Firestore Console to verify data is being saved

## Step 7: Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your existing project
   - Set public directory to: `out`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Firestore Collections Structure

### `users` Collection
```
users/{userId}
  - userId: string
  - username: string
  - passwordHash: string
  - createdAt: timestamp
  - theme: 'light' | 'dark'
```

### `daily_logs` Collection
```
daily_logs/{logId}
  - logId: string
  - userId: string (reference to user)
  - date: timestamp
  - sleep: number (optional)
  - workout: object (optional)
    - type: string
    - duration: number
  - meditation: number (optional)
  - learning: number (optional)
  - note: string (optional)
  - createdAt: timestamp
```

## Troubleshooting

### "Permission denied" errors
- Check that Firestore security rules are published
- Verify user is logged in
- Ensure userId matches in the request

### Firebase config not found
- Verify `.env.local` file exists
- Check all environment variables are set
- Restart the development server after changing env vars

### Data not appearing
- Check browser console for errors
- Verify Firestore rules allow the operation
- Check Firestore Console to see if data exists

## Next Steps

- Set up Firebase Authentication for Google SSO (future enhancement)
- Configure Firebase Hosting for production deployment
- Set up Firebase Functions for server-side operations (if needed)
