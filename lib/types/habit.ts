export interface HabitConfig {
    id: string;
    label: string;
    group: string; // e.g., "Morning Routine", "Health", "Study"
    sheetId?: string; // Reference to which sheet this habit belongs to
    order: number;
}

export interface HabitSheet {
    id: string;
    label: string; // e.g., "Routine", "Gym", "Work"
    order: number;
    color?: string; // Optional color for the sheet tab
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
