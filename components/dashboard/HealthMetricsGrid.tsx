'use client';

import { Footprints, Droplets, Flame, Sun, Heart, Scale } from 'lucide-react';

interface HealthMetricsProps {
    data: {
        steps?: number;
        water?: number;
        calories?: number;
        uvIndex?: number;
        heartRate?: number;
        weight?: number;
    };
}

export default function HealthMetricsGrid({ data }: HealthMetricsProps) {
    const metrics = [
        {
            id: 'steps',
            label: 'Steps',
            value: data.steps,
            unit: '',
            icon: Footprints,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        },
        {
            id: 'water',
            label: 'Water',
            value: data.water,
            unit: 'L',
            icon: Droplets,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            id: 'calories',
            label: 'Calories',
            value: data.calories,
            unit: 'kcal',
            icon: Flame,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            id: 'uvIndex',
            label: 'UV Index',
            value: data.uvIndex,
            unit: '',
            icon: Sun,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10'
        },
        {
            id: 'heartRate',
            label: 'Heart Rate',
            value: data.heartRate,
            unit: 'bpm',
            icon: Heart,
            color: 'text-rose-500',
            bgColor: 'bg-rose-500/10'
        },
        {
            id: 'weight',
            label: 'Weight',
            value: data.weight,
            unit: 'kg',
            icon: Scale,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10'
        }
    ];

    // Filter to show all (even if empty, to encourage tracking) or maybe just available?
    // User requested "utility to calculate...", so showing them encourages use.

    return (
        <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Health Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {metrics.map(metric => (
                    <div
                        key={metric.id}
                        className="p-4 rounded-xl flex items-center justify-between"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1.5 rounded-lg ${metric.bgColor}`}>
                                    <metric.icon size={14} className={metric.color} />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                    {metric.label}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {metric.value ?? '-'}
                                </span>
                                {metric.unit && (
                                    <span className="text-xs text-gray-400 font-normal">
                                        {metric.unit}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
