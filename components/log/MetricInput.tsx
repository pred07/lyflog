'use client';

interface MetricInputProps {
    label: string;
    value: number; // 0 if unset, 1-5 otherwise
    onChange: (val: number) => void;
    max?: number;
}

export default function MetricInput({ label, value, onChange, max = 5 }: MetricInputProps) {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {label}
                </label>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {value > 0 ? `${value}/${max}` : '-'}
                </span>
            </div>

            <div className="flex justify-between gap-1">
                {[...Array(max)].map((_, i) => {
                    const level = i + 1;
                    const isActive = value >= level;

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange(level)}
                            className={`
                                h-8 w-full rounded-md transition-all duration-200
                                ${isActive
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-20 scale-95 hover:opacity-40'
                                }
                            `}
                            style={{
                                backgroundColor: isActive ? 'var(--accent)' : 'var(--text-tertiary)'
                            }}
                            aria-label={`Set ${label} to ${level}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
