'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Edit3, Activity, User, FileText, CheckSquare } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            href: '/dashboard',
            label: 'Patterns',
            icon: Home,
            isActive: (path: string) => path === '/' || path === '/dashboard'
        },
        { href: '/log', label: 'Log', icon: Edit3, isActive: (path: string) => path.startsWith('/log') && !path.startsWith('/logbook') },
        { href: '/session', label: 'Live Log', icon: Activity, isActive: (path: string) => path.startsWith('/session') },
        { href: '/habits', label: 'Daily Check', icon: CheckSquare, isActive: (path: string) => path.startsWith('/habits') },
        { href: '/profile', label: 'Me', icon: User, isActive: (path: string) => path.startsWith('/profile') },
    ];

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderTop: '1px solid var(--border)'
            }}
        >
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = item.isActive(pathname);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform duration-100"
                            style={{
                                color: active ? 'var(--accent)' : 'var(--text-tertiary)'
                            }}
                        >
                            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
