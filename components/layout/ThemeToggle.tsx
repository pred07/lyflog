'use client';

import { useEffect, useState } from 'react';
import { updateUserTheme } from '@/lib/firebase/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const { user } = useAuth();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Initialize theme from localStorage or system preference
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.toggle('dark', true);
        }

        // If user is logged in, sync with their profile theme if available
        if (user?.theme) {
            setTheme(user.theme);
            document.documentElement.classList.toggle('dark', user.theme === 'dark');
            localStorage.setItem('theme', user.theme);
        }
    }, [user]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);

        if (user) {
            try {
                await updateUserTheme(user.userId, newTheme);
            } catch (error) {
                console.error('Failed to update theme preference:', error);
            }
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
