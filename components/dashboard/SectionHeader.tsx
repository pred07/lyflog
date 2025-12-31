'use client';

import { Info } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    description?: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
            </h2>
            {description && (
                <div className="group relative">
                    <Info size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900 text-center">
                        {description}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800 dark:border-t-gray-100" />
                    </div>
                </div>
            )}
        </div>
    );
}
