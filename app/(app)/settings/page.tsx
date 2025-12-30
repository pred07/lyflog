'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { deleteAllUserLogs } from '@/lib/firebase/firestore';
import { deleteUserAccount } from '@/lib/firebase/auth';
import Link from 'next/link';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;

        setDeleting(true);
        try {
            await deleteAllUserLogs(user.userId);
            await deleteUserAccount(user.userId);
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Error deleting account. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Settings
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Manage your account and preferences.
            </p>

            {/* Account Info */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Account Information
                </h2>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p>
                        <strong>Username:</strong> {user?.username}
                    </p>
                    <p>
                        <strong>Account created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Theme */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Appearance
                </h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Theme preference is controlled via the toggle in the navigation bar.
                </p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Current theme: {user?.theme || 'light'}
                </p>
            </div>

            {/* Data Export */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Data Export
                </h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Download your complete data history.
                </p>
                <Link href="/export" className="btn-secondary inline-block">
                    Go to Data Export
                </Link>
            </div>

            {/* Delete Account */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Delete Account
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn-secondary"
                        style={{ borderColor: '#dc2626', color: '#dc2626' }}
                    >
                        Delete Account
                    </button>
                ) : (
                    <div className="p-4 rounded" style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid #dc2626'
                    }}>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Are you sure? This will permanently delete all your data.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                className="btn-primary"
                                style={{ backgroundColor: '#dc2626' }}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Logout */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Session
                </h2>
                <button
                    onClick={handleLogout}
                    className="btn-secondary"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
