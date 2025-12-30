'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/lib/types/auth';
import { loginUser, registerUser } from '@/lib/firebase/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored session
        const storedUser = localStorage.getItem('nytvnd_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const user = await loginUser(username, password);
        setUser(user);
        localStorage.setItem('nytvnd_user', JSON.stringify(user));
    };

    const register = async (username: string, password: string) => {
        const user = await registerUser(username, password);
        setUser(user);
        localStorage.setItem('nytvnd_user', JSON.stringify(user));
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('nytvnd_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
