'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Edit3, Activity, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        // Map '/' or '/dashboard' to Home. 
        // Logic: if pathname is '/' or '/dashboard', highlight Home.
        // Actually, since we might redirect '/' to '/dashboard' or render same content, 
        // we should check if pathname ends with these.
        {
            href: '/',
            // If we are on dashboard, also highlight home if we consider them the same. 
            // But if we have separate routes, let's stick to href.
            // For now, let's treat '/dashboard' as the main app home.
            // If the user is on '/', the BottomNav might not render if it's outside the app layout...
            // But we plan to render Dashboard on '/' for logged in users.
            // So let's link to '/' for Home? Or '/dashboard'?
            // Plan says: "Home = Dashboard". 
            // If I link to '/', and the user is logged in, they see Dashboard.
            // If I link to '/dashboard', they see Dashboard.
            // Let's use '/dashboard' as the explicit app route to avoid confusion with Landing Logic for now, 
            // OR use '/' if we successfully unify.
            // Let's use '/dashboard' for safely linking to internal app, or '/' if we are confident.
            // I'll use '/dashboard' for the Home icon for now to match existing Navigation structure.
            label: 'Home',
            icon: Home,
            isActive: (path: string) => path === '/' || path === '/dashboard'
        },
        { href: '/log', label: 'Log', icon: Edit3, isActive: (path: string) => path.startsWith('/log') },
        { href: '/trends', label: 'Trends', icon: Activity, isActive: (path: string) => path.startsWith('/trends') },
        { href: '/profile', label: 'Me', icon: User, isActive: (path: string) => path.startsWith('/profile') }, // 'profile' route to be created
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
                            className="flex flex-col items-center justify-center w-full h-full space-y-1"
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
