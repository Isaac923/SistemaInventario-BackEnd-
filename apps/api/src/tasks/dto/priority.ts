export const PriorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type Priority = (typeof PriorityValues)[number];