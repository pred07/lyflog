'use client';

import { Minus, Plus, Play, Pause, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ExposureInputProps {
    label: string;
    type: 'count' | 'duration' | 'boolean'; // 'boolean' unused for now but good for future
    value: number; // 0 if unset
    onChange: (val: number) => void;
    unit?: string;
}

export default function ExposureInput({ label, type, value, onChange, unit }: ExposureInputProps) {
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                onChange(value + 1);
            }, 60000); // Update every minute for duration
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, value, onChange]);

    const handleToggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const handleIncrement = () => onChange(value + 1);
    const handleDecrement = () => onChange(Math.max(0, value - 1));

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {label}
                </label>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {type === 'duration' ? `${value} min` : value}
                </span>
            </div>

            <div className="flex items-center gap-3">
                {type === 'count' ? (
                    <>
                        <button
                            type="button"
                            onClick={handleDecrement}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Minus size={18} />
                        </button>
                        <div className="flex-1 text-center font-semibold text-lg">
                            {value}
                        </div>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </>
                ) : type === 'duration' ? (
                    <>
                        <button
                            type="button"
                            onClick={handleToggleTimer}
                            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${isRunning
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                        >
                            {isRunning ? <Pause size={18} /> : <Play size={18} />}
                            <span>{isRunning ? 'Recording' : 'Start'}</span>
                        </button>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                            className="w-20 text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        />
                        <span className="text-sm text-gray-500">min</span>
                    </>
                ) : null}
            </div>
        </div>
    );
}
