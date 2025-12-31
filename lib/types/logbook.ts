export type LogbookColumnType = 'text' | 'number' | 'checkbox' | 'select' | 'notes';

export interface LogbookColumn {
    id: string;
    label: string;
    type: LogbookColumnType;
    options?: string[]; // For 'select' type
    required?: boolean;
    width?: number; // Optional visual width hint
}

export interface LogbookConfig {
    id: string; // generated UUID
    userId: string;
    title: string; // e.g. "Gym Training"
    columns: LogbookColumn[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LogbookEntry {
    id: string; // generated UUID
    logbookId: string;
    userId: string;
    date: Date; // The "Session" date
    data: Record<string, string | number | boolean>; // Keyed by column.id
    createdAt: Date;
    updatedAt: Date;
}
