import bcrypt from 'bcryptjs';
import { User } from '@/lib/types/auth';

const DEMO_MODE = false; // Set to false when Firebase is configured
const USERS_KEY = 'demo_users';

// Demo mode: localStorage-based auth (no Firebase required)
export async function registerUserDemo(username: string, password: string): Promise<User> {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    if (users.find((u: any) => u.username === username)) {
        throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = {
        userId,
        username,
        passwordHash,
        createdAt: new Date().toISOString(),
        theme: 'light' as const,
    };

    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return {
        userId,
        username,
        createdAt: new Date(user.createdAt),
        theme: user.theme,
    };
}

export async function loginUserDemo(username: string, password: string): Promise<User> {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.username === username);

    if (!user) {
        throw new Error('Invalid username or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid username or password');
    }

    return {
        userId: user.userId,
        username: user.username,
        createdAt: new Date(user.createdAt),
        theme: user.theme,
    };
}

export async function updateUserThemeDemo(userId: string, theme: 'dark' | 'light'): Promise<void> {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.userId === userId);

    if (userIndex !== -1) {
        users[userIndex].theme = theme;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}

export async function deleteUserAccountDemo(userId: string): Promise<void> {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter((u: any) => u.userId !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
}

// Wrapper functions that use demo mode or Firebase based on DEMO_MODE flag
export async function registerUser(username: string, password: string): Promise<User> {
    if (DEMO_MODE) {
        return registerUserDemo(username, password);
    }

    // Firebase implementation (original code)
    const { db } = await import('./config');
    const { collection, doc, setDoc, query, where, getDocs, Timestamp } = await import('firebase/firestore');

    const USERS_COLLECTION = 'users';
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userDoc = {
        userId,
        username,
        passwordHash,
        createdAt: Timestamp.now(),
        theme: 'light' as const,
    };

    await setDoc(doc(db, USERS_COLLECTION, userId), userDoc);

    return {
        userId,
        username,
        createdAt: userDoc.createdAt.toDate(),
        theme: userDoc.theme,
    };
}

export async function loginUser(username: string, password: string): Promise<User> {
    if (DEMO_MODE) {
        return loginUserDemo(username, password);
    }

    // Firebase implementation (original code)
    const { db } = await import('./config');
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const USERS_COLLECTION = 'users';
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error('Invalid username or password');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const isValid = await bcrypt.compare(password, userData.passwordHash);
    if (!isValid) {
        throw new Error('Invalid username or password');
    }

    return {
        userId: userData.userId,
        username: userData.username,
        createdAt: userData.createdAt.toDate(),
        theme: userData.theme,
    };
}

export async function getUserById(userId: string): Promise<User | null> {
    if (DEMO_MODE) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find((u: any) => u.userId === userId);
        return user ? {
            userId: user.userId,
            username: user.username,
            createdAt: new Date(user.createdAt),
            theme: user.theme,
        } : null;
    }

    // Firebase implementation
    const { db } = await import('./config');
    const { doc, getDoc } = await import('firebase/firestore');

    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
        return null;
    }

    const userData = userDoc.data();
    return {
        userId: userData.userId,
        username: userData.username,
        createdAt: userData.createdAt.toDate(),
        theme: userData.theme,
    };
}

export async function updateUserTheme(userId: string, theme: 'dark' | 'light'): Promise<void> {
    if (DEMO_MODE) {
        return updateUserThemeDemo(userId, theme);
    }

    // Firebase implementation
    const { db } = await import('./config');
    const { doc, setDoc } = await import('firebase/firestore');

    await setDoc(
        doc(db, 'users', userId),
        { theme },
        { merge: true }
    );
}

export async function deleteUserAccount(userId: string): Promise<void> {
    if (DEMO_MODE) {
        return deleteUserAccountDemo(userId);
    }

    // Firebase implementation
    const { db } = await import('./config');
    const { doc, setDoc } = await import('firebase/firestore');

    await setDoc(doc(db, 'users', userId), { deleted: true }, { merge: true });
}
