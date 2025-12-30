'use client';

import { useEffect, useState } from 'react';
import { updateUserTheme } from '@/lib/firebase/auth';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ThemeToggle() {
    const { user } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Initialize theme from user preference or localStorage
        const savedTheme = user?.theme || (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, [user]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        if (user) {
            await updateUserTheme(user.userId, newTheme);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="btn-secondary px-4 py-2 text-sm"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
