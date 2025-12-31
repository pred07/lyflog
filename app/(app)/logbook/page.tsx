'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LogbookConfig, LogbookEntry } from '@/lib/types/logbook';
import { updateUserProfile } from '@/lib/firebase/auth';
import { addLogbookEntry, getLogbookEntries } from '@/lib/firebase/logbook';
import LogbookManager from '@/components/logbook/LogbookManager';
import LogbookView from '@/components/logbook/LogbookView';
import LogbookEntryForm from '@/components/logbook/LogbookEntryForm';
import { Plus, Settings } from 'lucide-react';
import SectionHeader from '@/components/dashboard/SectionHeader';

export default function LogbookPage() {
    const { user } = useAuth();
    const [activeLogbookId, setActiveLogbookId] = useState<string | null>(null);
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [showManager, setShowManager] = useState(false);
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial load
    useEffect(() => {
        if (user?.logbooks && user.logbooks.length > 0 && !activeLogbookId) {
            setActiveLogbookId(user.logbooks[0].id);
        }
    }, [user, activeLogbookId]);

    // Load entries when active logbook changes
    useEffect(() => {
        if (!user || !activeLogbookId) return;

        const loadEntries = async () => {
            setLoading(true);
            try {
                const data = await getLogbookEntries(user.userId, activeLogbookId);
                setEntries(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [user, activeLogbookId]);

    const handleUpdateLogbooks = async (newLogbooks: LogbookConfig[]) => {
        if (!user) return;
        try {
            await updateUserProfile(user.userId, { logbooks: newLogbooks });
            // If we deleted the active one, switch or clear
            if (activeLogbookId && !newLogbooks.find(l => l.id === activeLogbookId)) {
                setActiveLogbookId(newLogbooks.length > 0 ? newLogbooks[0].id : null);
            } else if (!activeLogbookId && newLogbooks.length > 0) {
                setActiveLogbookId(newLogbooks[0].id);
            }
        } catch (error) {
            console.error('Failed to update logbooks:', error);
        }
    };

    const handleAddEntry = async (data: Record<string, any>, date: Date) => {
        if (!user || !activeLogbookId) return;

        const newEntry: Omit<LogbookEntry, 'id'> = {
            logbookId: activeLogbookId,
            userId: user.userId,
            date: date,
            data: data,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        try {
            const savedEntry = await addLogbookEntry(user.userId, newEntry);
            setEntries([savedEntry, ...entries]); // Optimistic prepend
            setShowEntryForm(false);
        } catch (error) {
            console.error('Failed to add entry:', error);
        }
    };

    if (!user) return null;

    const activeLogbook = user.logbooks?.find(l => l.id === activeLogbookId);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Logbook</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed records for structured activities.</p>
                </div>
                <button
                    onClick={() => setShowManager(!showManager)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Manage Logbooks"
                >
                    <Settings size={20} />
                </button>
            </header>

            {/* Logbook Manager (Collapsible) */}
            {showManager && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <LogbookManager
                        logbooks={user.logbooks || []}
                        onUpdate={handleUpdateLogbooks}
                    />
                </div>
            )}

            {/* Main Content */}
            {(!user.logbooks || user.logbooks.length === 0) ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-gray-500 mb-4">No logbooks defined yet.</p>
                    <button
                        onClick={() => setShowManager(true)}
                        className="btn-primary"
                    >
                        Create Your First Logbook
                    </button>
                    <p className="text-xs text-gray-400 mt-4">
                        Great for Gym, Study, specific Practice sessions.
                    </p>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-[var(--border)]">
                        {user.logbooks.map(lb => (
                            <button
                                key={lb.id}
                                onClick={() => setActiveLogbookId(lb.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeLogbookId === lb.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {lb.title}
                            </button>
                        ))}
                    </div>

                    {activeLogbook && (
                        <div>
                            {/* Toolbar */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {activeLogbook.title}
                                </h2>
                                <button
                                    onClick={() => setShowEntryForm(true)}
                                    className="btn-primary flex items-center gap-2 text-sm"
                                >
                                    <Plus size={16} /> Add Entry
                                </button>
                            </div>

                            {/* Entry Form */}
                            {showEntryForm && (
                                <LogbookEntryForm
                                    logbook={activeLogbook}
                                    onSave={handleAddEntry}
                                    onCancel={() => setShowEntryForm(false)}
                                />
                            )}

                            {/* Table */}
                            {loading ? (
                                <div className="text-center py-8 text-gray-400">Loading entries...</div>
                            ) : (
                                <LogbookView
                                    logbook={activeLogbook}
                                    entries={entries}
                                />
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
