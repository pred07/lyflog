'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Footer from '@/components/layout/Footer';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <img src="/logo.png" alt="SYNAPSE" className="h-12 w-12" />
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                        A quiet mirror during a difficult phase.
                    </h2>
                    <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                        SYNAPSE helps you observe patterns in your behavior, energy, and daily life — without judgment, advice, or pressure to improve.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#how-it-works" className="btn-primary">
                            How It Works
                        </a>
                        <Link href="/login" className="btn-secondary">
                            Login
                        </Link>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-3xl font-bold mb-12 text-center" style={{ color: 'var(--text-primary)' }}>
                            How It Works
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-4xl mb-4">📝</div>
                                <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Log simple daily facts
                                </h4>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Track sleep, movement, meditation, learning time, and optional notes.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-4">📊</div>
                                <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Visualize long-term patterns
                                </h4>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    See trends and correlations in your data over time.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-4">🔍</div>
                                <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Interpret results yourself
                                </h4>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Draw your own conclusions without advice or judgment.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who This Is For */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
                            Who This Is For
                        </h3>
                        <div className="card max-w-2xl mx-auto">
                            <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                                <li className="flex items-start">
                                    <span className="mr-3">•</span>
                                    <span>People experiencing work stress and overload</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">•</span>
                                    <span>People in emotionally disruptive phases (breakups, grief, transitions)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">•</span>
                                    <span>People noticing low energy, low motivation, or mental fatigue</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">•</span>
                                    <span>People seeking clarity about their patterns without advice or judgment</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* What Is Tracked */}
                <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
                            What Is Tracked
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            <div className="card">
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sleep duration</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hours of sleep per night</p>
                            </div>
                            <div className="card">
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Workout / movement</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Type and duration</p>
                            </div>
                            <div className="card">
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Meditation</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration in minutes</p>
                            </div>
                            <div className="card">
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Learning time</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time spent learning outside platforms</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What This Is Not */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
                            What This Is Not
                        </h3>
                        <div className="card max-w-2xl mx-auto">
                            <ul className="space-y-3 mb-6" style={{ color: 'var(--text-secondary)' }}>
                                <li className="flex items-start">
                                    <span className="mr-3">✗</span>
                                    <span>Not a coach, productivity system, or scoring app</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">✗</span>
                                    <span>Not therapy, treatment, or diagnosis</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">✗</span>
                                    <span>Not motivational content or self-improvement ideology</span>
                                </li>
                            </ul>
                            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> SYNAPSE does not diagnose or treat medical or mental health conditions. It supports self-observation and understanding, and can be used alongside professional care.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Ready to observe your patterns?
                        </h3>
                        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                            Start logging your daily data and see what emerges.
                        </p>
                        <Link href="/login" className="btn-primary">
                            Get Started
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
