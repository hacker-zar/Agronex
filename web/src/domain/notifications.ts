export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW";
export function normalizePriority(value: string | null | undefined): NotificationPriority { return value === "HIGH" || value === "MEDIUM" ? value : "LOW"; }
