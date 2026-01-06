'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
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
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                        A quiet mirror for your life.
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        SYNAPSE is an observational system for sleep, habits, and states.
                    </p>

                    <div className="flex flex-col items-center gap-2 mb-12 text-sm font-medium tracking-wide border-t border-b border-gray-100 dark:border-gray-800 py-4 max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)' }}>
                        <span className='opacity-70'>NO SCORES • NO STREAKS • NO ADVICE</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login" className="btn-primary text-lg px-8 py-3 font-normal bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            View Demo
                        </Link>
                        <a href="#system" className="btn-secondary text-lg px-8 py-3 font-normal">
                            How it works
                        </a>
                    </div>
                    <p className="mt-4 text-xs opacity-50">No account required for demo.</p>
                </section>

                {/* The System */}
                <section id="system" className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                Separating Action from Reflection
                            </h3>
                            <p className="text-lg max-w-2xl mx-auto leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                Most trackers mix data entry with judgment. SYNAPSE separates them to reduce anxiety and cognitive load.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Action Mode */}
                            <div className="p-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <div className="text-sm font-bold uppercase tracking-wider mb-2 text-emerald-600 dark:text-emerald-400">
                                    Action Mode
                                </div>
                                <h4 className="text-xl font-bold mb-4">Fast Logging</h4>
                                <p className="mb-6 opacity-80">
                                    Capture data without friction. No charts, no feedback, no "good job" messages. Just operational recording of what is happening.
                                </p>
                                <ul className="space-y-2 text-sm opacity-70">
                                    <li className="flex gap-2"><span>•</span><span>Tracks habits and exposures</span></li>
                                    <li className="flex gap-2"><span>•</span><span>Neutral interface</span></li>
                                    <li className="flex gap-2"><span>•</span><span>Zero judgment</span></li>
                                </ul>
                            </div>

                            {/* Reflection Mode */}
                            <div className="p-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <div className="text-sm font-bold uppercase tracking-wider mb-2 text-indigo-600 dark:text-indigo-400">
                                    Reflection Mode
                                </div>
                                <h4 className="text-xl font-bold mb-4">Pattern Recognition</h4>
                                <p className="mb-6 opacity-80">
                                    Review data when you are ready. See how variables move together over time (e.g. sleep duration and focus levels).
                                </p>
                                <ul className="space-y-2 text-sm opacity-70">
                                    <li className="flex gap-2"><span>•</span><span>Lag-aware correlations</span></li>
                                    <li className="flex gap-2"><span>•</span><span>Weekly exposure distributions</span></li>
                                    <li className="flex gap-2"><span>•</span><span>Scientific observation</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Signals (Anti-Features) */}
                <section className="py-20 border-t border-gray-200 dark:border-gray-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-2xl font-bold mb-10 text-center">What SYNAPSE does not do</h3>
                        <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
                            <div>
                                <h4 className="font-bold mb-2 opacity-90">No Predictions</h4>
                                <p className="text-sm opacity-70 leading-relaxed">The system will not tell you what to do. It assumes you are the expert on your own life.</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2 opacity-90">No Gamification</h4>
                                <p className="text-sm opacity-70 leading-relaxed">There are no points, levels, or broken streaks. Missing a day is just data, not a failure.</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2 opacity-90">No Algorithms</h4>
                                <p className="text-sm opacity-70 leading-relaxed">Your data feed is chronological and unfiltered. We do not optimize for engagement.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Audience */}
                <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <p className="text-lg font-medium mb-6 opacity-60 uppercase tracking-widest text-xs">Intended Audience</p>
                        <h3 className="text-2xl md:text-3xl font-bold mb-8 leading-snug">
                            Built for individuals navigating high cognitive load, transition, or disruption.
                        </h3>
                        <p className="opacity-70 max-w-xl mx-auto leading-relaxed">
                            This is not a productivity tool. It is a clarity tool. It is designed for those who need to see "what is" before they can decide "what should be."
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 text-center border-t border-gray-200 dark:border-gray-800">
                    <div className="max-w-3xl mx-auto px-4">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                            See the system.
                        </h3>
                        <p className="mb-10 text-lg opacity-70 max-w-lg mx-auto">
                            The demo allows you to explore the interface without creating an account.
                        </p>
                        <Link href="/login" className="btn-primary text-lg px-10 py-4 shadow-none bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Explore Demo
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="py-12 text-center text-xs opacity-40 border-t border-gray-100 dark:border-gray-800">
                <p>SYNAPSE v0.9 • Observational Intelligence</p>
            </footer>
        </div>
    );
}
