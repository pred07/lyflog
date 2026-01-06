export interface DailyLog {
    logId: string;
    userId: string;
    date: Date;

    // Core metrics
    sleep?: number; // hours
    anxiety?: number; // 1-5
    energy?: number; // 1-5
    focus?: number; // 1-5
    workout?: {
        type: string;
        duration: number; // minutes
    };
    meditation?: number; // minutes
    learning?: number; // minutes

    // New health metrics
    steps?: number; // daily step count
    water?: number; // liters or glasses
    calories?: number; // consumed calories
    uvIndex?: number; // UV exposure index (0-11+)
    heartRate?: number; // resting heart rate (bpm)
    weight?: number; // kg

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
    steps: string;
    water: string;
    calories: string;
    uvIndex: string;
    heartRate: string;
    weight: string;
    note: string;
}
