import { LogbookConfig } from './logbook';

export interface MetricConfig {
    id: string;
    label: string;
    type: 'range'; // For now just range 1-5
    max: number; // Default 5
}

export interface ExposureConfig {
    id: string;
    label: string;
    type: 'count' | 'duration' | 'boolean';
    unit?: string;
}

export interface User {
    userId: string;
    username: string;
    createdAt: Date;
    theme: 'dark' | 'light';
    metrics?: MetricConfig[];
    exposures?: ExposureConfig[];
    logbooks?: LogbookConfig[];
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    loginGoogle?: () => Promise<void>;
    loginTest?: (username: string, password: string) => Promise<void>;
}
