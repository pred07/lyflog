'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { format } from 'date-fns';

export default function ExportPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadLogs();
        }
    }, [user]);

    const loadLogs = async () => {
        if (!user) return;
        try {
            const userLogs = await getUserLogs(user.userId);
            setLogs(userLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportAsCSV = () => {
        if (logs.length === 0) return;

        const headers = ['Date', 'Sleep (hours)', 'Workout Type', 'Workout Duration (min)', 'Meditation (min)', 'Learning (min)', 'Note'];
        const rows = logs.map(log => [
            format(log.date, 'yyyy-MM-dd'),
            log.sleep || '',
            log.workout?.type || '',
            log.workout?.duration || '',
            log.meditation || '',
            log.learning || '',
            log.note ? `"${log.note.replace(/"/g, '""')}"` : '',
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nytvnd-lifelog-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAsJSON = () => {
        if (logs.length === 0) return;

        const data = {
            exportDate: new Date().toISOString(),
            username: user?.username,
            logs: logs.map(log => ({
                date: format(log.date, 'yyyy-MM-dd'),
                sleep: log.sleep,
                workout: log.workout,
                meditation: log.meditation,
                learning: log.learning,
                note: log.note,
            })),
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nytvnd-lifelog-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Loading data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Data Export
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Download your complete data for external analysis or backup.
            </p>

            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Export Options
                </h2>

                <div className="space-y-4">
                    <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            CSV Format
                        </h3>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Spreadsheet-compatible format for analysis in Excel, Google Sheets, or similar tools.
                        </p>
                        <button
                            onClick={exportAsCSV}
                            className="btn-primary"
                            disabled={logs.length === 0}
                        >
                            Download CSV
                        </button>
                    </div>

                    <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            JSON Format
                        </h3>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Structured data format for programmatic analysis or backup.
                        </p>
                        <button
                            onClick={exportAsJSON}
                            className="btn-primary"
                            disabled={logs.length === 0}
                        >
                            Download JSON
                        </button>
                    </div>
                </div>

                {logs.length === 0 && (
                    <p className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        No data available to export. Start by logging your first entry.
                    </p>
                )}
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Data Lifecycle
                </h2>
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p>
                        <strong>Data ownership:</strong> All data belongs to you. Exports contain your complete log history.
                    </p>
                    <p>
                        <strong>Data retention:</strong> Your data is stored securely in Firestore and persists until you delete your account.
                    </p>
                    <p>
                        <strong>Data deletion:</strong> You can delete your account and all associated data from the Settings page.
                    </p>
                </div>
            </div>
        </div>
    );
}
