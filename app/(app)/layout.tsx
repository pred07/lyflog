import AuthGuard from '@/components/auth/AuthGuard';
import Navigation from '@/components/layout/Navigation';
import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1 pb-16 md:pb-0">
                    {children}
                </main>
                <BottomNav />
            </div>
        </AuthGuard>
    );
}
