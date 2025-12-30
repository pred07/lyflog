'use client';

import { useEffect, useState } from 'react';
import { updateUserTheme } from '@/lib/firebase/auth';
import { useAuth } from '@/components/auth/AuthProvider';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    // ... existing setup ...
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
