import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDhYvlWZZzwnObhxAueVqsnG0mkMbLd7ew",
    authDomain: "lyflog-21b81.firebaseapp.com",
    projectId: "lyflog-21b81",
    storageBucket: "lyflog-21b81.firebasestorage.app",
    messagingSenderId: "1086977253800",
    appId: "1:1086977253800:web:1b4fd8f04861476414fd9d"
};

let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} else {
    app = getApps()[0];
    db = getFirestore(app);
}

export { app, db };
