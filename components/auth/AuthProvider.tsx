'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/lib/types/auth';
import { loginWithGoogle, loginWithTestAccount, logout as firebaseLogout, onAuthChange, getUserProfile } from '@/lib/firebase/auth';

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { throw new Error('AuthContext not initialized'); },
    loginGoogle: async () => { throw new Error('AuthContext not initialized'); },
    loginTest: async () => { throw new Error('AuthContext not initialized'); },
    register: async () => { throw new Error('AuthContext not initialized'); },
    logout: async () => { throw new Error('AuthContext not initialized'); },
    refreshUser: async () => { throw new Error('AuthContext not initialized'); },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for test account in localStorage
        const storedUser = localStorage.getItem('nytvnd_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Only restore test accounts from localStorage
            if (parsedUser.userId?.startsWith('test_')) {
                setUser(parsedUser);
                setLoading(false);
                return;
            }
        }

        // Listen to Firebase auth changes for Google SSO users
        const unsubscribe = onAuthChange((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginGoogle = async () => {
        const user = await loginWithGoogle();
        setUser(user);
    };

    const loginTest = async (username: string, password: string) => {
        const user = await loginWithTestAccount(username, password);
        setUser(user);
        localStorage.setItem('nytvnd_user', JSON.stringify(user));
    };

    const logout = async () => {
        await firebaseLogout();
        setUser(null);
        localStorage.removeItem('nytvnd_user');
    };



    // Refresh user data from Firestore
    const refreshUser = async () => {
        if (!user) return;

        try {
            const updatedUser = await getUserProfile(user.userId);
            if (updatedUser) {
                setUser(updatedUser);
                // Update localStorage for test accounts
                if (updatedUser.userId.startsWith('test_')) {
                    localStorage.setItem('nytvnd_user', JSON.stringify(updatedUser));
                }
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    // Legacy methods for compatibility
    const login = loginTest;
    const register = async () => {
        throw new Error('Registration disabled. Use Google SSO or test accounts.');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            loginGoogle,
            loginTest,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
