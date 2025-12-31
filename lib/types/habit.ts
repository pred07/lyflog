export interface HabitConfig {
    id: string;
    label: string;
    group: string; // e.g., "Morning Routine", "Health", "Study"
    order: number;
}

export interface HabitEntry {
    id: string;
    userId: string;
    date: Date; // The day this entry is for
    habitId: string;
    done: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DayHabits {
    date: Date;
    habits: Record<string, boolean>; // habitId -> done
}
