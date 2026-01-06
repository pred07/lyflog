'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateUserProfile } from '@/lib/firebase/auth';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { User, LogOut, Download, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MetricsManager from '@/components/profile/MetricsManager';
import ExposureManager from '@/components/profile/ExposureManager';
import { MetricConfig, ExposureConfig } from '@/lib/types/auth';

export default function ProfilePage() {
    const { user, login, logout, refreshUser } = useAuth(); // Get refreshUser from hook at component level
    const router = useRouter();
    const [name, setName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [metrics, setMetrics] = useState<MetricConfig[]>([]);
    const [exposures, setExposures] = useState<ExposureConfig[]>([]);

    useEffect(() => {
        if (user) {
            setName(user.username);
            setMetrics(user.metrics || []);
            setExposures(user.exposures || []);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateUserProfile(user.userId, { username: name });
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateMetrics = async (newMetrics: MetricConfig[]) => {
        if (!user) return;
        setMetrics(newMetrics); // Optimistic
        try {
            await updateUserProfile(user.userId, { metrics: newMetrics });
            // Refresh user data to show changes immediately
            await refreshUser?.();
        } catch (error) {
            console.error('Failed to update metrics:', error);
            // Revert on error? For now simple log.
        }
    };

    const handleUpdateExposures = async (newExposures: ExposureConfig[]) => {
        if (!user) return;
        setExposures(newExposures); // Optimistic
        try {
            await updateUserProfile(user.userId, { exposures: newExposures });
            // Refresh user data to show changes immediately
            await refreshUser?.();
        } catch (error) {
            console.error('Failed to update exposures:', error);
            // Revert
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="max-w-md mx-auto px-4 py-8 pb-24">
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Me</h1>

            {/* Identity Section */}
            <div className="card mb-6 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
                    <User size={32} />
                </div>
                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-b border-indigo-500 focus:outline-none px-1 py-0.5 w-full"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded"
                            >
                                {saving ? '...' : 'Save'}
                            </button>
                        </div>
                    ) : (
                        <div onClick={() => setIsEditing(true)} className="cursor-pointer group">
                            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                {user.username}
                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">Edit</span>
                            </h2>
                            <p className="text-sm text-gray-500">Tap name to edit</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Appearance */}
            <div className="card mb-6 flex justify-between items-center">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Theme</span>
                <ThemeToggle />
            </div>

            {/* Custom Metrics */}
            <MetricsManager metrics={metrics} onUpdate={handleUpdateMetrics} />

            {/* Exposures */}
            <ExposureManager exposures={exposures} onUpdate={handleUpdateExposures} />

            {/* Actions */}
            <div className="space-y-4">
                <Link href="/export" className="card flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Download size={20} className="text-gray-500" />
                    <span style={{ color: 'var(--text-primary)' }}>Export Data</span>
                </Link>

                <Link href="/settings" className="card flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Settings size={20} className="text-gray-500" />
                    <span style={{ color: 'var(--text-primary)' }}>Settings</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full card flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
}
