'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { loginGoogle, loginTest } = useAuth();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginGoogle?.();
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleTestLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginTest?.(username, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <header style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/">
                        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            NYTVND LifeLog
                        </h1>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                            Sign In
                        </h2>

                        {/* Google SSO Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full mb-6 px-4 py-3 rounded-lg border flex items-center justify-center gap-3 transition-colors"
                            style={{
                                backgroundColor: 'var(--bg-primary)',
                                borderColor: 'var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            disabled={loading}
                        >
                            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
                                    Or use test account
                                </span>
                            </div>
                        </div>

                        {/* Test Account Login */}
                        <form onSubmit={handleTestLogin} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field"
                                    placeholder="admin or test"
                                    autoComplete="username"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="admin or test"
                                    autoComplete="current-password"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded" style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-secondary w-full"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in with test account'}
                            </button>
                        </form>

                        <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                            Test accounts: admin/admin or test/test
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
