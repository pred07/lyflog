'use client';

import { LogbookConfig, LogbookEntry } from '@/lib/types/logbook';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

interface LogbookViewProps {
    logbook: LogbookConfig;
    entries: LogbookEntry[];
}

export default function LogbookView({ logbook, entries }: LogbookViewProps) {
    if (entries.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>No entries yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium border-b border-[var(--border)]">
                    <tr>
                        <th className="p-3 w-24">Date</th>
                        {logbook.columns.map(col => (
                            <th key={col.id} className="p-3 min-w-[100px]">{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                    {entries.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                            <td className="p-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                                {format(entry.date, 'MMM dd')}
                            </td>
                            {logbook.columns.map(col => {
                                const val = entry.data[col.id];
                                return (
                                    <td key={col.id} className="p-3">
                                        {col.type === 'checkbox' ? (
                                            val ? <Check size={16} className="text-green-500" /> : <span className="text-gray-300">-</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-primary)' }}>{val?.toString() || '-'}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
