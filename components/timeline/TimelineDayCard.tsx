import { DayContext } from '@/lib/firebase/timeline';
import { ContextZone } from '@/lib/types/context';
import { format, isWithinInterval } from 'date-fns';
import { FileText, Activity, CheckCircle, Moon, Zap, Brain, Wind, Tag, MapPin, Dumbbell, Book, PenTool } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface TimelineDayCardProps {
    day: DayContext;
    zones?: ContextZone[];
}

export default function TimelineDayCard({ day, zones = [] }: TimelineDayCardProps) {
    const { user } = useAuth();
    const { date, log, habits, sessions, logbookEntries } = day;
    const hasData = log || habits.length > 0 || sessions.length > 0 || (logbookEntries && logbookEntries.length > 0);

    // Helper to get logbook title
    const getLogbookTitle = (id: string) => {
        return user?.logbooks?.find(lb => lb.id === id)?.title || id;
    };

    // Check if this day falls within any zones
    const dayZones = zones.filter(zone =>
        isWithinInterval(date, { start: zone.startDate, end: zone.endDate })
    );

    if (!hasData) return null;

    return (
        <div className="relative pl-6 md:pl-8 pb-12 border-l border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
            {/* Date Marker */}
            <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black" />

            <div className="mb-2 flex items-center gap-2 flex-wrap">
                <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {format(date, 'EEEE, MMM d')}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                        {format(date, 'yyyy')}
                    </span>
                </div>

                {/* Zone Badges */}
                {dayZones.length > 0 && (
                    <div className="flex gap-1">
                        {dayZones.map(zone => (
                            <div
                                key={zone.id}
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${zone.color}20`,
                                    color: zone.color,
                                    border: `1px solid ${zone.color}40`
                                }}
                                title={`Context: ${zone.label}`}
                            >
                                <MapPin size={10} />
                                <span>{zone.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {/* 1. Daily Log Metrics (Sleep, Mood, etc.) */}
                {log && (
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                            {log.sleep && (
                                <div className="flex items-center gap-2">
                                    <Moon size={16} className="text-indigo-500" />
                                    <span className="text-sm">{typeof log.sleep === 'number' ? log.sleep.toFixed(1) : log.sleep}h Sleep</span>
                                </div>
                            )}
                            {log.anxiety !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Wind size={16} className="text-gray-400" />
                                    <span className="text-sm">Anxiety: {log.anxiety}/5</span>
                                </div>
                            )}
                            {log.energy !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-amber-500" />
                                    <span className="text-sm">Energy: {log.energy}/5</span>
                                </div>
                            )}
                            {log.focus !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Brain size={16} className="text-emerald-500" />
                                    <span className="text-sm">Focus: {log.focus}/5</span>
                                </div>
                            )}
                        </div>

                        {/* Note snippet if exists */}
                        {log.note && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3 mt-1 italic">
                                &quot;{log.note}&quot;
                            </div>
                        )}

                        {/* Tags (Phase 2) */}
                        {log.tags && log.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                {log.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                        <Tag size={10} className="text-indigo-400" />
                                        <span>{tag}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Logbook Entries (Gym, Study, etc.) */}
                {logbookEntries && logbookEntries.length > 0 && (
                    <div className="space-y-2">
                        {logbookEntries.map(entry => {
                            const title = getLogbookTitle(entry.logbookId);
                            // Simple icon logic based on title keywords
                            const icon = title.toLowerCase().includes('gym') || title.toLowerCase().includes('workout') ? <Dumbbell size={16} /> :
                                title.toLowerCase().includes('study') || title.toLowerCase().includes('learn') ? <Book size={16} /> :
                                    <PenTool size={16} />;

                            return (
                                <div key={entry.id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                            {icon}
                                        </div>
                                        <span>{title}</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                                        {Object.entries(entry.data).map(([key, value]) => {
                                            // Skip empty values
                                            if (value === undefined || value === null || value === '') return null;
                                            return (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-xs text-gray-400 capitalize">{key}</span>
                                                    <span className="text-gray-900 dark:text-gray-100 font-medium truncate">
                                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 3. Habits Grid */}
                {habits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {habits.map(habit => (
                            <div key={habit.habitId} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm border border-emerald-100 dark:border-emerald-900/50">
                                <CheckCircle size={14} className="mr-1.5" />
                                <span>{habit.habitId}</span> {/* ideally map to name, but ID for now is fine or passed in props */}
                                {habit.notes && (
                                    <FileText size={12} className="ml-2 opacity-50" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. Sessions List */}
                {sessions.length > 0 && (
                    <div className="space-y-2">
                        {sessions.map(session => (
                            <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                <Activity size={18} className="text-blue-500" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {session.sessionType}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {format(session.createdAt, 'h:mm a')} • {session.exercises?.length || 0} exercises
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
