'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password);
            }
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
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
                    {/* Test Mode Warning */}
                    <div className="mb-6 p-4 rounded-lg" style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)'
                    }}>
                        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                            ⚠️ <strong>Test authentication</strong> — Google SSO will replace this.
                        </p>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                            {isLogin ? 'Login' : 'Register'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    required
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
                                    required
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
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
                                className="btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-sm"
                                style={{ color: 'var(--accent)' }}
                            >
                                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                            </button>
                        </div>
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
