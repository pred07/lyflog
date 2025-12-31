'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Footer from '@/components/layout/Footer';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function LandingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading || (user && mounted)) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-pulse">Loading...</div>
        </div>;
    }

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Image src="/logo.png" alt="SYNAPSE" width={48} height={48} className="h-12 w-12" />
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        A quiet mirror.
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Observe your life&apos;s patterns without judgment. <br className="hidden md:block" />
                        No scores. No streaks. No advice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login" className="btn-primary text-lg px-8 py-4">
                            Log In / Demo
                        </Link>
                        <a href="#system" className="btn-secondary text-lg px-8 py-4">
                            The System
                        </a>
                    </div>
                </section>

                {/* The System (Three Pillars) */}
                <section id="system" className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                The Dual Dashboard System
                            </h3>
                            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                Separating <strong>Action</strong> (doing) from <strong>Reflection</strong> (analyzing) to reduce anxiety.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1: Patterns */}
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:opacity-20 transition-opacity">
                                    01
                                </div>
                                <div className="text-4xl mb-6">📊</div>
                                <h4 className="text-2xl font-bold mb-2 text-indigo-500">
                                    Patterns
                                </h4>
                                <p className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">
                                    Reflection Mode
                                </p>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Visualize long-term trends. See how sleep affects anxiety, or how workouts impact focus.
                                </p>
                            </div>

                            {/* Card 2: Live Log */}
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:opacity-20 transition-opacity">
                                    02
                                </div>
                                <div className="text-4xl mb-6">⚡</div>
                                <h4 className="text-2xl font-bold mb-2 text-amber-500">
                                    Live Log
                                </h4>
                                <p className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">
                                    Action Mode
                                </p>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    A live notebook for workouts and study sessions. No charts, just pure operational recording.
                                </p>
                            </div>

                            {/* Card 3: Daily Check */}
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:opacity-20 transition-opacity">
                                    03
                                </div>
                                <div className="text-4xl mb-6">📅</div>
                                <h4 className="text-2xl font-bold mb-2 text-emerald-500">
                                    Daily Check
                                </h4>
                                <p className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">
                                    Action Mode
                                </p>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Track habit presence. Just mark what happened. No broken streaks, no guilt trips.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who This Is For */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="card p-8 md:p-12 border-l-4 border-indigo-500">
                            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                                Designed for Transition
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <span className="mr-3 text-indigo-500">•</span>
                                        <span>Navigating burnout or high stress</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-3 text-indigo-500">•</span>
                                        <span>Recovering from major life changes</span>
                                    </li>
                                </ul>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <span className="mr-3 text-indigo-500">•</span>
                                        <span>Sensitive to &quot;gamified&quot; pressure</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-3 text-indigo-500">•</span>
                                        <span>Seeking clarity, not optimization</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What This Is Not */}
                <section className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h3 className="text-3xl font-bold mb-12" style={{ color: 'var(--text-primary)' }}>
                            Anti-Features
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-2xl mb-2 text-gray-400">✗</div>
                                <p className="text-sm opacity-70">Missed a day? It doesn&apos;t matter. Data is just data.</p>
                            </div>
                            <div>
                                <div className="text-2xl mb-2 text-gray-400">✗</div>
                                <p className="text-sm opacity-70">You are not a number. There is no &quot;Health Score&quot; here.</p>
                            </div>
                            <div>
                                <div className="text-2xl mb-2 text-gray-400">✗</div>
                                <p className="text-sm opacity-70">We don&apos;t tell you to drink water. We just show you if you did.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                            Start observing today.
                        </h3>
                        <p className="mb-10 text-xl" style={{ color: 'var(--text-secondary)' }}>
                            Use the <strong>Live Demo</strong> to explore without creating an account.
                        </p>
                        <Link href="/login" className="btn-primary text-lg px-10 py-4 shadow-xl">
                            Enter System
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
