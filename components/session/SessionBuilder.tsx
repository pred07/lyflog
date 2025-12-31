'use client';

import { useState } from 'react';
import { SessionExercise, SessionSet } from '@/lib/types/session';
import { Plus, Trash2, Check, X } from 'lucide-react';

interface SessionBuilderProps {
    sessionType: string;
    exercises: SessionExercise[];
    onUpdateExercises: (exercises: SessionExercise[]) => void;
    exerciseHistory: string[];
}

export default function SessionBuilder({ sessionType, exercises, onUpdateExercises, exerciseHistory }: SessionBuilderProps) {
    const [newExerciseName, setNewExerciseName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addExercise = (name: string) => {
        if (!name.trim()) return;

        const newExercise: SessionExercise = {
            id: crypto.randomUUID(),
            name: name.trim(),
            sets: []
        };

        onUpdateExercises([...exercises, newExercise]);
        setNewExerciseName('');
        setShowSuggestions(false);
    };

    const addSet = (exerciseId: string) => {
        onUpdateExercises(exercises.map(ex =>
            ex.id === exerciseId
                ? { ...ex, sets: [...ex.sets, { done: false, notes: '' }] }
                : ex
        ));
    };

    const updateSet = (exerciseId: string, setIndex: number, updates: Partial<SessionSet>) => {
        onUpdateExercises(exercises.map(ex =>
            ex.id === exerciseId
                ? { ...ex, sets: ex.sets.map((s, i) => i === setIndex ? { ...s, ...updates } : s) }
                : ex
        ));
    };

    const deleteSet = (exerciseId: string, setIndex: number) => {
        onUpdateExercises(exercises.map(ex =>
            ex.id === exerciseId
                ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
                : ex
        ));
    };

    const deleteExercise = (exerciseId: string) => {
        onUpdateExercises(exercises.filter(ex => ex.id !== exerciseId));
    };

    const filteredSuggestions = exerciseHistory.filter(name =>
        name.toLowerCase().includes(newExerciseName.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Add Exercise */}
            <div className="relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newExerciseName}
                        onChange={e => {
                            setNewExerciseName(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Add exercise (e.g., Bench Press)"
                        className="input-field flex-1"
                        onKeyDown={e => e.key === 'Enter' && addExercise(newExerciseName)}
                    />
                    <button
                        onClick={() => addExercise(newExerciseName)}
                        className="btn-primary px-4"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && newExerciseName && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredSuggestions.map(name => (
                            <button
                                key={name}
                                onClick={() => addExercise(name)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Exercises List */}
            {exercises.map((exercise, exIdx) => (
                <div key={exercise.id} className="card p-4 border-l-4 border-indigo-500">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {exercise.name}
                        </h3>
                        <button
                            onClick={() => deleteExercise(exercise.id)}
                            className="text-red-400 hover:text-red-500"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2 mb-3">
                        {exercise.sets.map((set, setIdx) => (
                            <div key={setIdx} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                <span className="text-xs font-mono text-gray-400 w-12">Set {setIdx + 1}</span>

                                <input
                                    type="number"
                                    placeholder="Weight"
                                    value={set.weight || ''}
                                    onChange={e => updateSet(exercise.id, setIdx, { weight: parseFloat(e.target.value) })}
                                    className="input-field text-sm py-1 w-20"
                                />
                                <span className="text-xs text-gray-400">×</span>
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={set.reps || ''}
                                    onChange={e => updateSet(exercise.id, setIdx, { reps: parseInt(e.target.value) })}
                                    className="input-field text-sm py-1 w-16"
                                />

                                <button
                                    onClick={() => updateSet(exercise.id, setIdx, { done: !set.done })}
                                    className={`p-1.5 rounded ${set.done ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
                                >
                                    {set.done ? <Check size={16} /> : <X size={16} />}
                                </button>

                                <button
                                    onClick={() => deleteSet(exercise.id, setIdx)}
                                    className="text-red-400 hover:text-red-500 ml-auto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => addSet(exercise.id)}
                        className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Set
                    </button>
                </div>
            ))}

            {exercises.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                    Add your first exercise to start logging
                </div>
            )}
        </div>
    );
}
