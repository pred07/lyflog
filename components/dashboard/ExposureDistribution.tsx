'use client';

import { DailyLog } from '@/lib/types/log';
import { groupDataByWeek } from '@/lib/utils/dataProcessing';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface ExposureDistributionProps {
    label: string;
    exposureKey: string;
    logs: DailyLog[];
    color?: string;
}

export default function ExposureDistribution({ label, exposureKey, logs, color = '#94a3b8' }: ExposureDistributionProps) {
    const data = groupDataByWeek(logs, exposureKey, true);

    // Get last two weeks for comparison
    const thisWeek = data[data.length - 1];
    const lastWeek = data[data.length - 2];

    const getTrend = () => {
        if (!thisWeek || !lastWeek || lastWeek.avg === 0) return { icon: Minus, color: 'text-gray-400', label: 'Stable' };

        const diff = thisWeek.avg - lastWeek.avg;
        const percentChange = (diff / lastWeek.avg) * 100;

        // Neutral language: "Higher/Lower" not "Worse/Better"
        if (percentChange > 10) return { icon: ArrowUpRight, color: 'text-orange-400', label: 'Higher' };
        if (percentChange < -10) return { icon: ArrowDownRight, color: 'text-emerald-400', label: 'Lower' };

        return { icon: Minus, color: 'text-gray-400', label: 'Stable' };
    };

    const trend = getTrend();
    const TrendIcon = trend.icon;

    if (logs.length === 0) return null;

    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/30">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-semibold opacity-90">{thisWeek?.avg.toFixed(1) || '0'}</span>
                        <span className="text-xs text-gray-500">avg/week</span>
                    </div>
                </div>

                {thisWeek && lastWeek && (
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 ${trend.color}`}>
                        <TrendIcon size={14} />
                        <span>{trend.label} vs last wk</span>
                    </div>
                )}
            </div>

            <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="weekLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                            interval={1} // Show every other label if cramped
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--bg-hover)' }}
                            contentStyle={{
                                backgroundColor: 'var(--bg-secondary)',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [value.toFixed(1), 'Average']}
                        />
                        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === data.length - 1 ? color : 'var(--text-tertiary)'}
                                    opacity={index === data.length - 1 ? 1 : 0.3}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
