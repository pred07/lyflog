
import { DayContext } from '@/lib/firebase/timeline';
import { format } from 'date-fns';
import { FileText, Activity, CheckCircle, Moon, Zap, Brain, Wind } from 'lucide-react';

interface TimelineDayCardProps {
    day: DayContext;
}

export default function TimelineDayCard({ day }: TimelineDayCardProps) {
    const { date, log, habits, sessions } = day;
    const hasData = log || habits.length > 0 || sessions.length > 0;

    if (!hasData) return null;

    return (
        <div className="relative pl-8 pb-12 border-l border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
            {/* Date Marker */}
            <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black" />

            <div className="mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {format(date, 'EEEE, MMM d')}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                    {format(date, 'yyyy')}
                </span>
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
                    </div>
                )}

                {/* 2. Habits Grid */}
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
