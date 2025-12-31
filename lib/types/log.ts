export interface DailyLog {
    logId: string;
    userId: string;
    date: Date;
    sleep?: number; // hours
    workout?: {
        type: string;
        duration: number; // minutes
    };
    meditation?: number; // minutes
    learning?: number; // minutes
    note?: string;
    metrics?: Record<string, number>;
    exposures?: Record<string, number>; // count, minutes, or 1/0 for boolean
    createdAt: Date;
}

export interface LogFormData {
    date: string;
    sleep: string;
    workoutType: string;
    workoutDuration: string;
    meditation: string;
    learning: string;
    note: string;
}
