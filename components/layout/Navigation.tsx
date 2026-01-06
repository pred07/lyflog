'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Navigation() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/timeline', label: 'Timeline' },
        { href: '/search', label: 'Search' },
        { href: '/log', label: 'Log Activity' },
        { href: '/habits', label: 'Habits' },
        { href: '/trends', label: 'Trends' },
        { href: '/zones', label: 'Zones' },
        { href: '/export', label: 'Data Export' },
        { href: '/settings', label: 'Settings' },
    ];

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <nav style={{
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)'
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/dashboard">
                            <NextImage src="/logo.png" alt="SYNAPSE" width={40} height={40} className="h-10 w-10" />
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    style={{
                                        color: pathname === item.href ? 'var(--accent)' : 'var(--text-secondary)',
                                        backgroundColor: pathname === item.href ? 'var(--bg-secondary)' : 'transparent',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="btn-secondary px-4 py-2 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
