export interface SessionSet {
    weight?: number;
    reps?: number;
    duration?: number; // For cardio/timed exercises
    done: boolean;
    notes?: string;
}

export interface SessionExercise {
    id: string;
    name: string;
    sets: SessionSet[];
}

export interface SessionEntry {
    id: string;
    userId: string;
    date: Date;
    sessionType: string; // e.g., "Chest & Triceps", "Math Study"
    exercises: SessionExercise[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SessionTemplate {
    id: string;
    userId: string;
    name: string; // e.g., "Chest Day", "Leg Day"
    exercises: string[]; // Exercise names for quick start
}
