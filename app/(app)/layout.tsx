import AuthGuard from '@/components/auth/AuthGuard';
import Navigation from '@/components/layout/Navigation';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
