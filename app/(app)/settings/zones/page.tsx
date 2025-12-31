'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getContextZones, addContextZone, deleteContextZone } from '@/lib/firebase/context';
import { ContextZone } from '@/lib/types/context';
import { format } from 'date-fns';
import { Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ContextZonesPage() {
    const { user } = useAuth();
    const [zones, setZones] = useState<ContextZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [label, setLabel] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadZones();
    }, [user]);

    const loadZones = async () => {
        if (!user) return;
        try {
            const data = await getContextZones(user.userId);
            setZones(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !label || !startDate || !endDate) return;

        try {
            await addContextZone(user.userId, {
                label,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                color: '#6366f1' // Default indigo
            });
            setIsCreating(false);
            setLabel('');
            setStartDate('');
            setEndDate('');
            loadZones();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        if (!confirm('Delete this zone?')) return;
        await deleteContextZone(user.userId, id);
        loadZones();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link href="/settings" className="hover:text-gray-900 dark:hover:text-gray-100">Settings</Link>
                    <span>/</span>
                    <span>Context Zones</span>
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Isolation Mode
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Mark specific date ranges (Vacations, Sick days) to exclude them from your analysis.
                </p>
            </header>

            {!isCreating ? (
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors mb-8"
                >
                    <Plus size={18} />
                    Add Context Zone
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="card p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold mb-4">New Context Zone</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Label</label>
                            <input
                                type="text"
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                placeholder="e.g. Flu, Maldives Trip"
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                            >
                                Save Zone
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {zones.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        No context zones defined.
                    </div>
                )}

                {zones.map(zone => (
                    <div key={zone.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">{zone.label}</h3>
                                <p className="text-sm text-gray-500">
                                    {format(zone.startDate, 'MMM d, yyyy')} - {format(zone.endDate, 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(zone.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
