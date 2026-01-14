export interface DailyLog {
    logId: string;
    userId: string;
    date: Date;

    // Core metrics (6 fields)
    workoutDone: boolean;           // Activity binary
    workoutDuration?: number;       // Duration in minutes (optional)
    mood: number;                   // Subjective state (1-5)
    energy: number;                 // Perceived energy (1-5)
    stress: number;                 // Stress level (1-5)
    note?: string;                  // Optional context (one line)

    createdAt: Date;
}

export interface LogFormData {
    date: string;
    workoutDone: string;            // "true" or "false"
    workoutDuration: string;
    mood: string;
    energy: string;
    stress: string;
    note: string;
}
