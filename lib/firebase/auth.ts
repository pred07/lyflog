import { db } from './config';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/types/auth';

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

// Hardcoded test accounts for development/testing
const TEST_ACCOUNTS = [
    { username: 'admin', password: 'admin', userId: 'test_admin_001' },
    { username: 'test', password: 'test', userId: 'test_user_001' }
];

// Check if credentials match test accounts
function checkTestAccount(username: string, password: string): User | null {
    const account = TEST_ACCOUNTS.find(
        acc => acc.username === username && acc.password === password
    );

    if (account) {
        return {
            userId: account.userId,
            username: account.username,
            createdAt: new Date(),
            theme: 'light',
        };
    }

    return null;
}

// Google SSO Login
export async function loginWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Create or update user in Firestore
    const userId = firebaseUser.uid;
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // Create new user
        const userData = {
            userId,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            createdAt: Timestamp.now(),
            theme: 'light' as const,
        };

        await setDoc(userRef, userData);

        return {
            userId,
            username: userData.username,
            createdAt: userData.createdAt.toDate(),
            theme: userData.theme,
        };
    } else {
        const userData = userDoc.data();
        return {
            userId: userData.userId,
            username: userData.username,
            createdAt: userData.createdAt.toDate(),
            theme: userData.theme,
        };
    }
}

// Test account login (for admin/admin and test/test)
export async function loginWithTestAccount(username: string, password: string): Promise<User> {
    const testUser = checkTestAccount(username, password);

    if (!testUser) {
        throw new Error('Invalid test credentials');
    }

    return testUser;
}

// Sign out
export async function logout(): Promise<void> {
    await firebaseSignOut(auth);
}

// Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                callback({
                    userId: userData.userId,
                    username: userData.username,
                    createdAt: userData.createdAt.toDate(),
                    theme: userData.theme,
                });
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
}

// Update user theme
export async function updateUserTheme(userId: string, theme: 'dark' | 'light'): Promise<void> {
    // Skip for test accounts
    if (userId.startsWith('test_')) {
        return;
    }

    await setDoc(
        doc(db, 'users', userId),
        { theme },
        { merge: true }
    );
}

// Delete user account
export async function deleteUserAccount(userId: string): Promise<void> {
    // Don't allow deleting test accounts
    if (userId.startsWith('test_')) {
        throw new Error('Cannot delete test accounts');
    }

    await setDoc(doc(db, 'users', userId), { deleted: true }, { merge: true });
}

export { auth };
