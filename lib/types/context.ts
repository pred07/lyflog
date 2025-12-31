export interface ContextZone {
    id: string;
    userId: string;
    label: string; // e.g. "Vacation", "Sick", "Exam Week"
    startDate: Date;
    endDate: Date;
    color?: string; // Hex code for visualization
    createdAt: Date;
}
